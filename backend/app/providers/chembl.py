from app.providers.base import BaseProvider
from app.providers.schemas import BioactivityData
from typing import List

class ChEMBLProvider(BaseProvider):
    def __init__(self):
        super().__init__(base_url="https://www.ebi.ac.uk/chembl/api/data")

    async def get_chembl_id(self, name: str) -> str:
        """
        Search for ChEMBL ID by name.
        """
        try:
            # Using the search endpoint
            endpoint = f"/molecule/search?q={name}&format=json"
            data = await self._get(endpoint)
            
            molecules = data.get("molecules", [])
            if molecules:
                return molecules[0].get("molecule_chembl_id")
            return None
        except Exception as e:
            print(f"Error in ChEMBL ID search: {e}")
            return None

    async def get_bioactivity_by_name(self, name: str, limit: int = 10) -> List[BioactivityData]:
        chembl_id = await self.get_chembl_id(name)
        if not chembl_id:
            return []
        return await self.get_bioactivity(chembl_id, limit)

    async def get_bioactivity(self, molecule_chembl_id: str, limit: int = 5) -> List[BioactivityData]:
        """
        Get bioactivity data for a molecule.
        """
        try:
            params = {
                "molecule_chembl_id": molecule_chembl_id,
                "limit": limit,
                "format": "json"
            }
            
            # Using activity endpoint
            data = await self._get("/activity.json", params=params)
            
            activities = []
            if "activities" in data:
                for item in data["activities"]:
                    activities.append(BioactivityData(
                        target_chembl_id=item.get("target_chembl_id"),
                        target_name=item.get("target_pref_name"), 
                        standard_type=item.get("standard_type"),
                        standard_value=float(item.get("standard_value")) if item.get("standard_value") and item.get("standard_value").replace('.', '', 1).isdigit() else None,
                        standard_units=item.get("standard_units")
                    ))
            
            return activities
        except Exception as e:
            print(f"Error in ChEMBL bioactivity search: {e}")
            return []

chembl_client = ChEMBLProvider()
