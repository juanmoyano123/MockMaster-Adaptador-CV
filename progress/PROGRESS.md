# Proyecto: MockMaster - Adaptador Inteligente de CV

**Arquitectura MVP:** localStorage (Sin Auth, Sin DB)

Última actualización: 2026-01-25

---

## 🚀 MVP - No Auth (Weeks 1-4)

**Objetivo:** Validar core AI value proposition antes de invertir en infraestructura

### DONE

### IN_PROGRESS

### BACKLOG
- F-002 | Resume Upload & Parsing (localStorage) | Upload PDF/DOCX, save in browser, no backend
- F-003 | Job Description Analysis | Extract keywords with Claude API
- F-004 | AI Resume Adaptation Engine | **CORE** Claude reformulates resume for job
- F-005 | ATS Compatibility Score | Calculate match percentage 0-100
- F-006 | PDF Export with Templates | 3 ATS-friendly templates (Clean/Modern/Compact)
- F-012 | Edit Before Export | Tweak AI output before download

---

## 🔐 V2 - Authentication & Persistence (Post-MVP)

**Trigger:** 100+ active users/week OR positive validation metrics

### DONE

### IN_PROGRESS

### BACKLOG
- F-001 | User Authentication (Supabase) | Google OAuth + email, migrate from localStorage
- F-007 | Application History Tracker | Track which resume sent where (requires DB)
- F-008 | Onboarding Wizard | 3-step guided flow for new users
- F-009 | Stripe Subscription Integration | Pro plan $19/month unlimited adaptations
- F-010 | Usage Limits per User | Enforce free tier 3/month, Pro unlimited
- F-011 | Dashboard & Resume Management | View all resumes and adaptations

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

**Total Features:** 14
**MVP Features:** 6 (down from original 10)
**V2 Features:** 6
**V3 Features:** 2

**Completadas:** 0 (0%)
**En Progreso:** 0 (0%)
**Pendientes:** 14 (100%)

**Por Fase:**
- 🚀 MVP (No Auth): 0/6 (0%)
- 🔐 V2 (With Auth): 0/6 (0%)
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

**V2:**
- Stack: + Supabase (Auth + PostgreSQL + Storage) + Stripe
- Costo: $25-50/mes
- Deploy: Vercel + Supabase Cloud

---

## 🎯 Próximos Pasos

**Iniciar MVP:**
1. `/build-feature F-002` - Resume Upload (localStorage)
2. `/build-feature F-003` - Job Description Analysis
3. `/build-feature F-004` - AI Adaptation Engine (CORE)

**Criterio de Éxito MVP:**
- 100+ descargas/semana
- 30%+ usuarios regresan mismo día
- Feedback positivo sobre AI quality

**Cuando Migrar a V2:**
- Si MVP tiene tracción (100+ usuarios/semana)
- Usuarios piden "guardar mi trabajo"
- Listo para monetizar
