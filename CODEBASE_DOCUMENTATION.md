# 🏎️ F1 Apex — Complete Codebase Documentation

> **Last Updated:** January 21, 2026  
> **Version:** 3.0 (Analytics & Engagement Release)  
> **Status:** Production-Ready | 2026 Season  
> **Live:** [apexpredict.live](https://apexpredict.live)

---

## 📖 Introduction

**F1 Apex** is a full-stack Formula 1 prediction platform that transforms race weekends into strategic competitions. Users predict qualifying and race results, compete in leagues, and climb global standings—all through an interface designed to feel like a race engineer's pit wall.

This document serves as the **single source of truth** for developers. It covers architecture decisions, database design, API contracts, component structure, and operational best practices.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT (BROWSER)                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Next.js 16 App                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │   │
│  │  │  Pages   │  │Components│  │   Lib    │              │   │
│  │  │(22 routes)│ │  (35+)   │  │ (API/DB) │              │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘              │   │
│  │       └─────────────┼─────────────┘                     │   │
│  └─────────────────────┼───────────────────────────────────┘   │
│                        ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           Integrated Third-Party Services               │   │
│  │  ├─ Supabase Client (Real-time DB + Auth)              │   │
│  │  ├─ Vercel Analytics (Traffic + Vitals)                │   │
│  │  └─ Google AdSense (Monetization)                      │   │
│  └────────────────────────┬────────────────────────────────┘   │
└───────────────────────────┼─────────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐
│   FastAPI Backend     │       │   Supabase Cloud      │
│   (Vercel Serverless) │◄─────►│   PostgreSQL + Auth   │
│   Python 3.12         │       │   Row Level Security  │
└───────────────────────┘       └───────────────────────┘
```

### Why This Stack?

| Technology | Rationale |
|:-----------|:----------|
| **Next.js 16** | Latest App Router with React Server Components. Streaming, partial prerendering, edge optimization. |
| **React 19** | Concurrent features, improved hydration, enhanced developer experience. |
| **FastAPI** | Python's fastest web framework. Automatic OpenAPI docs, async support, Pydantic validation. |
| **Supabase** | Managed PostgreSQL with built-in auth, real-time subscriptions, and Row Level Security. |
| **Google AdSense** | Reliable, scalable monetization with responsive ad formats. |
| **Tailwind CSS v4** | Design tokens, responsive utilities, Lightning CSS engine. |
| **Vercel** | Seamless deployment with automatic preview environments and Python serverless functions. |

---

## 📁 Project Structure

```
fl-predictor/
│
├── 📂 app/                          # Next.js App Router
│   │
│   ├── 📄 layout.tsx                # Root layout (fonts, AdSense, analytics)
│   ├── 📄 page.tsx                  # Landing page (Server Component)
│   ├── 📄 globals.css               # Design system (1025+ lines)
│   ├── 📄 template.tsx              # Page transitions template
│   ├── 📄 sitemap.ts                # Dynamic sitemap generator
│   ├── 📄 robots.ts                 # Robots.txt generator
│   │
│   ├── 📂 components/               # 35+ Reusable UI Components
│   │   │
│   │   │  ── CORE LAYOUT ──
│   │   ├── Navbar.tsx               # Navigation (7KB) - Auth state, mobile menu
│   │   ├── Footer.tsx               # Site footer (14KB) - Pit Crew section
│   │   ├── MobileMenu.tsx           # Responsive mobile nav (6KB)
│   │   │
│   │   │  ── VISUAL EFFECTS ──
│   │   ├── TelemetryBackground.tsx  # Animated canvas (11KB) - 470+ lines
│   │   ├── TelemetryBgWrapper.tsx   # Client wrapper for background
│   │   ├── WindTunnelBg.tsx         # Alternative aero background (4KB)
│   │   ├── TelemetryLoader.tsx      # Loading state with F1 styling (4KB)
│   │   ├── LoadingSpinner.tsx       # Spinner variants (4KB)
│   │   │
│   │   │  ── PREDICTION SYSTEM ──
│   │   ├── PredictionForm.tsx       # Multi-step form (9KB)
│   │   ├── LaunchSequence.tsx       # Countdown timer (5KB)
│   │   ├── ConfidenceMeter.tsx      # Gauge component (4KB)
│   │   ├── WeatherWidget.tsx        # Circuit weather (8KB)
│   │   ├── CircuitGuide.tsx         # 🆕 Track insights (6KB)
│   │   ├── TemplateSelector.tsx     # 🆕 Quick prediction templates (9KB)
│   │   │
│   │   │  ── SOCIAL FEATURES ──
│   │   ├── LeagueChat.tsx           # Real-time chat (11KB)
│   │   ├── RivalryCard.tsx          # H2H display (11KB)
│   │   ├── GauntletModal.tsx        # Rivalry challenges (8KB)
│   │   ├── NotificationBell.tsx     # Notification dropdown (7KB)
│   │   ├── NotificationPreferences.tsx # 🆕 User notification settings (4KB)
│   │   ├── FeedbackForm.tsx         # 🆕 User feedback collection (7KB)
│   │   ├── ShareButton.tsx          # 🆕 Social sharing (3KB)
│   │   ├── StreakBadge.tsx          # 🆕 Prediction streak indicator (4KB)
│   │   │
│   │   │  ── ANALYTICS & LIVE ──
│   │   ├── 📂 Analytics/            # 🆕 Performance Analytics
│   │   │   ├── AnalyticsDashboard.tsx  # Main analytics view (8KB)
│   │   │   ├── TrendChart.tsx          # Performance over time (3KB)
│   │   │   └── AccuracyHeatmap.tsx     # Race-by-race accuracy (3KB)
│   │   │
│   │   ├── 📂 Live/                 # 🆕 Live Race Features
│   │   │   ├── LiveTimingTower.tsx     # Simulated timing display (8KB)
│   │   │   └── LiveTelemetry.tsx       # Real-time telemetry (5KB)
│   │   │
│   │   ├── LiveSessionBanner.tsx    # Active session indicator (2KB)
│   │   │
│   │   │  ── MONETIZATION & COMPLIANCE ──
│   │   ├── AdUnit.tsx               # AdSense container (2KB)
│   │   ├── CookieConsent.tsx        # GDPR banner (3KB)
│   │   ├── DeveloperModal.tsx       # LinkedIn badge (4KB)
│   │   │
│   │   │  ── NOTIFICATIONS ──
│   │   ├── TeamRadioToast.tsx       # F1-style toasts (3KB)
│   │   ├── KeyboardShortcutsHelpWrapper.tsx
│   │   │
│   │   └── 📂 ui/                   # Design System Atoms
│   │       ├── Badge.tsx            # Team-colored badges (1KB)
│   │       ├── F1Button.tsx         # Button variants (3KB)
│   │       ├── GlassCard.tsx        # Glassmorphic cards (1KB)
│   │       └── PageHeader.tsx       # Section headers (1KB)
│   │
│   ├── 📂 lib/                      # Shared Utilities
│   │   ├── drivers.ts               # 2026 driver grid (154 lines, 22 drivers)
│   │   └── supabase.ts              # Supabase browser client
│   │
│   ├── 📂 hooks/                    # Custom React Hooks
│   │   └── useKeyboardShortcuts.ts  # Keyboard navigation hooks
│   │
│   └── 📂 [routes]/                 # 22 Page Routes
│       ├── admin/                   # Admin dashboard
│       ├── auth/                    # Auth callbacks
│       ├── calendar/                # 2026 race calendar (24 races)
│       ├── classification/          # Race results
│       ├── contact/                 # Contact form
│       ├── friends/                 # Friend management
│       ├── history/                 # Prediction history
│       ├── leaderboard/             # Global standings
│       ├── leagues/                 # League CRUD + chat
│       ├── live/                    # 🆕 Live race experience
│       ├── login/                   # Authentication
│       ├── predict/[id]/            # Prediction form (dynamic)
│       ├── privacy/                 # Privacy policy
│       ├── profile/                 # User profiles (with logout)
│       │   └── settings/            # 🆕 Notification preferences
│       ├── reset-password/          # Password reset
│       ├── rivalries/               # H2H rivalries
│       ├── standings/               # Championship tables
│       ├── submissions/[id]/        # 🆕 Shareable prediction receipts
│       └── terms/                   # Terms of service
│
├── 📂 api/                          # FastAPI Backend
│   ├── index.py                     # Vercel entry point
│   ├── main.py                      # All endpoints (1500+ lines)
│   ├── email_service.py             # 🆕 Resend integration (350 lines)
│   ├── scoring.py                   # Points calculation engine
│   └── requirements.txt             # Python dependencies
│
├── 📂 lib/                          # Root-Level Config
│   └── config.ts                    # Environment configuration
│
├── 📂 public/                       # Static Assets
│   ├── ads.txt                      # AdSense authorization
│   └── manifest.json                # PWA manifest
│
├── 📂 backend/                      # Local Development Backend
│   └── venv/                        # Python virtual environment
│
├── 📄 vercel.json                   # Deployment routing
├── 📄 tailwind.config.js            # Tailwind customization
├── 📄 *.sql                         # Database schema files
│   ├── database_schema.sql
│   ├── leagues_schema.sql
│   ├── friends_and_chat_schema.sql
│   └── enhancements_schema.sql
│
└── 📄 package.json                  # Node dependencies
```

---

## 🎨 Design System (globals.css)

The design system spans **1025 lines** with 150+ CSS variables.

### Color Tokens

```css
:root {
  /* ═══ BACKGROUNDS ═══ */
  --bg-void: #0B0B0F;        /* Deepest layer */
  --bg-midnight: #0D1117;    /* Primary background */
  --bg-onyx: #111114;        /* Secondary background */
  --bg-carbon: #1A1A1F;      /* Cards */
  --bg-graphite: #232328;    /* Interactive elements */
  --bg-slate: #2A2A30;       /* Hover states */
  
  /* ═══ ACCENTS ═══ */
  --f1-red: #E10600;         /* Primary CTA */
  --accent-cyan: #00E5FF;    /* Links, data highlights */
  --accent-gold: #C9A962;    /* Premium, achievements */
  
  /* ═══ TEXT ═══ */
  --text-primary: #F0F0F0;   /* Headings */
  --text-secondary: #9CA3AF; /* Body text */
  --text-muted: #6B7280;     /* Subtle text */
  --text-subtle: #4B5563;    /* Disabled */
  
  /* ═══ GLASSMORPHISM ═══ */
  --glass-bg: rgba(17, 17, 20, 0.85);
  --glass-blur: 24px;
  --glass-border: rgba(255, 255, 255, 0.06);
}
```

### Component Classes

| Class | Purpose |
|:------|:--------|
| `.glass-card` | Primary glassmorphic container with hover effects |
| `.telemetry-panel` | Gradient panel with gold accent line |
| `.pit-board` | Left-bordered info panel |
| `.btn-primary` | Red CTA button with glow |
| `.btn-secondary` | Graphite secondary button |
| `.btn-gold` | Gold premium button |
| `.countdown-digit` | Monospace countdown numbers |

### Font Stack

```typescript
// Loaded in layout.tsx
const fonts = {
  display: 'Orbitron',           // Headlines (700-900)
  heading: 'Geist, Titillium',   // Section headers (600-700)
  body: 'Geist, Inter',          // Body text (400-500)
  mono: 'Geist Mono, Roboto Mono' // Data/numbers (400-600)
};
```

---

## 💰 Monetization (AdSense)

### Implementation

1. **Script Load** — Async in `app/layout.tsx` `<head>`
2. **Component** — `app/components/AdUnit.tsx` handles responsive ads
3. **Authorization** — `public/ads.txt` for seller verification

### Strategic Placements (7 Units)

| Page | Location | Slot Purpose |
|:-----|:---------|:-------------|
| Homepage | After Hero | High visibility |
| Homepage | Before CTA | Exit engagement |
| Calendar | Between Grid/List | Content break |
| Leaderboard | After Podium | Natural pause |
| Standings | Between WDC/WCC | Section break |
| Rivalries | Before Matchmaking | Content break |
| History | After 3rd prediction | Conditional inline |

### Environment Variable
```env
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-2903739336841923
```

---

## 🗄️ Database Schema

### Entity Relationships

```
profiles ──< predictions >── races
    │
    ├──< league_members >── leagues
    │         │
    │         ├──< league_messages
    │         └──< league_prediction_grades
    │
    ├──< friendships
    ├──< rivalries
    ├──< user_achievements >── achievements
    └──< activity_feed
```

### Core Tables

| Table | Purpose | Key Fields |
|:------|:--------|:-----------|
| `profiles` | User data | `id`, `username`, `total_score`, `is_admin` |
| `races` | 2026 calendar (24 races) | `id`, `name`, `circuit`, `quali_time`, `race_time`, `fp1/2/3_time`, `sprint_quali_time`, `sprint_time` |
| `predictions` | User picks | `user_id`, `race_id`, `quali_p1-p3`, `race_p1-p10`, `fastest_lap`, `points_total` |

### League System

| Table | Purpose |
|:------|:--------|
| `leagues` | League definitions + invite codes |
| `league_members` | Memberships with roles (admin/member) |
| `league_messages` | Real-time chat with reactions |
| `league_prediction_grades` | Manual scoring by admins |

### Social Features

| Table | Purpose |
|:------|:--------|
| `friendships` | Friend relationships (pending/accepted) |
| `rivalries` | H2H matchups with scores |
| `achievements` | Badge definitions |
| `user_achievements` | Earned badges |
| `activity_feed` | User activity log |

---

## 🔌 API Reference

### Base URL
- **Development:** `http://localhost:3000/api`
- **Production:** `https://apexpredict.live/api`

### Authentication
```
Authorization: Bearer <supabase_access_token>
```

### Rate Limits
| Category | Limit |
|:---------|:------|
| Public | 30/min |
| Predictions | 10/min |
| Chat | 20/min |

### Endpoints

#### Public
```http
GET  /                    Health check
GET  /races               All races
GET  /standings           Global leaderboard (top 100)
GET  /achievements        Achievement definitions
```

#### Authenticated
```http
POST /predict             Submit prediction
GET  /predictions/me      User's predictions
POST /leagues             Create league
GET  /leagues/{id}        League details
POST /leagues/{id}/chat   Send message
POST /friends/request     Send friend request
```

#### Admin
```http
GET  /admin/predictions/{race_id}
POST /admin/grade
POST /admin/settle
```

---

## 📊 Scoring Engine

Located in `api/scoring.py`:

```python
# Qualifying
QUALI_P1 = 5
QUALI_P2 = 3
QUALI_P3 = 1

# Race
RACE_P1 = 10
RACE_P2 = 8
RACE_P3 = 6
RACE_P4_P10 = [5, 4, 3, 2, 1, 1, 1]

# Bonuses
FASTEST_LAP = 3
HAT_TRICK = 2      # Pole + Win
PODIUM_EXACT = 5   # Exact order
PODIUM_ANY = 2     # Any order
```

---

## 🚀 Deployment

### Environment Variables

| Variable | Description |
|:---------|:------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_API_URL` | API base URL |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | AdSense publisher ID |
| `SUPABASE_URL` | Backend Supabase URL |
| `SUPABASE_KEY` | Service role key |

### Vercel Config (vercel.json)
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/index.py" }
  ],
  "functions": {
    "api/index.py": { "runtime": "python3.12" }
  }
}
```

---

## 🧪 Development

```bash
# Start dev server
npm run dev

# Build production
npm run build

# Run linter
npm run lint

# Local backend
cd backend && pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## 🔐 Security

| Feature | Implementation |
|:--------|:---------------|
| RLS | All Supabase tables |
| Pydantic | Input validation |
| JWT | Token verification |
| CORS | Origin whitelisting |
| Cookie Consent | GDPR compliance |
| Ads.txt | Seller authorization |

---

## 📚 Additional Docs

| File | Purpose |
|:-----|:--------|
| `README.md` | User-facing overview |
| `DEPLOYMENT.md` | Deployment guide |
| `FUTURE_ENHANCEMENTS.md` | Planned features |
| `*.sql` | Database schemas |

---

**Maintained by the F1 Apex development team.**  
*Last verified: January 21, 2026*
