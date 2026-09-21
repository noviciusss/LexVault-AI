from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

class Firm(SQLModel, table=True):
    __tablename__ = "firms"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
