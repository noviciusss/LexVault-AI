from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.capture import router as capture_router
from app.api.pipeline import router as pipeline_router
from app.api.approvals import router as approvals_router
from app.api.search import router as search_router
from app.api.chat import router as chat_router
from app.api.graph import router as graph_router
from app.api.admin import router as admin_router
from app.api.constitution import router as constitution_router
from app.api.statutes import router as statutes_router
from app.api.tools import router as tools_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(capture_router)
api_router.include_router(pipeline_router)
api_router.include_router(approvals_router)
api_router.include_router(search_router)
api_router.include_router(chat_router)
api_router.include_router(graph_router)
api_router.include_router(admin_router)
api_router.include_router(constitution_router)
api_router.include_router(statutes_router)
api_router.include_router(tools_router)
