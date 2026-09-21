from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Column
import sqlalchemy as sa

class PipelineJob(SQLModel, table=True):
    __tablename__ = "pipeline_jobs"

    id: Optional[int] = Field(default=None, primary_key=True)
    knowledge_item_id: int = Field(foreign_key="knowledge_items.id", index=True)
    stage: int = Field(default=1)
    stage_name: str = Field(default="Capture")
    
    # Status: pending, running, done, failed, waiting_approval
    status: str = Field(default="pending", index=True)
    
    output_preview: Optional[str] = Field(default=None, sa_column=Column(sa.Text))
    error_message: Optional[str] = Field(default=None, sa_column=Column(sa.Text))
    
    started_at: datetime = Field(default_factory=datetime.utcnow)
    finished_at: Optional[datetime] = Field(default=None)

class PipelineJobRead(SQLModel):
    id: int
    knowledge_item_id: int
    stage: int
    stage_name: str
    status: str
    output_preview: Optional[str]
    error_message: Optional[str]
    started_at: datetime
    finished_at: Optional[datetime]
