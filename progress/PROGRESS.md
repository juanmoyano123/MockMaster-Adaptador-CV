# Proyecto: MockMaster - Adaptador Inteligente de CV

**Arquitectura MVP:** localStorage (Sin Auth, Sin DB)

Última actualización: 2026-01-26

---

## 🚀 MVP - No Auth (Weeks 1-4)

**Objetivo:** Validar core AI value proposition antes de invertir en infraestructura

### DONE
- F-002 | Resume Upload & Parsing (localStorage) | ✅ COMPLETE - Text paste, Claude AI structuring, localStorage persistence
- F-003 | Job Description Analysis | ✅ COMPLETE - Claude AI extracts skills, responsibilities, seniority, industry
- F-004 | AI Resume Adaptation Engine | ✅ COMPLETE - **CORE FEATURE** Adapts resume with keywords, reorders experiences, reformulates bullets
- F-006 | PDF Export with Templates | ✅ COMPLETE - 3 ATS-friendly templates (Clean/Modern/Compact), Puppeteer-based, <500KB, <5s generation

### IN_PROGRESS

### BACKLOG
- F-005 | ATS Compatibility Score | Calculate match percentage 0-100 (partially in F-004)
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

**Completadas:** 4 (28.6%)
**En Progreso:** 0 (0%)
**Pendientes:** 10 (71.4%)

**Por Fase:**
- 🚀 MVP (No Auth): 4/6 (66.7%) - ¡DOS TERCIOS COMPLETOS! 🎉
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

**Continuar MVP:**
1. ✅ ~~F-002 - Resume Upload (localStorage)~~ COMPLETE
2. ✅ ~~F-003 - Job Description Analysis~~ COMPLETE
3. ✅ ~~F-004 - AI Adaptation Engine (CORE)~~ COMPLETE
4. ✅ ~~F-006 - PDF Export~~ COMPLETE (Pending: Vercel chrome-aws-lambda config)
5. `/build-feature F-012` - Edit Before Export (NEXT - Alta prioridad UX)
6. `/build-feature F-005` - ATS Score Details (opcional, ya tenemos básico)

**Criterio de Éxito MVP:**
- 100+ descargas/semana
- 30%+ usuarios regresan mismo día
- Feedback positivo sobre AI quality

**Cuando Migrar a V2:**
- Si MVP tiene tracción (100+ usuarios/semana)
- Usuarios piden "guardar mi trabajo"
- Listo para monetizar
