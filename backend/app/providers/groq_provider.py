import os
import requests
from dotenv import load_dotenv

load_dotenv()

class GroqProvider:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"
        self.model = "llama-3.3-70b-versatile"
        
        if not self.api_key:
            print("Warning: GROQ_API_KEY not found in environment variables.")

    def generate_content(self, prompt: str) -> str:
        """
        Generates content using Groq Inference API.
        """
        if not self.api_key:
            return "Groq API key not configured."

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.5,
            "max_tokens": 4096
        }

        try:
            response = requests.post(self.api_url, headers=headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            
            if "choices" in result and len(result["choices"]) > 0:
                return result["choices"][0]["message"]["content"].strip()
            else:
                return f"Unexpected response format: {result}"
                
        except requests.exceptions.HTTPError as he:
            err = f"HTTP Error: {he}. Response body: {he.response.text}"
            print(f"Error generating content with Groq: {err}")
            return err
        except Exception as e:
            print(f"Error generating content with Groq: {e}")
            return f"Error generating content: {e}"

groq_client = GroqProvider()
