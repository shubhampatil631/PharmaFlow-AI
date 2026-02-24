from fastapi import APIRouter, HTTPException
from app.services.ops_service import ops_service

router = APIRouter()

@router.get("/health", response_description="Get system health")
def get_health():
    try:
        return ops_service.get_system_health()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs", response_description="Get system logs")
def get_logs():
    return ops_service.get_system_logs()

@router.get("/metrics", response_description="Get system metrics")
def get_metrics():
    return ops_service.get_metrics()
