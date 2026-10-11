import logging
from datetime import datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.knowledge import KnowledgeItem
from app.models.pipeline import PipelineJob
from app.models.audit import AuditLogEntry
from app.ws.socket_manager import broadcast_stage_update

logger = logging.getLogger("lexvault.stage5")

async def execute_stage5_approval(
    session: AsyncSession,
    knowledge_item: KnowledgeItem,
    job: PipelineJob,
    approver_id: int,
    action: str,  # "approve" | "reject"
    edited_text: Optional[str] = None,
    rejection_reason: Optional[str] = None,
) -> KnowledgeItem:
    """
    Stage 5: Lawyer Approval Gate (Human-In-The-Loop)
    Enforces that no knowledge is vectorized or graphed without explicit attorney sign-off.
    Reviewer can approve, reject, or edit-then-approve.
    """
    logger.info(f"Executing Stage 5 (Lawyer Approval: {action}) for Item #{knowledge_item.id} by User #{approver_id}")

    job.stage = 5
    job.stage_name = "Lawyer Approval Gate"
    job.status = "running"
    session.add(job)
    await session.commit()

    if action == "reject":
        knowledge_item.status = "rejected"
        knowledge_item.rejection_reason = rejection_reason or "Declined by reviewer"
        knowledge_item.current_stage = 5
        job.status = "failed"
        job.error_message = f"Rejected by reviewer #{approver_id}: {knowledge_item.rejection_reason}"
        job.finished_at = datetime.utcnow()

        audit = AuditLogEntry(
            firm_id=knowledge_item.firm_id,
            actor_id=approver_id,
            action="APPROVAL_REJECTED",
            target_type="KnowledgeItem",
            target_id=knowledge_item.id,
            details=f"Insight rejected. Reason: {knowledge_item.rejection_reason}",
        )
        session.add(audit)
        session.add(knowledge_item)
        session.add(job)
        await session.commit()

        await broadcast_stage_update(job.id, 5, "Lawyer Approval Gate", "failed", error=job.error_message)
        return knowledge_item

    # Approval branch (Approve or Edit-Then-Approve)
    if edited_text:
        knowledge_item.abstracted_insight = edited_text
        edit_detail = "Insight edited and approved by attorney."
    else:
        edit_detail = "Insight approved by attorney without modifications."

    knowledge_item.status = "approved"
    knowledge_item.approved_by = approver_id
    knowledge_item.approved_at = datetime.utcnow()
    knowledge_item.current_stage = 5

    job.status = "done"
    job.output_preview = f"Approved by Reviewer #{approver_id} at {knowledge_item.approved_at.strftime('%Y-%m-%d %H:%M:%S UTC')}."
    job.finished_at = datetime.utcnow()

    audit = AuditLogEntry(
        firm_id=knowledge_item.firm_id,
        actor_id=approver_id,
        action="APPROVAL_GRANTED",
        target_type="KnowledgeItem",
        target_id=knowledge_item.id,
        details=edit_detail,
    )
    session.add(audit)
    session.add(knowledge_item)
    session.add(job)
    await session.commit()

    await broadcast_stage_update(job.id, 5, "Lawyer Approval Gate", "done", output=job.output_preview)
    return knowledge_item
