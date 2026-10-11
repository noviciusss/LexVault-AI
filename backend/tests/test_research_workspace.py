"""Contract and isolation tests against a disposable SQLite database."""
import json
import os
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["GROQ_API_KEY"] = ""

import pytest
import pytest_asyncio
import httpx
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.main import app
from app.core import database
from app.core.database import get_session
from app.core.security import create_access_token
from app.models.firm import Firm
from app.models.user import User
from app.models.knowledge import KnowledgeItem
from app.models.pipeline import PipelineJob
from app.models.audit import AuditLogEntry
from app.services.groq_client import groq_client

@pytest_asyncio.fixture
async def client(monkeypatch):
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    maker = async_sessionmaker(engine, expire_on_commit=False)
    async with engine.begin() as connection:
        await connection.run_sync(SQLModel.metadata.create_all)
    async with maker() as session:
        session.add_all([Firm(id=1, name="First firm"), Firm(id=2, name="Second firm")])
        await session.flush()
        session.add_all([User(id=1, name="Lawyer A", email="a@test.law", hashed_password="unused", role="lawyer", firm_id=1), User(id=2, name="Partner A", email="partner@test.law", hashed_password="unused", role="admin", firm_id=1), User(id=3, name="Partner B", email="b@test.law", hashed_password="unused", role="admin", firm_id=2)])
        session.add_all([KnowledgeItem(id=1, title="Article 21 first firm", author_id=1, firm_id=1, status="published", current_stage=6, abstracted_insight="Privacy and dignity under Article 21"), KnowledgeItem(id=2, title="Second firm confidential strategy", author_id=3, firm_id=2, status="pending_approval", current_stage=5, raw_text="Other tenant raw text", sanitized_text="Other tenant sanitized", abstracted_insight="Other tenant strategy"), KnowledgeItem(id=3, title="First firm pending", author_id=1, firm_id=1, status="pending_approval", current_stage=5, abstracted_insight="First tenant pending")])
        session.add(PipelineJob(id=1, knowledge_item_id=2, stage=5, stage_name="Review", status="running"))
        session.add_all([AuditLogEntry(id=1, actor_id=2, action="CONSTITUTION_RESEARCH", firm_id=1), AuditLogEntry(id=2, actor_id=3, action="APPROVAL_GRANTED", firm_id=2)])
        await session.commit()
    async def override_session():
        async with maker() as session:
            yield session
    app.dependency_overrides[get_session] = override_session
    monkeypatch.setattr(database, "async_session_maker", maker)
    monkeypatch.setattr(groq_client, "_client", None)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as http:
        yield http
    app.dependency_overrides.clear()
    await engine.dispose()

def auth(user_id, role="admin"):
    return {"Authorization": f"Bearer {create_access_token(subject=user_id, role=role)}"}

@pytest.mark.asyncio
async def test_authenticated_tenant_boundaries(client):
    assert (await client.get("/api/knowledge")).status_code == 401
    first = (await client.get("/api/knowledge", headers=auth(1, "lawyer"))).json()
    assert [item["id"] for item in first] == [1]
    pending = (await client.get("/api/approvals", headers=auth(2))).json()
    assert [item["id"] for item in pending] == [3]
    assert (await client.get("/api/pipeline/1", headers=auth(2))).status_code == 404
    assert (await client.get("/api/pipeline/1", headers=auth(3))).status_code == 200
    assert (await client.get("/api/knowledge/2", headers=auth(2))).status_code == 404
    assert (await client.get("/api/knowledge/1", headers=auth(1))).status_code == 200
    graph = (await client.get("/api/graph", headers=auth(1))).json()
    assert all("Second firm" not in node["label"] for node in graph["nodes"])
    stats = (await client.get("/api/admin/stats", headers=auth(2))).json()
    assert stats["total_captured"] == 2
    assert stats["pending_approval"] == 1

