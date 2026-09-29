# MockMaster - Adaptador Inteligente de CV

## 🔴 PROBLEMA

**Situación actual del mercado:**
- Cada puesto requiere un CV diferente, pero adaptar manualmente toma 30-60 min por aplicación
- Los job seekers envían el mismo CV genérico a todos los puestos → baja tasa de respuesta (2-5%)
- Los ATS (Applicant Tracking Systems) filtran CVs que no tienen las keywords exactas del puesto
- No saber qué experiencias/habilidades destacar para cada rol específico
- Recruiters dedican 6-7 segundos por CV → si no hace match visual e inmediato, descartado

**Pain points específicos:**
- "Tengo experiencia relevante pero no sé cómo presentarla para este puesto"
- "El puesto pide X y yo tengo algo parecido, pero no sé cómo reformularlo"
- "Paso horas adaptando CVs y al final no sé si quedó bien"
- "No sé qué keywords busca el ATS de esta empresa"

**Quién sufre este problema:**
- Job seekers activos aplicando a múltiples puestos (especialmente en transición de carrera/país)
- Profesionales senior con mucha experiencia que no saben qué priorizar
- Inmigrantes traduciendo/adaptando su experiencia a otro mercado laboral
- Estudiantes/juniors que no saben cómo "vender" poca experiencia

---

## 🟢 SOLUCIÓN

**Propuesta de valor:**
App que toma tu CV completo + una job description y genera automáticamente un CV optimizado para ese puesto específico, con diseño profesional y listo para exportar en PDF.

**Cómo funciona:**

```
INPUT 1: Job Description (pegar texto o URL del puesto)
         ↓
    [IA analiza: keywords, skills requeridos, seniority, industria]
         ↓
INPUT 2: CV Personal (subir PDF/DOCX o pegar texto)
         ↓
    [IA mapea: qué experiencias hacen match, qué reformular, qué priorizar]
         ↓
OUTPUT: CV Adaptado
    - Experiencias reorganizadas por relevancia
    - Bullets reformulados con keywords del puesto
    - Skills destacadas según lo que pide el rol
    - Diseño profesional y ATS-friendly
         ↓
EXPORTAR: PDF listo para enviar
```

**Regla de oro:** La IA NUNCA inventa información. Solo reorganiza, reformula y prioriza lo que ya existe en el CV original.

**Demanda (quién paga):**
- Job seekers aplicando activamente ($15-30/mes)
- Career coaches y consultoras de outplacement (B2B)
- Universidades y bootcamps para sus egresados
- Empresas de recruiting que quieren ayudar a candidatos

**Oferta (qué entregamos):**
- CVs ilimitados adaptados por puesto
- Múltiples plantillas profesionales (ATS-friendly)
- Score de compatibilidad CV vs Job Description
- Exportación en PDF con diseño atractivo
- Historial de versiones (qué CV enviaste a qué empresa)

---

## 🔧 HERRAMIENTAS / STACK

| Componente | Tecnología | Justificación |
|------------|------------|---------------|
| Frontend | Next.js + React + Tailwind | UI moderna, responsive, rápida |
| Backend | Supabase | Auth + DB + Storage para CVs |
| IA Core | Claude API | Análisis semántico + reformulación inteligente |
| Parser de CVs | pdf-parse / mammoth.js | Extraer texto de PDF/DOCX |
| Generador PDF | Puppeteer / React-PDF | Exportar con estilos profesionales |
| Pagos | Stripe | Suscripciones mensuales |
| Scraping Jobs | Apify (opcional) | Extraer job descriptions de URLs |

**Tiempo estimado MVP:** 6-8 semanas

---

## 💰 MODELO DE NEGOCIO (borrador)

| Plan | Precio | Incluye |
|------|--------|---------|
| Free | $0 | 2 adaptaciones/mes, 1 plantilla básica |
| Pro | $19/mes | Ilimitado, todas las plantillas, historial |
| Premium | $39/mes | Todo + análisis avanzado + sugerencias de mejora |

**B2B:** $199-499/mes para coaches, universidades, recruiters (múltiples usuarios)

---

## 🎯 DIFERENCIADORES vs COMPETENCIA

| Competidor | Qué hace | Nuestra ventaja |
|------------|----------|-----------------|
| Jobscan | Solo analiza match % | Nosotros GENERAMOS el CV adaptado |
| Resume.io | Templates bonitos | Nosotros adaptamos contenido + diseño |
| ChatGPT directo | Requiere prompts manuales | UX optimizada, un click, plantillas pro |

---

## ✅ VALIDACIÓN PENDIENTE

- [ ] Entrevistar 10 job seekers sobre su proceso actual
- [ ] Testear con mi propio CV + 5 job descriptions reales
- [ ] Definir 3-5 plantillas iniciales (tech, finance, general)
- [ ] Validar pricing con encuesta rápida
- [ ] Analizar competencia en detalle (Jobscan, Teal, Kickresume)
