import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.deps import get_current_user
from app.models.user import User
from app.models.chat import ChatQuery, ChatRequest, ChatResponse
from app.models.audit import AuditLogEntry
from app.pipeline.stage7_retrieval import execute_stage7_retrieval
from app.pipeline.stage8_response import execute_stage8_response

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
    )

    # Stage 8: Safe Response
    answer, cited_items, guardrail_applied = await execute_stage8_response(
        question=request.question,
        retrieved_items=retrieved_items,
        context_str=context_str,
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
        details=f"Inquired: '{request.question[:80]}...'. Cited {len(cited_items)} sources. Guardrail: {guardrail_applied}.",
        metadata_json=json.dumps({
            "cited_item_ids": [item["item_id"] for item in cited_items],
            "guardrail_applied": guardrail_applied,
        }),
    )
    session.add(audit)
    await session.commit()
    await session.refresh(chat_record)

    return ChatResponse(
        id=chat_record.id,
        question=chat_record.question,
        answer=chat_record.answer,
        cited_items=cited_items,
        guardrail_applied=guardrail_applied,
        created_at=chat_record.created_at,
    )

@router.get("/history")
async def get_chat_history(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    from sqlmodel import select, desc
    query = (
        select(ChatQuery)
        .where(ChatQuery.user_id == current_user.id)
        .order_by(desc(ChatQuery.created_at))
        .limit(20)
    )
    res = await session.execute(query)
    records = res.scalars().all()

    return [
        {
            "id": r.id,
            "question": r.question,
            "answer": r.answer,
            "guardrail_applied": r.guardrail_applied,
            "created_at": r.created_at,
        }
        for r in records
    ]
