# ULTRA MINIMAL Vercel Python test
# This file has ZERO external dependencies beyond FastAPI

import os
from datetime import datetime, timezone

# FastAPI must be installed via requirements.txt
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="F1 Predictor API",
    version="2.4.1",
    root_path="/api" if os.environ.get("VERCEL") else ""
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "F1 API Running", "version": "2.4.1"}

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "env_check": {
            "VERCEL": os.environ.get("VERCEL", "not set"),
            "SUPABASE_URL_set": bool(os.environ.get("SUPABASE_URL")),
            "SUPABASE_KEY_set": bool(os.environ.get("SUPABASE_KEY")),
        }
    }

@app.get("/test")
def test():
    return {"test": "success", "msg": "If you see this, the backend is working!"}

# Handler for Vercel
handler = app
