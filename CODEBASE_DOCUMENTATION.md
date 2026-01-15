# 🏎️ F1 Apex - Complete Codebase Documentation

> **Last Updated:** January 15, 2026  
> **Purpose:** Reference document for continuing development

---

## 📁 Project Structure

```
fl-predictor/
├── api/                        # Backend API (Vercel Python Serverless)
│   ├── main.py                 # FastAPI app - 1484 lines
│   ├── scoring.py              # Points calculation
│   ├── index.py                # Vercel entry point
│   └── requirements.txt        # Python dependencies
├── backend/                    # Local development server (same code)
├── frontend/                   # Next.js 16 + React 19 App
│   ├── app/                    # App router pages & components
│   ├── lib/                    # API client & config
│   └── middleware.ts           # Auth protection
├── *.sql                       # Database schemas (run in Supabase)
└── vercel.json                 # Deployment config
```

---

## 🔧 Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Next.js | 16.0.6 |
| UI | React | 19.2.0 |
| Backend | FastAPI | ≥0.100.0 |
| Database | Supabase (PostgreSQL) | - |
| Auth | Supabase Auth | - |
| Styling | Tailwind CSS | v4 |
| Deployment | Vercel | - |

---

## 🗄️ Database Schema Overview

### Core Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | User accounts | `id`, `username`, `total_score`, `is_admin` |
| `races` | 2026 F1 calendar | `id`, `name`, `circuit`, `quali_time`, `race_time`, `is_sprint` |
| `predictions` | User picks | `user_id`, `race_id`, `quali_p1_driver`, `race_p1_driver`, `points_total` |

### League System Tables

| Table | Purpose |
|-------|---------|
| `leagues` | League info with `invite_code`, `is_public`, `max_members` |
| `league_members` | Memberships with `role` (owner/admin/member), `season_points` |
| `league_invites` | Pending invitations |
| `league_prediction_grades` | Per-league grading for wild/flop/surprise |

### Social Tables

| Table | Purpose |
|-------|---------|
| `friendships` | Friend relationships with `status` |
| `league_messages` | Chat messages per league |
| `message_reactions` | Emoji reactions on messages |
| `activity_feed` | Activity log for feed |
| `achievements` | Achievement definitions |
| `user_achievements` | Earned achievements |
| `rivalries` | Rivalry matchups |

---

## 🔌 API Endpoints Reference

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/health` | Detailed health status |
| GET | `/races` | All races (rate: 30/min) |
| GET | `/races/{id}` | Single race details |
| GET | `/standings` | Global leaderboard |
| GET | `/achievements` | All achievements |

### Authenticated Endpoints (Require Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Submit prediction (10/min) |
| GET/POST | `/leagues` | List/create leagues |
| GET | `/leagues/{id}` | League details |
| POST | `/leagues/join` | Join via invite code |
| GET | `/friends` | Friend list |
| POST | `/friends/request` | Send friend request |
| GET | `/leagues/{id}/chat` | Get chat messages |
| POST | `/leagues/{id}/chat` | Send message |

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/predictions/{race_id}` | All predictions for race |
| POST | `/admin/grade` | Grade prediction |
| POST | `/admin/settle` | Settle race & calculate points |

---

## 📊 Scoring System

```python
# Qualifying Points
Pole Position (P1):   5 pts
P2:                   3 pts
P3:                   1 pt

# Race Points
Winner (P1):          10 pts
P2:                   8 pts
P3:                   6 pts

# Bonuses
Hat Trick (Pole + Win): +2 pts
Podium Trio (Exact):    +5 pts
Podium Trio (Any order): +2 pts

# Manual Grading (Admin/League)
Wild Prediction:      0-50 pts
Biggest Flop:         0-50 pts
Biggest Surprise:     0-50 pts
```

---

## 👥 2026 Driver Grid

All 11 teams × 2 drivers = **22 drivers**

| Team | Driver 1 | Driver 2 |
|------|----------|----------|
| Red Bull | Max Verstappen (1) | Isack Hadjar (6) |
| McLaren | Lando Norris (4) | Oscar Piastri (81) |
| Ferrari | Charles Leclerc (16) | Lewis Hamilton (44) |
| Mercedes | George Russell (63) | Kimi Antonelli (12) |
| Aston Martin | Fernando Alonso (14) | Lance Stroll (18) |
| Williams | Carlos Sainz (55) | Alexander Albon (23) |
| Alpine | Pierre Gasly (10) | Franco Colapinto (43) |
| Haas | Esteban Ocon (31) | Oliver Bearman (87) |
| RB | Yuki Tsunoda (22) | Liam Lawson (30) |
| Sauber | Nico Hulkenberg (27) | Gabriel Bortoleto (5) |
| **Cadillac** | Valtteri Bottas (77) | Sergio Perez (11) |

