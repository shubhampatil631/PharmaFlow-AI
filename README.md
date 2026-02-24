# PharmaFlow Intelligence Platform

PharmaFlow is an advanced, AI-driven intelligence platform tailored for the pharmaceutical industry. It leverages a multi-agent architecture to perform deep real-time research, data integration, and document generation, focusing on molecule discovery, clinical trials, intellectual property, and market analysis.

## Project Structure

This repository is divided into two primary services:

- **[`frontend/`](./frontend)**: A React-based single-page application built with Vite and Tailwind CSS. It provides the user interface for dashboards, chat interactions, and data visualization.
- **[`backend/`](./backend)**: A FastAPI Python service that powers the multi-agent system. It handles data ingestion, API integrations (PubChem, ClinicalTrials.gov, OpenTargets, ChEMBL), LLM processing (Google Gemini), and report generation.

## Getting Started

To run the full application locally, you need to start both the frontend and backend development servers.

### 1. Start the Backend

```bash
cd backend
python -m venv venv
# On Windows: .\venv\Scripts\activate
# On Unix or MacOS: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
The FastAPI instance will be available at `http://localhost:8000`.

### 2. Start the Frontend

In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The React application will be available at `http://localhost:5173` (or the port specified by Vite).

## Architecture Highlights
- **RAG via Agents**: Uses domain-specific worker agents to fetch live data rather than depending solely on a vector database.
- **Dynamic Search**: Real-time semantic and hybrid search capabilities.
- **Automated Reporting**: Generates comprehensive PDF reports summarizing molecule data, patents, supply chain details, and competitive landscape.
