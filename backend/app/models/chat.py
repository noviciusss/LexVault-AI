from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Column
import sqlalchemy as sa

class ChatQuery(SQLModel, table=True):
    __tablename__ = "chat_queries"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    firm_id: int = Field(default=1, foreign_key="firms.id")
    
    question: str = Field(sa_column=Column(sa.Text))
    answer: str = Field(sa_column=Column(sa.Text))
    
    # JSON list of retrieved and cited knowledge items
    retrieved_item_ids: Optional[str] = Field(default="[]", sa_column=Column(sa.Text))
    guardrail_applied: bool = Field(default=False)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChatRequest(SQLModel):
    question: str
    practice_area: Optional[str] = None

class ChatResponse(SQLModel):
    id: int
    question: str
    answer: str
    cited_items: list[dict]
    guardrail_applied: bool
    created_at: datetime
