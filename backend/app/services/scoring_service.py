import os
from typing import Dict, Any
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DATABASE_NAME", "pharmaceutical_agent")
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

class ScoringService:
    def get_score(self, task_id: str) -> Dict[str, Any]:
        """
        Calculate/Retrieve score based on Agent Task outcome.
        """
        task = db.agent_tasks.find_one({"_id": ObjectId(task_id)})
        if not task:
            return None
            
        result = task.get("result", {})
        base_score = result.get("score", 0) if result else 0
        
        # Heuristic Logic (MVP)
        # In real system, this would analyze the text of the agent's findings
        
        confidence = "Low"
        if base_score > 75:
            confidence = "High"
        elif base_score > 50:
            confidence = "Medium"
            
        return {
            "task_id": task_id,
            "molecule_name": task.get("molecule_name"),
            "repurposing_score": base_score,
            "risk_score": max(0, 100 - base_score),
            "confidence": confidence,
            "explanation": result.get("summary", "Analysis pending."),
            "components": [
                {"id": "safety", "label": "Safety Profile", "score": min(100, base_score + 10), "weight": 0.4},
                {"id": "efficacy", "label": "Efficacy Evidence", "score": base_score, "weight": 0.4},
                {"id": "novelty", "label": "Novelty / IP", "score": max(0, base_score - 20), "weight": 0.2}
            ]
        }

    def recompute_score(self, task_id: str, components: list) -> Dict[str, Any]:
        """
        Recalculate score based on user-defined weights.
        """
        # Logic: Weighted Average
        total_weight = sum(c.get("weight", 0) for c in components)
        if total_weight == 0:
            return {"repurposing_score": 0, "risk_score": 0, "explanation": "Weights cannot be zero."}
            
        weighted_sum = sum(c.get("score", 0) * c.get("weight", 0) for c in components)
        new_score = int(weighted_sum / total_weight)
        
        return {
            "repurposing_score": new_score,
            "risk_score": max(0, 100 - new_score),
            "explanation": f"Score recalculated based on custom weights (Safety: {components[0]['weight']}, Efficacy: {components[1]['weight']}, Novelty: {components[2]['weight']})."
        }

    def save_snapshot(self, task_id: str, snapshot_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Saves a scoring scenario snapshot to DB.
        """
        snapshot = {
            "task_id": task_id,
            "created_at": datetime.utcnow().isoformat(),
            "data": snapshot_data,
            "name": snapshot_data.get("name", f"Scenario {datetime.utcnow().strftime('%H:%M')}")
        }
        res = db.score_snapshots.insert_one(snapshot)
        snapshot["_id"] = str(res.inserted_id)
        return snapshot

    def get_snapshots(self, task_id: str) -> List[Dict[str, Any]]:
        """
        Retrieves saved scenarios for a task.
        """
        cursor = db.score_snapshots.find({"task_id": task_id}).sort("created_at", -1)
        return [{**doc, "_id": str(doc["_id"])} for doc in cursor]


scoring_service = ScoringService()
