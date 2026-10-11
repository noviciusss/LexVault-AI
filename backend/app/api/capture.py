from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_session
from app.core.deps import get_current_user
from app.models.user import User
from app.models.knowledge import KnowledgeItem
from app.models.pipeline import PipelineJob
from app.pipeline.runner import run_capture_pipeline
from app.services.whisper_service import whisper_service
from app.services.ocr_service import ocr_service
from app.core import database
from app.ws.socket_manager import broadcast_stage_update
import logging

router = APIRouter(prefix="/capture", tags=["capture"])

async def process_upload(item_id, job_id, content, input_type, filename, language):
    """Return a job immediately; extraction is part of the observable background job."""
    try:
        if input_type == "voice":
            text = await whisper_service.transcribe(content, filename=filename)
        else:
            text = await ocr_service.extract_text(content, filename=filename, lang=language)
        if not text or not text.strip():
            raise ValueError("No readable text was extracted from the upload")
        await run_capture_pipeline(item_id, job_id, text)
    except Exception as error:
        logging.getLogger("lexvault.capture").exception("Upload extraction failed")
        async with database.async_session_maker() as session:
            job = await session.get(PipelineJob, job_id)
            if job:
                job.status = "failed"
                job.error_message = str(error)
                session.add(job)
                await session.commit()
        await broadcast_stage_update(job_id, 1, "Capture extraction", "failed", error=str(error))

@router.post("")
async def capture_input(
    background_tasks: BackgroundTasks,
    input_type: str = Form(...),  # "text", "voice", "ocr"
    text_content: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    practice_area: Optional[str] = Form("Corporate & Securities"),
    language: Optional[str] = Form("eng"),  # "eng", "hin" (Hindi), "hin+eng"
    file: Optional[UploadFile] = File(None),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    raw_content = ""
    upload_bytes = None

    if input_type == "text":
        if not text_content or not text_content.strip():
            raise HTTPException(status_code=400, detail="Text content is required for text capture")
        raw_content = text_content.strip()

    elif input_type == "voice":
        if not file:
            raise HTTPException(status_code=400, detail="Audio file required for voice capture")
        upload_bytes = await file.read(25 * 1024 * 1024 + 1)

    elif input_type == "ocr":
        if file:
            upload_bytes = await file.read(25 * 1024 * 1024 + 1)
        elif text_content and text_content.strip():
            raw_content = text_content.strip()
        else:
            raise HTTPException(status_code=400, detail="Document image/PDF required for OCR capture")

    else:
        raise HTTPException(status_code=400, detail=f"Invalid input_type '{input_type}'")

    if upload_bytes is not None and (not upload_bytes or len(upload_bytes) > 25 * 1024 * 1024):
        raise HTTPException(400, "Upload must be non-empty and no larger than 25 MB")

    # Create KnowledgeItem
    item = KnowledgeItem(
        title=title or f"Matter Notes ({input_type.upper()})",
        author_id=current_user.id,
        firm_id=current_user.firm_id,
        practice_area=practice_area,
        raw_input_type=input_type,
        raw_text=raw_content,
        status="processing",
        current_stage=1,
    )
    session.add(item)
    await session.commit()
    await session.refresh(item)

    # Create initial PipelineJob
    job = PipelineJob(
        knowledge_item_id=item.id,
        stage=1,
        stage_name="Raw Capture",
        status="running",
    )
    session.add(job)
    await session.commit()
    await session.refresh(job)

    # Launch background task
    if upload_bytes is not None:
        background_tasks.add_task(process_upload, item.id, job.id, upload_bytes, input_type, file.filename or "upload", language or "eng")
    else:
        background_tasks.add_task(run_capture_pipeline, item.id, job.id, raw_content)

    return {
        "job_id": job.id,
        "knowledge_item_id": item.id,
        "status": "processing",
        "raw_preview": raw_content[:150],
    }
