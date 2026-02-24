from fastapi import APIRouter, HTTPException
from app.services.dashboard_service import dashboard_service

router = APIRouter()

@router.get("", response_description="Get dashboard stats")
def get_dashboard_stats():
    try:
        return dashboard_service.get_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
