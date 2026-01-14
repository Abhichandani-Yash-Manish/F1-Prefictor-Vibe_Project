from fastapi import FastAPI, HTTPException, Depends, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel, field_validator
from dotenv import load_dotenv
from datetime import datetime, timezone
from typing import Optional, List
import os
import re
from scoring import calculate_points

# Rate limiting imports
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")

# Defensive initialization - Vercel needs both env vars set
if not url or not key:
    print("WARNING: SUPABASE_URL or SUPABASE_KEY not set. Running in limited mode.")
    supabase = None
else:
    supabase: Client = create_client(url, key)

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)

# Configure root path for Vercel/proxies
# If running through a proxy/rewrite that strips nothing but forwards to /api, we need to know.
# However, Vercel Python runtime usually receives the full path.
# If the request is /api/races, and route is /races, we need root_path="/api".
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

app = FastAPI(
    title="F1 Predictor API", 
    version="2.3.0",
    root_path="/api" if os.environ.get("VERCEL") else ""
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Log the detailed validation error
    print(f"Validation Error at {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": f"Validation Error: {exc.errors()}"},
    )

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# SECURITY: Define allowed origins (update for production)
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
# Ensure localhost is always allowed for development
if "http://localhost:3000" not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append("http://localhost:3000")
if "http://127.0.0.1:3000" not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append("http://127.0.0.1:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for debugging/production flexibility
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# --- VALID DRIVERS LIST (2026 Grid - 11 Teams, 22 Drivers) ---
VALID_DRIVERS = [
    # Red Bull
    "Max Verstappen (Red Bull)",
    "Isack Hadjar (Red Bull)",
    # McLaren
    "Lando Norris (McLaren)",
    "Oscar Piastri (McLaren)",
    # Ferrari
    "Charles Leclerc (Ferrari)",
    "Lewis Hamilton (Ferrari)",
    # Mercedes
    "George Russell (Mercedes)",
    "Kimi Antonelli (Mercedes)",
    # Aston Martin
    "Fernando Alonso (Aston Martin)",
    "Lance Stroll (Aston Martin)",
    # Williams
    "Carlos Sainz (Williams)",
    "Alexander Albon (Williams)",
    # Alpine
    "Pierre Gasly (Alpine)",
    "Franco Colapinto (Alpine)",
    # Haas
    "Esteban Ocon (Haas)",
    "Oliver Bearman (Haas)",
    # RB (Visa Cash App RB)
    "Yuki Tsunoda (RB)",
    "Liam Lawson (RB)",
    # Sauber (Audi)
    "Nico Hulkenberg (Sauber)",
    "Gabriel Bortoleto (Sauber)",
    # Cadillac (NEW TEAM 2026)
    "Valtteri Bottas (Cadillac)",
    "Sergio Perez (Cadillac)",
    # Form placeholders
    "Select Driver...",
    ""
]

# --- MODELS WITH VALIDATION ---
class PredictionInput(BaseModel):
    user_id: str
    race_id: int
    quali_p1_driver: str
    quali_p2_driver: str
    quali_p3_driver: str
    race_p1_driver: str
    race_p2_driver: str
    race_p3_driver: str
    wild_prediction: str
    biggest_flop: str
    biggest_surprise: str
    
    @field_validator('quali_p1_driver', 'quali_p2_driver', 'quali_p3_driver', 
                     'race_p1_driver', 'race_p2_driver', 'race_p3_driver')
    @classmethod
    def validate_driver(cls, v: str) -> str:
        if v and v not in VALID_DRIVERS:
            raise ValueError(f'Invalid driver: {v}')
        return v
    
    @field_validator('wild_prediction', 'biggest_flop', 'biggest_surprise')
    @classmethod
    def sanitize_text(cls, v: str) -> str:
        # Remove any potentially dangerous characters
        if v:
            v = re.sub(r'[<>"\']', '', v)[:500]  # Limit to 500 chars
        return v

class RaceResultInput(BaseModel):
    race_id: int
    quali_p1_driver: str
    quali_p2_driver: str
    quali_p3_driver: str
    race_p1_driver: str
    race_p2_driver: str
    race_p3_driver: str
    
    @field_validator('quali_p1_driver', 'quali_p2_driver', 'quali_p3_driver',
                     'race_p1_driver', 'race_p2_driver', 'race_p3_driver')
    @classmethod
    def validate_driver(cls, v: str) -> str:
        if v not in VALID_DRIVERS:
            raise ValueError(f'Invalid driver: {v}')
        return v

class GradingInput(BaseModel):
    prediction_id: int
    manual_score: int
    
    @field_validator('manual_score')
    @classmethod
    def validate_score(cls, v: int) -> int:
        if v < 0 or v > 50:
            raise ValueError('Score must be between 0 and 50')
        return v

# --- LEAGUE MODELS ---
class LeagueCreateInput(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool = False
    max_members: int = 50
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        if not v or len(v) < 3 or len(v) > 50:
            raise ValueError('League name must be 3-50 characters')
        return re.sub(r'[<>"\']', '', v)
    
    @field_validator('max_members')
    @classmethod
    def validate_max_members(cls, v: int) -> int:
        if v < 2 or v > 1000:
            raise ValueError('Max members must be between 2 and 1000')
        return v

class LeagueUpdateInput(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None
    max_members: Optional[int] = None

class LeagueJoinInput(BaseModel):
    invite_code: str

class LeagueInviteInput(BaseModel):
    username_or_email: str

# --- FRIEND MODELS ---
class FriendRequestInput(BaseModel):
    username: str

# --- CHAT MODELS ---
class ChatMessageInput(BaseModel):
    content: str
    message_type: str = "chat"
    race_id: Optional[int] = None
    reply_to_id: Optional[int] = None
    
    @field_validator('content')
    @classmethod
    def validate_content(cls, v: str) -> str:
        if not v or len(v.strip()) == 0:
            raise ValueError('Message cannot be empty')
        if len(v) > 1000:
            raise ValueError('Message too long (max 1000 chars)')
        # Sanitize basic HTML
        return re.sub(r'[<>]', '', v)

class ReactionInput(BaseModel):
    reaction: str
    
    @field_validator('reaction')
    @classmethod
    def validate_reaction(cls, v: str) -> str:
        allowed = ['🏎️', '🔥', '😂', '👍', '💀', '🏆', '❤️', '🎉']
        if v not in allowed:
            raise ValueError(f'Invalid reaction. Allowed: {allowed}')
        return v

# --- LEAGUE GRADING MODELS ---
class LeagueGradeInput(BaseModel):
    prediction_id: int
    wild_points: int = 0
    flop_points: int = 0
    surprise_points: int = 0
    notes: Optional[str] = None
    
    @field_validator('wild_points', 'flop_points', 'surprise_points')
    @classmethod
    def validate_points(cls, v: int) -> int:
        if v < 0 or v > 50:
            raise ValueError('Points must be between 0 and 50')
        return v

# --- SECURITY: Admin Authorization Helper ---
async def verify_admin(authorization: Optional[str] = Header(None)):
    """Verify that the request is from an authenticated admin user."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    try:
        # Extract token from "Bearer <token>"
        token = authorization.replace("Bearer ", "")
        
        # Verify the token with Supabase
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_id = user_response.user.id
        
        # Check if user is admin
        profile = supabase.table("profiles").select("is_admin").eq("id", user_id).single().execute()
        
        if not profile.data or not profile.data.get("is_admin"):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        return user_id
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Auth error: {str(e)}")

# --- SECURITY: User Authorization Helper ---
async def verify_user(authorization: Optional[str] = Header(None)):
    """Verify that the request is from an authenticated user."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    try:
        token = authorization.replace("Bearer ", "")
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return user_response.user.id
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Auth error: {str(e)}")

# --- HELPER: Generate Invite Code ---
def generate_invite_code() -> str:
    import random
    import string
    chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return ''.join(random.choice(chars) for _ in range(8))

# --- ROUTES ---

@app.get("/")
def read_root():
    return {"message": "F1 Predictor API is running!", "version": "2.0.0"}

@app.get("/races")
@limiter.limit("30/minute")
def get_races(request: Request):
    response = supabase.table("races").select("*").order("race_time", desc=False).execute()
    return response.data

@app.get("/races/{race_id}")
@limiter.limit("60/minute")
def get_race(request: Request, race_id: int):
    response = supabase.table("races").select("*").eq("id", race_id).execute()
    return response.data[0] if response.data else {}

@app.get("/admin/predictions/{race_id}")
@limiter.limit("20/minute")
def get_predictions_for_race(request: Request, race_id: int, admin_id: str = Depends(verify_admin)):
    response = supabase.table("predictions").select("*").eq("race_id", race_id).execute()
    return response.data

@app.post("/predict")
@limiter.limit("10/minute")  # Prevent spam submissions
def submit_prediction(request: Request, prediction: PredictionInput):
    # SECURITY: Enforce prediction deadline
    race_response = supabase.table("races").select("quali_time").eq("id", prediction.race_id).single().execute()
    
    if race_response.data and race_response.data.get("quali_time"):
        quali_time = datetime.fromisoformat(race_response.data["quali_time"].replace("Z", "+00:00"))
        if datetime.now(timezone.utc) > quali_time:
            raise HTTPException(status_code=403, detail="Predictions are closed - qualifying has started")
    
    data = prediction.dict()
    try:
        response = supabase.table("predictions").insert(data).execute()
        return {"message": "Success", "data": response.data}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/admin/grade")
@limiter.limit("30/minute")
def grade_prediction(request: Request, grading: GradingInput, admin_id: str = Depends(verify_admin)):
    try:
        supabase.table("predictions").update({"manual_score": grading.manual_score}).eq("id", grading.prediction_id).execute()
        return {"message": "Grade saved"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/admin/settle")
@limiter.limit("5/minute")  # Settling should be rare
def settle_race(request: Request, result: RaceResultInput, admin_id: str = Depends(verify_admin)):
    print(f"Settling Race {result.race_id} by admin {admin_id}...")
    response = supabase.table("predictions").select("*").eq("race_id", result.race_id).execute()
    predictions = response.data
    
    if not predictions:
        return {"message": "No predictions found for this race"}

    updated_count = 0
    for pred in predictions:
        # Calculate automatic points from scoring algorithm
        auto_points = calculate_points(pred, result.dict())
        # Add manual grading points (wild prediction, flop, surprise bonuses)
        manual_points = pred.get('manual_score') or 0
        # Total = automatic + manual
        total_points = auto_points + manual_points
        
        supabase.table("predictions").update({"points_total": total_points}).eq("id", pred['id']).execute()
        updated_count += 1
        
    return {"message": f"Race settled! Updated {updated_count} predictions."}

# --- REAL-TIME STANDINGS ENDPOINT ---
def get_race_code(race_name):
    # Maps race names to 3-letter codes for 2026 calendar
    name = race_name.lower()
    if "australian" in name: return "AUS"
    if "chinese" in name: return "CHN"
    if "japanese" in name: return "JPN"
    if "bahrain" in name: return "BHR"
    if "saudi" in name: return "SAU"
    if "miami" in name: return "MIA"
    if "emilia" in name or "imola" in name: return "ITA"
    if "monaco" in name: return "MCO"
    if "spanish" in name or "spain" in name: return "ESP"
    if "canadian" in name or "canada" in name: return "CAN"
    if "austrian" in name or "austria" in name: return "AUT"
    if "british" in name or "silverstone" in name: return "GBR"
    if "belgian" in name or "spa" in name: return "BEL"
    if "hungarian" in name or "hungary" in name: return "HUN"
    if "dutch" in name or "netherlands" in name: return "NED"
    if "italian" in name or "monza" in name: return "ITA"
    if "madrid" in name: return "MAD"
    if "azerbaijan" in name or "baku" in name: return "AZE"
    if "singapore" in name: return "SGP"
    if "united states" in name or "austin" in name or "cota" in name: return "USA"
    if "mexico" in name: return "MEX"
    if "brazil" in name or "são paulo" in name or "sao paulo" in name: return "BRA"
    if "las vegas" in name: return "LVS"
    if "qatar" in name: return "QAT"
    if "abu dhabi" in name: return "ABU"
    return "GP"

@app.get("/standings")
@limiter.limit("30/minute")
def get_standings(request: Request):
    # 1. Fetch all users
    users_res = supabase.table("profiles").select("*").execute()
    users = users_res.data
    
    standings_data = []
    
    for user in users:
        # 2. Fetch all predictions for this user (with race info)
        preds_res = supabase.table("predictions").select("points_total, race_id, races(name, race_time)").eq("user_id", user['id']).execute()
        predictions = preds_res.data
        
        # 3. Calculate Total Score dynamically
        total_score = sum((p['points_total'] or 0) for p in predictions)
        
        # 4. Get Recent Form (Last 3 races)
        scored_preds = [p for p in predictions if p['points_total'] is not None]
        scored_preds.sort(key=lambda x: x['races']['race_time'], reverse=True)
        
        recent_raw = scored_preds[:3]
        last_races = []
        for p in recent_raw:
            last_races.append({
                "code": get_race_code(p['races']['name']),
                "points": p['points_total']
            })
            
        standings_data.append({
            "id": user['id'],
            "username": user['username'],
            "total_score": total_score,
            "last_races": last_races
        })
    
    # 5. Sort by Total Score (Highest First)
    standings_data.sort(key=lambda x: x['total_score'], reverse=True)
    
    return standings_data

# =============================================
# LEAGUE ROUTES
# =============================================

@app.get("/leagues")
@limiter.limit("30/minute")
def get_leagues(request: Request, user_id: str = Depends(verify_user)):
    """Get all leagues the user is a member of, plus public leagues."""
    try:
        # Get user's leagues
        my_leagues = supabase.table("league_members").select(
            "league_id, role, season_points, joined_at, leagues(*)"
        ).eq("user_id", user_id).execute()
        
        # Get public leagues for discovery
        public_leagues = supabase.table("leagues").select("*").eq("is_public", True).eq("is_active", True).execute()
        
        return {
            "my_leagues": my_leagues.data,
            "public_leagues": public_leagues.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/leagues/{league_id}")
@limiter.limit("60/minute")
def get_league(request: Request, league_id: int, user_id: str = Depends(verify_user)):
    """Get league details with standings."""
    try:
        # Get league info
        league = supabase.table("leagues").select("*").eq("id", league_id).single().execute()
        
        if not league.data:
            raise HTTPException(status_code=404, detail="League not found")
        
        # Check if user has access (is member or league is public)
        is_member = supabase.table("league_members").select("id").eq(
            "league_id", league_id
        ).eq("user_id", user_id).execute()
        
        if not league.data.get("is_public") and not is_member.data:
            raise HTTPException(status_code=403, detail="Access denied to private league")
        
        # Get league standings with member info
        standings = supabase.table("league_members").select(
            "user_id, role, season_points, joined_at, profiles(username)"
        ).eq("league_id", league_id).order("season_points", desc=True).execute()
        
        # Get member count
        member_count = len(standings.data) if standings.data else 0
        
        return {
            "league": league.data,
            "standings": standings.data,
            "member_count": member_count,
            "is_member": bool(is_member.data)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/leagues")
@limiter.limit("10/minute")
def create_league(request: Request, league_input: LeagueCreateInput, user_id: str = Depends(verify_user)):
    """Create a new league."""
    print(f"Received create_league request from {user_id}. Data: {league_input}")
    try:
        invite_code = generate_invite_code()
        
        # Create the league
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
        
        # Add creator as owner member
        supabase.table("league_members").insert({
            "league_id": league_id,
            "user_id": user_id,
            "role": "owner"
        }).execute()
        
        return {"message": "League created successfully", "league": new_league.data[0]}
    except Exception as e:
        print(f"Create League Error: {str(e)}") # Log for Vercel
        # Try to extract more info if available
        detail = str(e)
        if hasattr(e, 'message'):
            detail = f"{e.message} (Code: {getattr(e, 'code', 'N/A')})"
        raise HTTPException(status_code=400, detail=f"Failed to create league: {detail}")

@app.put("/leagues/{league_id}")
@limiter.limit("20/minute")
def update_league(request: Request, league_id: int, league_input: LeagueUpdateInput, user_id: str = Depends(verify_user)):
    """Update league settings (owner only)."""
    try:
        # Verify ownership
        league = supabase.table("leagues").select("owner_id").eq("id", league_id).single().execute()
        
        if not league.data or league.data.get("owner_id") != user_id:
            raise HTTPException(status_code=403, detail="Only league owner can update settings")
        
        # Build update dict with only non-None values
        update_data = {k: v for k, v in league_input.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = supabase.table("leagues").update(update_data).eq("id", league_id).execute()
        
        return {"message": "League updated successfully", "league": result.data[0] if result.data else None}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/leagues/{league_id}")
@limiter.limit("5/minute")
def delete_league(request: Request, league_id: int, user_id: str = Depends(verify_user)):
    """Delete a league (owner only)."""
    try:
        # Verify ownership
        league = supabase.table("leagues").select("owner_id, invite_code").eq("id", league_id).single().execute()
        
        if not league.data or league.data.get("owner_id") != user_id:
            raise HTTPException(status_code=403, detail="Only league owner can delete the league")
        
        # Prevent deleting the global league
        if league.data.get("invite_code") == "F1APEX2026":
            raise HTTPException(status_code=403, detail="Cannot delete the global F1 Apex Championship")
        
        supabase.table("leagues").delete().eq("id", league_id).execute()
        
        return {"message": "League deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/leagues/join")
@limiter.limit("20/minute")
def join_league(request: Request, join_input: LeagueJoinInput, user_id: str = Depends(verify_user)):
    """Join a league using invite code."""
    try:
        # Find league by invite code
        league = supabase.table("leagues").select("*").eq("invite_code", join_input.invite_code.upper()).single().execute()
        
        if not league.data:
            raise HTTPException(status_code=404, detail="Invalid invite code")
        
        if not league.data.get("is_active"):
            raise HTTPException(status_code=400, detail="This league is no longer active")
        
        # Check member count
        member_count = supabase.table("league_members").select("id", count="exact").eq("league_id", league.data["id"]).execute()
        
        if member_count.count and member_count.count >= league.data.get("max_members", 50):
            raise HTTPException(status_code=400, detail="League is full")
        
        # Check if already a member
        existing = supabase.table("league_members").select("id").eq(
            "league_id", league.data["id"]
        ).eq("user_id", user_id).execute()
        
        if existing.data:
            raise HTTPException(status_code=400, detail="Already a member of this league")
        
        # Calculate user's current season points
        points_result = supabase.table("predictions").select("points_total").eq("user_id", user_id).execute()
        season_points = sum((p.get("points_total") or 0) for p in (points_result.data or []))
        
        # Join the league
        supabase.table("league_members").insert({
            "league_id": league.data["id"],
            "user_id": user_id,
            "role": "member",
            "season_points": season_points
        }).execute()
        
        return {"message": f"Successfully joined {league.data['name']}", "league": league.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/leagues/{league_id}/leave")
@limiter.limit("10/minute")
def leave_league(request: Request, league_id: int, user_id: str = Depends(verify_user)):
    """Leave a league."""
    try:
        # Get league info
        league = supabase.table("leagues").select("owner_id, invite_code").eq("id", league_id).single().execute()
        
        if not league.data:
            raise HTTPException(status_code=404, detail="League not found")
        
        # Prevent leaving global league
        if league.data.get("invite_code") == "F1APEX2026":
            raise HTTPException(status_code=400, detail="Cannot leave the global F1 Apex Championship")
        
        # Prevent owner from leaving (must transfer ownership or delete)
        if league.data.get("owner_id") == user_id:
            raise HTTPException(status_code=400, detail="League owner cannot leave. Transfer ownership or delete the league.")
        
        # Remove membership
        supabase.table("league_members").delete().eq("league_id", league_id).eq("user_id", user_id).execute()
        
        return {"message": "Successfully left the league"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/leagues/{league_id}/members")
@limiter.limit("30/minute")
def get_league_members(request: Request, league_id: int, user_id: str = Depends(verify_user)):
    """Get all members of a league with standings."""
    try:
        # Verify access
        league = supabase.table("leagues").select("is_public").eq("id", league_id).single().execute()
        
        if not league.data:
            raise HTTPException(status_code=404, detail="League not found")
        
        is_member = supabase.table("league_members").select("id").eq(
            "league_id", league_id
        ).eq("user_id", user_id).execute()
        
        if not league.data.get("is_public") and not is_member.data:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Get members with profile info
        members = supabase.table("league_members").select(
            "user_id, role, season_points, joined_at, profiles(username)"
        ).eq("league_id", league_id).order("season_points", desc=True).execute()
        
        return {"members": members.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/leagues/{league_id}/invite")
@limiter.limit("20/minute")
def invite_to_league(request: Request, league_id: int, invite_input: LeagueInviteInput, user_id: str = Depends(verify_user)):
    """Send an invite to someone to join the league."""
    try:
        # Verify membership
        is_member = supabase.table("league_members").select("id").eq(
            "league_id", league_id
        ).eq("user_id", user_id).execute()
        
        if not is_member.data:
            raise HTTPException(status_code=403, detail="Only league members can send invites")
        
        # Find invitee by username or email
        invitee = supabase.table("profiles").select("id, username").eq(
            "username", invite_input.username_or_email
        ).execute()
        
        if not invitee.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        invitee_id = invitee.data[0]["id"]
        
        # Check if already a member
        existing_member = supabase.table("league_members").select("id").eq(
            "league_id", league_id
        ).eq("user_id", invitee_id).execute()
        
        if existing_member.data:
            raise HTTPException(status_code=400, detail="User is already a member")
        
        # Check for existing pending invite
        existing_invite = supabase.table("league_invites").select("id").eq(
            "league_id", league_id
        ).eq("invitee_id", invitee_id).eq("status", "pending").execute()
        
        if existing_invite.data:
            raise HTTPException(status_code=400, detail="Invite already sent to this user")
        
        # Create invite
        supabase.table("league_invites").insert({
            "league_id": league_id,
            "inviter_id": user_id,
            "invitee_id": invitee_id,
            "status": "pending"
        }).execute()
        
        return {"message": f"Invite sent to {invitee.data[0]['username']}"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/invites")
@limiter.limit("30/minute")
def get_my_invites(request: Request, user_id: str = Depends(verify_user)):
    """Get pending invites for the current user."""
    try:
        invites = supabase.table("league_invites").select(
            "id, league_id, inviter_id, status, created_at, leagues(name, description), profiles!league_invites_inviter_id_fkey(username)"
        ).eq("invitee_id", user_id).eq("status", "pending").execute()
        
        return {"invites": invites.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/invites/{invite_id}/accept")
@limiter.limit("20/minute")
def accept_invite(request: Request, invite_id: int, user_id: str = Depends(verify_user)):
    """Accept a league invite."""
    try:
        # Get invite
        invite = supabase.table("league_invites").select("*").eq("id", invite_id).eq("invitee_id", user_id).single().execute()
        
        if not invite.data:
            raise HTTPException(status_code=404, detail="Invite not found")
        
        if invite.data.get("status") != "pending":
            raise HTTPException(status_code=400, detail="Invite is no longer pending")
        
        league_id = invite.data["league_id"]
        
        # Check league capacity
        league = supabase.table("leagues").select("max_members").eq("id", league_id).single().execute()
        member_count = supabase.table("league_members").select("id", count="exact").eq("league_id", league_id).execute()
        
        if member_count.count and league.data and member_count.count >= league.data.get("max_members", 50):
            raise HTTPException(status_code=400, detail="League is full")
        
        # Calculate user's current season points
        points_result = supabase.table("predictions").select("points_total").eq("user_id", user_id).execute()
        season_points = sum((p.get("points_total") or 0) for p in (points_result.data or []))
        
        # Join the league
        supabase.table("league_members").insert({
            "league_id": league_id,
            "user_id": user_id,
            "role": "member",
            "season_points": season_points
        }).execute()
        
        # Update invite status
        supabase.table("league_invites").update({"status": "accepted"}).eq("id", invite_id).execute()
        
        return {"message": "Successfully joined the league"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/invites/{invite_id}/decline")
@limiter.limit("20/minute")
def decline_invite(request: Request, invite_id: int, user_id: str = Depends(verify_user)):
    """Decline a league invite."""
    try:
        invite = supabase.table("league_invites").select("id").eq("id", invite_id).eq("invitee_id", user_id).single().execute()
        
        if not invite.data:
            raise HTTPException(status_code=404, detail="Invite not found")
        
        supabase.table("league_invites").update({"status": "declined"}).eq("id", invite_id).execute()
        
        return {"message": "Invite declined"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/leagues/{league_id}/standings")
@limiter.limit("30/minute")
def get_league_standings(request: Request, league_id: int, user_id: str = Depends(verify_user)):
    """Get detailed standings for a league."""
    try:
        # Verify access
        league = supabase.table("leagues").select("*").eq("id", league_id).single().execute()
        
        if not league.data:
            raise HTTPException(status_code=404, detail="League not found")
        
        is_member = supabase.table("league_members").select("id").eq(
            "league_id", league_id
        ).eq("user_id", user_id).execute()
        
        if not league.data.get("is_public") and not is_member.data:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Get members with detailed standings
        members_raw = supabase.table("league_members").select(
            "user_id, role, season_points, joined_at, profiles(username)"
        ).eq("league_id", league_id).order("season_points", desc=True).execute()
        
        standings = []
        for idx, member in enumerate(members_raw.data or []):
            standings.append({
                "position": idx + 1,
                "user_id": member["user_id"],
                "username": member["profiles"]["username"] if member.get("profiles") else "Unknown",
                "role": member["role"],
                "season_points": member["season_points"] or 0,
                "joined_at": member["joined_at"]
            })
        
        return {
            "league": league.data,
            "standings": standings,
            "total_members": len(standings)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================
# FRIENDS ROUTES
# =============================================

@app.get("/friends")
@limiter.limit("30/minute")
def get_friends(request: Request, user_id: str = Depends(verify_user)):
    """Get all friends and pending requests."""
    try:
        # Get accepted friends (both directions)
        friends_as_sender = supabase.table("friendships").select(
            "id, friend_id, status, created_at, accepted_at, profiles!friendships_friend_id_fkey(username, total_score)"
        ).eq("user_id", user_id).eq("status", "accepted").execute()
        
        friends_as_receiver = supabase.table("friendships").select(
            "id, user_id, status, created_at, accepted_at, profiles!friendships_user_id_fkey(username, total_score)"
        ).eq("friend_id", user_id).eq("status", "accepted").execute()
        
        # Get pending requests sent TO the user
        pending_received = supabase.table("friendships").select(
            "id, user_id, created_at, profiles!friendships_user_id_fkey(username)"
        ).eq("friend_id", user_id).eq("status", "pending").execute()
        
        # Get pending requests sent BY the user
        pending_sent = supabase.table("friendships").select(
            "id, friend_id, created_at, profiles!friendships_friend_id_fkey(username)"
        ).eq("user_id", user_id).eq("status", "pending").execute()
        
        # Combine friends list
        friends = []
        for f in (friends_as_sender.data or []):
            friends.append({
                "friendship_id": f["id"],
                "friend_id": f["friend_id"],
                "username": f["profiles"]["username"] if f.get("profiles") else "Unknown",
                "total_score": f["profiles"]["total_score"] if f.get("profiles") else 0,
                "accepted_at": f["accepted_at"]
            })
        for f in (friends_as_receiver.data or []):
            friends.append({
                "friendship_id": f["id"],
                "friend_id": f["user_id"],
                "username": f["profiles"]["username"] if f.get("profiles") else "Unknown",
                "total_score": f["profiles"]["total_score"] if f.get("profiles") else 0,
                "accepted_at": f["accepted_at"]
            })
        
        return {
            "friends": friends,
            "pending_received": pending_received.data,
            "pending_sent": pending_sent.data,
            "friend_count": len(friends)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/friends/request")
@limiter.limit("20/minute")
def send_friend_request(request: Request, friend_input: FriendRequestInput, user_id: str = Depends(verify_user)):
    """Send a friend request by username."""
    try:
        # Find user by username
        target = supabase.table("profiles").select("id, username").eq("username", friend_input.username).execute()
        
        if not target.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        target_id = target.data[0]["id"]
        
        # Prevent self-friending
        if target_id == user_id:
            raise HTTPException(status_code=400, detail="Cannot send friend request to yourself")
        
        # Check for existing friendship (either direction)
        existing = supabase.table("friendships").select("id, status").or_(
            f"and(user_id.eq.{user_id},friend_id.eq.{target_id}),and(user_id.eq.{target_id},friend_id.eq.{user_id})"
        ).execute()
        
        if existing.data:
            status = existing.data[0]["status"]
            if status == "accepted":
                raise HTTPException(status_code=400, detail="Already friends")
            elif status == "pending":
                raise HTTPException(status_code=400, detail="Friend request already pending")
            elif status == "blocked":
                raise HTTPException(status_code=400, detail="Cannot send request")
        
        # Create friend request
        supabase.table("friendships").insert({
            "user_id": user_id,
            "friend_id": target_id,
            "status": "pending"
        }).execute()
        
        return {"message": f"Friend request sent to {target.data[0]['username']}"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/friends/{friendship_id}/accept")
@limiter.limit("30/minute")
def accept_friend_request(request: Request, friendship_id: int, user_id: str = Depends(verify_user)):
    """Accept a friend request."""
    try:
        # Get friendship where user is the recipient
        friendship = supabase.table("friendships").select("*").eq("id", friendship_id).eq("friend_id", user_id).eq("status", "pending").single().execute()
        
        if not friendship.data:
            raise HTTPException(status_code=404, detail="Friend request not found")
        
        # Accept the request
        supabase.table("friendships").update({
            "status": "accepted",
            "accepted_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", friendship_id).execute()
        
        return {"message": "Friend request accepted!"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/friends/{friendship_id}/decline")
@limiter.limit("30/minute")
def decline_friend_request(request: Request, friendship_id: int, user_id: str = Depends(verify_user)):
    """Decline a friend request."""
    try:
        friendship = supabase.table("friendships").select("id").eq("id", friendship_id).eq("friend_id", user_id).eq("status", "pending").single().execute()
        
        if not friendship.data:
            raise HTTPException(status_code=404, detail="Friend request not found")
        
        # Delete the request
        supabase.table("friendships").delete().eq("id", friendship_id).execute()
        
        return {"message": "Friend request declined"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/friends/{friendship_id}")
@limiter.limit("20/minute")
def remove_friend(request: Request, friendship_id: int, user_id: str = Depends(verify_user)):
    """Remove a friend."""
    try:
        # Verify user is part of this friendship
        friendship = supabase.table("friendships").select("id").eq("id", friendship_id).or_(
            f"user_id.eq.{user_id},friend_id.eq.{user_id}"
        ).single().execute()
        
        if not friendship.data:
            raise HTTPException(status_code=404, detail="Friendship not found")
        
        supabase.table("friendships").delete().eq("id", friendship_id).execute()
        
        return {"message": "Friend removed"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/users/search")
@limiter.limit("30/minute")
def search_users(request: Request, q: str, user_id: str = Depends(verify_user)):
    """Search for users by username."""
    try:
        if len(q) < 2:
            raise HTTPException(status_code=400, detail="Search query too short")
        
        # Search users (case insensitive partial match)
        results = supabase.table("profiles").select("id, username, total_score").ilike("username", f"%{q}%").limit(20).execute()
        
        # Filter out current user
        users = [u for u in (results.data or []) if u["id"] != user_id]
        
        return {"users": users}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================
# LEAGUE CHAT ROUTES
# =============================================

@app.get("/leagues/{league_id}/chat")
@limiter.limit("60/minute")
def get_league_chat(request: Request, league_id: int, limit: int = 50, before_id: Optional[int] = None, user_id: str = Depends(verify_user)):
    """Get chat messages for a league."""
    try:
        # Verify membership
        is_member = supabase.table("league_members").select("id").eq("league_id", league_id).eq("user_id", user_id).execute()
        
        if not is_member.data:
            raise HTTPException(status_code=403, detail="Not a member of this league")
        
        # Build query
        query = supabase.table("league_messages").select(
            "id, content, message_type, race_id, reply_to_id, created_at, is_pinned, user_id, profiles(username)"
        ).eq("league_id", league_id).eq("is_deleted", False).order("created_at", desc=True).limit(min(limit, 100))
        
        if before_id:
            query = query.lt("id", before_id)
        
        messages = query.execute()
        
        # Get reactions for these messages
        if messages.data:
            message_ids = [m["id"] for m in messages.data]
            reactions = supabase.table("message_reactions").select("message_id, reaction, user_id").in_("message_id", message_ids).execute()
            
            # Group reactions by message
            reaction_map = {}
            for r in (reactions.data or []):
                mid = r["message_id"]
                if mid not in reaction_map:
                    reaction_map[mid] = []
                reaction_map[mid].append({"reaction": r["reaction"], "user_id": r["user_id"]})
            
            # Attach reactions to messages
            for m in messages.data:
                m["reactions"] = reaction_map.get(m["id"], [])
        
        return {"messages": list(reversed(messages.data or []))}  # Reverse to chronological order
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/leagues/{league_id}/chat")
@limiter.limit("30/minute")
def send_chat_message(request: Request, league_id: int, message: ChatMessageInput, user_id: str = Depends(verify_user)):
    """Send a message to league chat."""
    try:
        # Verify membership
        is_member = supabase.table("league_members").select("id").eq("league_id", league_id).eq("user_id", user_id).execute()
        
        if not is_member.data:
            raise HTTPException(status_code=403, detail="Not a member of this league")
        
        # Create message
        new_message = supabase.table("league_messages").insert({
            "league_id": league_id,
            "user_id": user_id,
            "content": message.content,
            "message_type": message.message_type,
            "race_id": message.race_id,
            "reply_to_id": message.reply_to_id
        }).execute()
        
        return {"message": "Message sent", "data": new_message.data[0] if new_message.data else None}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/chat/{message_id}")
@limiter.limit("30/minute")
def delete_chat_message(request: Request, message_id: int, user_id: str = Depends(verify_user)):
    """Delete a chat message (soft delete)."""
    try:
        # Verify ownership
        message = supabase.table("league_messages").select("id, user_id").eq("id", message_id).single().execute()
        
        if not message.data:
            raise HTTPException(status_code=404, detail="Message not found")
        
        if message.data["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Can only delete your own messages")
        
        # Soft delete
        supabase.table("league_messages").update({"is_deleted": True, "content": "[message deleted]"}).eq("id", message_id).execute()
        
        return {"message": "Message deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/chat/{message_id}/react")
@limiter.limit("60/minute")
def add_reaction(request: Request, message_id: int, reaction_input: ReactionInput, user_id: str = Depends(verify_user)):
    """Add a reaction to a message."""
    try:
        # Verify message exists and user has access
        message = supabase.table("league_messages").select("id, league_id").eq("id", message_id).single().execute()
        
        if not message.data:
            raise HTTPException(status_code=404, detail="Message not found")
        
        is_member = supabase.table("league_members").select("id").eq("league_id", message.data["league_id"]).eq("user_id", user_id).execute()
        
        if not is_member.data:
            raise HTTPException(status_code=403, detail="Not a member of this league")
        
        # Add reaction (will fail if duplicate due to unique constraint)
        try:
            supabase.table("message_reactions").insert({
                "message_id": message_id,
                "user_id": user_id,
                "reaction": reaction_input.reaction
            }).execute()
        except:
            pass  # Ignore duplicate reaction
        
        return {"message": "Reaction added"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/chat/{message_id}/react/{reaction}")
@limiter.limit("60/minute")
def remove_reaction(request: Request, message_id: int, reaction: str, user_id: str = Depends(verify_user)):
    """Remove a reaction from a message."""
    try:
        supabase.table("message_reactions").delete().eq("message_id", message_id).eq("user_id", user_id).eq("reaction", reaction).execute()
        return {"message": "Reaction removed"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# =============================================
# LEAGUE GRADING ROUTES (Decentralized Admin)
# =============================================

async def verify_league_grader(league_id: int, user_id: str) -> bool:
    """Check if user can grade predictions in this league."""
    # Check if global admin
    admin_check = supabase.table("profiles").select("is_admin").eq("id", user_id).single().execute()
    if admin_check.data and admin_check.data.get("is_admin"):
        return True
    
    # Check league role
    member = supabase.table("league_members").select("role").eq("league_id", league_id).eq("user_id", user_id).single().execute()
    if member.data and member.data.get("role") in ['owner', 'admin', 'grader']:
        return True
    
    return False

@app.get("/leagues/{league_id}/predictions/{race_id}")
@limiter.limit("30/minute")
def get_league_predictions_for_race(request: Request, league_id: int, race_id: int, user_id: str = Depends(verify_user)):
    """Get predictions for league members for a specific race."""
    try:
        # Verify user is league member
        is_member = supabase.table("league_members").select("id").eq("league_id", league_id).eq("user_id", user_id).execute()
        if not is_member.data:
            raise HTTPException(status_code=403, detail="Not a member of this league")
        
        # Get all member IDs
        members = supabase.table("league_members").select("user_id").eq("league_id", league_id).execute()
        member_ids = [m["user_id"] for m in members.data]
        
        # Get predictions from those members
        predictions = supabase.table("predictions").select(
            "*, profiles(username)"
        ).eq("race_id", race_id).in_("user_id", member_ids).execute()
        
        # Get existing grades for this league
        grades = supabase.table("league_prediction_grades").select("*").eq("league_id", league_id).execute()
        grade_map = {g["prediction_id"]: g for g in (grades.data or [])}
        
        # Attach grades to predictions
        result = []
        for pred in (predictions.data or []):
            pred["league_grade"] = grade_map.get(pred["id"])
            result.append(pred)
        
        return {"predictions": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/leagues/{league_id}/grade")
@limiter.limit("30/minute")
async def grade_league_prediction(request: Request, league_id: int, grade_input: LeagueGradeInput, user_id: str = Depends(verify_user)):
    """Grade a prediction within a league."""
    try:
        # Verify grading permission
        can_grade = await verify_league_grader(league_id, user_id)
        if not can_grade:
            raise HTTPException(status_code=403, detail="You don't have permission to grade in this league")
        
        # Verify the prediction belongs to a league member
        prediction = supabase.table("predictions").select("user_id").eq("id", grade_input.prediction_id).single().execute()
        if not prediction.data:
            raise HTTPException(status_code=404, detail="Prediction not found")
        
        is_member = supabase.table("league_members").select("id").eq("league_id", league_id).eq("user_id", prediction.data["user_id"]).execute()
        if not is_member.data:
            raise HTTPException(status_code=400, detail="This prediction is not from a league member")
        
        # Upsert the grade
        grade_data = {
            "league_id": league_id,
            "prediction_id": grade_input.prediction_id,
            "grader_id": user_id,
            "wild_points": grade_input.wild_points,
            "flop_points": grade_input.flop_points,
            "surprise_points": grade_input.surprise_points,
            "notes": grade_input.notes,
            "graded_at": datetime.now(timezone.utc).isoformat()
        }
        
        supabase.table("league_prediction_grades").upsert(grade_data, on_conflict="league_id,prediction_id").execute()
        
        return {"message": "Grade saved successfully", "total_points": grade_input.wild_points + grade_input.flop_points + grade_input.surprise_points}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/leagues/{league_id}/grading-queue")
@limiter.limit("20/minute")
async def get_grading_queue(request: Request, league_id: int, user_id: str = Depends(verify_user)):
    """Get predictions awaiting grading in a league."""
    try:
        # Verify grading permission
        can_grade = await verify_league_grader(league_id, user_id)
        if not can_grade:
            raise HTTPException(status_code=403, detail="No grading permission")
        
        # Get member IDs
        members = supabase.table("league_members").select("user_id").eq("league_id", league_id).execute()
        member_ids = [m["user_id"] for m in members.data]
        
        # Get all predictions from members
        predictions = supabase.table("predictions").select(
            "id, race_id, user_id, wild_prediction, biggest_flop, biggest_surprise, profiles(username), races(name)"
        ).in_("user_id", member_ids).execute()
        
        # Get already graded prediction IDs
        graded = supabase.table("league_prediction_grades").select("prediction_id").eq("league_id", league_id).execute()
        graded_ids = set(g["prediction_id"] for g in (graded.data or []))
        
        # Filter ungraded
        ungraded = [p for p in (predictions.data or []) if p["id"] not in graded_ids]
        
        return {
            "ungraded_count": len(ungraded),
            "predictions": ungraded[:50]  # Limit to 50
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/leagues/{league_id}/sync-points")
@limiter.limit("5/minute")
async def sync_league_points(request: Request, league_id: int, user_id: str = Depends(verify_user)):
    """Recalculate all league member points including grades."""
    try:
        can_grade = await verify_league_grader(league_id, user_id)
        if not can_grade:
            raise HTTPException(status_code=403, detail="No permission")
        
        members = supabase.table("league_members").select("user_id").eq("league_id", league_id).execute()
        
        updated = 0
        for member in (members.data or []):
            member_id = member["user_id"]
            
            # Get auto points
            auto_points = supabase.table("predictions").select("points_total").eq("user_id", member_id).execute()
            auto_total = sum(p.get("points_total") or 0 for p in (auto_points.data or []))
            
            # Get league-specific grades
            grades = supabase.table("league_prediction_grades").select(
                "wild_points, flop_points, surprise_points, predictions!inner(user_id)"
            ).eq("league_id", league_id).execute()
            
            grade_total = sum(
                (g.get("wild_points") or 0) + (g.get("flop_points") or 0) + (g.get("surprise_points") or 0)
                for g in (grades.data or [])
                if g.get("predictions", {}).get("user_id") == member_id
            )
            
            # Update season points
            supabase.table("league_members").update({
                "season_points": auto_total + grade_total
            }).eq("league_id", league_id).eq("user_id", member_id).execute()
            
            updated += 1
        
        return {"message": f"Synced points for {updated} members"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================
# ACHIEVEMENTS & ACTIVITY ROUTES
# =============================================

@app.get("/achievements")
@limiter.limit("30/minute")
def get_all_achievements(request: Request):
    """Get all available achievements."""
    try:
        achievements = supabase.table("achievements").select("*").eq("is_active", True).order("category").execute()
        return {"achievements": achievements.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users/{target_user_id}/achievements")
@limiter.limit("30/minute")
def get_user_achievements(request: Request, target_user_id: str):
    """Get achievements earned by a user."""
    try:
        earned = supabase.table("user_achievements").select(
            "*, achievements(code, name, description, icon, points_value, category)"
        ).eq("user_id", target_user_id).order("earned_at", desc=True).execute()
        
        return {
            "achievements": earned.data,
            "count": len(earned.data or [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/activity")
@limiter.limit("30/minute")
def get_activity_feed(request: Request, limit: int = 50, user_id: str = Depends(verify_user)):
    """Get activity feed for the current user and friends."""
    try:
        # Get friend IDs
        friends1 = supabase.table("friendships").select("friend_id").eq("user_id", user_id).eq("status", "accepted").execute()
        friends2 = supabase.table("friendships").select("user_id").eq("friend_id", user_id).eq("status", "accepted").execute()
        
        friend_ids = [f["friend_id"] for f in (friends1.data or [])] + [f["user_id"] for f in (friends2.data or [])]
        friend_ids.append(user_id)  # Include own activity
        
        # Get activity
        activity = supabase.table("activity_feed").select(
            "*, profiles(username)"
        ).in_("user_id", friend_ids).eq("is_public", True).order("created_at", desc=True).limit(min(limit, 100)).execute()
        
        return {"activity": activity.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/leagues/{league_id}/activity")
@limiter.limit("30/minute")
def get_league_activity(request: Request, league_id: int, limit: int = 30, user_id: str = Depends(verify_user)):
    """Get activity feed for a specific league."""
    try:
        # Verify membership
        is_member = supabase.table("league_members").select("id").eq("league_id", league_id).eq("user_id", user_id).execute()
        if not is_member.data:
            raise HTTPException(status_code=403, detail="Not a member")
        
        # Get member IDs
        members = supabase.table("league_members").select("user_id").eq("league_id", league_id).execute()
        member_ids = [m["user_id"] for m in members.data]
        
        # Get activity
        activity = supabase.table("activity_feed").select(
            "*, profiles(username)"
        ).in_("user_id", member_ids).order("created_at", desc=True).limit(min(limit, 50)).execute()
        
        return {"activity": activity.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users/{target_user_id}/profile")
@limiter.limit("30/minute")
def get_user_profile(request: Request, target_user_id: str):
    """Get user profile with stats."""
    try:
        # Get basic profile
        profile = supabase.table("profiles").select("id, username, total_score, is_admin").eq("id", target_user_id).single().execute()
        if not profile.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get counts
        predictions = supabase.table("predictions").select("id", count="exact").eq("user_id", target_user_id).execute()
        friends = supabase.table("friendships").select("id", count="exact").or_(f"user_id.eq.{target_user_id},friend_id.eq.{target_user_id}").eq("status", "accepted").execute()
        leagues = supabase.table("league_members").select("id", count="exact").eq("user_id", target_user_id).execute()
        achievements = supabase.table("user_achievements").select("id", count="exact").eq("user_id", target_user_id).execute()
        
        return {
            "profile": profile.data,
            "stats": {
                "predictions": predictions.count or 0,
                "friends": friends.count or 0,
                "leagues": leagues.count or 0,
                "achievements": achievements.count or 0
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- HEALTH CHECK ---
@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# --- SERVER STARTUP ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)