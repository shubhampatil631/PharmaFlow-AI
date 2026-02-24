import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

class HuggingFaceProvider:
    def __init__(self):
        self.api_key = os.getenv("HUGGINGFACE_API_KEY")
        self.api_url = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"
        
        if not self.api_key:
            print("Warning: HUGGINGFACE_API_KEY not found in environment variables.")

    def generate_content(self, prompt: str) -> str:
        """
        Generates content using Hugging Face Inference API.
        """
        if not self.api_key:
            return "Hugging Face API key not configured."

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Mistral format
        formatted_prompt = f"<s>[INST] {prompt} [/INST]"
        
        payload = {
            "inputs": formatted_prompt,
            "parameters": {
                "max_new_tokens": 1024,
                "temperature": 0.7,
                "return_full_text": False
            }
        }

        try:
            response = requests.post(self.api_url, headers=headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            
            if isinstance(result, list) and len(result) > 0:
                return result[0].get("generated_text", "").strip()
            elif isinstance(result, dict) and "generated_text" in result:
                return result.get("generated_text", "").strip()
            else:
                return f"Unexpected response format: {result}"
                
        except requests.exceptions.HTTPError as he:
            err = f"HTTP Error: {he}. Response body: {he.response.text}"
            print(f"Error generating content with Hugging Face: {err}")
            return err
        except Exception as e:
            print(f"Error generating content with Hugging Face: {e}")
            return f"Error generating content: {e}"

huggingface_client = HuggingFaceProvider()
