<div align="center">
  
# 🏎️ **F1 APEX** | *Telemetry Command Center*

### Where Data Meets Destiny

![F1 Apex Banner](https://img.shields.io/badge/🔴_LIVE-2026_Season-E10600?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Operational-00E5FF?style=for-the-badge&logo=checkmarx&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Resend](https://img.shields.io/badge/Resend-000000?style=for-the-badge&logo=resend&logoColor=white)

<br/>

*"Lights out and away we go."* — Martin Brundle

---

**Imagine having your own race engineer's pit wall.**  
**Imagine predicting the chaos before the first corner.**  
**Imagine competing against rivals who think they know better.**

**Welcome to F1 Apex.**

</div>

---

## 🎯 What Is F1 Apex?

F1 Apex isn't just another fantasy F1 app. It's a **full-fledged prediction command center** built with the same obsessive attention to detail that race engineers bring to their telemetry screens.

Every weekend, millions of F1 fans predict race outcomes in their heads. *"Verstappen will dominate."* *"Watch out for McLaren in the wet."* *"Alpine might surprise everyone."*

**But how often are you right?**

F1 Apex lets you **prove it**. Submit your predictions before the lights go out, and let the algorithm calculate your score with surgical precision.

---

## 🌟 Core Features

<table>
<tr>
<td width="50%" valign="top">

### 🖥️ **The Command Center**
Your personalized dashboard displays live race countdowns, recent podium results, championship deltas, and your prediction accuracy—all rendered with a **glassmorphic UI** that feels like you're staring at an F1 broadcast.

### ⏱️ **Precision Predictions**
Lock in your **Qualifying Top 3**, **Race Top 10**, and **Fastest Lap** picks before sessions begin. Our scoring system rewards accuracy, risk-taking, and intuition with bonus points for exact matches.

### 📡 **Real-Time Telemetry**
We pull official classification data from the **Ergast/Jolpica API** the moment the checkered flag waves. No manual updates. No waiting. Just instant, automated scoring.

### 🗓️ **Complete 2026 Calendar**
All 24 races with full session times: FP1, FP2, FP3, Sprint Quali, Sprint, Qualifying, and Race—including the 11th team (Cadillac) and all 22 drivers.

</td>
<td width="50%" valign="top">

### 🏆 **Global & Private Leagues**
Create private leagues for your friends, join the **Global Championship**, or do both. Each league has its own chat, standings, and admin tools for manual grading.

### 👤 **Driver Profiles & Achievements**
Track your career stats, prediction streaks, favorite team allegiance, and earned achievements. Become the **Oracle** by hitting 90%+ accuracy—or earn the **Streak Master** badge.

### ⚔️ **Head-to-Head Rivalries**
Challenge any user to a season-long rivalry battle. Every race is a chance to extend your lead or mount an epic comeback. The **Gauntlet Modal** presents your accepted challenges.

### 🔔 **Smart Notifications**
The **NotificationBell** keeps you updated on friend requests, league invites, race reminders, and rivalry challenges—all in one elegant dropdown.

</td>
</tr>
</table>

---

## ✨ Premium Features

| Feature | Component | Description |
|:--------|:----------|:------------|
| 🌐 **Reactive Background** | `TelemetryBackground.tsx` | A stunning **470+ line** animated canvas with glowing nodes, data streams, and mouse-reactive trails that simulate F1 telemetry networks. |
| 🚀 **Launch Sequence** | `LaunchSequence.tsx` | Animated countdown timer showing days, hours, minutes, seconds to the next session with F1-style formatting. |
| 📊 **Confidence Meter** | `ConfidenceMeter.tsx` | Track-style gauge displaying prediction confidence percentages with F1 sector colors. |
| 🌤️ **Weather Widget** | `WeatherWidget.tsx` | Displays current and forecasted weather for each circuit—crucial for tire strategy predictions. |
| 💬 **League Chat** | `LeagueChat.tsx` | Real-time chat with emoji reactions, smooth animations, and team radio styling. |
| 📈 **Analytics Dashboard** | `TrendChart.tsx` + `AccuracyHeatmap.tsx` | **NEW:** Track your prediction performance over time with interactive charts and visual heatmaps showing accuracy by race. |
| ⏱️ **Live Timing Tower** | `LiveTimingTower.tsx` | **NEW:** Simulated live timing display showing race positions with real-time animations. |
| 🔔 **Notification Preferences** | Settings Panel | **NEW:** Customize which notifications you receive—race reminders, friend activity, rivalry updates. |
| 🎫 **Shareable Prediction Cards** | `PredictionReceipt.tsx` | **NEW:** Generate beautiful, shareable images of your predictions for social media bragging rights. |
| 🍪 **Cookie Consent** | `CookieConsent.tsx` | GDPR-compliant animated consent banner that respects user privacy. |
| 👨‍💻 **Developer Identity** | `DeveloperModal.tsx` | Interactive "Pit Crew" card featuring LinkedIn badge integration—hidden in the footer for those who scroll. |
| 💰 **Strategic Ads** | `AdUnit.tsx` | Non-intrusive Google AdSense integration across 6 pages with 7 placements. |

---

## 📧 Premium Email Experience

**Every interaction matters.** F1 Apex sends beautifully branded transactional emails that match our dark, premium aesthetic:

| Email Type | Trigger | Special Touch |
|:-----------|:--------|:--------------|
| 🏁 **Welcome Email** | New user signup | Personalized greeting + F1 quote (Resend) |
| 🔗 **Magic Link** | Passwordless login | *"Racing is life..."* — Steve McQueen |
| 🔐 **Password Reset** | Forgot password | *"You learn more from your failures..."* — Niki Lauda |
| 🏆 **League Invite** | Friend shares league | *"Second or third place is not enough..."* — Ayrton Senna |
| ✅ **Confirm Signup** | Email verification | *"Be proud of who you are..."* — Lewis Hamilton |

All emails feature our logo, F1-red CTA buttons, and elegant quote blocks with contextually relevant F1 wisdom.

---

## 🛡️ Bulletproof Authentication

We've implemented **enterprise-grade session handling** to ensure users never get stuck:

| Feature | Implementation |
|:--------|:---------------|
| ⏱️ **5-Second Hard Deadline** | Session checks are guaranteed to complete within 5 seconds—no infinite loading. |
| 🔄 **Force Reset Button** | Appears after 3 seconds on the authenticating screen, allowing users to clear sessions and retry. |
| 🚪 **Accessible Logout** | Logout button visible on Profile page (no edit mode required) AND in the desktop Navbar. |
| 📱 **Mobile Optimized** | Non-blocking auth checks, touch-optimized controls, and scroll lock fixes for iOS Safari. |
| 🔥 **Fire & Forget** | Background auth operations don't block the main thread—UI stays responsive. |

---

## 🎨 Design Philosophy: "Modern Telemetry"

Every pixel of F1 Apex is intentional. We studied the **high-contrast, information-dense graphics** of F1 broadcasts and recreated that aesthetic for the web. The design system spans **1025 lines of CSS** with custom variables, glassmorphism classes, and animation keyframes.

### 🎨 Color Palette

| Color | Hex | Purpose |
|:------|:----|:--------|
| 🖤 **Void Black** | `#0B0B0F` | Deep background layer |
| ⬛ **Midnight** | `#0D1117` | Primary background |
| 🔴 **F1 Red** | `#E10600` | Primary accent, CTAs |
| 🔵 **Telemetry Cyan** | `#00E5FF` | Data highlights, links |
| 🟡 **Victory Gold** | `#C9A962` | Premium elements, achievements |
| 🟢 **Success** | `#10B981` | Positive states |
| ⚪ **Ceramic White** | `#F0F0F0` | Primary text |

### 🔤 Typography Stack

| Usage | Font Family | Weights |
|:------|:------------|:--------|
| **Display/Headlines** | Orbitron | 700–900 |
| **Headers/UI** | Geist, Titillium Web | 400–700 |
| **Body Text** | Geist, Inter | 400–500 |
| **Data/Telemetry** | Geist Mono, Roboto Mono | 400–600 |

### 🪟 Glassmorphism System

```css
.glass-card {
  background: rgba(17, 17, 20, 0.85);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
```

---

## 🛠️ Technical Architecture

Built for **speed**, **scalability**, and **developer experience**.

```
┌─────────────────────────────────────────────────────────────┐
│                    🌐 VERCEL EDGE NETWORK                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌───────────────┐          ┌───────────────────────┐     │
│   │  Next.js 16   │◄────────►│  FastAPI Backend      │     │
│   │  React 19     │          │  Python 3.12          │     │
│   │  Tailwind v4  │          │  Pydantic Validation  │     │
│   └───────────────┘          └───────────────────────┘     │
│           │                            │                    │
│           └────────────┬───────────────┘                    │
│                        ▼                                    │
│              ┌─────────────────────┐                        │
│              │  Supabase           │                        │
│              │  PostgreSQL + Auth  │                        │
│              │  Real-time Channels │                        │
│              └─────────────────────┘                        │
│                        │                                    │
│              ┌─────────────────────┐                        │
│              │  Resend             │                        │
│              │  Transactional Email│                        │
│              └─────────────────────┘                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Chassis** | Next.js 16 + React 19 | App Router, SSR, Edge Optimization |
| **Aero Package** | Tailwind CSS v4 + Custom CSS | 1025 lines of design tokens |
| **Power Unit** | FastAPI + Python 3.12 | High-performance API, scoring engine |
| **Telemetry** | Supabase | PostgreSQL, Auth, Real-time subscriptions |
| **Grid Position** | Vercel | Global CDN, serverless Python functions |
| **Analytics** | Vercel Analytics + Speed Insights | Traffic & Core Web Vitals |
| **Communications** | Resend | Transactional email delivery |
| **Revenue** | Google AdSense | Strategic, non-intrusive ad placements |

---

## 📊 How Scoring Works

Our scoring system rewards **accuracy** and **boldness**.

```
╔═══════════════════════════════════════════════════════════╗
║                    QUALIFYING POINTS                       ║
╠═══════════════════════════════════════════════════════════╣
║   🥇 Pole Position (P1):           5 points               ║
║   🥈 P2 Prediction:                3 points               ║
║   🥉 P3 Prediction:                1 point                ║
╠═══════════════════════════════════════════════════════════╣
║                      RACE POINTS                           ║
╠═══════════════════════════════════════════════════════════╣
║   🏆 Race Winner (P1):            10 points               ║
║   🥈 P2 Prediction:                8 points               ║
║   🥉 P3 Prediction:                6 points               ║
║   P4–P10:                          5 → 1 points           ║
║   ⏱️  Fastest Lap:                 3 points               ║
╠═══════════════════════════════════════════════════════════╣
║                    BONUS POINTS                            ║
╠═══════════════════════════════════════════════════════════╣
║   🎩 Hat Trick (Pole + Win):      +2 points               ║
║   🎯 Podium Trio (Exact Order):   +5 points               ║
║   🎲 Podium Trio (Any Order):     +2 points               ║
╚═══════════════════════════════════════════════════════════╝
```

**League Admin Powers:** Manual grading for "Wild Predictions," "Biggest Flops," and "Biggest Surprises" (0–50 pts each).

---

## 🚀 Quick Start: Get On Track

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ (for local backend)
- A Supabase project ([Create one free](https://supabase.com))
- A Resend account for transactional emails ([Sign up free](https://resend.com))
- Git

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Yash-Abhichandani/F1-Prefictor-Vibe_Project.git
cd fl-predictor
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Configure Environment
Create a `.env.local` file in the root:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# API Configuration  
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Email (Resend)
RESEND_API_KEY=re_xxx
SMTP_FROM_EMAIL=noreply@yourdomain.com

# Optional: Google AdSense
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxx
```

### 4️⃣ Initialize Database
Run the SQL schemas in Supabase SQL Editor (in order):
1. `database_schema.sql` — Core tables + 2026 calendar
2. `leagues_schema.sql` — League system
3. `friends_and_chat_schema.sql` — Social features
4. `enhancements_schema.sql` — Achievements + activity feed

### 5️⃣ Configure Supabase Auth Emails
Navigate to **Supabase Dashboard → Authentication → Email Templates** and paste the custom HTML templates from [auth_email_templates.md](./auth_email_templates.md) for a branded email experience.

### 6️⃣ Ignition
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) — Welcome to your pit wall.

