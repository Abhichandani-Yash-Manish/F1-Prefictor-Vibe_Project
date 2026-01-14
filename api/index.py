# Vercel Python Serverless Function
# This file contains a minimal FastAPI app that works on Vercel
# All code in one file to avoid import issues

from fastapi import FastAPI, HTTPException, Depends, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from datetime import datetime, timezone
from typing import Optional, List
import os
import re

# --- Supabase Setup ---
try:
    from supabase import create_client, Client
    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_KEY", "")
    if url and key:
        supabase: Client = create_client(url, key)
    else:
        supabase = None
        print("WARNING: Supabase not configured")
except Exception as e:
    supabase = None
    print(f"WARNING: Failed to init Supabase: {e}")

# --- Rate Limiting ---
try:
    from slowapi import Limiter, _rate_limit_exceeded_handler
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded
    limiter = Limiter(key_func=get_remote_address)
except Exception as e:
    limiter = None
    print(f"WARNING: Failed to init rate limiter: {e}")

# --- FastAPI App ---
app = FastAPI(
    title="F1 Predictor API",
    version="2.4.0",
    root_path="/api" if os.environ.get("VERCEL") else ""
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if limiter:
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- Auth Helper ---
async def verify_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization required")
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    try:
        token = authorization.replace("Bearer ", "")
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user.user.id
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

# --- Models ---
class LeagueCreateInput(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool = False
    max_members: int = 50
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        if not v or len(v) < 3 or len(v) > 50:
            raise ValueError('Name must be 3-50 characters')
        return re.sub(r'[<>"\']', '', v)

# --- Helper ---
def generate_invite_code() -> str:
    import random
    chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return ''.join(random.choice(chars) for _ in range(8))

# --- Routes ---

@app.get("/")
def root():
    return {"message": "F1 Predictor API", "version": "2.4.0", "status": "running"}

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "supabase": "connected" if supabase else "not configured"
    }

@app.get("/races")
def get_races(request: Request):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    try:
        response = supabase.table("races").select("*").order("race_time", desc=False).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/standings")
def get_standings(request: Request):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    try:
        users = supabase.table("profiles").select("*").execute()
        standings = []
        for user in users.data:
            preds = supabase.table("predictions").select("points_total").eq("user_id", user['id']).execute()
            total = sum((p.get('points_total') or 0) for p in preds.data)
            standings.append({
                "id": user['id'],
                "username": user['username'],
                "total_score": total
            })
        standings.sort(key=lambda x: x['total_score'], reverse=True)
        return standings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/leagues")
def get_leagues(request: Request, user_id: str = Depends(verify_user)):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    try:
        my_leagues = supabase.table("league_members").select(
            "league_id, role, season_points, joined_at, leagues(*)"
        ).eq("user_id", user_id).execute()
        
        public_leagues = supabase.table("leagues").select("*").eq("is_public", True).eq("is_active", True).execute()
        
        return {
            "my_leagues": my_leagues.data,
            "public_leagues": public_leagues.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/leagues")
def create_league(request: Request, league_input: LeagueCreateInput, user_id: str = Depends(verify_user)):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    try:
        invite_code = generate_invite_code()
        
        new_league = supabase.table("leagues").insert({
            "owner_id": user_id,
            "name": league_input.name,
            "description": league_input.description,
            "invite_code": invite_code,
            "is_public": league_input.is_public,
            "max_members": league_input.max_members
        }).execute()
        
        if not new_league.data:
            raise HTTPException(status_code=400, detail="Failed to create league")
        
        league_id = new_league.data[0]["id"]
        
        supabase.table("league_members").insert({
            "league_id": league_id,
            "user_id": user_id,
            "role": "owner"
        }).execute()
        
        return {"message": "League created successfully", "league": new_league.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/leagues/{league_id}/standings")
def get_league_standings(request: Request, league_id: int, user_id: str = Depends(verify_user)):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    try:
        league = supabase.table("leagues").select("*").eq("id", league_id).single().execute()
        if not league.data:
            raise HTTPException(status_code=404, detail="League not found")
        
        standings = supabase.table("league_members").select(
            "user_id, role, season_points, joined_at, profiles(username)"
        ).eq("league_id", league_id).order("season_points", desc=True).execute()
        
        formatted = []
        for i, m in enumerate(standings.data):
            formatted.append({
                "position": i + 1,
                "user_id": m["user_id"],
                "username": m["profiles"]["username"] if m.get("profiles") else "Unknown",
                "role": m["role"],
                "season_points": m["season_points"],
                "joined_at": m["joined_at"]
            })
        
        return {
            "league": league.data,
            "standings": formatted
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Expose handler for Vercel
handler = app
