from typing import Optional, Any
from datetime import datetime
from sqlmodel import SQLModel, Field, Column
import sqlalchemy as sa

class KnowledgeItem(SQLModel, table=True):
    __tablename__ = "knowledge_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: Optional[str] = Field(default="Untitled Insight")
    author_id: int = Field(foreign_key="users.id")
    firm_id: int = Field(default=1, foreign_key="firms.id")
    practice_area: Optional[str] = Field(default="General Corporate")
    
    # Status: draft, processing, pending_approval, approved, rejected, published
    status: str = Field(default="processing", index=True)
    
    # Raw input
    raw_input_type: str = Field(default="text")  # text, voice, ocr
    raw_text: Optional[str] = Field(default=None, sa_column=Column(sa.Text))
    
    # Stage 2 cleaned text
    cleaned_text: Optional[str] = Field(default=None, sa_column=Column(sa.Text))
    
    # Stage 3 PII stripped text + entities log
    sanitized_text: Optional[str] = Field(default=None, sa_column=Column(sa.Text))
    pii_entities_found: Optional[str] = Field(default="[]", sa_column=Column(sa.Text))  # JSON string
    
    # Stage 4 Strategy Abstraction
    abstracted_insight: Optional[str] = Field(default=None, sa_column=Column(sa.Text))
    key_takeaways: Optional[str] = Field(default=None, sa_column=Column(sa.Text))
    
    # Stage tracking (1 to 8)
    current_stage: int = Field(default=1)
    
    # Stage 5 Approval
    approved_by: Optional[int] = Field(default=None, foreign_key="users.id")
    approved_at: Optional[datetime] = Field(default=None)
    rejection_reason: Optional[str] = Field(default=None)
    
    # Stage 6 IDs in External Stores
    vector_id: Optional[str] = Field(default=None)
    graph_node_id: Optional[str] = Field(default=None)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class KnowledgeItemRead(SQLModel):
    id: int
    title: Optional[str]
    author_id: int
    firm_id: int
    practice_area: Optional[str]
    status: str
    raw_input_type: str
    sanitized_text: Optional[str]
    abstracted_insight: Optional[str]
    pii_entities_found: Optional[str]
    current_stage: int
    created_at: datetime
    approved_at: Optional[datetime]
