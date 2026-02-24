import os
import asyncio
from typing import Dict, Any, List
from datetime import datetime
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv
from app.services.llm_service import llm_service

load_dotenv()
MONGO_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DATABASE_NAME", "pharmaceutical_agent")
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

class ChatService:
    def __init__(self):
        self.last_context = None

    async def process_message(self, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Process user message using RAG + LLM.
        """
        try:
            # 1. Context Retrieval
            context_data = []
            sources = []
            
            # Variables for context management
            matched_full_data = None
            matched_pretty_summary = None
            
            # A. Check Specific IDs from Context (Explicit user request from UI)
            molecule_id = context.get("molecule_id") if context else None
            document_id = context.get("document_id") if context else None
            
            if molecule_id:
                task = db.agent_tasks.find_one({"_id": ObjectId(molecule_id)}) if ObjectId.is_valid(molecule_id) else None
                if not task:
                    task = db.agent_tasks.find_one({"molecule_id": molecule_id}) # Alternate lookup
                
                if task:
                    mol_name = task.get("molecule_name", "the molecule")
                    data = task.get("result", {}).get("data", {})
                    matched_full_data = f"SPECIFIC ANALYSIS REPORT FOR {mol_name}:\n{str(data)}"
                    matched_pretty_summary = self._format_data_summary(mol_name, data)
                    new_source = {"title": f"Analysis: {mol_name}", "type": "report", "id": str(task["_id"])}
                    sources.append(new_source)
                    context_data.append(matched_full_data[:12000])

            if document_id:
                doc = db.ingestion_documents.find_one({"_id": ObjectId(document_id)}) if ObjectId.is_valid(document_id) else None
                if doc:
                    doc_text = f"SPECIFIC UPLOADED DOCUMENT ({doc.get('filename')}):\n{doc.get('parsed_content')}"
                    context_data.append(doc_text[:12000])
                    sources.append({"title": doc.get('filename'), "type": "document", "id": str(doc["_id"])})

            # B. Check Agent Tasks (Heuristic / Keyword Analysis)
            if not matched_full_data:
                cleaned_query = message.replace("Tell me about", "").replace("Analyze", "").strip()
                tasks_list = list(db.agent_tasks.find(
                    {"status": "completed", "result.data": {"$exists": True}},
                    {"molecule_name": 1, "result": 1, "updated_at": 1}
                ).sort("updated_at", -1).limit(10))
                
                match_found = False
                matched_count = 0
                for t in tasks_list:
                    mol_name = t.get("molecule_name", "")
                    
                    # Match specific molecule, or inject top 3 if asking a wide question
                    is_generic_query = any(q in message.lower() for q in ["compare", "all", "reports", "molecules"])
                    if mol_name and (mol_name.lower() in message.lower() or cleaned_query.lower() in mol_name.lower() or is_generic_query):
                        match_found = True
                        data = t.get("result", {}).get("data", {})
                        mol_full_data = f"ANALYSIS REPORT FOR {mol_name}:\n{str(data)}"
                        new_source = {"title": f"Analysis: {mol_name}", "type": "report", "id": str(t["_id"])}
                        sources.append(new_source)
                        
                        context_data.append(mol_full_data[:6000]) # Cap to fit multiples in logic window
                        matched_count += 1
                        if matched_count >= 3: # Limit context to max 3 full reports
                            break
                            
                # Cross-report generic metadata if no specific molecule requested
                if not match_found and not document_id:
                    gen_context = "OVERVIEW OF AVAILABLE REPORTS IN DATABASE:\n"
                    for t in tasks_list[:5]:
                        mol_name = t.get("molecule_name", "")
                        data = t.get("result", {}).get("data", {})
                        gen_context += self._format_data_summary(mol_name, data) + "\n\n"
                    context_data.append(gen_context)
                    
                # Cache the combined contexts
                if context_data and not document_id:
                    self.last_context = {
                        "full": "\n\n".join(context_data),
                        "summary": "Multiple/Generic reports context loaded.",
                        "sources": sources
                    }
            
            # C. Check Ingested Documents (Broad Search)
            if not document_id:
                from app.services.search_service import search_service
                search_res = search_service.search(message, limit=3, filters=["document"])
                if search_res.get("results"):
                    doc_context = "RELATED INTERNAL DOCUMENTS:\n"
                    for res in search_res["results"]:
                         # We need the full content for RAG, so we re-fetch
                         full_doc = db.ingestion_documents.find_one({"_id": ObjectId(res["id"])}) if ObjectId.is_valid(res["id"]) else None
                         if full_doc:
                            doc_context += f"- Source: {full_doc.get('filename')}\n  Content: {full_doc.get('parsed_content', '')[:3000]}\n"
                            sources.append(res)
                    context_data.append(doc_context)

            # Use Memory fallback ONLY if it's a short continuation
            if not context_data and self.last_context and len(message.strip().split()) < 4:
                print("DEBUG: Using retained context for short continuation query.")
                matched_full_data = self.last_context["full"]
                sources.extend(self.last_context["sources"])
                if matched_full_data:
                    context_data.append(matched_full_data[:10000])

            # 2. Formulate Prompt
            system_instruction = """You are 'PharmaFlow AI'. 
            Your goal is to help scientists analyze drugs and repurposing opportunities based ON THE CONTEXT below.
            
            CRITICAL INSTRUCTIONS:
            1. ONLY answer the specific question asked by the user. If they ask about Patents, ONLY output patent data. DO NOT provide an overall summary unless explicitly requested.
            2. If the user gives a short confirmation like "yes", "all", or "give me complete report", provide a comprehensive summary of the ENTIRE context.
            3. Use the CONTEXT DATA to answer questions. Do not ask clarifying questions to dodge providing data. Give them the factual data.
            4. If the user asks to compare or asks about multiple reports, analyze and synthesize data across ALL provided reports in the context.
            5. If the user's message is ONLY "hi", "hello", or "greetings" with no other question attached, simply say "Hello, I am PharmaFlow AI. How can I help you today?". But if the user asks ANY question (e.g., "can you give me Amoxicillin clinical trial"), you MUST ignore the greeting rule and actually answer their question using the data!
            6. Be professional, concise, and scientific.
            7. Do NOT say 'Hello I am your assistant' explicitly in every single reply.
            """
            
            if context_data:
                system_context = f"{system_instruction}\n\nCONTEXT DATA:\n" + "\n".join(context_data)
            else:
                system_context = system_instruction + "\n(No internal database records found for this query)"

            # 3. Generate Response
            # Combine system context and user message properly for the general text-generation endpoint
            full_prompt = f"{system_context}\n\nUSER QUESTION: {message}"
            response_text = await llm_service.generate_hybrid_content(full_prompt, is_json=False)
            
            if response_text is None:
                # LLM Failure Fallback (Quota/Network)
                if matched_pretty_summary:
                     response_text = f"**Note**: AI service is busy. Here is the data summary:\n\n{matched_pretty_summary}"
                elif context_data:
                     response_text = f"**Note**: AI service is busy. Found records:\n\n{context_data[0][:500]}..."
                else:
                     response_text = "I am currently unable to process complex queries due to high traffic/error. Please search for a molecule."

            return {
                "message": response_text,
                "sender": "agent",
                "timestamp": datetime.now().isoformat(),
                "sources": sources
            }
            
        except Exception as e:
            print(f"Chat Error: {e}")
            import traceback
            traceback.print_exc()
            return {
                "message": "I apologize, but I encountered a system error processing your request.",
                "sender": "agent",
                "timestamp": datetime.now().isoformat()
            }

    def _format_data_summary(self, mol_name: str, data: Dict[str, Any]) -> str:
        """Helper to format detailed JSON into readable Markdown"""
        summary = [f"### Analysis Data for {mol_name}"]
        
        # Market
        if "iqvia" in data:
            mkt = data["iqvia"].get("market_data", {})
            val = mkt.get('projected_market_size_2030', 'N/A')
            cagr = mkt.get('cagr_percent', 'N/A')
            summary.append(f"- **Market Outlook**: ${val}M by 2030 (CAGR {cagr}%)")
        
        # Clinical
        if "clinical" in data:
            clin = data["clinical"]
            active = clin.get('active_trials_count', 0)
            breakdown = clin.get('recruitment_breakdown', {})
            recruiting = breakdown.get('Recruiting', 0)
            summary.append(f"- **Clinical Status**: {active} active trials ({recruiting} recruiting).")
            
        # Patent
        if "patent" in data:
            pat = data["patent"].get("patent_status", {})
            status = pat.get('freedom_to_operate', 'Unknown')
            expiry = pat.get('expiry_year', 'Unknown')
            summary.append(f"- **IP Landscape**: {status} (Expiry: {expiry})")
            
        # Supply
        if "exim" in data:
            exim = data["exim"].get("trade_data", {})
            risk = exim.get('supply_risk', 'Unknown')
            summary.append(f"- **Supply Chain**: Risk Level - {risk}")
            
        return "\n".join(summary)

chat_service = ChatService()


chat_service = ChatService()