> **Source of Truth:** `frontend/app/lib/drivers.ts`

---

## 🚀 Development Commands

```bash
# Frontend (from /frontend)
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint check

# Backend (from /backend or /api)
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## 🔐 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_API_URL=/api                    # For production
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxx   # Optional
```

### Backend (.env)
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJhbGci...                    # Service role key
ALLOWED_ORIGINS=https://your-domain.vercel.app
```

---

## 🏗️ Key Components

### Frontend Components (`/frontend/app/components/`)

| Component | Purpose | Lines |
|-----------|---------|-------|
| `Navbar.tsx` | Navigation with auth state | ~150 |
| `Footer.tsx` | Site footer | ~90 |
| `PredictionForm.tsx` | Race prediction form | 220 |
| `LaunchSequence.tsx` | Countdown timer | ~170 |
| `RivalryCard.tsx` | Rivalry display | ~250 |
| `LeagueChat.tsx` | Real-time chat | ~310 |
| `TelemetryBackground.tsx` | Animated canvas BG | ~470 |
| `ConfidenceMeter.tsx` | Prediction confidence | ~130 |
| `WeatherWidget.tsx` | Weather for circuit | ~180 |

### Core Files

| File | Purpose |
|------|---------|
| `frontend/lib/api.ts` | API client with Safari compat |
| `frontend/lib/config.ts` | Environment config |
| `frontend/middleware.ts` | Auth route protection |
| `frontend/app/lib/drivers.ts` | 2026 driver data |

---

## 🛡️ Security Features

1. **Row Level Security (RLS)** - All tables protected
2. **Rate Limiting** - Via slowapi (configurable per endpoint)
3. **Input Validation** - Pydantic models with validators
4. **CORS** - Configurable allowed origins
5. **Token Verification** - Supabase JWT validation
6. **Admin Checks** - `is_admin` flag + verification helper

---

## 📋 SQL Schemas to Run

Execute in this order in Supabase SQL Editor:

1. `database_schema.sql` - Core tables + 2026 race calendar
2. `leagues_schema.sql` - League system + auto-join global
3. `friends_and_chat_schema.sql` - Friends + chat + realtime
4. `enhancements_schema.sql` - Achievements + activity feed
5. `rivalries_table.sql` - Rivalries feature (optional)

---

## ⚠️ Known Considerations

### Production Checklist
- [ ] Set `ALLOWED_ORIGINS` to production domain
- [ ] Configure Supabase environment variables on Vercel
- [ ] Run all SQL schemas in Supabase
- [ ] Verify `is_admin` is set for admin users
- [ ] Test league creation after deployment

### Potential Issues
1. **Safari Headers** - API client sanitizes headers for WebKit compat
2. **Vercel Cold Starts** - First request may be slow
3. **Supabase Limits** - Free tier has connection limits

---

## 🔄 Data Flow

```
User Action → Frontend Component
    ↓
API Client (lib/api.ts)
    ↓
FastAPI Backend (api/main.py)
    ↓
Supabase (postgresql)
    ↓
Response → Frontend State
```

---

## 📱 Protected Routes

Routes requiring authentication (via `middleware.ts`):
- `/predict/*`
- `/submissions`
- `/results`
- `/admin/*`

Unauthenticated users redirected to `/login`.

---

## 🎨 Design System

### CSS Variables (globals.css)
```css
--bg-gunmetal: #0D1117
--bg-carbon: #1F2833
--accent-cyan: #00E5FF
--accent-teal: #00BFA5
--signal-red: #FF0000
--text-grey: #C5C6C7
--text-silver: #9E9E9E
```

### Fonts
- **Headings:** Orbitron, Titillium Web
- **Body:** Inter
- **Data/Code:** Roboto Mono, JetBrains Mono

---

## 🔗 Quick Links

| Resource | Path |
|----------|------|
| Home Page | `/frontend/app/page.tsx` |
| API Main | `/api/main.py` |
| Drivers List | `/frontend/app/lib/drivers.ts` |
| Scoring Logic | `/api/scoring.py` |
| DB Schema | `/database_schema.sql` |
| League Schema | `/leagues_schema.sql` |

---

## ✅ Code Quality Status

- **Linting:** ESLint configured
- **TypeScript:** Strict mode enabled
- **API Validation:** Pydantic models
- **Error Handling:** Try-catch + HTTPException
- **Logging:** Console logging for debugging

---

> **Next Steps:** Use this document as reference when continuing development. All core features are implemented and production-ready.
