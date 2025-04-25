import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import workshops, users, registrations, admin, auth
from app.utils.db import init_db
import uvicorn
import requests
import time
import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Science Workshop Registration Portal",
    description="API for Jnana Prabodhini's Vijnana Dals program",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all route modules
app.include_router(auth.router, tags=["Authentication"], prefix="/api")
app.include_router(users.router, tags=["Users"], prefix="/api")
app.include_router(workshops.router, tags=["Workshops"], prefix="/api")
app.include_router(registrations.router, tags=["Registrations"], prefix="/api")
app.include_router(admin.router, tags=["Admin"], prefix="/api/admin")

@app.on_event("startup")
async def startup_event():
    await init_db()

@app.get("/")
def read_root():
    return {"message": "Welcome to Science Workshop Registration Portal API"}


# Function to hit the GET API every 5 minutes
def hit_api():
    while True:
        try:
            BACKEND_API = os.getenv("BACKEND_API")
            response = requests.get(BACKEND_API)
            print(f"Current Time: {datetime.datetime.now().strftime('%H:%M:%S')}")
            print(response.json())
        except requests.exceptions.RequestException as e:
            print(f"Current Time: {datetime.datetime.now().strftime('%H%M%S')}")
            print(f"Error: {e}")
        time.sleep(300)


# Start the API hitter in a separate thread
import threading

thread = threading.Thread(target=hit_api)
thread.daemon = True  # Set as daemon so it exits when main thread exits
thread.start()

# Run the FastAPI app

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)