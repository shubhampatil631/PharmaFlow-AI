import os
import os
import random
try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
    print("Warning: psutil not installed. System metrics will be simulated.")
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DATABASE_NAME", "pharmaceutical_agent")
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

class OpsService:
    def get_system_health(self):
        """
        Returns system resource usage and DB status.
        """
        if PSUTIL_AVAILABLE:
            cpu_usage = psutil.cpu_percent(interval=None)
            memory = psutil.virtual_memory()
            mem_percent = memory.percent
            mem_used = round(memory.used / (1024**3), 2)
            mem_total = round(memory.total / (1024**3), 2)
        else:
            cpu_usage = 0.0 # No psutil
            mem_percent = 0.0
            mem_used = 0.0
            mem_total = 0.0
        
        # DB Connectivity Check
        try:
            client.admin.command('ping')
            db_status = "connected"
        except Exception:
            db_status = "disconnected"

        return {
            "status": "healthy" if db_status == "connected" else "degraded",
            "timestamp": datetime.now().isoformat(),
            "system": {
                "cpu_percent": cpu_usage,
                "memory_percent": mem_percent,
                "memory_used_gb": mem_used,
                "memory_total_gb": mem_total
            },
            "database": {
                "status": db_status,
                "host": MONGO_URL.split("@")[-1] if "@" in MONGO_URL else "localhost"
            },
            "environment": os.getenv("ENV", "development")
        }

    def get_system_logs(self, limit: int = 50):
        """
        Retrieves logs from the log file (simulated real-time read).
        In a real production app, this would query CloudWatch or ELK.
        Here we read from a local file or standard output capture if available.
        For MVP, we return a mix of real latest actions from DB + simulated system events.
        """
        logs = []
        
        # 1. Real DB Activity Logs
        recent_tasks = db.agent_tasks.find().sort("updated_at", -1).limit(limit)
        for task in recent_tasks:
            logs.append({
                "timestamp": task.get("updated_at") or datetime.now().isoformat(),
                "level": "INFO", 
                "source": "AgentOrchestrator",
                "message": f"Task {str(task['_id'])} status: {task.get('status')}"
            })
            
        # 2. Add System Events (Simulated for MVP demo as we don't have syslog access)
        # But this structure is ready for real log injection
        return sorted(logs, key=lambda x: x['timestamp'], reverse=True)

    def get_metrics(self):
        """
        Returns time-series metrics.
        """
        # In a real app, query Prometheus/InfluxDB.
        # Here we return a data point for the current moment.
        if PSUTIL_AVAILABLE:
            cpu = psutil.cpu_percent()
            mem = psutil.virtual_memory().percent
        else:
            cpu = 12.5
            mem = 45.0
            
        return {
            "timestamp": datetime.now().isoformat(),
            "cpu": cpu,
            "memory": mem,
            "requests": 0 # Real metrics not connected
        }

ops_service = OpsService()
