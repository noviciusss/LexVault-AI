import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.database import get_session
from app.core.deps import get_current_user
from app.models.user import User
from app.models.chat import ChatQuery, ChatRequest, ChatResponse
from app.models.audit import AuditLogEntry
from app.pipeline.stage7_retrieval import execute_stage7_retrieval
from app.pipeline.stage8_response import execute_stage8_response
from app.services.groq_client import groq_client
from app.pipeline.stage8_response import response_prompts, REFUSAL
import re

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("", response_model=ChatResponse)
async def chat_with_assistant(
    request: ChatRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be blank")

    # Stage 7: Hybrid Retrieval
    retrieved_items, context_str = await execute_stage7_retrieval(
        question=request.question,
        firm_id=current_user.firm_id,
        top_k=4,
        practice_area=request.practice_area,
    )

    # Stage 8: Safe Response with multi-turn history and action type
    answer, cited_items, guardrail_applied = await execute_stage8_response(
        question=request.question,
        retrieved_items=retrieved_items,
        context_str=context_str,
        history=request.history,
        action_type=request.action_type,
    )

    # Save to ChatQuery table
    chat_record = ChatQuery(
        user_id=current_user.id,
        firm_id=current_user.firm_id,
        question=request.question,
        answer=answer,
        retrieved_item_ids=json.dumps([item["item_id"] for item in cited_items]),
        guardrail_applied=guardrail_applied,
    )
    session.add(chat_record)

    # Audit log
    audit = AuditLogEntry(
        actor_id=current_user.id,
        actor_name=current_user.name,
        action="AI_ASSISTANT_QUERY",
        target_type="ChatQuery",
        details=f"Inquired: '{request.question[:80]}...'. Cited {len(cited_items)} sources. Action: {request.action_type or 'advisory'}.",
        firm_id=current_user.firm_id,
    )
    session.add(audit)
    await session.commit()
    await session.refresh(chat_record)

    return ChatResponse(
        id=chat_record.id or 1,
        question=chat_record.question,
        answer=chat_record.answer,
        cited_items=cited_items,
        guardrail_applied=guardrail_applied,
        created_at=chat_record.created_at,
    )

@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Server-Sent Events (SSE) streaming endpoint for real-time word-by-word token delivery."""
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be blank")

    retrieved_items, context_str = await execute_stage7_retrieval(
        question=request.question,
        firm_id=current_user.firm_id,
        top_k=4,
        practice_area=request.practice_area,
    )

    async def event_generator():
        # First send citations metadata
        metadata = {
            "type": "metadata",
            "cited_items": retrieved_items,
            "guardrail_applied": not bool(retrieved_items and context_str),
        }
        yield f"data: {json.dumps(metadata)}\n\n"

        prompt, system_prompt = response_prompts(request.question, context_str, request.action_type)
        full_answer = []
        try:
            if not retrieved_items or not context_str:
                full_answer.append(REFUSAL)
                yield f"data: {json.dumps({'type': 'token', 'token': REFUSAL})}\n\n"
            else:
                async for chunk in groq_client.stream(prompt=prompt, system_prompt=system_prompt, history=request.history):
                    full_answer.append(chunk)
                    yield f"data: {json.dumps({'type': 'token', 'token': chunk})}\n\n"
            answer = "".join(full_answer)
            ids = set(re.findall(r"\[Knowledge Item #(\d+)\]", answer))
            citations = [item for item in retrieved_items if str(item.get("item_id")) in ids]
            record = ChatQuery(user_id=current_user.id, firm_id=current_user.firm_id,
                               question=request.question, answer=answer,
                               retrieved_item_ids=json.dumps(list(ids)), guardrail_applied=not bool(context_str))
            session.add(record)
            session.add(AuditLogEntry(actor_id=current_user.id, actor_name=current_user.name,
                        action="AI_ASSISTANT_QUERY", target_type="ChatQuery", firm_id=current_user.firm_id,
                        details=f"Streamed research response; {len(citations)} cited sources; mode {request.action_type or 'advisory'}."))
            await session.commit()
            yield f"data: {json.dumps({'type': 'metadata', 'cited_items': citations, 'guardrail_applied': not bool(context_str)})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        except Exception:
            yield f"data: {json.dumps({'type': 'error', 'message': 'The research stream was interrupted. Please retry.'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/history")
async def get_chat_history(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(ChatQuery)
        .where(ChatQuery.firm_id == current_user.firm_id)
        .order_by(ChatQuery.created_at.desc())
        .limit(30)
    )
    res = await session.execute(query)
    queries = res.scalars().all()
    return queries
