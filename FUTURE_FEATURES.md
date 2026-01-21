# 🚀 F1 Apex — Future Feature Proposals

> **Generated:** January 21, 2026  
> **Updated:** January 21, 2026  
> **Based on:** Full codebase analysis  
> **Priority:** Impact vs. Effort assessment

---

## ✅ Tier 1: Completed (High Impact)

All major Tier 1 features have shipped! 🏁

### ~~1. Live Race Mode~~ ✅ SHIPPED
- `LiveTimingTower.tsx` — Simulated real-time position display
- `LiveTelemetry.tsx` — Telemetry visualization
- `LiveSessionBanner.tsx` — Active session indicator
- **Route:** `/live`

### ~~2. Push Notifications~~ 🔔 Partial
- In-app `NotificationBell.tsx` — Real-time dropdown
- `NotificationPreferences.tsx` — User customization
- **Note:** Browser push notifications pending (Phase 9)

### ~~3. Prediction Analytics Dashboard~~ ✅ SHIPPED
- `AnalyticsDashboard.tsx` — Main view
- `TrendChart.tsx` — Performance over season
- `AccuracyHeatmap.tsx` — Race-by-race accuracy grid
- **Route:** Profile page integration

### ~~4. Streak Multipliers~~ ✅ SHIPPED
- `StreakBadge.tsx` — Visual streak indicator
- Database tracking implemented
- Displayed on profile and predictions

---

## ✅ Tier 2: Completed (Medium Impact)

### ~~5. Dark/Light Mode Toggle~~ ⏳ Pending
- CSS variables ready
- Toggle component not yet implemented

### ~~6. Shareable Prediction Cards~~ ✅ SHIPPED
- `ShareButton.tsx` — Social sharing component
- `/submissions/[id]` — Shareable receipts
- One-click sharing to platforms

### ~~7. Prediction Templates~~ ✅ SHIPPED
- `TemplateSelector.tsx` — Quick picks
- "Standings Order" template
- "Last Race" copy functionality

### ~~8. Circuit Guide Cards~~ ✅ SHIPPED
- `CircuitGuide.tsx` — Track insights
- DRS zones, weather, overtaking difficulty
- Integrated into Calendar page

---

## 🥉 Tier 3: Nice-to-Have (Future)

### 9. Fantasy Team Mode 🏁
- Season-long team building with budget cap
- **Status:** Descoped (significant effort)

### 10. Voice Commands 🎙️
- Web Speech API integration
- **Status:** Future consideration

### 11. AR Trophy Cabinet 🏅
- 3D trophies with Three.js
- **Status:** Future consideration

---

## 📊 Feature Status Matrix

| Feature | Status | Component/Route |
|:--------|:-------|:----------------|
| Live Race Mode | ✅ Shipped | `/live`, `Live/*.tsx` |
| In-App Notifications | ✅ Shipped | `NotificationBell.tsx` |
| Analytics Dashboard | ✅ Shipped | `Analytics/*.tsx` |
| Streak Tracking | ✅ Shipped | `StreakBadge.tsx` |
| Shareable Cards | ✅ Shipped | `/submissions/[id]` |
| Prediction Templates | ✅ Shipped | `TemplateSelector.tsx` |
| Circuit Guides | ✅ Shipped | `CircuitGuide.tsx` |
| Dark Mode | ⏳ Pending | CSS ready |
| Browser Push | ⏳ Phase 9 | — |
| Fantasy Team | ❌ Descoped | — |

---

## 🎯 Next Sprint (Phase 9-10)

1. **Browser Push Notifications** — Service Worker + OneSignal
2. **Dark Mode Toggle** — System preference detection
3. **PWA Support** — Installable app manifest
4. **Mobile App** — React Native port

---

*Feature tracking updated as of v3.0 release*
