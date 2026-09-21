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

router = APIRouter(prefix="/capture", tags=["capture"])

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

    if input_type == "text":
        if not text_content or not text_content.strip():
            raise HTTPException(status_code=400, detail="Text content is required for text capture")
        raw_content = text_content.strip()

    elif input_type == "voice":
        if not file:
            raise HTTPException(status_code=400, detail="Audio file required for voice capture")
        audio_bytes = await file.read()
        raw_content = await whisper_service.transcribe(audio_bytes, filename=file.filename or "voice.wav")

    elif input_type == "ocr":
        if file:
            file_bytes = await file.read()
            raw_content = await ocr_service.extract_text(
                file_bytes,
                filename=file.filename or "doc.pdf",
                lang=language or "eng",
            )
        elif text_content and text_content.strip():
            raw_content = text_content.strip()
        else:
            raise HTTPException(status_code=400, detail="Document image/PDF required for OCR capture")

    else:
        raise HTTPException(status_code=400, detail=f"Invalid input_type '{input_type}'")

    if not raw_content:
        raw_content = "Brief notes regarding client transaction and indemnity provisions."

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
    background_tasks.add_task(run_capture_pipeline, item.id, job.id, raw_content)

    return {
        "job_id": job.id,
        "knowledge_item_id": item.id,
        "status": "processing",
        "raw_preview": raw_content[:150],
    }
