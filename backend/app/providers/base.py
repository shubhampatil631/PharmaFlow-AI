import httpx
from typing import Optional, Any, Dict

class BaseProvider:
    """Base class for all data providers to handle HTTP sessions and error logging."""
    
    def __init__(self, base_url: str, timeout: int = 30):
        self.base_url = base_url
        self.timeout = timeout
        self.headers = {
            "User-Agent": "GenZ-Agentic-AI/1.0 (Integration Test)",
            "Accept": "application/json"
        }

    async def _request_with_retry(self, method: str, url: str, **kwargs) -> Dict[str, Any]:
        """Internal helper to execute requests with retries."""
        import asyncio
        import httpx
        
        max_retries = 3
        backoff_factor = 1.0
        
        for attempt in range(max_retries + 1):
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                try:
                    if method.upper() == "GET":
                        response = await client.get(url, **kwargs)
                    elif method.upper() == "POST":
                        response = await client.post(url, **kwargs)
                    else:
                        raise ValueError(f"Unsupported method: {method}")

                    response.raise_for_status()
                    return response.json()
                    
                except httpx.HTTPStatusError as e:
                    # Retry on server errors (5xx)
                    if 500 <= e.response.status_code < 600 and attempt < max_retries:
                        wait_time = backoff_factor * (2 ** attempt)
                        print(f"HTTP {e.response.status_code} error from {url}. Retrying in {wait_time}s... (Attempt {attempt + 1}/{max_retries})")
                        await asyncio.sleep(wait_time)
                        continue
                    # Re-raise if not 5xx or out of retries
                    print(f"HTTP Error {e.response.status_code} fetching {url}: {e}")
                    raise
                    
                except (httpx.ConnectError, httpx.ReadTimeout, httpx.WriteTimeout, httpx.PoolTimeout) as e:
                    # Retry on network/timeout errors
                    if attempt < max_retries:
                        wait_time = backoff_factor * (2 ** attempt)
                        print(f"Network error ({type(e).__name__}) connecting to {url}. Retrying in {wait_time}s... (Attempt {attempt + 1}/{max_retries})")
                        await asyncio.sleep(wait_time)
                        continue
                    print(f"Network Error fetching {url}: {e}")
                    raise
                    
                except Exception as e:
                    print(f"Unexpected Error fetching {url}: {e}")
                    raise

    async def _get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Internal helper for GET requests."""
        url = f"{self.base_url}{endpoint}"
        return await self._request_with_retry("GET", url, params=params, headers=self.headers)

    async def _post(self, endpoint: str, json_data: Dict[str, Any]) -> Dict[str, Any]:
        """Internal helper for POST requests (e.g., GraphQL)."""
        url = f"{self.base_url}{endpoint}"
        return await self._request_with_retry("POST", url, json=json_data, headers=self.headers)
