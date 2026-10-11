import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Literal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, desc

from app.core.database import get_session
from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.models.knowledge import KnowledgeItem
from app.models.pipeline import PipelineJob
from app.pipeline.runner import run_approval_pipeline

router = APIRouter(prefix="/approvals", tags=["approvals"])

class ApprovalActionRequest(BaseModel):
    action: Literal["approve", "reject"]
    edited_text: Optional[str] = None
    rejection_reason: Optional[str] = None

@router.get("")
async def list_pending_approvals(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(KnowledgeItem)
        .where(KnowledgeItem.status == "pending_approval")
        .where(KnowledgeItem.firm_id == current_user.firm_id)
        .order_by(desc(KnowledgeItem.created_at))
    )
    result = await session.execute(query)
    items = result.scalars().all()

    formatted = []
    for item in items:
        pii = []
        try:
            if item.pii_entities_found:
                pii = json.loads(item.pii_entities_found)
        except Exception:
            pass

        formatted.append({
            "id": item.id,
            "title": item.title,
            "practice_area": item.practice_area,
            "author_id": item.author_id,
            "raw_input_type": item.raw_input_type,
            "sanitized_text": item.sanitized_text,
            "abstracted_insight": item.abstracted_insight,
            "pii_entities_found": pii,
            "created_at": item.created_at,
        })
    return formatted

@router.post("/{item_id}/action")
async def take_approval_action(
    item_id: int,
    action_req: ApprovalActionRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_role(["reviewer", "admin"])),
):
    item = await session.get(KnowledgeItem, item_id)
    if not item or item.firm_id != current_user.firm_id:
        raise HTTPException(status_code=404, detail="Knowledge item not found")

    if item.status != "pending_approval":
        raise HTTPException(status_code=400, detail=f"Item is in '{item.status}' state, not pending approval")

    # Find or create pipeline job for this item
    query = select(PipelineJob).where(PipelineJob.knowledge_item_id == item_id).order_by(desc(PipelineJob.id))
    res = await session.execute(query)
    job = res.scalars().first()
    if not job:
        job = PipelineJob(knowledge_item_id=item_id, stage=5, stage_name="Lawyer Approval Gate", status="running")
        session.add(job)
        await session.commit()
        await session.refresh(job)

    # Launch background approval & storage task
    background_tasks.add_task(
        run_approval_pipeline,
        knowledge_item_id=item.id,
        job_id=job.id,
        approver_id=current_user.id,
        action=action_req.action,
        edited_text=action_req.edited_text,
        rejection_reason=action_req.rejection_reason,
    )

    return {
        "status": "success",
        "action": action_req.action,
        "item_id": item.id,
        "message": f"Approval action '{action_req.action}' submitted to pipeline.",
    }
