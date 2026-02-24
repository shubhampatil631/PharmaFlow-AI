from fastapi import APIRouter, HTTPException, Query, Body
from app.services.molecule_service import molecule_service
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

# -- Request Models --
class CreateMoleculeRequest(BaseModel):
    name: str
    cas_number: Optional[str] = None
    synonyms: Optional[List[str]] = []
    description: Optional[str] = None

class RequestEvalRequest(BaseModel):
    priority: str = "normal"
    focus_areas: List[str] = []

# -- Endpoints --

@router.get("", response_description="List all molecules")
async def get_molecules(
    q: Optional[str] = Query(None, description="Search term for molecule name"),
    status: Optional[str] = Query(None, description="Comma-separated list of statuses"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100)
):
    """
    Get a list of molecules with pagination and search.
    """
    params = {"q": q, "status": status, "page": page, "size": size}
    results = await molecule_service.get_molecules(params)
    return results

@router.post("", response_description="Add new molecule")
async def create_molecule(payload: CreateMoleculeRequest = Body(...)):
    """
    Add a new molecule to the system. 
    This automatically fetches basic data from PubChem.
    """
    try:
        molecule = await molecule_service.create_molecule(payload.dict())
        return molecule
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{id}", response_description="Get a single molecule")
async def get_molecule(id: str):
    """
    Get detailed information about a specific molecule.
    """
    molecule = await molecule_service.get_molecule_by_id(id)
    if not molecule:
        raise HTTPException(status_code=404, detail=f"Molecule {id} not found")
    return molecule

@router.put("/{id}", response_description="Update a molecule")
async def update_molecule(id: str, payload: dict = Body(...)):
    """
    Update details of an existing molecule.
    """
    # Verify existence
    molecule = await molecule_service.get_molecule_by_id(id)
    if not molecule:
        raise HTTPException(status_code=404, detail=f"Molecule {id} not found")
        
    try:
        updated = await molecule_service.update_molecule(id, payload)
        return updated
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{id}/request-eval", response_description="Trigger analysis")
async def request_evaluation(id: str, payload: RequestEvalRequest = Body(...)):
    """
    Request a deep analysis (Agent Workflow) for a molecule.
    """
    # Verify existence
    molecule = await molecule_service.get_molecule_by_id(id)
    if not molecule:
        raise HTTPException(status_code=404, detail=f"Molecule {id} not found")

    # In Module 3, this will call AgentService.create_task()
    # For now (Module 2), we'll trigger the data fetcher directly to verify integration
    try:
        task_id = await molecule_service.run_deep_analysis(id)
        if not task_id:
            raise HTTPException(status_code=500, detail="Failed to start analysis") # Changed from 404 to 500 as molecule existence is already checked
        return {"message": "Analysis started", "task_id": task_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{id}/enrich", response_description="Sync external data")
async def enrich_molecule(id: str):
    """
    Trigger an enrichment process to sync external data for a molecule.
    """
    try:
        result = await molecule_service.enrich_molecule_data(id)
        if not result:
             raise HTTPException(status_code=404, detail="Molecule not found or enrichment failed") # Added detail for clarity
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

