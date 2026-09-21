from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Column
import sqlalchemy as sa

class AuditLogEntry(SQLModel, table=True):
    __tablename__ = "audit_log_entries"

    id: Optional[int] = Field(default=None, primary_key=True)
    actor_id: Optional[int] = Field(default=None, foreign_key="users.id")
    actor_name: Optional[str] = Field(default="System")
    
    # action: CAPTURE, LOCAL_AI_CLEAN, PII_REMOVAL, STRATEGY_ABSTRACTION, APPROVAL, REJECTION, VECTOR_EMBED, GRAPH_INGEST, RAG_QUERY
    action: str = Field(index=True)
    target_type: str = Field(default="KnowledgeItem")
    target_id: Optional[int] = Field(default=None)
    
    details: Optional[str] = Field(default=None, sa_column=Column(sa.Text))
    metadata_json: Optional[str] = Field(default="{}", sa_column=Column(sa.Text))
    
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)

class AuditLogRead(SQLModel):
    id: int
    actor_id: Optional[int]
    actor_name: Optional[str]
    action: str
    target_type: str
    target_id: Optional[int]
    details: Optional[str]
    metadata_json: Optional[str]
    timestamp: datetime
