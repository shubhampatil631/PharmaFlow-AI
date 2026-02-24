from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import List
from app.services.search_service import search_service

router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    limit: int = 20
    filters: List[str] = []

@router.post("", response_description="Search across system")
def search_post(payload: SearchRequest):
    try:
        results = search_service.search(payload.query, payload.limit, payload.filters)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_description="Search across system")
def search_get(q: str, limit: int = 20, type: str = None):
    # type can be comma separated "molecule,document"
    filters = type.split(",") if type else []
    try:
        results = search_service.search(q, limit, filters)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
