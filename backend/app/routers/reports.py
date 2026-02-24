from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from app.services.report_service import report_service
import os

router = APIRouter()

@router.get("", response_description="List reports")
def list_reports():
    return report_service.list_reports()

@router.post("/generate/{task_id}")
def generate_report(task_id: str):
    try:
        path = report_service.generate_report(task_id)
        return {"message": "Report generated", "path": path}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download/{task_id}")
def download_report(task_id: str):
    # Find task to get path (or check standard path)
    # Ideally service should handle retrieval
    # For MVP, we query service/db again or trust pattern
    
    # In a real app, use service.get_report_path(task_id)
    # We'll do a quick lookup here or assume it's generated
    filename = f"report_{task_id}.html"
    file_path = os.path.join("reports", filename)
    
    if not os.path.exists(file_path):
         # Try PDF backward compat
         file_path = file_path.replace(".html", ".pdf")
         
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Report not found. Generate it first.")
        
    return FileResponse(file_path, filename=os.path.basename(file_path))

@router.get("/{task_id}", response_description="Get report details")
def get_report(task_id: str):
    report = report_service.get_report(task_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.delete("/{task_id}", response_description="Delete a report")
def delete_report(task_id: str):
    success = report_service.delete_report(task_id)
    if not success:
         # Note: Idempotency - if already gone, maybe 200 ok? But 404 implies "not found to delete"
         # For UI feedback 404 is fine or just 200.
         raise HTTPException(status_code=404, detail="Report not found or already deleted")
    return {"message": "Report deleted"}
