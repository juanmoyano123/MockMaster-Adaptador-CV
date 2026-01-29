# Proyecto: MockMaster - Adaptador Inteligente de CV

**Arquitectura MVP:** localStorage (Sin Auth, Sin DB)

Última actualización: 2026-01-29

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

### IN_PROGRESS
- F-009 | MercadoPago Subscription Integration | ⏳ IN PROGRESS - Pro plan $19/month, 2-day trial, 5 free adaptations/month

### BACKLOG
- F-008 | Onboarding Wizard | 3-step guided flow for new users
- F-010 | Usage Limits per User | ✅ Merged into F-009

---

## ✨ V3 - Enhancements (Month 3+)

**Objetivo:** Growth features post-monetization

### DONE

### IN_PROGRESS

### BACKLOG
- F-013 | Multiple Template Selection | 5+ template options instead of 3
- F-014 | Job Description URL Extraction | Paste URL instead of text

---

## 📊 Métricas de Progreso

**Total Features:** 13
**MVP Features:** 6 (down from original 10)
**V2 Features:** 5
**V3 Features:** 2

**Completadas:** 9 (69.2%)
**En Progreso:** 0 (0%)
**Pendientes:** 4 (30.8%)

**Por Fase:**
- 🚀 MVP (No Auth): 6/6 (100%) - ✅ **MVP COMPLETO!**
- 🔐 V2 (With Auth): 3/5 (60%) - F-001 Auth + F-011 App Shell + F-007 Job Library done!
- ✨ V3 (Enhancements): 0/2 (0%)

**Estimación de Tiempo:**
- MVP: 3-4 weeks (50% faster than original plan)
- V2 Migration: 3-5 days (only lib/storage.ts changes)
- V3: TBD based on user feedback

---

## 💰 Stack & Costos

**MVP:**
- Stack: Next.js + localStorage + Claude API + Puppeteer
- Costo: $5-10/mes (solo Claude API)
- Deploy: Vercel (free tier)

**V2 (Current):**
- Stack: + Supabase (Auth implemented, DB pending)
- Costo: $10-25/mes (Claude API + Supabase free tier)
- Deploy: Vercel + Supabase Cloud
- Auth: Email/password + Google OAuth ready

---

## 🎯 Próximos Pasos

**✅ MVP COMPLETO! Todas las features core implementadas:**
1. ✅ ~~F-002 - Resume Upload (localStorage)~~ COMPLETE
2. ✅ ~~F-003 - Job Description Analysis~~ COMPLETE
3. ✅ ~~F-004 - AI Adaptation Engine (CORE)~~ COMPLETE
4. ✅ ~~F-005 - ATS Score with Breakdown~~ COMPLETE
5. ✅ ~~F-006 - PDF Export~~ COMPLETE (Pending: Vercel chrome-aws-lambda config)
6. ✅ ~~F-012 - Edit Before Export~~ COMPLETE

**🚀 V2 Progress:**
- ✅ F-001 - User Authentication (Supabase) COMPLETE
- ✅ Landing Page + Auth UI Screens COMPLETE
- ✅ F-011 - App Shell + Dashboard + User Profile COMPLETE
  - Sidebar navigation (Dashboard, Mi CV, Analizar, Ofertas, Adaptar, Perfil, Billing, Config)
  - Header with UserMenu dropdown (avatar, name, logout)
  - Profile page with password change
  - Settings/Billing placeholder pages
  - Mobile responsive with bottom nav
- ✅ F-007 - Job Description Library COMPLETE
  - Save analyzed job descriptions with name and tags
  - Search and filter by tags
  - Quick "Adaptar CV" button to jump to adaptation
  - View/delete saved jobs
  - localStorage persistence (up to 50 jobs)
- Next: F-008 Onboarding Wizard OR F-009 Stripe Integration

**Criterio de Éxito MVP:**
- 100+ descargas/semana
- 30%+ usuarios regresan mismo día
- Feedback positivo sobre AI quality

**Cuando Migrar a V2:**
- Si MVP tiene tracción (100+ usuarios/semana)
- Usuarios piden "guardar mi trabajo"
- Listo para monetizar
