import logging
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.knowledge import KnowledgeItem
from app.models.pipeline import PipelineJob
from app.models.audit import AuditLogEntry
from app.services.groq_client import groq_client
from app.ws.socket_manager import broadcast_stage_update

logger = logging.getLogger("lexvault.stage4")

async def execute_stage4_abstraction(
    session: AsyncSession,
    knowledge_item: KnowledgeItem,
    job: PipelineJob,
) -> KnowledgeItem:
    """
    Stage 4: Strategy Abstraction
    Transforms specific sanitized factual narratives into generalized, reusable institutional legal strategies
    and precedents that can be safely leveraged firm-wide.
    """
    logger.info(f"Executing Stage 4 (Strategy Abstraction) for Item #{knowledge_item.id}")

    job.stage = 4
    job.stage_name = "Strategy Abstraction"
    job.status = "running"
    session.add(job)
    await session.commit()
    await broadcast_stage_update(job.id, 4, "Strategy Abstraction", "running")

    prompt = (
        "You are an expert institutional legal knowledge engineer. "
        "Review the following sanitized legal matter notes. Extract the high-level reusable legal strategy, "
        "contractual structuring principles, and tactical precedents that another attorney in the firm could apply "
        "to a similar case in the future. "
        "Do NOT include any specific case narrative or identifiers. "
        "Provide:\n"
        "1. Core Legal Principle\n"
        "2. Strategic Recommendation & Clause Guidance\n"
        "3. Common Pitfalls & Enforceability Guardrails\n\n"
        f"SANITIZED FACTUAL INPUT:\n{knowledge_item.sanitized_text}"
    )

    system_prompt = (
        "You are an elite legal knowledge system. Generalize legal facts into reusable institutional intelligence."
    )

    abstraction = await groq_client.complete(prompt=prompt, system_prompt=system_prompt)
    knowledge_item.abstracted_insight = abstraction
    knowledge_item.current_stage = 5
    knowledge_item.status = "pending_approval"

    # Audit log
    audit = AuditLogEntry(
        actor_id=knowledge_item.author_id,
        action="STRATEGY_ABSTRACTED",
        target_type="KnowledgeItem",
        target_id=knowledge_item.id,
        details="Generated reusable legal abstraction and submitted to Human-in-the-Loop review queue.",
    )
    session.add(audit)
    session.add(knowledge_item)

    job.status = "done"
    job.output_preview = abstraction[:350] + ("..." if len(abstraction) > 350 else "")
    job.finished_at = datetime.utcnow()
    session.add(job)
    await session.commit()

    await broadcast_stage_update(job.id, 4, "Strategy Abstraction", "done", output=job.output_preview)

    # Broadcast that stage 5 is now waiting for lawyer approval
    await broadcast_stage_update(job.id, 5, "Lawyer Approval Gate", "waiting_approval")
    return knowledge_item