---

## 🏁 The Complete 2026 Grid

F1 Apex includes the **complete 2026 driver lineup** with all 11 teams and 22 drivers:

| Team | Drivers | Team Color |
|:-----|:--------|:-----------|
| 🔵 **Red Bull Racing** | Max Verstappen (1), Isack Hadjar (6) | `#3671C6` |
| 🟠 **McLaren** | Lando Norris (4), Oscar Piastri (81) | `#FF8000` |
| 🔴 **Ferrari** | Charles Leclerc (16), Lewis Hamilton (44) | `#E8002D` |
| ⚫ **Mercedes** | George Russell (63), Kimi Antonelli (12) | `#27F4D2` |
| 🟢 **Aston Martin** | Fernando Alonso (14), Lance Stroll (18) | `#229971` |
| 🔵 **Williams** | Carlos Sainz (55), Alexander Albon (23) | `#64C4FF` |
| 💗 **Alpine** | Pierre Gasly (10), Franco Colapinto (43) | `#FF87BC` |
| ⚪ **Haas** | Esteban Ocon (31), Oliver Bearman (87) | `#B6BABD` |
| 🔷 **RB** | Yuki Tsunoda (22), Liam Lawson (30) | `#6692FF` |
| 🟡 **Sauber** | Nico Hulkenberg (27), Gabriel Bortoleto (5) | `#52E252` |
| 🇺🇸 **Cadillac** | Valtteri Bottas (77), Sergio Perez (11) | `#1E1E1E` |

