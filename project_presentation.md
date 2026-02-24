---
theme: gaia
_class: lead
paginate: true
backgroundColor: #fff
backgroundImage: url('https://marp.app/assets/hero-background.svg')
---

# **Gen-Z Agentic AI for Molecule Repurposing**

### Architecture, Solution, & Workflow

---

# **1. Technology Stack & Real-World Integration**

Our platform is built on a modern, high-performance stack designed for scientific data analysis.

### **Frontend**
- **Core**: React 18 + Vite (Fast HMR & Build)
- **UI/UX**: TailwindCSS + Lucide Icons (Professional Scientific Interface)
- **Visualization**: Recharts (Dynamic Real-time Charts)

### **Backend**
- **Framework**: FastAPI (High-performance Python Async API)
- **Database**: MongoDB + Motor (Async non-blocking storage)
- **AI/LLM**: Agentic Orchestration Layer (LangGraph/Custom)

### **Real-World API Integrations**
We integrate live scientific data sources, not just static datasets:
- **PubChem**: Molecular properties & 2D/3D structures.
- **ChEMBL**: Bioactivity and drug-target interactions.
- **PubMed**: Biomedical literature and latest research papers.
- **OpenTargets**: Genetics and disease associations.
- **ClinicalTrials.gov**: Real-time status of ongoing studies.

---

# **2. The Problem & Our Solution**

### **The Challenge**
Drug repurposing is manually intensive. Researchers must correlate data across:
- **Chemical Feasibility** (Is it stable?)
- **Patent Landscape** (Is it novel?)
- **Clinical History** (Is it safe?)
Identifying a viable candidate takes months of cross-referencing disjointed databases.

### **The Solution**
An **Autonomous Agentic Platform** that automates the early-stage discovery pipeline.
- **Unified Intelligence**: Aggregates 5+ global databases into a single view.
- **Active Reasoning**: Specialized AI Agents (Scholar, Patent, Safety) analyze data like a human researcher.
- **Scoring Engine**: Instantly calculates "Repurposing Viability" based on real-time metrics.

---

# **3. Project Workflow**

The end-to-end flow from input to actionable insight:

1.  **Ingestion & Search**
    - User searches for a Molecule (e.g., "Metformin") or Disease.
    - System instantly fetches base metadata from **PubChem**.

2.  **Autonomous Enrichment Layer**
    - **Parallel Execution**: Backend triggers async tasks to fetch Bioactivity (**ChEMBL**), Patents, and Trials (**ClinicalTrials**).
    - **Data Normalization**: Diverse API responses are standardized into a unified schema.

3.  **Agentic Analysis & Scoring**
    - **Research Agents**: Analyze retrieved text for keywords (toxicity, side effects).
    - **Scoring Service**: Computes a viability score (0-100) based on weighted factors.

4.  **Reporting & Interaction**
    - **Generative Reporting**: Compiles a comprehensive PDF dossier.
    - **RAG Chat**: User asks "Why is the safety score low?" and AI explains citing specific papers.

---
