import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.core.database import get_session
from app.models.pipeline import PipelineJob
from app.models.knowledge import KnowledgeItem

router = APIRouter(prefix="/pipeline", tags=["pipeline"])

@router.get("/{job_id}")
async def get_pipeline_job(job_id: int, session: AsyncSession = Depends(get_session)):
    job = await session.get(PipelineJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Pipeline job not found")

    item = await session.get(KnowledgeItem, job.knowledge_item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Knowledge item not found")

    # Construct the 8-stage progress view
    stages = [
        {"stage": 1, "name": "Raw Capture", "status": "pending", "output": None},
        {"stage": 2, "name": "Local AI Processing", "status": "pending", "output": None},
        {"stage": 3, "name": "PII Removal & Sanitization", "status": "pending", "output": None},
        {"stage": 4, "name": "Strategy Abstraction", "status": "pending", "output": None},
        {"stage": 5, "name": "Lawyer Approval Gate", "status": "pending", "output": None},
        {"stage": 6, "name": "Vector DB & Knowledge Graph", "status": "pending", "output": None},
        {"stage": 7, "name": "RAG Retrieval Ready", "status": "pending", "output": None},
        {"stage": 8, "name": "Safe Guardrailed Response", "status": "pending", "output": None},
    ]

    curr = item.current_stage
    pii_entities = []
    try:
        if item.pii_entities_found:
            pii_entities = json.loads(item.pii_entities_found)
    except Exception:
        pass

    for s in stages:
        num = s["stage"]
        if num < curr:
            s["status"] = "done"
        elif num == curr:
            if item.status == "rejected":
                s["status"] = "failed"
            elif item.status == "pending_approval" and num == 5:
                s["status"] = "waiting_approval"
            elif item.status == "published" and num == 6:
                s["status"] = "done"
            else:
                s["status"] = "running"
        else:
            s["status"] = "pending"

        # Populate outputs
        if num == 1 and item.raw_text:
            s["output"] = item.raw_text[:250] + ("..." if len(item.raw_text) > 250 else "")
        elif num == 2 and item.cleaned_text:
            s["output"] = f"Title: {item.title}\n{item.cleaned_text[:250]}..."
        elif num == 3 and item.sanitized_text:
            s["output"] = {
                "entities_count": len(pii_entities),
                "entities": pii_entities,
                "sanitized_preview": item.sanitized_text[:250],
            }
        elif num == 4 and item.abstracted_insight:
            s["output"] = item.abstracted_insight[:300] + "..."
        elif num == 5:
            if item.approved_at:
                s["output"] = f"Approved at {item.approved_at.strftime('%Y-%m-%d %H:%M')}"
            elif item.status == "pending_approval":
                s["output"] = "Awaiting review in Approvals Queue"
        elif num == 6 and item.status == "published":
            s["output"] = f"Vector ID: {item.vector_id[:12]} | Graph Node: {item.graph_node_id}"

    return {
        "job_id": job.id,
        "knowledge_item_id": item.id,
        "title": item.title,
        "status": item.status,
        "current_stage": item.current_stage,
        "raw_input_type": item.raw_input_type,
        "sanitized_text": item.sanitized_text,
        "abstracted_insight": item.abstracted_insight,
        "pii_entities": pii_entities,
        "stages": stages,
        "job_details": {
            "status": job.status,
            "error_message": job.error_message,
            "output_preview": job.output_preview,
            "started_at": job.started_at,
            "finished_at": job.finished_at,
        },
    }