---

## 📁 Project Structure

```
fl-predictor/
├── 📂 app/                      # Next.js App Router
│   ├── 📄 layout.tsx            # Root layout (fonts, analytics, AdSense)
│   ├── 📄 page.tsx              # Homepage (Server Component)
│   ├── 📄 globals.css           # Design system (1025 lines)
│   │
│   ├── 📂 components/           # Reusable UI components (30+ files)
│   │   ├── AdUnit.tsx           # AdSense integration
│   │   ├── CookieConsent.tsx    # GDPR compliance
│   │   ├── DeveloperModal.tsx   # LinkedIn badge modal
│   │   ├── Footer.tsx           # Site footer (14KB)
│   │   ├── GauntletModal.tsx    # Rivalry challenges
│   │   ├── LaunchSequence.tsx   # Countdown timer
│   │   ├── LeagueChat.tsx       # Real-time chat
│   │   ├── LiveTimingTower.tsx  # 🆕 Simulated timing tower
│   │   ├── MobileMenu.tsx       # Touch-optimized mobile nav
│   │   ├── Navbar.tsx           # Navigation + desktop logout
│   │   ├── NotificationBell.tsx # Notification dropdown
│   │   ├── NotificationPreferences.tsx # 🆕 User settings
│   │   ├── PredictionForm.tsx   # Prediction submission
│   │   ├── PredictionReceipt.tsx # 🆕 Shareable cards
│   │   ├── RivalryCard.tsx      # Rivalry display
│   │   ├── StreakBadge.tsx      # Prediction streak indicator
│   │   ├── TelemetryBackground.tsx # Animated canvas (11KB)
│   │   ├── ConfidenceMeter.tsx  # Gauge component
│   │   ├── WeatherWidget.tsx    # Circuit weather
│   │   │
│   │   ├── 📂 Analytics/        # 🆕 Analytics components
│   │   │   ├── TrendChart.tsx   # Historical performance
│   │   │   └── AccuracyHeatmap.tsx # Race-by-race accuracy
│   │   │
│   │   └── 📂 ui/               # Design system atoms
│   │       ├── Badge.tsx
│   │       ├── F1Button.tsx
│   │       ├── GlassCard.tsx
│   │       └── PageHeader.tsx
│   │
│   ├── 📂 lib/                  # Utilities & data
│   │   ├── drivers.ts           # 2026 grid (154 lines)
│   │   └── supabase.ts          # Supabase client
│   │
│   └── 📂 [routes]/             # 19+ page routes
│       ├── admin/               # Admin dashboard
│       ├── analytics/           # 🆕 Analytics page
│       ├── calendar/            # 2026 race calendar
│       ├── history/             # Prediction history
│       ├── leaderboard/         # Global standings
│       ├── leagues/             # League management
│       ├── predict/[id]/        # Prediction form
│       ├── profile/[id]/        # User profiles (with logout)
│       ├── receipt/             # 🆕 Prediction receipts
│       ├── rivalries/           # Head-to-head
│       ├── standings/           # Championship
│       └── ...
│
├── 📂 api/                      # FastAPI backend
│   ├── index.py                 # Vercel entry point
│   ├── main.py                  # All endpoints (1500+ lines)
│   ├── email_service.py         # 🆕 Resend integration (350 lines)
│   ├── scoring.py               # Points engine
│   └── requirements.txt
│
├── 📂 public/                   
│   ├── ads.txt                  # AdSense authorization
│   ├── logo.png                 # Brand logo
│   └── manifest.json            # PWA manifest
│
├── 📄 vercel.json               # Deployment config
└── 📄 *.sql                     # Database schemas
```

