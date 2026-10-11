import logging
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.knowledge import KnowledgeItem
from app.models.pipeline import PipelineJob
from app.models.audit import AuditLogEntry
from app.services.groq_client import groq_client
from app.ws.socket_manager import broadcast_stage_update

logger = logging.getLogger("lexvault.stage2")

async def execute_stage2_local_ai(
    session: AsyncSession,
    knowledge_item: KnowledgeItem,
    job: PipelineJob,
) -> KnowledgeItem:
    """
    Stage 2: Local AI Processing
    Cleans raw text, eliminates transcription artifacts, structures into legal paragraphs,
    and extracts a representative case/topic title.
    """
    logger.info(f"Executing Stage 2 (Local AI Cleaning) for Item #{knowledge_item.id}")

    job.stage = 2
    job.stage_name = "Local AI Processing"
    job.status = "running"
    session.add(job)
    await session.commit()
    await broadcast_stage_update(job.id, 2, "Local AI Processing", "running")

    prompt = (
        "Clean, punctuate, and structure the following raw legal working notes/transcript into clear paragraphs. "
        "Also generate a concise legal matter title on the very first line prefixed with 'TITLE: '.\n\n"
        f"RAW INPUT:\n{knowledge_item.raw_text}"
    )

    cleaned_response = await groq_client.complete_local(
        prompt=prompt,
        system_prompt="You are an on-device legal assistant that structures rough attorney notes into clean draft text."
    )

    # Parse title and body
    lines = (cleaned_response or knowledge_item.raw_text or "").strip().split("\n")
    title = knowledge_item.title or "Legal Insight"
    body_lines = []
    for line in lines:
        if line.startswith("TITLE:"):
            title = line.replace("TITLE:", "").strip()
        else:
            body_lines.append(line)
    
    cleaned_body = "\n".join(body_lines).strip()
    if not cleaned_body:
        cleaned_body = knowledge_item.raw_text or ""

    knowledge_item.title = title[:150]
    knowledge_item.cleaned_text = cleaned_body
    knowledge_item.current_stage = 2

    # Audit log
    audit = AuditLogEntry(
        firm_id=knowledge_item.firm_id,
        actor_id=knowledge_item.author_id,
        action="LOCAL_AI_CLEANED",
        target_type="KnowledgeItem",
        target_id=knowledge_item.id,
        details=f"Cleaned and structured raw text into title '{knowledge_item.title}'",
    )
    session.add(audit)
    session.add(knowledge_item)

    job.status = "done"
    job.output_preview = f"Title: {knowledge_item.title}\n\n{cleaned_body[:250]}..."
    job.finished_at = datetime.utcnow()
    session.add(job)
    await session.commit()

    await broadcast_stage_update(job.id, 2, "Local AI Processing", "done", output=job.output_preview)
    return knowledge_item
