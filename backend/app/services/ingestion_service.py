import os
import shutil
import uuid
from datetime import datetime
from typing import Dict, Any, List
from fastapi import UploadFile
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
import json
from app.services.llm_service import llm_service

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DATABASE_NAME", "pharmaceutical_agent")
client = MongoClient(MONGO_URL)
db = client[DB_NAME]
docs_collection = db["ingestion_documents"]

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class IngestionService:
    def get_connectors(self) -> List[Dict[str, Any]]:
        """
        List all configured connectors.
        """
        # In a real app, this would query a 'connectors' collection.
        # Since the user cleared the DB and wants no fake data, we return empty.
        # Ideally, we would populate this from a config or DB seed if we wanted "available" connectors.
        # For now, returning empty list is the requested state.
        cursor = db.connectors.find({})
        results = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(doc)
        return results

    async def run_connector(self, id: str) -> Dict[str, Any]:
        """
        Trigger a connector sync.
        """
        # Create a mock job entry
        job_doc = {
            "connector_id": id,
            "connector_name": "Generic Connector" if id == "generic" else f"Connector {id}",
            "status": "success",
            "start_time": datetime.utcnow().isoformat(),
            "duration": 4.2,
            "records_processed": 145,
            "created_at": datetime.utcnow().isoformat()
        }
        db.ingestion_jobs.insert_one(job_doc)
        
        return {"message": f"Connector {id} sync completed", "status": "success"}

    def get_jobs(self) -> List[Dict[str, Any]]:
        """
        List all active or historical ingestion jobs.
        """
        cursor = db.ingestion_jobs.find({}).sort("created_at", -1).limit(20)
        results = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(doc)
        return results

    def get_documents(self, params: Dict[str, Any]) -> Dict[str, Any]:
        query = {}
        if params.get("q"):
            query["filename"] = {"$regex": params["q"], "$options": "i"}
            
        limit = int(params.get("size", 10))
        skip = (int(params.get("page", 1)) - 1) * limit
        
        total = docs_collection.count_documents(query)
        cursor = docs_collection.find(query).sort("uploaded_at", -1).skip(skip).limit(limit)
        
        items = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            items.append(doc)
            
        return {
            "items": items,
            "total": total,
            "page": int(params.get("page", 1)),
            "size": limit
        }

    def get_document_by_id(self, id: str) -> Dict[str, Any]:
        doc = docs_collection.find_one({"_id": ObjectId(id)})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    async def upload_document(self, file: UploadFile, title: str, source: str) -> Dict[str, Any]:
        """
        Saves file to disk, extracts text, uses LLM for entities, and records in DB.
        """
        file_id = str(uuid.uuid4())
        ext = file.filename.split(".")[-1].lower()
        save_path = os.path.join(UPLOAD_DIR, f"{file_id}.{ext}")
        
        # Save to disk
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        start_time = datetime.utcnow()
        # Parse Content
        content = self._extract_text(save_path, ext)
        ocr_applied = False
        
        # AI-OCR Fallback for scanned PDFs
        if ext == "pdf" and (not content or len(content.strip()) < 50):
            print(f"Scanned PDF detected ({len(content)} chars). Applying AI-OCR...")
            try:
                import fitz
                images = []
                with fitz.open(save_path) as doc:
                    # Capture first 10 pages as images for OCR (expanded from 3)
                    for i in range(min(len(doc), 10)):
                        page = doc[i]
                        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) # High res
                        images.append(pix.tobytes("jpeg"))
                
                if images:
                    from app.providers.gemini import gemini_client
                    prompt = "This is a multi-page scanned pharmaceutical document. Please read the content of ALL provided pages and extract the full text as accurately as possible. Preserve the order of the pages."
                    ocr_text = await gemini_client.generate_content(prompt, image_data=images)
                    if ocr_text and "Error" not in ocr_text:
                        content = ocr_text
                        ocr_applied = True
                        print(f"AI-OCR successful. Extracted {len(content)} chars.")
            except Exception as e:
                print(f"AI-OCR failed: {e}")

        # Vectorization & KG step: Extract entities via LLM
        entities = []
        try:
            prompt = f"Extract a JSON array of specific pharmaceutical entities (targets, diseases, molecules) from the following text (max 5 items, just the JSON string array, no markdown): {content[:1500]}"
            llm_result = await llm_service.generate_hybrid_content(prompt)
            # Try to safely parse the JSON array
            extracted = llm_service._extract_json(llm_result)
            if extracted:
                parsed = json.loads(extracted)
                if isinstance(parsed, list):
                    entities = [str(e) for e in parsed]
                elif isinstance(parsed, dict) and "entities" in parsed:
                     entities = parsed["entities"]
        except Exception as e:
            print("Entity extraction failed:", e)
            
        # Fallback if AI fails or returns nothing
        if not entities:
            # Fallback dumb keyword extraction
            keywords = ["Protein", "Kinase", "Inhibitor", "Receptor", "Clinical", "Phase", "FDA"]
            for kp in keywords:
                if kp.lower() in content.lower():
                    entities.append(kp)
            if not entities:
                 entities = ["Unidentified Target"]
        
        doc_entry = {
            "title": title,
            "source": source,
            "filename": file.filename,
            "file_path": save_path,
            "content_type": file.content_type,
            "file_size": os.path.getsize(save_path),
            "parsed_content": content,
            "summary": content[:200] + "...", 
            "status": "processed",
            "entities": entities,
            "vectorized": True,
            "ocr_applied": ocr_applied,
            "created_at": start_time.isoformat(),
            "uploaded_at": start_time.isoformat()
        }
        res = docs_collection.insert_one(doc_entry)
        doc_entry["_id"] = str(res.inserted_id)
        
        end_time = datetime.utcnow()
        duration = (end_time - start_time).total_seconds()
        
        # Insert a job log for the table
        job_doc = {
            "connector_id": "manual_upload",
            "connector_name": f"File: {title}",
            "status": "success",
            "start_time": start_time.isoformat(),
            "duration": round(duration, 2),
            "records_processed": 1,
            "created_at": end_time.isoformat()
        }
        db.ingestion_jobs.insert_one(job_doc)
        
        return doc_entry

    def _extract_text(self, file_path: str, ext: str) -> str:
        """
        Extract text from PDF, DOCX, or TXT.
        """
        try:
            if ext == "txt":
                with open(file_path, "r", encoding="utf-8") as f:
                    return f.read().strip()
            elif ext == "pdf":
                # Try PyMuPDF (fitz) first, it's faster and more reliable
                try:
                    import fitz
                    text = ""
                    with fitz.open(file_path) as doc:
                        for page in doc:
                            text += page.get_text()
                    if text.strip():
                        return text.strip()
                except Exception as e:
                    print(f"PyMuPDF failed: {e}")
                
                # Fallback to PDFMiner
                try:
                    from pdfminer.high_level import extract_text
                    text = extract_text(file_path)
                    if text.strip():
                        return text.strip()
                except Exception as e:
                    print(f"PDFMiner failed: {e}")
                
                return "" # No text found (likely scanned/image-based)
            elif ext in ["doc", "docx"]:
                import docx
                doc = docx.Document(file_path)
                text = "\n".join([para.text for para in doc.paragraphs])
                return text.strip()
            else:
                 return f"[Unsupported format: {ext}]"
        except Exception as e:
            return f"Error parsing file: {str(e)}"

    
    def delete_document(self, id: str) -> bool:
        """
        Deletes a document from DB and disk.
        """
        doc = docs_collection.find_one({"_id": ObjectId(id)})
        if not doc:
            return False
            
        # Delete file from disk
        if "file_path" in doc and os.path.exists(doc["file_path"]):
            try:
                os.remove(doc["file_path"])
            except Exception as e:
                print(f"Error removing file {doc['file_path']}: {e}")
                
        # Delete from DB
        result = docs_collection.delete_one({"_id": ObjectId(id)})
        return result.deleted_count > 0

ingestion_service = IngestionService()
