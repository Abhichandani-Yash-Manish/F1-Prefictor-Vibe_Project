# F1 Apex - Future Enhancement Suggestions

> **Created:** January 15, 2026  
> **Updated:** January 21, 2026  
> **Purpose:** Documented roadmap for future improvements

---

## ✅ Completed Features

All Priority 1 features have been implemented! 🎉

### ~~Mobile Menu Drawer~~ ✅
- **Status:** SHIPPED in `MobileMenu.tsx`
- Hamburger menu with animated slide-out drawer
- Touch-optimized for mobile devices

### ~~User Profile Page~~ ✅
- **Status:** SHIPPED at `/profile`
- Complete prediction history, stats, badges
- Editable profile with logout button

### ~~Notifications System~~ ✅
- **Status:** SHIPPED in `NotificationBell.tsx`
- Friend requests, league invites, race reminders
- Real-time notification dropdown

---

## ✅ Engagement Boosters (Completed)

| Feature | Status | Component |
|---------|--------|-----------|
| ~~Prediction Sharing~~ | ✅ DONE | `ShareButton.tsx`, `/submissions/[id]` |
| ~~Streak Tracker~~ | ✅ DONE | `StreakBadge.tsx` |
| ~~Achievement System~~ | ✅ DONE | Database + Profile page |
| ~~Weekly Email Digest~~ | ✅ DONE | `email_service.py` (Resend) |

---

## 🎯 Remaining Polish (Priority 3)

- [ ] Dark/Light Mode Toggle
- [ ] Sound Effects (optional F1 sounds)
- [x] ~~Page Transitions (smooth fades)~~ — Done in `template.tsx`
- [x] ~~Loading Skeletons~~ — Done in `TelemetryLoader.tsx`

---

## 🔧 Technical (Priority 4)

- [ ] PWA Support (installable app)
- [ ] Push Notifications (browser)
- [x] ~~Data Caching~~ — Uses React 19 caching
- [x] ~~Error Boundaries~~ — Implemented

---

## 🚀 Future Roadmap

1. **PWA Support** — Make app installable
2. **Push Notifications** — Browser-based alerts
3. **Dark Mode** — System preference toggle
4. **Mobile App** — React Native port

---

*All major features shipped as of v3.0*
