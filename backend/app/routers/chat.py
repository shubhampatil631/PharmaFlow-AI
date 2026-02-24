from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.services.chat_service import chat_service

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

@router.post("", response_description="Send chat message")
async def chat(payload: ChatRequest):
    try:
        response = await chat_service.process_message(payload.message, payload.context)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
