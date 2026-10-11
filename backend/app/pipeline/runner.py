import logging
from app.core import database
from app.models.knowledge import KnowledgeItem
from app.models.pipeline import PipelineJob
from app.pipeline.stage1_capture import execute_stage1_capture
from app.pipeline.stage2_local_ai import execute_stage2_local_ai
from app.pipeline.stage3_pii import execute_stage3_pii
from app.pipeline.stage4_abstraction import execute_stage4_abstraction
from app.pipeline.stage5_approval import execute_stage5_approval
from app.pipeline.stage6_storage import execute_stage6_storage
from app.ws.socket_manager import broadcast_stage_update

logger = logging.getLogger("lexvault.runner")

async def run_capture_pipeline(knowledge_item_id: int, job_id: int, raw_content: str):
    """
    Background Task: Executes Stages 1 to 4 sequentially.
    Stops at Stage 5 to wait for human-in-the-loop attorney approval.
    """
    job = None
    async with database.async_session_maker() as session:
        try:
            import asyncio
            await asyncio.sleep(0.1)
            item = await session.get(KnowledgeItem, knowledge_item_id)
            job = await session.get(PipelineJob, job_id)
            if not item or not job:
                logger.error(f"Cannot run pipeline: Item #{knowledge_item_id} or Job #{job_id} not found.")
                return

            # Stage 1: Capture
            item = await execute_stage1_capture(session, item, job, raw_content)

            # Stage 2: Local AI Cleaning
            item = await execute_stage2_local_ai(session, item, job)

            # Stage 3: PII Removal
            item = await execute_stage3_pii(session, item, job)

            # Stage 4: Strategy Abstraction
            item = await execute_stage4_abstraction(session, item, job)

            logger.info(f"Pipeline successfully advanced to Stage 5 (Pending Approval) for Item #{item.id}")

        except Exception as e:
            logger.exception(f"Pipeline error on Item #{knowledge_item_id}: {e}")
            if job:
                job.status = "failed"
                job.error_message = str(e)
                session.add(job)
                await session.commit()
                await broadcast_stage_update(job_id, job.stage, job.stage_name, "failed", error=str(e))

async def run_approval_pipeline(
    knowledge_item_id: int,
    job_id: int,
    approver_id: int,
    action: str,
    edited_text: str = None,
    rejection_reason: str = None,
):
    """
    Background Task: Executes Stage 5 (Approval) and Stage 6 (Storage) upon approval.
    """
    job = None
    async with database.async_session_maker() as session:
        try:
            import asyncio
            await asyncio.sleep(0.1)
            item = await session.get(KnowledgeItem, knowledge_item_id)
            job = await session.get(PipelineJob, job_id)
            if not item or not job:
                return

            # Stage 5: Approval gate
            item = await execute_stage5_approval(
                session=session,
                knowledge_item=item,
                job=job,
                approver_id=approver_id,
                action=action,
                edited_text=edited_text,
                rejection_reason=rejection_reason,
            )

            # If approved, immediately run Stage 6 (Vector + Graph)
            if action == "approve" and item.status == "approved":
                item = await execute_stage6_storage(session, item, job)
                logger.info(f"Item #{item.id} published to Vector DB and Knowledge Graph.")

        except Exception as e:
            logger.exception(f"Approval pipeline error on Item #{knowledge_item_id}: {e}")
            if job:
                job.status = "failed"
                job.error_message = str(e)
                session.add(job)
                await session.commit()
                await broadcast_stage_update(job_id, 5, "Approval/Storage", "failed", error=str(e))
