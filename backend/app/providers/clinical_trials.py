from app.providers.base import BaseProvider
from app.providers.schemas import ClinicalTrial
from typing import List
import requests
import asyncio

class ClinicalTrialsProvider(BaseProvider):
    def __init__(self):
        # New API v2 endpoint
        super().__init__(base_url="https://clinicaltrials.gov/api/v2")
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json"
        }

    async def search_trials(self, query: str, limit: int = 50) -> List[ClinicalTrial]:
        """
        Search clinical trials using requests (sync) wrapped in asyncio to avoid httpx WAF blocking.
        """
        try:
            params = {
                "query.term": query,
                "pageSize": 50,  # Increased from 5 to 50 for comprehensive scan
                "format": "json"
            }
            url = f"{self.base_url}/studies"
            
            # Use requests.get in a separate thread to prevent blocking
            def fetch():
                return requests.get(url, params=params, headers=self.headers, timeout=10)

            response = await asyncio.to_thread(fetch)
            response.raise_for_status()
            data = response.json()
            
            trials = []
            if "studies" in data:
                for study in data["studies"]:
                    protocol = study.get("protocolSection", {})
                    id_module = protocol.get("identificationModule", {})
                    status_module = protocol.get("statusModule", {})
                    design_module = protocol.get("designModule", {})
                    conditions_module = protocol.get("conditionsModule", {})
                    
                    trials.append(ClinicalTrial(
                        nct_id=id_module.get("nctId"),
                        title=id_module.get("briefTitle"),
                        phase=", ".join(design_module.get("phases", [])) if design_module.get("phases") else None,
                        status=status_module.get("overallStatus"),
                        conditions=conditions_module.get("conditions", []),
                        url=f"https://clinicaltrials.gov/study/{id_module.get('nctId')}"
                    ))
            
            return trials
        except Exception as e:
            print(f"Error in ClinicalTrials search: {e}")
            return []

clinical_trials_client = ClinicalTrialsProvider()
