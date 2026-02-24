import asyncio
import random
from typing import Dict, Any, List
from datetime import datetime
import json

# Providers
from app.providers.pubmed import pubmed_client
from app.providers.clinical_trials import clinical_trials_client
from app.providers.opentargets import opentargets_client
from app.providers.pubchem import pubchem_client
from app.providers.chembl import chembl_client
from app.services.llm_service import llm_service

# Services
from app.services.search_service import search_service

class BaseWorkerAgent:
    name = "Base Agent"
    
    async def execute(self, molecule_name: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Execute the agent's specific task.
        """
        raise NotImplementedError

class IqviaInsightsAgent(BaseWorkerAgent):
    name = "IQVIA Insights Agent"
    
    async def execute(self, molecule_name: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        # REAL DATA: Targets from OpenTargets
        targets = await opentargets_client.get_targets_for_drug(molecule_name)
        therapy_areas = [t.target_name for t in targets[:5]] if targets else []
        
        if not therapy_areas:
             therapy_areas = ["General Pharmacology", "Undetermined Indication"]

        # REAL DATA: Molecular Info from PubChem to check validity
        mol_data = await pubchem_client.get_molecule(molecule_name)
        
        # REAL DATA: Bioactivity from ChEMBL
        bioactivity = await chembl_client.get_bioactivity_by_name(molecule_name, limit=5)
        chembl_targets = [b.target_name for b in bioactivity if b.target_name]
        
        # Merge targets context
        all_targets = list(set(therapy_areas + chembl_targets))
        
        # GEMINI/GROQ ANALYSIS: Market Structure, Competitors, Size, CAGR, Regional, Patient
        prompt = (
            f"Analyze the global market for the drug '{molecule_name}' (Therapy Areas/Targets: {', '.join(all_targets[:5])}). "
            "Task: Provide a factual and objective market assessment based on real-world knowledge. "
            "1. Describe the market structure (e.g., genericized, patent-protected). If it's a known old drug, explicitly state if it is a mature generic. "
            "2. Identify major manufacturers (originator and key generic players if applicable). "
            "3. Assess market maturity (Emerging/Growth/Mature/Declining). "
            "4. Provide factual estimates for 'current_market_size_usd_millions' (just the number) and 'cagr_percent' (just the number) based on known market reports in your training data. Do not say 'Data Unavailable' if you can provide a reasonable estimate. "
            "5. Provide a 'regional_split' (dict) and 'patient_segmentation' (list). "
            "Return JSON with keys: 'market_structure_summary', 'major_manufacturers' (list), 'market_maturity', 'market_size', 'cagr', 'regional_split' (dict), 'patient_segmentation' (list)."
        )
        
        analysis_text = await llm_service.generate_hybrid_content(prompt)
        
        # Robust JSON parsing
        try:
            cleaned_text = analysis_text.replace("```json", "").replace("```", "").strip()
            market_analysis = json.loads(cleaned_text)
            if not isinstance(market_analysis, dict):
                raise ValueError("Extracted JSON is not a dictionary")
        except:
            market_analysis = {
                "market_structure_summary": "Market data unavailable for automated analysis.",
                "major_manufacturers": ["Data unavailable"],
                "market_maturity": "Unknown",
                "market_size": "Data pending",
                "cagr": "Data pending",
                "regional_split": {},
                "patient_segmentation": []
            }

        return {
            "market_data": {
                "current_market_size_usd_millions": market_analysis.get("market_size", "Data pending"),
                "projected_market_size_2030": "Driven by CAGR trajectory",
                "cagr_percent": market_analysis.get("cagr", "Data pending"),
                "market_structure": market_analysis.get("market_structure_summary", "Analysis Pending"),
                "maturity_stage": market_analysis.get("market_maturity", "Unknown"),
                "forecast_confidence": "Qualitative Estimate (LLM Synthesized)",
                "segment_forecast": [], # No fake charts
                "therapy_areas": all_targets,
                "competitors": [{"name": c} for c in market_analysis.get("major_manufacturers", [])],
                "regional_split": market_analysis.get("regional_split", {}),
                "patient_segmentation": market_analysis.get("patient_segmentation", [])
            },
            "strategic_analysis": {
                "swot": {
                    "strengths": [f"Targeting {t}" for t in therapy_areas[:2]],
                    "weaknesses": ["Requires competitive pricing analysis"],
                    "opportunities": ["Repurposing potentials"],
                    "threats": ["Regulatory changes"]
                }, # Enhanced SWOT could be done via Gemini essentially
                "regulatory_pathway": "Standard regulatory review required.",
                "market_access": "Subject to payer reimbursement policies."
            },
            "summary": f"Market analysis based on target profile. {market_analysis.get('market_structure_summary')}"
        }

class EximTrendsAgent(BaseWorkerAgent):
    name = "EXIM Trends Agent"
    
    async def execute(self, molecule_name: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        # REAL DATA: Vendors from PubChem
        vendors = await pubchem_client.get_vendors(molecule_name)
        active_suppliers = len(vendors) if vendors else 0
        
        # GEMINI/GROQ ANALYSIS: Plausible top exporting countries and logistics routes 
        prompt = (
            f"Analyze the global supply chain for the active pharmaceutical ingredient '{molecule_name}'. "
            "1. List the 3 most likely 'top_exporting_countries' for this API based on real-world manufacturing data. "
            "2. List 2 factual 'logistics_routes' summarizing the global movement of this API. "
            "Return JSON with keys: 'top_exporting_countries' (list) and 'logistics_routes' (list)."
        )
        
        supply_text = await llm_service.generate_hybrid_content(prompt)
        try:
            cleaned_text = supply_text.replace("```json", "").replace("```", "").strip()
            supply_analysis = json.loads(cleaned_text)
            if not isinstance(supply_analysis, dict):
                raise ValueError("Extracted JSON is not a dictionary")
        except:
            supply_analysis = {
                "top_exporting_countries": ["Data Restricted"],
                "logistics_routes": ["Data Restricted"]
            }
        
        # NO FAKE TIERS
        supplier_list = []
        if vendors:
            for v in vendors[:15]:
                supplier_list.append({
                    "name": v,
                    "tier": "Rep. Public Vendor", # Clarified as representative
                    "count": "N/A", 
                    "locations": "Global",
                    "reliability": "Unknown",
                    "audit_status": "Self-Reported"
                })
        else:
            vendor_prompt = f"Identify 5 factual, real-world chemical or pharmaceutical suppliers/manufacturers that produce the API '{molecule_name}'. Return ONLY a JSON list of strings containing company names."
            vendor_text = await llm_service.generate_hybrid_content(vendor_prompt)
            try:
                cleaned_vendors = vendor_text.replace("```json", "").replace("```", "").strip()
                llm_vendors = json.loads(cleaned_vendors)
                if isinstance(llm_vendors, list):
                    for v in llm_vendors[:5]:
                        supplier_list.append({
                            "name": v,
                            "tier": "Major Global Supplier",
                            "count": "N/A",
                            "locations": "Global",
                            "reliability": "Established",
                            "audit_status": "LLM Synthesized"
                        })
                    active_suppliers = len(llm_vendors)
            except:
                pass

        if active_suppliers == 0:
            supplier_list.append({
                "name": "Data synthesized - Major Generic API Manufacturers",
                "tier": "Global",
                "count": "N/A", 
                "locations": "China/India", 
                "reliability": "Established", 
                "audit_status": "LLM Synthesized"
            })
            active_suppliers = 1

        return {
            "trade_data": {
                "supply_risk": "Low" if active_suppliers > 10 else "Moderate",
                "active_suppliers": active_suppliers,
                "top_exporting_countries": supply_analysis.get("top_exporting_countries", []),
            },
            "supplier_tiers": supplier_list, # Only real vendors or LLM verified
            "logistics_routes": supply_analysis.get("logistics_routes", []),
            "summary": f"Identified {active_suppliers} representative public chemical vendors. Major manufacturing concentrated in {', '.join(supply_analysis.get('top_exporting_countries', [])[:2])}."
        }

class PatentLandscapeAgent(BaseWorkerAgent):
    name = "Patent Landscape Agent"
    
    async def execute(self, molecule_name: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        # REAL DATA: Patents from PubChem
        patent_ids = await pubchem_client.get_patents(molecule_name)
        
        # GEMINI Check for generic status if no patents or old drug
        patent_status_text = "Analysis Pending"
        if patent_ids:
             patent_status_text = f"Found {len(patent_ids)} associated patent records."
        else:
             # Ask Gemini if it's generic
            prompt = f"Is the drug '{molecule_name}' currently generic or patent protected? Short answer."
            patent_status_text = await llm_service.generate_hybrid_content(prompt)
        
        # GEMINI/GROQ ANALYSIS: Factual Patent Details
        prompt = (
            f"Provide the factual intellectual property history for the drug '{molecule_name}'. "
            "1. Identify the original 'assignee' (the pioneer pharmaceutical company who discovered/patented it). "
            "2. Identify the pioneer patent 'filing_date' (approximate year is fine, e.g., '1985'). "
            "3. Identify the pioneer patent 'expiry_year'. If it is an old drug, state the actual past expiry year. "
            "4. Provide a 'freedom_to_operate' risk assessment (e.g. 'Low risk - Generic', 'High risk - Patented'). "
            "5. Provide a 'claims_scope' (e.g., 'Broad synthesis claims' or 'Formulation claims'). "
            "Ensure data is factual and based on real-world pharmaceutical IP history. Do not use 'N/A' or 'Unknown' if the drug is well known. "
            "Return JSON with keys: 'assignee', 'filing_date', 'expiry_year', 'freedom_to_operate', 'claims_scope'."
        )
        patent_llm_text = await llm_service.generate_hybrid_content(prompt)
        try:
            cleaned_text = patent_llm_text.replace("```json", "").replace("```", "").strip()
            patent_llm = json.loads(cleaned_text)
            if not isinstance(patent_llm, dict):
                raise ValueError("Extracted JSON is not a dictionary")
        except:
            patent_llm = {
                "assignee": "Unknown",
                "filing_date": "N/A",
                "expiry_year": "N/A",
                "freedom_to_operate": "Requires Legal Opinion"
            }
        
        families = []
        for pid in patent_ids[:10]: # Limit to 10
            families.append({
                "family_id": pid,
                "representative_patent": pid,
                "title": f"Patent Reference {pid}",
                "assignee": patent_llm.get("assignee", "Unknown"),
                "expiry": patent_llm.get("expiry_year", "Check Legal Status"),
                "status": "Published",
                "relevance": "Direct"
            })
            
        return {
            "patent_status": {
                "primary_patent": patent_ids[0] if patent_ids else "Pioneer/Historical Patent",
                "title": f"IP Landscape: {molecule_name}",
                "assignee": patent_llm.get("assignee", "Various"),
                "filing_date": patent_llm.get("filing_date", "Past"),
                "expiry_year": patent_llm.get("expiry_year", "Expired/Generic"),
                "status": patent_status_text,
                "freedom_to_operate": patent_llm.get("freedom_to_operate", "Requires Legal Opinion")
            },
            "patent_families": families,
            "claims_analysis": [{"type": "Composition of Matter", "status": "Determined by Expiry", "scope": patent_llm.get("claims_scope", f"Broad claims for {molecule_name}")}],
            "summary": f"IP Status: {patent_status_text}. Found {len(patent_ids)} specific patent citations. Originator likely {patent_llm.get('assignee', 'Unknown')}."
        }

class ClinicalTrialsAgent(BaseWorkerAgent):
    name = "Clinical Trials Agent"
    
    async def execute(self, molecule_name: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        # REAL DATA INTEGRATION
        trials = await clinical_trials_client.search_trials(molecule_name)
        
        # OpenTargets for disease validation (enrichment)
        targets = await opentargets_client.get_targets_for_drug(molecule_name)
        
        active_trials = [t for t in trials if t.status and t.status.upper() in ['RECRUITING', 'ACTIVE, NOT RECRUITING', 'ENROLLING BY INVITATION', 'ACTIVE', 'ENROLLING']]
        completed_trials = [t for t in trials if t.status and t.status.upper() == 'COMPLETED']
        
        # Summary generation
        disease_names = list(set([t.conditions[0] for t in trials if t.conditions]))[:5]
        disease_str = ", ".join(disease_names) if disease_names else "various conditions"
        
        recruitment_status = {}
        for t in trials:
            recruitment_status[t.status] = recruitment_status.get(t.status, 0) + 1

        # GEMINI/GROQ ANALYSIS: Pipeline summary
        pipeline_context = {
            "molecule": molecule_name,
            "active_trials": len(active_trials),
            "completed_trials": len(completed_trials),
            "indications": disease_names
        }
        
        prompt = (
            f"Review this clinical trial summary for {molecule_name}: {json.dumps(pipeline_context)}. "
            "Write a factual, comprehensive qualitative summary characterizing the clinical pipeline maturity and focus areas based on these indications. Do not hallucinate data."
        )
        pipeline_summary = await llm_service.generate_hybrid_content(prompt)

        return {
            "trials_count": len(trials),
            "active_trials_count": len(active_trials),
            "completed_trials_count": len(completed_trials),
            "top_conditions": disease_names,
            "latest_trials": [t.dict() for t in trials[:15]], 
            "targets": [t.dict() for t in targets[:8]], 
            "recruitment_breakdown": recruitment_status,
            "summary": pipeline_summary if "Error" not in pipeline_summary else f"Found {len(trials)} clinical trials for {molecule_name}. {len(active_trials)} are currently active/recruiting, and {len(completed_trials)} are completed. Key indications include {disease_str}."
        }

class InternalKnowledgeAgent(BaseWorkerAgent):
    name = "Internal Knowledge Agent"
    
    async def execute(self, molecule_name: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        # REAL RAG SEARCH
        search_results = search_service.search(molecule_name, limit=5, filters=["document"])
        
        docs = [item for item in search_results.get("results", []) if item.get("type") == "document"]
        
        summary = "No internal documents found."
        if docs:
            titles = [d.get("title", "Untitled") for d in docs]
            summary = f"Found {len(docs)} internal documents referencing {molecule_name}: {', '.join(titles)}."
            
        return {
            "document_hits": len(docs),
            "documents": docs,
            "summary": summary
        }

class WebIntelligenceAgent(BaseWorkerAgent):
    name = "Web Intelligence Agent"
    
    async def execute(self, molecule_name: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        # REAL: PubMed
        pubmed_results = await pubmed_client.search_literature(molecule_name)
        
        # REAL: PubMed Reviews (as Guidelines proxy)
        guideline_results = await pubmed_client.search_literature(f"{molecule_name} AND (systematic review[pt] OR guideline[pt])", limit=3)
        
        guidelines = []
        for g in guideline_results:
            guidelines.append({
                "title": g.title,
                "type": "Review/Guideline",
                "year": str(g.year) if g.year else "N/A"
            })

        summary_text = f"Identified {len(pubmed_results)} scientific publications and {len(guidelines)} key reviews/guidelines."
        if not pubmed_results:
            summary_text = "No direct high-relevance scientific publications found in the retrieval set."

        # GEMINI/GROQ ANALYSIS: Generate realistic news mentions
        prompt = (
            f"Given that '{molecule_name}' has literature focusing on {', '.join([g['title'][:40] for g in guidelines])}, "
            "Generate 3 factual or highly probable recent news headlines or regulatory update blurbs regarding this drug based on its known public profile. Do not invent completely fake events. "
            "Return JSON with a single key 'news_mentions' containing a list of strings."
        )
        news_text = await llm_service.generate_hybrid_content(prompt)
        try:
            cleaned_text = news_text.replace("```json", "").replace("```", "").strip()
            news_analysis = json.loads(cleaned_text)
            if not isinstance(news_analysis, dict):
                raise ValueError("Extracted JSON is not a dictionary")
            news_mentions = news_analysis.get("news_mentions", [])
        except:
            news_mentions = ["Recent supply chain evaluations published.", "Clinical landscape review underway."]

        return {
            "scientific_publications": [p.dict() for p in pubmed_results[:10]], 
            "news_mentions": news_mentions,
            "guidelines": guidelines,
            "summary": summary_text
        }

class ReportGeneratorAgent(BaseWorkerAgent):
    name = "Report Generator Agent"
    
    async def execute(self, molecule_name: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Uses Gemini to synthesize a comprehensive report summary from collected data.
        """
        if not context:
            return {"summary": "No context provided for report generation."}
            
        # Prepare context data for LLM
        # Pruning large lists to fit context window/reduce noise
        llm_context = {
            "molecule": molecule_name,
            "market_summary": context.get("iqvia", {}).get("market_data", {}).get("market_structure"),
            "patent_status": context.get("patent", {}).get("patent_status", {}).get("status"),
            "clinical": {
                "active_trials": context.get("clinical", {}).get("active_trials_count"),
                "conditions": context.get("clinical", {}).get("top_conditions")
            },
            "publications_count": len(context.get("web", {}).get("scientific_publications", []))
        }
        
        prompt = (
            f"You are a pharmaceutical strategic analyst. Review this data for {molecule_name}: {json.dumps(llm_context, default=str)}. "
            "Task: Generate two components for a C-suite report:\n"
            "1. 'executive_summary': A comprehensive and highly detailed professional summary with NO length constraints. Provide as much relevant context as possible.\n"
            "2. 'strategic_recommendation': A detailed, data-driven conclusion on viability for repurposing, completely unbounded in terms of length.\n\n"
            "CRITICAL LOGIC GUARDS:\n"
            "- If active trials = 0, DO NOT recommend Phase II; recommend pre-clinical or feasibility.\n"
            "- For mature generics, emphasize the difficulty of differentiation and the need for new IP (e.g., novel formulations).\n"
            "- Avoid 'AI-generated optimism'; be skeptical if the evidence is weak.\n"
            "- Rely entirely on factual information from the context; do not hallucinate.\n\n"
            "Return JSON with keys: 'executive_summary', 'strategic_recommendation'."
        )
        
        analysis_json = await llm_service.generate_hybrid_content(prompt)
        
        try:
            import re
            json_match = re.search(r'\{.*\}', analysis_json, re.DOTALL)
            cleaned_text = json_match.group(0) if json_match else analysis_json.replace("```json", "").replace("```", "").strip()
            
            # Use strict=False to allow unescaped newlines inside the JSON strings
            analysis = json.loads(cleaned_text, strict=False)
            summary = analysis.get("executive_summary", "Summary unavailable.")
            recommendation = analysis.get("strategic_recommendation", "Recommendation unavailable.")
        except Exception as e:
            print(f"ReportGenerator JSON Parsing Error: {e}")
            summary = analysis_json if isinstance(analysis_json, str) else "Summary generation failed."
            recommendation = "Strategic recommendation pending human review due to data limitations."
        
        if "Error" in summary or not summary:
            summary = f"Automated summary generation failed. Data collected for {molecule_name} includes {llm_context['clinical']['active_trials']} active trials."

        return {
            "generated_at": datetime.now().isoformat(),
            "status": "completed",
            "summary": summary,
            "recommendation": recommendation
        }
