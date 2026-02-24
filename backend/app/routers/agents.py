from fastapi import APIRouter, HTTPException, Query, Body, Request
from sse_starlette.sse import EventSourceResponse
from app.services.agent_service import agent_service
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class CreateTaskRequest(BaseModel):
    molecule_id: str
    molecule_name: str
    focus_areas: list = []

@router.get("", response_description="List all tasks")
async def get_tasks(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100)
):
    params = {"page": page, "size": size}
    return await agent_service.get_tasks(params)

@router.post("", response_description="Start a new agent task")
async def create_task(payload: CreateTaskRequest = Body(...)):
    try:
        task = await agent_service.create_task(
            payload.molecule_id, 
            payload.molecule_name, 
            payload.focus_areas
        )
        return task
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{id}", response_description="Get task details")
async def get_task(id: str):
    task = await agent_service.get_task_by_id(id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("/{id}/cancel", response_description="Cancel a task")
async def cancel_task(id: str):
    success = await agent_service.cancel_task(id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task cancelled successfully", "id": id}

@router.get("/{id}/stream", response_description="Stream task logs")
async def stream_task_logs(id: str, request: Request):
    """
    Server-Sent Events (SSE) endpoint for real-time logs.
    """
    event_generator = agent_service.stream_task_logs(id)
    return EventSourceResponse(event_generator)
@router.delete("/{id}", response_description="Delete a task")
async def delete_task(id: str):
    success = await agent_service.delete_task(id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully", "id": id}

@router.get("/workers/{name}/config", response_description="Get worker config")
async def get_worker_config(name: str):
    return await agent_service.get_worker_config(name)

@router.post("/workers/{name}/config", response_description="Update worker config")
async def update_worker_config(name: str, config: dict = Body(...)):
    await agent_service.update_worker_config(name, config)
    return {"message": "Configuration updated"}
