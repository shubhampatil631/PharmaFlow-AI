import os
from typing import Dict, Any, List
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DATABASE_NAME", "pharmaceutical_agent")
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

class SearchService:
    def search(self, query: str, limit: int = 20, filters: List[str] = None) -> Dict[str, Any]:
        """
        Performs a multi-modal search across Molecules and Documents with filtering.
        """
        results = []
        filters = filters or []
        # Case insensitive filters
        filters = [f.lower() for f in filters]
        
        include_molecules = not filters or "molecule" in filters or "molecules" in filters
        include_documents = not filters or "document" in filters or "documents" in filters
        
        include_reports = not filters or "report" in filters or "reports" in filters

        # 1. Search Molecules
        if include_molecules:
            mol_cursor = db.molecules.find({
                "$or": [
                    {"name": {"$regex": query, "$options": "i"}},
                    {"description": {"$regex": query, "$options": "i"}},
                    {"synonyms": {"$regex": query, "$options": "i"}}
                ]
            }).limit(limit // 3)
            
            for doc in mol_cursor:
                results.append({
                    "id": str(doc["_id"]),
                    "type": "molecule",
                    "title": doc["name"],
                    "subtitle": (doc.get("description") or "")[:100] + "...",
                    "metadata": {
                        "status": doc.get("status"),
                        "molecular_weight": doc.get("molecular_weight")
                    },
                    "score": 1.0 
                })
        
        # 2. Search Agent Reports (Deep Data Search)
        if include_reports:
            report_cursor = db.agent_tasks.find({
                "status": "completed",
                "$or": [
                    {"molecule_name": {"$regex": query, "$options": "i"}},
                    {"result.data.executive_summary": {"$regex": query, "$options": "i"}},
                    {"result.data.strategic_summary": {"$regex": query, "$options": "i"}},
                    {"result.data.patent.patent_status.freedom_to_operate": {"$regex": query, "$options": "i"}}
                ]
            }).limit(limit // 3)

            for task in report_cursor:
                 # Extract some key insights for subtitle
                 data = task.get("result", {}).get("data", {})
                 subtitle = "Comprehensive Analysis Report"
                 if "iqvia" in data:
                     mkt = data["iqvia"].get("market_data", {}).get("projected_market_size_2030")
                     if mkt:
                         subtitle += f" • Market 2030: ${mkt}M"
                 
                 results.append({
                    "id": str(task["_id"]),
                    "type": "report",
                    "title": f"Analysis: {task.get('molecule_name')}",
                    "subtitle": subtitle,
                    "metadata": {
                        "generated_date": task.get("updated_at"),
                        "report_url": f"/reports/view/{str(task['_id'])}" 
                    },
                    "score": 1.2 # Boost reports
                 })

        # 3. Search Documents
        if include_documents:
            doc_cursor = db.ingestion_documents.find({
                "$or": [
                    {"filename": {"$regex": query, "$options": "i"}},
                    {"parsed_content": {"$regex": query, "$options": "i"}}
                ]
            }).limit(limit // 3)
            
            for doc in doc_cursor:
                 results.append({
                    "id": str(doc["_id"]),
                    "type": "document",
                    "title": doc["filename"],
                    "subtitle": (doc.get("summary") or "")[:100] + "...",
                    "metadata": {
                        "file_size": doc.get("file_size"),
                        "source": doc.get("source", "upload")
                    },
                     "score": 0.8
                })
                
        # Generate NLP Summary (Dynamic)
        mol_count = len([r for r in results if r["type"] == "molecule"])
        doc_count = len([r for r in results if r["type"] == "document"])
        
        summary = f"Found {len(results)} matches for '{query}'."
        if results:
            summary += f" Identified {mol_count} relevant molecules and {doc_count} supporting documents."
            if mol_count > 0:
                top_mol = next(r for r in results if r["type"] == "molecule")
                summary += f" Top hit: {top_mol['title']}."
        else:
            summary += " Try broadening your search terms or checking valid synonyms."

        return {
            "query": query,
            "total_results": len(results),
            "results": results,
            "summary": summary
        }

search_service = SearchService()
