import json
from datetime import date, datetime
from typing import Literal
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.core.database import get_session
from app.core.deps import get_current_user
from app.models.user import User
from app.models.workspace import Hearing, ResearchThread

router = APIRouter(prefix="/workspace", tags=["workspace"])

class HearingInput(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    court: str = Field(min_length=1, max_length=300)
    date: date
    note: str = Field(default="", max_length=4000)

@router.get("/hearings")
async def hearings(session: AsyncSession = Depends(get_session), user: User = Depends(get_current_user)):
    return (await session.execute(select(Hearing).where(Hearing.firm_id == user.firm_id).order_by(Hearing.date))).scalars().all()

@router.post("/hearings")
async def add_hearing(data: HearingInput, session: AsyncSession = Depends(get_session), user: User = Depends(get_current_user)):
    record = Hearing(**data.model_dump(), firm_id=user.firm_id, user_id=user.id)
    session.add(record)
    await session.commit()
    await session.refresh(record)
    return record

@router.delete("/hearings/{hearing_id}")
async def remove_hearing(hearing_id: int, session: AsyncSession = Depends(get_session), user: User = Depends(get_current_user)):
    record = await session.get(Hearing, hearing_id)
    if not record or record.firm_id != user.firm_id:
        raise HTTPException(404, "Hearing not found")
    if record.user_id != user.id and user.role != "admin":
        raise HTTPException(403, "Only the creator or a partner may remove a hearing")
    await session.delete(record)
    await session.commit()
    return {"status": "deleted"}

class ThreadInput(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    practiceArea: str = Field(default="Constitutional Law & Fundamental Rights", max_length=300)
    messages: list[dict] = Field(default_factory=list, max_length=300)

def thread_read(record):
    return {"id": record.id, "title": record.title, "practiceArea": record.practice_area,
            "messages": json.loads(record.messages_json), "updatedAt": record.updated_at.isoformat()}

@router.get("/threads")
async def threads(session: AsyncSession = Depends(get_session), user: User = Depends(get_current_user)):
    records = (await session.execute(select(ResearchThread).where(ResearchThread.firm_id == user.firm_id, ResearchThread.user_id == user.id).order_by(ResearchThread.updated_at.desc()))).scalars().all()
    return [thread_read(record) for record in records]

@router.put("/threads/{thread_id}")
async def save_thread(thread_id: str, data: ThreadInput, session: AsyncSession = Depends(get_session), user: User = Depends(get_current_user)):
    if len(thread_id) > 100:
        raise HTTPException(400, "Invalid thread identifier")
    encoded = json.dumps(data.messages)
    if len(encoded) > 1_000_000:
        raise HTTPException(413, "Conversation is too large")
    record = await session.get(ResearchThread, thread_id)
    if record and (record.firm_id != user.firm_id or record.user_id != user.id):
        raise HTTPException(404, "Conversation not found")
    if not record:
        record = ResearchThread(id=thread_id, user_id=user.id, firm_id=user.firm_id, title=data.title)
    record.title = data.title
    record.practice_area = data.practiceArea
    record.messages_json = encoded
    record.updated_at = datetime.utcnow()
    session.add(record)
    await session.commit()
    return thread_read(record)

@router.delete("/threads/{thread_id}")
async def delete_thread(thread_id: str, session: AsyncSession = Depends(get_session), user: User = Depends(get_current_user)):
    record = await session.get(ResearchThread, thread_id)
    if not record or record.firm_id != user.firm_id or record.user_id != user.id:
        raise HTTPException(404, "Conversation not found")
    await session.delete(record)
    await session.commit()
    return {"status": "deleted"}
