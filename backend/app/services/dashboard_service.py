import os
from datetime import datetime
from typing import Dict, Any, List
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DATABASE_NAME", "pharmaceutical_agent")
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

class DashboardService:
    def get_stats(self) -> Dict[str, Any]:
        """
        Returns high-level statistics for the dashboard.
        """
        # 1. Counts
        total_molecules = db.molecules.count_documents({})
        molecules_analyzed = db.molecules.count_documents({"status": {"$in": ["analyzed", "completed"]}})
        
        total_docs = db.ingestion_documents.count_documents({})
        
        # Agent Tasks Stats
        total_tasks = db.agent_tasks.count_documents({})
        active_agents = db.agent_tasks.count_documents({"status": "running"})
        pending_reviews = db.agent_tasks.count_documents({"status": {"$in": ["failed", "pending"]}})

        # 2. Recent Molecules (limit 5)
        recent_molecules_cursor = db.molecules.find().sort("updated_at", -1).limit(5)
        recent_molecules = []
        for m in recent_molecules_cursor:
            recent_molecules.append({
                "id": str(m.get("_id", "")),
                "name": m.get("name", "Unknown"),
                "indication": m.get("indication") or m.get("therapeutic_area") or "N/A",
                "stage": m.get("status", "New").title(),
                "updated": m.get("updated_at") or m.get("last_enriched_at") or m.get("created_at")
            })

        # 3. Active Agent Tasks (limit 5)
        active_tasks_cursor = db.agent_tasks.find({"status": "running"}).sort("created_at", -1).limit(5)
        active_tasks = []
        for t in active_tasks_cursor:
            active_tasks.append({
                "task": f"Analysis: {t.get('molecule_name')}",
                "agent": "Orchestrator", # Simplified for list
                "progress": 50, # Mock progress for now as we don't track % yet
                "status": "Processing"
            })
            
        # Fallback if no active tasks, show completed ones
        if not active_tasks:
             recent_tasks_cursor = db.agent_tasks.find().sort("updated_at", -1).limit(5)
             for t in recent_tasks_cursor:
                active_tasks.append({
                    "task": f"Analysis: {t.get('molecule_name')}",
                    "agent": "Orchestrator",
                    "progress": 100 if t.get("status") == "completed" else 0,
                    "status": t.get("status", "Unknown").title()
                })

        # 4. Real System Alerts
        alerts = []
        
        # Recent Task Events
        recent_log_tasks = db.agent_tasks.find().sort("updated_at", -1).limit(5)
        for t in recent_log_tasks:
            status = t.get("status")
            mol = t.get("molecule_name", "Unknown")
            if status == "completed":
                alerts.append({
                    "msg": f"Analysis completed for {mol}",
                    "time": t.get("updated_at", datetime.now()).strftime("%H:%M") if isinstance(t.get("updated_at"), datetime) else "Recently",
                    "type": "success",
                    "sort_key": t.get("updated_at", datetime.min)
                })
            elif status == "failed":
                alerts.append({
                    "msg": f"Analysis failed for {mol}",
                    "time": "Recently",
                    "type": "error",
                    "sort_key": t.get("updated_at", datetime.min)
                })
            elif status == "running":
                 alerts.append({
                    "msg": f"Agent started analysis for {mol}",
                    "time": "Active",
                    "type": "info",
                    "sort_key": t.get("created_at", datetime.min)
                })

        # Recent Doc Events
        recent_docs = db.ingestion_documents.find().sort("created_at", -1).limit(3)
        for d in recent_docs:
             alerts.append({
                "msg": f"Ingested document: {d.get('filename')}",
                "time": "Recently",
                "type": "info",
                "sort_key": d.get("created_at", datetime.min)
            })
            
        # Sort and limit
        alerts.sort(key=lambda x: x["sort_key"], reverse=True)
        # Remove sort key for JSON serialization
        final_alerts = []
        for a in alerts[:5]:
            # Ensure time is string
            final_alerts.append({
                "msg": a["msg"],
                "time": str(a["time"]),
                "type": a["type"]
            })
            
        if not final_alerts:
             final_alerts = [{"msg": "System operational", "time": "Now", "type": "success"}]
        
        alerts = final_alerts

        return {
            "stats": {
                "active_molecules": total_molecules,
                "docs_ingested": total_docs,
                "active_agents": active_agents,
                "pending_reviews": pending_reviews
            },
            "recent_molecules": recent_molecules,
            "active_tasks": active_tasks,
            "alerts": alerts
        }

dashboard_service = DashboardService()
