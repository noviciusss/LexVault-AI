from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    hashed_password: str
    role: str = Field(default="lawyer")  # lawyer, reviewer, admin
    firm_id: int = Field(default=1, foreign_key="firms.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserRead(SQLModel):
    id: int
    name: str
    email: str
    role: str
    firm_id: int

class UserLogin(SQLModel):
    email: str
    password: str

class UserCreate(SQLModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "lawyer"
    firm_id: Optional[int] = 1
