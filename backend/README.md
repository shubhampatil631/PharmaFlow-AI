# PharmaFlow Backend

This directory contains the Python FastAPI backend for the PharmaFlow Intelligence Platform. It is responsible for orchestrating the multi-agent system, managing API integrations, serving search requests, and producing analytical reports.

## Tech Stack

- **Web Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Server**: Uvicorn
- **LLM Integration**: Google Generative AI (Gemini)
- **Data Validation**: Pydantic
- **Database**: MongoDB (motor) - *Note: Schema patterns are primarily used, database implementation varies depending on environment.*
- **PDF Generation**: WeasyPrint & Jinja2
- **Document Processing**: PyMuPDF, python-docx, pdfminer.six

## Directory Structure

```text
app/
├── routers/        # FastAPI route definitions (endpoints for molecules, chat, reports, agents)
├── services/       # Core business logic containing the RAG system and functional services
└── providers/      # External API integrations (OpenTargets, PubChem, ClinicalTrials, Gemini)
```

## Setup & Local Development

### Prerequisites
- Python 3.10+
- A `.env` file in this directory containing your required API keys (e.g., `GEMINI_API_KEY`).

### Installation
1. Create a virtual environment: `python -m venv venv`
2. Activate the environment:
   - Windows: `.\venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`

### Running the Server
To run the server in development mode so that it autoreloads when you make changes to the code:
```bash
uvicorn main:app --reload
```
By default, the server runs on port 8000. Interactive API documentation generated automatically by FastAPI can be found at `http://localhost:8000/docs`.

## Agents Architecture
The backend utilizes asynchronous Python functions as "Worker Agents" (found in `app/services/worker_agents.py`). These agents map to various data providers in `app/providers/` to fetch real, live data about molecular targets, patents, trials,, and more, mitigating hallucination via RAG principles.
