from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.data.india_constitution import CONSTITUTION_ARTICLES, CONSTITUTION_PARTS

router = APIRouter(prefix="/constitution", tags=["constitution"])

@router.get("/parts")
async def get_constitution_parts():
    """Return all constitutional parts for categorization and filtering"""
    return CONSTITUTION_PARTS

@router.get("/articles")
async def get_constitution_articles(
    part: Optional[str] = Query(None, description="Filter by part ID (e.g. part3, part4)"),
    q: Optional[str] = Query(None, description="Search query across article number, title, doctrines, or text"),
):
    """
    List Indian Constitution articles with optional part and text/keyword search.
    Supports Hindi Devanagari and English search.
    """
    results = CONSTITUTION_ARTICLES

    if part and part != "all":
        results = [a for a in results if a.get("part_id") == part]

    if q and q.strip():
        query_str = q.strip().lower()
        filtered = []
        for a in results:
            match = (
                query_str in a.get("article_number", "").lower()
                or query_str in a.get("title_en", "").lower()
                or query_str in a.get("title_hi", "").lower()
                or query_str in a.get("full_text_en", "").lower()
                or query_str in a.get("full_text_hi", "").lower()
                or query_str in a.get("landmark_cases", "").lower()
                or any(query_str in t.lower() for t in a.get("tags", []))
                or any(query_str in d.lower() for d in a.get("key_doctrines", []))
            )
            if match:
                filtered.append(a)
        results = filtered

    return results

@router.get("/articles/{article_number}")
async def get_constitution_article_by_number(article_number: str):
    """Fetch single Constitution Article by number (e.g. '14', '21', 'Preamble')"""
    for a in CONSTITUTION_ARTICLES:
        if a.get("article_number", "").lower() == article_number.lower():
            return a
    raise HTTPException(status_code=404, detail=f"Article '{article_number}' not found in Constitution registry.")
