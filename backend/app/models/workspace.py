from datetime import date, datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Column
import sqlalchemy as sa

class Hearing(SQLModel, table=True):
    __tablename__ = "hearings"
    id: Optional[int] = Field(default=None, primary_key=True)
    firm_id: int = Field(index=True, foreign_key="firms.id")
    user_id: int = Field(foreign_key="users.id")
    title: str
    court: str
    date: date
    note: str = ""

class ResearchThread(SQLModel, table=True):
    __tablename__ = "research_threads"
    id: str = Field(primary_key=True)
    firm_id: int = Field(index=True, foreign_key="firms.id")
    user_id: int = Field(index=True, foreign_key="users.id")
    title: str
    practice_area: str = "Constitutional Law & Fundamental Rights"
    messages_json: str = Field(default="[]", sa_column=Column(sa.Text))
    updated_at: datetime = Field(default_factory=datetime.utcnow)