@pytest.mark.asyncio
async def test_role_checks_and_audit_scoping(client):
    assert (await client.get("/api/admin/audit-log", headers=auth(1, "lawyer"))).status_code == 403
    assert (await client.get("/api/admin/users", headers=auth(1))).status_code == 403
    assert (await client.post("/api/admin/reseed", headers=auth(1))).status_code == 403
    assert (await client.post("/api/approvals/3/action", json={"action": "approve"}, headers=auth(1))).status_code == 403
    assert (await client.post("/api/approvals/2/action", json={"action": "approve"}, headers=auth(2))).status_code == 404
    assert (await client.post("/api/approvals/3/action", json={"action": "invalid"}, headers=auth(2))).status_code == 422
    logs = (await client.get("/api/admin/audit-log", headers=auth(3))).json()
    assert [event["id"] for event in logs] == [2]
    users = (await client.get("/api/admin/users", headers=auth(3))).json()
    assert [user["id"] for user in users] == [3]
    response = await client.post("/api/auth/register", json={"name": "Unauthorized partner", "email": "new@test.law", "password": "password", "role": "admin", "firm_id": 2})
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_constitution_research_and_bilingual_source_contract(client):
    articles = (await client.get("/api/constitution/articles?q=privacy")).json()
    assert any(article["article_number"] == "21" for article in articles)
    result = await client.post("/api/constitution/research", json={"question": "Explain Article 21 and privacy", "article_numbers": ["21"], "language": "hi"}, headers=auth(1))
    assert result.status_code == 200
    data = result.json()
    assert data["mode"] == "source_extract"
    assert "[Article 21]" in data["answer"]
    assert "प्राण" in data["answer"]
    assert data["sources"][0]["article_number"] == "21"
    assert data["sources"][0]["full_text_hi"]
    logs = (await client.get("/api/admin/audit-log?action=CONSTITUTION_RESEARCH", headers=auth(2))).json()
    assert any("21" in (event["details"] or "") for event in logs)
    assert (await client.post("/api/constitution/research", json={"question": "x"}, headers=auth(1))).status_code == 422

@pytest.mark.asyncio
async def test_persisted_threads_and_hearings_are_isolated(client):
    thread = {"title": "Privacy inquiry", "practiceArea": "Constitutional Law", "messages": [{"id": "message", "role": "user", "content": "Article 21?"}]}
    assert (await client.put("/api/workspace/threads/test-thread", json=thread, headers=auth(1))).status_code == 200
    assert (await client.put("/api/workspace/threads/test-thread", json=thread, headers=auth(3))).status_code == 404
    assert (await client.get("/api/workspace/threads", headers=auth(3))).json() == []
    assert len((await client.get("/api/workspace/threads", headers=auth(1))).json()) == 1
    hearing = (await client.post("/api/workspace/hearings", json={"title": "Writ petition", "court": "Delhi High Court", "date": "2026-11-12", "note": "Admission"}, headers=auth(1))).json()
    assert len((await client.get("/api/workspace/hearings", headers=auth(2))).json()) == 1
    assert (await client.get("/api/workspace/hearings", headers=auth(3))).json() == []
    assert (await client.delete(f"/api/workspace/hearings/{hearing['id']}", headers=auth(3))).status_code == 404
    assert (await client.delete(f"/api/workspace/hearings/{hearing['id']}", headers=auth(2))).status_code == 200

@pytest.mark.asyncio
async def test_stream_refusal_is_audited_and_drafting_prompt_is_shared(client, monkeypatch):
    import app.api.chat as chat_api
    from app.pipeline.stage8_response import response_prompts
    async def empty_retrieval(**kwargs):
        return [], ""
    monkeypatch.setattr(chat_api, "execute_stage7_retrieval", empty_retrieval)
    response = await client.post("/api/chat/stream", json={"question": "Unsupported request", "action_type": "draft_objection"}, headers=auth(1))
    events = [json.loads(line[6:]) for line in response.text.splitlines() if line.startswith("data: ")]
    assert events[0]["guardrail_applied"] is True
    assert any(event["type"] == "token" and "No supporting" in event["token"] for event in events)
    assert events[-1]["type"] == "done"
    history = (await client.get("/api/chat/history", headers=auth(1))).json()
    assert history[0]["guardrail_applied"] is True
    assert "preliminary objections" in response_prompts("question", "source", "draft_objection")[1]

@pytest.mark.asyncio
async def test_leap_day_limitation_and_no_fake_extraction(client):
    response = await client.get("/api/tools/limitation/calculate?case_type=specific_performance&trigger_date=2024-02-29")
    assert response.status_code == 200
    assert response.json()["computed_deadline"] == "2027-02-28"
    from app.services.ocr_service import ocr_service
    from app.services.whisper_service import whisper_service
    with pytest.raises(Exception):
        await ocr_service.extract_text(b"not a PDF", "broken.pdf")
    with pytest.raises(Exception):
        await whisper_service.transcribe(b"not audio")
