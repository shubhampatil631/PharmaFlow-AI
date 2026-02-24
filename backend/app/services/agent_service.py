import asyncio
import os
import json
from datetime import datetime
from typing import Dict, Any, AsyncGenerator
from bson import ObjectId
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# DB Setup
MONGO_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DATABASE_NAME", "pharmaceutical_agent")
client = MongoClient(MONGO_URL)
db = client[DB_NAME]
tasks_collection = db["agent_tasks"]

class AgentService:
    def __init__(self):
        # In-memory storage for active log streams (for simple broadcasting)
        # In production, use Redis. for MVP, memory is fine for single worker.
        self._active_streams: Dict[str, asyncio.Queue] = {}

    async def get_tasks(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Fetch all agent tasks."""
        query = {}
        limit = int(params.get("size", 10))
        skip = (int(params.get("page", 1)) - 1) * limit
        
        total = tasks_collection.count_documents(query)
        cursor = tasks_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        
        items = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            
            # Calculate dynamic progress
            progress = 0
            if doc.get("status") == "completed":
                progress = 100
            elif doc.get("status") == "failed":
                progress = 100  # Bar fills red
            elif doc.get("status") == "running":
                # Estimate progress based on log stages (Agent phases)
                logs = doc.get("logs", [])
                log_text = str(logs)
                if "Report Agent" in log_text: progress = 90
                elif "Internal Agent" in log_text: progress = 80
                elif "Web Agent" in log_text: progress = 70
                elif "Clinical Agent" in log_text: progress = 60
                elif "Patent Agent" in log_text: progress = 45
                elif "EXIM Agent" in log_text: progress = 30
                elif "Market Agent" in log_text: progress = 15
                else: progress = 5
                
            doc["progress"] = progress
            items.append(doc)
            
        return {
            "items": items,
            "total": total,
            "page": int(params.get("page", 1)),
            "size": limit
        }

    async def get_task_by_id(self, id: str) -> Dict[str, Any]:
        doc = tasks_collection.find_one({"_id": ObjectId(id)})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    async def create_task(self, molecule_id: str, molecule_name: str, focus_areas: list) -> Dict[str, Any]:
        """
        Creates a new Agent Task and starts the background worker.
        """
        new_task = {
            "molecule_id": molecule_id,
            "molecule_name": molecule_name,
            "focus_areas": focus_areas,
            "status": "initializing",
            "logs": [],
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "result": {"data": {}, "summary": ""}
        }
        
        res = tasks_collection.insert_one(new_task)
        task_id = str(res.inserted_id)
        new_task["_id"] = task_id
        
        # Start background processing (Fire & Forget)
        asyncio.create_task(self.run_crew_execution(task_id, molecule_name))
        
        return new_task

    async def run_crew_execution(self, task_id: str, molecule_name: str):
        """
        Executes the Multi-Agent Workflow using Worker Agents.
        """
        from app.services.worker_agents import (
            IqviaInsightsAgent, EximTrendsAgent, PatentLandscapeAgent,
            ClinicalTrialsAgent, InternalKnowledgeAgent, WebIntelligenceAgent,
            ReportGeneratorAgent
        )
        
        context = {}
        
        try:
            await self.log_update(task_id, f"🚀 Starting detailed analysis for {molecule_name}...")
            await self.update_status(task_id, "running")

            # --- Phase 1: Market & IP Landscape (Parallel-ish) ---
            await self.log_update(task_id, "🌍 [Market Agent] Analyzing market dynamics (IQVIA)...")
            iqvia = IqviaInsightsAgent()
            context["iqvia"] = await iqvia.execute(molecule_name)
            await self._save_partial_result(task_id, context)
            await self.log_update(task_id, f"   > Market Size: ${context['iqvia']['market_data']['current_market_size_usd_millions']}M")

            await self.log_update(task_id, "🚢 [EXIM Agent] Tracking supply chain trends...")
            exim = EximTrendsAgent()
            context["exim"] = await exim.execute(molecule_name)
            await self._save_partial_result(task_id, context)
            
            await self.log_update(task_id, "⚖️ [Patent Agent] assessing freedom to operate...")
            patent = PatentLandscapeAgent()
            context["patent"] = await patent.execute(molecule_name)
            await self._save_partial_result(task_id, context)
            await self.log_update(task_id, f"   > Primary Patent Expiry: {context['patent']['patent_status']['expiry_year']}")

            # --- Phase 2: Scientific & Clinical Validation ---
            await self.log_update(task_id, "🔬 [Clinical Agent] Fetching active trials (ClinicalTrials.gov)...")
            clinical = ClinicalTrialsAgent()
            context["clinical"] = await clinical.execute(molecule_name)
            await self._save_partial_result(task_id, context)
            await self.log_update(task_id, f"   > Found {context['clinical']['trials_count']} trials ({context['clinical']['active_trials_count']} active).")

            await self.log_update(task_id, "🌐 [Web Agent] Scanning scientific literature (PubMed)...")
            web = WebIntelligenceAgent()
            context["web"] = await web.execute(molecule_name)
            await self._save_partial_result(task_id, context)
            
            await self.log_update(task_id, "📂 [Internal Agent] Searching internal knowledge base...")
            internal = InternalKnowledgeAgent()
            context["internal"] = await internal.execute(molecule_name)
            await self._save_partial_result(task_id, context)

            # --- Phase 3: Synthesis & Reporting ---
            await self.log_update(task_id, "📝 [Report Agent] Synthesizing final report (Powered by Gemini)...")
            
            report_agent = ReportGeneratorAgent()
            report_out = await report_agent.execute(molecule_name, context)
            final_summary = report_out.get("summary", "Analysis completed.")
            final_recommendation = report_out.get("recommendation", "Strategic recommendation pending.")
            
            # Save Full Results for Report Service
            tasks_collection.update_one(
                {"_id": ObjectId(task_id)},
                {"$set": {
                    "result": {
                        "summary": final_summary,
                        "recommendation": final_recommendation,
                        "data": context
                    },
                    "status": "completed"
                }}
            )
            
            # Trigger Report Generation via Service (Auto-generate)
            from app.services.report_service import report_service
            report_path = report_service.generate_report(task_id)
            
            await self.log_update(task_id, f"✅ Report generated successfully: {os.path.basename(report_path)}")
            await self.update_status(task_id, "completed")

        except Exception as e:
            import traceback
            error_msg = f"❌ Error during execution: {str(e)}"
            print(traceback.format_exc())
            await self.log_update(task_id, error_msg)
            await self.update_status(task_id, "failed")

    async def log_update(self, task_id: str, message: str):
        """Append log to DB and push to active streams."""
        timestamp = datetime.utcnow().isoformat()
        log_entry = f"[{timestamp}] {message}"
        
        # DB Update
        tasks_collection.update_one(
            {"_id": ObjectId(task_id)},
            {"$push": {"logs": log_entry}, "$set": {"updated_at": timestamp}}
        )
        
        # Push to stream if active
        if task_id in self._active_streams:
            await self._active_streams[task_id].put(log_entry)

    async def _save_partial_result(self, task_id: str, context: Dict[str, Any]):
        """Helper to save partial results during execution."""
        try:
            from fastapi.encoders import jsonable_encoder
            # Exclude none to make it cleaner, but default is fine
            encoded_context = jsonable_encoder(context)
            
            tasks_collection.update_one(
                {"_id": ObjectId(task_id)},
                {"$set": {
                    "result.data": encoded_context,
                    "updated_at": datetime.utcnow().isoformat()
                }}
            )
        except Exception as e:
            err_msg = f"❌ DATA SAVE ERROR: {str(e)}"
            print(err_msg)
            # Log to DB so we can see it in verify_db
            tasks_collection.update_one(
                {"_id": ObjectId(task_id)},
                {"$push": {"logs": f"[{datetime.utcnow().isoformat()}] {err_msg}"}}
            )

    async def update_status(self, task_id: str, status: str):
        tasks_collection.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": {"status": status, "updated_at": datetime.utcnow().isoformat()}}
        )

    async def stream_task_logs(self, task_id: str) -> AsyncGenerator[str, None]:
        """
        Yields logs as Server-Sent Events (SSE).
        """
        queue = asyncio.Queue()
        self._active_streams[task_id] = queue
        
        try:
            # 1. Yield existing logs first
            task = await self.get_task_by_id(task_id)
            if task and "logs" in task:
                for log in task["logs"]:
                    yield json.dumps({"log": log})
            
            # 2. Yield new logs as they come
            while True:
                log = await queue.get()
                yield json.dumps({"log": log})
                
        except asyncio.CancelledError:
            # Cleanup when client disconnects
            del self._active_streams[task_id]

    async def delete_task(self, task_id: str) -> bool:
        """
        Deletes a task and its logs.
        """
        result = tasks_collection.delete_one({"_id": ObjectId(task_id)})
        return result.deleted_count > 0

    async def cancel_task(self, task_id: str) -> bool:
        """
        Cancels an active task. Note: in MVP, this just updates the status,
        the background coroutine might still finish.
        """
        result = tasks_collection.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": {"status": "cancelled", "updated_at": datetime.utcnow().isoformat()}}
        )
        return result.modified_count > 0

    async def get_worker_config(self, worker_name: str) -> Dict[str, Any]:
        """
        Get configuration for a specific worker.
        """
        # Checks DB or returns defaults
        # For MVP we can store in a new collection or same tasks collection? 
        # Better: new collection `agent_configs`
        doc = db["agent_configs"].find_one({"_id": worker_name})
        if doc:
            return doc.get("config", {})
        
        # Defaults
        return {
            "max_results": 20,
            "similarity_threshold": 0.7,
            "temperature": 0.2
        }

    async def update_worker_config(self, worker_name: str, config: Dict[str, Any]) -> bool:
        """
        Update worker configuration.
        """
        db["agent_configs"].update_one(
            {"_id": worker_name},
            {"$set": {"config": config, "updated_at": datetime.utcnow().isoformat()}},
            upsert=True
        )
        return True

agent_service = AgentService()
