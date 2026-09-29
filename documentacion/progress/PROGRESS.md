# Proyecto: MockMaster - Adaptador Inteligente de CV

**Arquitectura MVP:** localStorage (Sin Auth, Sin DB)

Última actualización: 2026-02-26 (V3 complete)

---

## 🚀 MVP - No Auth (Weeks 1-4)

**Objetivo:** Validar core AI value proposition antes de invertir en infraestructura

### DONE
- F-002 | Resume Upload & Parsing (localStorage) | ✅ COMPLETE - Text paste, Claude AI structuring, localStorage persistence
- F-003 | Job Description Analysis | ✅ COMPLETE - Claude AI extracts skills, responsibilities, seniority, industry
- F-004 | AI Resume Adaptation Engine | ✅ COMPLETE - **CORE FEATURE** Adapts resume with keywords, reorders experiences, reformulates bullets
- F-005 | ATS Compatibility Score with Breakdown | ✅ COMPLETE - Detailed scoring (keyword/skills/experience/format), missing keywords, suggestions
- F-006 | PDF Export with Templates | ✅ COMPLETE - 3 ATS-friendly templates (Clean/Modern/Compact), Puppeteer-based, <500KB, <5s generation
- F-012 | Edit Adapted Resume Before Export | ✅ COMPLETE - Inline editing with auto-save, reset to AI version, edits included in PDF

### IN_PROGRESS

### BACKLOG
(None - MVP Complete!)

---

## 🔐 V2 - Authentication & Persistence (Post-MVP)

**Trigger:** 100+ active users/week OR positive validation metrics

### DONE
- F-001 | User Authentication (Supabase) | ✅ COMPLETE - Email/password + Google OAuth, session management, protected routes, AuthContext
- F-011 | App Shell + Dashboard + User Profile | ✅ COMPLETE - Sidebar navigation, Header with UserMenu, Profile page, Settings/Billing placeholders, Mobile responsive
- F-007 | Job Description Library | ✅ COMPLETE - Save analyzed job descriptions, search/filter by tags, quick "Adaptar CV" action, localStorage persistence
- F-009 | MercadoPago Subscription Integration | ✅ COMPLETE - Checkout flow, webhooks, billing UI, usage tracking, Supabase tables (user_subscriptions, subscription_usage)
- F-008 | Onboarding Wizard | ✅ COMPLETE - 3-step wizard (Upload CV → Analyze Job → Generate), auto-resume on abandon, celebration modal, clean layout without AppShell
- F-010 | Usage Limits per User | ✅ COMPLETE (Merged into F-009 + Dashboard/Adapt banner integration)

### IN_PROGRESS

### BACKLOG

---

## 🧩 Chrome Extension - Job Application Accelerator

**Objetivo:** One-click job application from LinkedIn/Indeed with auto CV adaptation

### DONE
- F-EXT-001 | Extension Foundation | ✅ COMPLETE - Manifest V3, service worker, content scripts (LinkedIn + Indeed extractors), auth relay, sidepanel scaffold
- F-EXT-002 | Sidepanel UI + Extraction Flow | ✅ COMPLETE - State machine UI (8 states), job extraction from DOM, Vision API fallback, manual input, template selector, PDF download
- F-EXT-003 | AI Adaptation + Save Pipeline | ✅ COMPLETE - useAdaptation hook with Claude API, ATS score display, adapted resume view with copy/download, useApplication hook with save to Supabase
- F-EXT-004 | Application Tracker (Backend + Web Dashboard) | ✅ COMPLETE - REST API (POST/GET/PATCH/DELETE), Supabase migrations applied, web dashboard with stats/filters/sort/search, inline status editing, delete with confirmation, expandable detail rows, pagination

### IN_PROGRESS

### BACKLOG

---

## ✨ V3 - Enhancements (Month 3+)

**Objetivo:** Growth features post-monetization

### DONE
- F-013 | Multiple Template Selection | ✅ COMPLETE - 5 templates: Clean, Modern, Compact, Executive (Cambria serif), Minimal (Inter sans-serif)
- F-014 | Job Description URL Extraction | ✅ COMPLETE - Paste URL from LinkedIn/Indeed/generic, cheerio extraction, SSRF protection, auto-populate textarea

### IN_PROGRESS

### BACKLOG

---

## 📊 Métricas de Progreso

**Total Features:** 18
**MVP Features:** 6
**V2 Features:** 6
**Extension Features:** 4
**V3 Features:** 2

**Completadas:** 18 (100%)
**En Progreso:** 0 (0%)
**Pendientes:** 0

**Por Fase:**
- 🚀 MVP (No Auth): 6/6 (100%) - ✅ **MVP COMPLETO!**
- 🔐 V2 (With Auth): 6/6 (100%) - ✅ **V2 COMPLETO!**
- 🧩 Chrome Extension: 4/4 (100%) - ✅ **EXTENSION COMPLETA!**
- ✨ V3 (Enhancements): 2/2 (100%) - ✅ **V3 COMPLETO!**

---

## 💰 Stack & Costos

**MVP:**
- Stack: Next.js + localStorage + Claude API + Puppeteer
- Costo: $5-10/mes (solo Claude API)
- Deploy: Vercel (free tier)

**V2 + Extension (Current):**
- Stack: Next.js + Supabase (Auth + DB) + Claude API + Chrome Extension (Manifest V3)
- Costo: $10-25/mes (Claude API + Supabase free tier)
- Deploy: Vercel + Supabase Cloud + Chrome Web Store (pending)
- Auth: Email/password + Google OAuth + Extension Bearer token
- DB: 4 tables (user_subscriptions, subscription_usage, user_resumes, applications) with RLS

---

## 🎯 Próximos Pasos

**✅ TODAS LAS FEATURES COMPLETADAS (18/18)**

**Pendientes para produccion:**
- [x] Push all commits to origin/main
- [x] V3 features (F-013 Multiple Templates, F-014 URL Extraction)
- [ ] Deploy web app to Vercel
- [ ] Publish Chrome Extension to Chrome Web Store
- [ ] E2E testing on production environment
