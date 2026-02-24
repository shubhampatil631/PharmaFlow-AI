from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from app.services.ingestion_service import ingestion_service
from typing import List

router = APIRouter()

@router.get("/connectors", response_description="List active connectors")
def get_connectors():
    return ingestion_service.get_connectors()

@router.post("/connectors/{id}/run", response_description="Run a connector")
async def run_connector(id: str):
    try:
        return await ingestion_service.run_connector(id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/jobs", response_description="List background ingestion jobs")
def get_jobs():
    return ingestion_service.get_jobs()

@router.get("/documents", response_description="List uploaded documents")
def get_documents(
    q: str = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100)
):
    params = {"q": q, "page": page, "size": size}
    return ingestion_service.get_documents(params)

@router.get("/documents/{id}", response_description="Get document details")
def get_document(id: str):
    doc = ingestion_service.get_document_by_id(id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.post("/upload/doc", response_description="Upload a document")
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form("Undefined Title"),
    source: str = Form("Manual Upload")
):
    try:
        doc = await ingestion_service.upload_document(file, title, source)
        return doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.delete("/documents/{id}", response_description="Delete a document")
def delete_document(id: str):
    success = ingestion_service.delete_document(id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document deleted successfully", "id": id}
