import time
import requests
import os

def keep_alive():
    """Simple script to ping the backend from an external service or terminal"""
    url = os.getenv("BACKEND_URL") or "https://amount-collector-backend-rqrx.onrender.com"
    health_url = f"{url.rstrip('/')}/health"
    
    print(f"Starting keep-alive pinger for {health_url}")
    
    while True:
        try:
            print(f"Pinging {health_url}...")
            response = requests.get(health_url)
            print(f"Response: {response.status_code}")
        except Exception as e:
            print(f"Error: {e}")
        
        # Sleep for 14 minutes
        time.sleep(14 * 60)

if __name__ == "__main__":
    keep_alive()
