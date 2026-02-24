from app.providers.pubchem import pubchem_client
from app.providers.pubmed import pubmed_client
from app.providers.clinical_trials import clinical_trials_client
from app.providers.opentargets import opentargets_client
from app.providers.chembl import chembl_client
from datetime import datetime
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from typing import List, Dict, Any
from bson import ObjectId

load_dotenv()

# Database Connection (Simple for MVP, can be moved to a shared db module later)
MONGO_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DATABASE_NAME", "pharmaceutical_agent")
client = MongoClient(MONGO_URL)
db = client[DB_NAME]
molecules_collection = db["molecules"]

class MoleculeService:
    async def get_molecules(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Fetch molecules from DB with simple pagination/filtering. 
        Returns {items: [...], total: N}
        """
        query = {}
        if params.get("q"):
            query["name"] = {"$regex": params.get("q"), "$options": "i"}
            
        if params.get("status"):
            # Map human readable UI values to db values
            statuses = params.get("status").split(",")
            db_statuses = []
            for s in statuses:
                db_statuses.append(s.strip().lower().replace(" ", "_"))
            if db_statuses:
                query["status"] = {"$in": db_statuses}
        
        limit = int(params.get("size", 10))
        skip = (int(params.get("page", 1)) - 1) * limit
        
        total = molecules_collection.count_documents(query)
        cursor = molecules_collection.find(query).skip(skip).limit(limit)
        
        items = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            items.append(doc)
            
        return {
            "items": items,
            "total": total,
            "page": int(params.get("page", 1)),
            "size": limit
        }

    async def get_molecule_by_id(self, id: str) -> Dict[str, Any]:
        """
        Get single molecule details by ID.
        """
        doc = molecules_collection.find_one({"_id": ObjectId(id)})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    async def update_molecule(self, id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing molecule entry.
        """
        # Ensure _id is not in update_data
        update_data.pop("_id", None)
        update_data["updated_at"] = datetime.now().isoformat()
        molecules_collection.update_one({"_id": ObjectId(id)}, {"$set": update_data})
        return await self.get_molecule_by_id(id)

    async def create_molecule(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new molecule entry. 
        Fetches basic usage data from PubChem immediately.
        """
        name = request_data.get("name")
        # Check if exists
        existing = molecules_collection.find_one({"name": {"$regex":f"^{name}$", "$options": "i"}})
        if existing:
            existing["_id"] = str(existing["_id"])
            return existing

        # Fetch PubChem Data
        pubchem_data = await pubchem_client.get_molecule(name)
        
        # Structure payload
        new_molecule = {
            "name": pubchem_data.name, # Use official name if found
            "cas_number": request_data.get("cas_number") or pubchem_data.cas_number,
            "synonyms": request_data.get("synonyms", []),
            "description": request_data.get("description") or pubchem_data.description,
            "indication": request_data.get("indication", ""),
            "formula": pubchem_data.formula,
            "molecular_weight": pubchem_data.molecular_weight,
            "smiles": pubchem_data.smiles,
            "cid": pubchem_data.cid, # PubChem ID
            "iupac_name": pubchem_data.iupac_name,
            "structure_2d": pubchem_data.structure_2d,
            "structure_3d": pubchem_data.structure_3d,
            "status": "new",
            "repurposing_score": None,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        result = molecules_collection.insert_one(new_molecule)
        new_molecule["_id"] = str(result.inserted_id)
        return new_molecule

    async def run_deep_analysis(self, id: str):
        """
        Triggers an Agent Task for this molecule.
        """
        doc = await self.get_molecule_by_id(id)
        if not doc:
            return False
            
        # Import here to avoid circular dependency
        from app.services.agent_service import agent_service
        
        # Create a real Agent Task
        task = await agent_service.create_task(
            molecule_id=id,
            molecule_name=doc["name"],
            focus_areas=["General Repurposing"]
        )
        
        # Update status locally
        molecules_collection.update_one({"_id": ObjectId(id)}, {"$set": {"status": "in_evaluation"}})
        
        # Return the new task ID
        return task["_id"]

    async def enrich_molecule_data(self, id: str) -> Dict[str, Any]:
        """
        Fetches external data (Literature, Trials) and updates the molecule.
        """
        doc = await self.get_molecule_by_id(id)
        if not doc:
            return None
            
        name = doc["name"]
        
        # Parallel Fetch (simple await for MVP, but gather is better)
        # using asyncio.gather for speed
        import asyncio
        
        literature_task = pubmed_client.search_literature(name)
        trials_task = clinical_trials_client.search_trials(name)
        targets_task = opentargets_client.get_targets_for_drug(name)
        bioactivity_task = chembl_client.get_bioactivity_by_name(name)
        
        results = await asyncio.gather(literature_task, trials_task, targets_task, bioactivity_task, return_exceptions=True)
        
        literature = results[0] if not isinstance(results[0], Exception) else []
        trials = results[1] if not isinstance(results[1], Exception) else []
        targets = results[2] if not isinstance(results[2], Exception) else []
        bioactivity = results[3] if not isinstance(results[3], Exception) else []
        
        update_data = {
            "literature": [item.dict() for item in literature],
            "clinical_trials": [item.dict() for item in trials],
            "targets": [item.dict() for item in targets],
            "bioactivity": [item.dict() for item in bioactivity],
            "last_enriched_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }

        
        molecules_collection.update_one({"_id": ObjectId(id)}, {"$set": update_data})
        
        # Return updated doc
        return await self.get_molecule_by_id(id)

molecule_service = MoleculeService()

