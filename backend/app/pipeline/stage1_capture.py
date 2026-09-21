import logging
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.knowledge import KnowledgeItem
from app.models.pipeline import PipelineJob
from app.models.audit import AuditLogEntry
from app.ws.socket_manager import broadcast_stage_update

logger = logging.getLogger("lexvault.stage1")

async def execute_stage1_capture(
    session: AsyncSession,
    knowledge_item: KnowledgeItem,
    job: PipelineJob,
    raw_content: str,
) -> KnowledgeItem:
    """
    Stage 1: Raw Capture
    Stores the raw input text/transcription/OCR and emits the live progress event.
    """
    logger.info(f"Executing Stage 1 (Capture) for Item #{knowledge_item.id}")
    
    # Mark job as running
    job.stage = 1
    job.stage_name = "Raw Capture"
    job.status = "running"
    session.add(job)
    await session.commit()
    await broadcast_stage_update(job.id, 1, "Raw Capture", "running")

    # Update knowledge item
    knowledge_item.raw_text = raw_content
    knowledge_item.current_stage = 1
    knowledge_item.status = "processing"
    
    # Audit log
    audit = AuditLogEntry(
        actor_id=knowledge_item.author_id,
        action="CAPTURE_INGESTED",
        target_type="KnowledgeItem",
        target_id=knowledge_item.id,
        details=f"Captured {knowledge_item.raw_input_type} content ({len(raw_content)} chars)",
    )
    session.add(audit)
    session.add(knowledge_item)

    # Finish stage 1
    job.status = "done"
    job.output_preview = raw_content[:300] + ("..." if len(raw_content) > 300 else "")
    job.finished_at = datetime.utcnow()
    session.add(job)
    await session.commit()

    await broadcast_stage_update(job.id, 1, "Raw Capture", "done", output=job.output_preview)
    return knowledge_item
