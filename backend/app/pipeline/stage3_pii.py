import json
import logging
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.knowledge import KnowledgeItem
from app.models.pipeline import PipelineJob
from app.models.audit import AuditLogEntry
from app.services.presidio_service import presidio_service
from app.ws.socket_manager import broadcast_stage_update

logger = logging.getLogger("lexvault.stage3")

async def execute_stage3_pii(
    session: AsyncSession,
    knowledge_item: KnowledgeItem,
    job: PipelineJob,
) -> KnowledgeItem:
    """
    Stage 3: PII Removal
    Detects sensitive legal client identifiers (PERSON, ORG, CASE_NUMBER, EMAIL, PHONE, SSN)
    using Microsoft Presidio, strips them from the working text, and logs the redacted entities.
    """
    logger.info(f"Executing Stage 3 (PII Removal) for Item #{knowledge_item.id}")

    job.stage = 3
    job.stage_name = "PII Removal & Sanitization"
    job.status = "running"
    session.add(job)
    await session.commit()
    await broadcast_stage_update(job.id, 3, "PII Removal & Sanitization", "running")

    text_to_sanitize = knowledge_item.cleaned_text or knowledge_item.raw_text or ""
    sanitized_text, entities_found = presidio_service.sanitize(text_to_sanitize)

    knowledge_item.sanitized_text = sanitized_text
    knowledge_item.pii_entities_found = json.dumps(entities_found)
    knowledge_item.current_stage = 3

    # Audit log
    audit = AuditLogEntry(
        actor_id=knowledge_item.author_id,
        action="PII_STRIPPED",
        target_type="KnowledgeItem",
        target_id=knowledge_item.id,
        details=f"Presidio stripped {len(entities_found)} identifying client entities.",
        metadata_json=json.dumps({"entities_count": len(entities_found), "entities": entities_found}),
    )
    session.add(audit)
    session.add(knowledge_item)

    entity_summary = ", ".join([f"{e['entity_type']}: '{e['text']}'" for e in entities_found[:4]])
    if len(entities_found) > 4:
        entity_summary += f" and {len(entities_found) - 4} more"

    job.status = "done"
    job.output_preview = (
        f"Redacted {len(entities_found)} client entities ({entity_summary or 'No PII detected'}).\n\n"
        f"Sanitized Preview:\n{sanitized_text[:250]}..."
    )
    job.finished_at = datetime.utcnow()
    session.add(job)
    await session.commit()

    await broadcast_stage_update(
        job.id,
        3,
        "PII Removal & Sanitization",
        "done",
        output={"entities": entities_found, "preview": sanitized_text[:250]},
    )
    return knowledge_item