---

## 🛡️ Security & Compliance

| Feature | Implementation |
|:--------|:---------------|
| **Row Level Security** | All Supabase tables protected |
| **Rate Limiting** | Per-endpoint limits (predictions: 10/min) |
| **Pydantic Validation** | Strict input validation in FastAPI |
| **JWT Verification** | Secure token authentication |
| **Session Hard Deadline** | 5-second timeout prevents auth hangs |
| **GDPR Compliance** | Cookie consent with local storage |
| **Ads.txt** | Authorized Digital Sellers file |
| **Safari Compat** | Header sanitization in API client |

---

## 🗺️ Roadmap

- [x] **Phase 1:** Core Prediction Engine & Authentication
- [x] **Phase 2:** "Modern Telemetry" UI/UX Design System
- [x] **Phase 3:** Real-time API Integration (Results & Standings)
- [x] **Phase 4:** Leagues, Rivalries & Social Features
- [x] **Phase 5:** Monetization, Compliance & Developer Identity
- [x] **Phase 6:** Analytics Dashboard & Performance Tracking
- [x] **Phase 7:** Premium Email Experience (Resend + Supabase)
- [x] **Phase 8:** Mobile Optimization & Session Hardening
- [ ] **Phase 9:** Live Race Chat & Push Notifications
- [ ] **Phase 10:** Mobile App (React Native)

---

## 🤝 Contributing

We welcome fellow race engineers.

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/NewAeroPackage`)
3. **Commit** your changes (`git commit -m 'Add new rear wing'`)
4. **Push** to the branch (`git push origin feature/NewAeroPackage`)
5. **Open** a Pull Request

---

## 📜 License & Disclaimers

**Unofficial Fan Project**  
This website is an unofficial fan project and is not affiliated with Formula 1, FIA, or any F1 team. Formula 1®, F1®, the F1 logo, and all related marks are trademarks of Formula One Licensing BV.

**Copyright**  
All team names, driver names, and related imagery are used for informational and fan entertainment purposes only. No copyright infringement is intended. This is a free, non-commercial project made by fans, for fans.

---

<div align="center">

### Built with ❤️, ☕, and a borderline unhealthy obsession with F1

*"If you no longer go for a gap that exists, you are no longer a racing driver."* — Ayrton Senna

<br/>

**[⬆ Back to Top](#-f1-apex--telemetry-command-center)**

---

**Made by [Yash Abhichandani](https://github.com/Yash-Abhichandani)**  
*First Year Student | Full Stack Developer*

</div>
