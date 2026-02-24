from app.providers.base import BaseProvider
from app.providers.schemas import LiteratureResult
from typing import List

class PubMedProvider(BaseProvider):
    def __init__(self):
        # Using Europe PMC as it offers a cleaner REST API for literature search
        super().__init__(base_url="https://www.ebi.ac.uk/europepmc/webservices/rest/search")

    async def search_literature(self, query: str, limit: int = 5) -> List[LiteratureResult]:
        """
        Search for scientific literature.
        """
        try:
            params = {
                "query": query,
                "format": "json",
                "pageSize": limit,
                "resultType": "core"
            }
            
            data = await self._get("", params=params)
            
            results = []
            if "resultList" in data and "result" in data["resultList"]:
                for item in data["resultList"]["result"]:
                    # Robust metadata extraction
                    journal_title = item.get("journalTitle")
                    if not journal_title and "journalInfo" in item:
                        journal_title = item["journalInfo"].get("journal", {}).get("title")
                    
                    pub_year = item.get("pubYear")
                    if not pub_year and "journalInfo" in item:
                         pub_year = item["journalInfo"].get("yearOfPublication")
                    
                    results.append(LiteratureResult(
                        title=item.get("title", "No Title"),
                        abstract=item.get("abstractText"),
                        journal=journal_title or "Journal Not Listed",
                        year=int(pub_year) if pub_year and str(pub_year).isdigit() else None,
                        pmid=item.get("pmid"),
                        doi=item.get("doi")
                    ))
            
            return results
        except Exception as e:
            print(f"Error in PubMed search: {e}")
            return []

pubmed_client = PubMedProvider()
