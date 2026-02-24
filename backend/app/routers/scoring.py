from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from app.services.scoring_service import scoring_service

router = APIRouter()

@router.get("/{task_id}", response_description="Get repurposing score")
def get_score(task_id: str):
    score = scoring_service.get_score(task_id)
    if not score:
        raise HTTPException(status_code=404, detail="Score not found or Task invalid")
    return score

class RecomputeRequest(BaseModel):
    components: list

@router.post("/{task_id}/recompute", response_description="Recompute score")
def recompute_score(task_id: str, payload: RecomputeRequest):
    return scoring_service.recompute_score(task_id, payload.components)

@router.post("/{task_id}/snapshots", response_description="Save scenario")
def save_snapshot(task_id: str, payload: dict = Body(...)):
    return scoring_service.save_snapshot(task_id, payload)

@router.get("/{task_id}/snapshots", response_description="Get scenarios history")
def get_snapshots(task_id: str):
    return scoring_service.get_snapshots(task_id)
