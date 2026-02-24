import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class GoogleGenAIProvider:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            print("Warning: GEMINI_API_KEY not found in environment variables.")
            self.model = None
        else:
            genai.configure(api_key=self.api_key)
            self.model_name = 'gemini-1.5-flash'
            try:
                self.model = genai.GenerativeModel(self.model_name)
            except Exception as e:
                print(f"Error initializing default model {self.model_name}: {e}")
                self.model = None

    async def generate_content(self, prompt: str, image_data: list = None) -> str:
        """
        Generates content using Gemini. Supports multimodal input if image_data is provided.
        """
        if not self.api_key:
            return "Gemini API key not configured."
            
        import asyncio
        
        # Prepare content list
        content = [prompt]
        if image_data:
            for img in image_data:
                content.append({
                    "mime_type": "image/jpeg",
                    "data": img
                })
        
        try:
            # 1. Try default model
            if self.model:
                response = await asyncio.to_thread(self.model.generate_content, content)
                return response.text
        except Exception as e:
            print(f"Gemini {self.model_name} failed: {e}")
            
        # 2. Fallback: Discovery
        print("Attempting to discover available Gemini models...")
        try:
            available_models = []
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    available_models.append(m.name)
            
            if not available_models:
                return "Error: No Gemini models available."
                
            fallback_model_name = available_models[0]
            print(f"Falling back to {fallback_model_name}")
            
            fallback_model = genai.GenerativeModel(fallback_model_name)
            response = await asyncio.to_thread(fallback_model.generate_content, content)
            return response.text
            
        except Exception as e:
            error_msg = str(e)
            print(f"Error generating content with Gemini Fallback: {error_msg}")
            return f"Error: Generative AI API Exhausted or Failed - {error_msg}"

gemini_client = GoogleGenAIProvider()
