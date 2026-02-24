from fastapi import FastAPI
from app.routers import molecules, ingestion, agents, search, scoring, reports, chat, ops, dashboard
from dotenv import load_dotenv
import os

load_dotenv()
# Trigger reload

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

app = FastAPI(title="GEN_Z Agentic AI API")

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    mongo_url = os.getenv("MONGODB_URL", "NOT_SET")
    # Hide password in logs
    masked_url = mongo_url.split("@")[-1] if "@" in mongo_url else "localhost"
    print(f"🚀 API Starting... Connecting to DB at ...{masked_url}")

@app.get("/")
def read_root():
    return {"message": "Welcome to GEN_Z Agentic AI API"}

app.include_router(molecules.router, prefix="/api/molecules", tags=["molecules"])
app.include_router(ingestion.router, prefix="/api/ingestion", tags=["ingestion"])
app.include_router(agents.router, prefix="/api/agents", tags=["agents"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(scoring.router, prefix="/api/scoring", tags=["scoring"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(ops.router, prefix="/api/ops", tags=["Operations"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
