# MockMaster — Propuesta de Reorganización de Archivos

## Diagnóstico: Estado Actual

### 1. Raíz del proyecto sobrecargada

Hay 6 archivos markdown grandes mezclados con archivos de configuración:

| Archivo | Líneas | Problema |
|---------|--------|----------|
| `plan.md` | 2,901 | Plan de la web app, debería estar en /docs |
| `plan-ext.md` | 2,059 | Plan de la extensión, debería estar en /docs |
| `idea-raw.md` | 112 | Idea original, debería estar en /docs |
| `validacion.md` | 923 | Validación técnica, debería estar en /docs |
| `SETUP-MERCADOPAGO.md` | 204 | Setup específico, debería estar en /docs |
| `README.md` | 477 | ✅ Correcto en raíz |

**Resultado:** La raíz se siente desordenada y es difícil distinguir qué es documentación vs. configuración.

---

### 2. La extensión vive dentro de la web app

```
mockmaster/              ← proyecto Next.js (web app)
├── extension/           ← proyecto Chrome Extension (webpack, React 18)
│   ├── package.json     ← sus propias dependencias
│   ├── tsconfig.json    ← su propio typescript
│   └── src/             ← su propio código fuente
├── package.json         ← dependencias Next.js
└── ...
```

**Problemas:**
- Son proyectos independientes con build systems distintos (Next.js vs Webpack).
- Versiones de React diferentes (19 en web, 18 en extensión).
- No comparten código actualmente (tipos duplicados en `lib/types.ts` y `extension/src/shared/types.ts`).
- El `node_modules` de la extensión se mezcla con el de la web app.
- Si alguien clona el repo, tiene que hacer `npm install` en dos lugares.

---

### 3. La carpeta `documentacion/` tiene nombres inconsistentes

Hay 3 patrones de nombres mezclados:

```
ARCHITECTURE-F002.md       ← patrón A: TIPO-FEATURE
F001-ARCHITECTURE.md       ← patrón B: FEATURE-TIPO
TEST-F002-MANUAL.md        ← patrón C: TEST-FEATURE-SUBTIPO
FEXT004-IMPLEMENTATION...  ← patrón D: prefijo especial extensión
```

Además, hay features con documentación completa (F001, F003, F005, F006, F012) y otras con documentación parcial o inconsistente (F002 tiene archivos en ambos patrones, F004 no tiene IMPLEMENTATION, F008 solo tiene IMPLEMENTATION).

---

### 4. Componentes: mezcla de organizados y sueltos

```
components/
├── app-shell/           ✅ Agrupado por feature
├── auth/                ✅ Agrupado por feature
├── landing/             ✅ Agrupado por feature
├── onboarding/          ✅ Agrupado por feature
├── pdf-templates/       ✅ Agrupado por feature
├── ATSScoreDisplay.tsx  ❌ Suelto
├── AdaptedResumePreview.tsx  ❌ Suelto
├── EditableBullet.tsx   ❌ Suelto
├── EditableExperience.tsx    ❌ Suelto
├── ... (14 archivos más sueltos)
```

Los componentes sueltos están relacionados entre sí pero no agrupados. Por ejemplo, todos los `Editable*.tsx` son parte del flujo de edición del CV.

---

### 5. `lib/` es un cajón de sastre y `utils/` es redundante

```
lib/
├── types.ts                 ← tipos globales
├── storage.ts               ← localStorage genérico
├── adapted-resume-storage.ts ← storage específico
├── job-storage.ts           ← storage específico
├── job-library-storage.ts   ← storage específico
├── subscription-storage.ts  ← storage específico
├── template-preferences.ts  ← storage específico
├── auth-helper.ts           ← auth
├── mercadopago.ts           ← pagos
├── pdf-utils.ts             ← PDF
├── pdf-templates-html.ts    ← PDF
├── resume-parser.ts         ← parsing
├── subscription-config.ts   ← config
├── url-extractor.ts         ← utilidad
├── validation.ts            ← utilidad
├── supabase/                ← cliente Supabase
└── ...

utils/
├── file-validation.ts       ← ¿por qué no está en lib/?
└── text-hash.ts             ← ¿por qué no está en lib/?
```

No hay criterio claro de qué va en `lib/` vs `utils/`.

---

### 6. `progress/` debería estar dentro de `documentacion/`

Son 2 archivos (PROGRESS.md y dashboard.html) que son documentación de seguimiento del proyecto.

---

## Propuesta de Reorganización

### Opción A: Monorepo con separación clara (RECOMENDADA)

Convertir a monorepo con workspaces. Separa los proyectos pero mantiene un solo repo:

```
mockmaster/
│
├── README.md                          ← único MD en raíz
├── package.json                       ← workspace root
├── .gitignore
├── .env.local.example
│
├── apps/
│   ├── web/                           ← Next.js web app
│   │   ├── app/                       ← App Router (sin cambios)
│   │   ├── components/
│   │   │   ├── app-shell/
│   │   │   ├── auth/
│   │   │   ├── landing/
│   │   │   ├── onboarding/
│   │   │   ├── pdf-templates/
│   │   │   ├── resume-editor/         ← NUEVO: agrupa Editable*
│   │   │   │   ├── EditableBullet.tsx
│   │   │   │   ├── EditableExperience.tsx
│   │   │   │   ├── EditableExperienceItem.tsx
│   │   │   │   ├── EditableSkills.tsx
│   │   │   │   └── EditableSummary.tsx
│   │   │   ├── resume-flow/           ← NUEVO: agrupa flujo principal
│   │   │   │   ├── ResumeUploadFlow.tsx
│   │   │   │   ├── ResumeAdaptationFlow.tsx
│   │   │   │   ├── ResumeUpload.tsx
│   │   │   │   ├── ResumePreview.tsx
│   │   │   │   └── AdaptedResumePreview.tsx
│   │   │   ├── job-analysis/          ← NUEVO
│   │   │   │   ├── JobAnalysisFlow.tsx
│   │   │   │   ├── JobAnalysisPreview.tsx
│   │   │   │   ├── JobDescriptionInput.tsx
│   │   │   │   └── ATSScoreDisplay.tsx
│   │   │   └── ui/                    ← NUEVO: componentes reutilizables
│   │   │       ├── DownloadPDFButton.tsx
│   │   │       ├── PasteTextForm.tsx
│   │   │       ├── ResetConfirmationDialog.tsx
│   │   │       ├── SubscriptionBanner.tsx
│   │   │       ├── TemplateSelectorModal.tsx
│   │   │       └── UpgradeModal.tsx
│   │   ├── contexts/
│   │   ├── lib/
│   │   │   ├── storage/               ← NUEVO: agrupa toda lógica de storage
│   │   │   │   ├── base.ts            ← (era storage.ts)
│   │   │   │   ├── adapted-resume.ts
│   │   │   │   ├── job.ts
│   │   │   │   ├── job-library.ts
│   │   │   │   ├── subscription.ts
│   │   │   │   └── template-preferences.ts
│   │   │   ├── pdf/                   ← NUEVO: agrupa lógica PDF
│   │   │   │   ├── utils.ts
│   │   │   │   └── templates-html.ts
│   │   │   ├── supabase/
│   │   │   ├── auth-helper.ts
│   │   │   ├── mercadopago.ts
│   │   │   ├── resume-parser.ts
│   │   │   ├── subscription-config.ts
│   │   │   ├── types.ts
│   │   │   ├── url-extractor.ts
│   │   │   ├── validation.ts
│   │   │   ├── file-validation.ts     ← movido de utils/
│   │   │   └── text-hash.ts           ← movido de utils/
│   │   ├── __tests__/
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   │
│   └── extension/                     ← Chrome Extension (ya existe, se mueve)
│       ├── src/
│       ├── manifest.json
│       ├── package.json
│       ├── webpack.config.js
│       └── tsconfig.json
│
├── docs/                              ← NUEVA: toda la documentación
│   ├── planning/                      ← planes y visión
│   │   ├── plan-web.md                ← (era plan.md)
│   │   ├── plan-extension.md          ← (era plan-ext.md)
│   │   ├── idea-raw.md
│   │   └── validacion.md
│   ├── features/                      ← documentación por feature
│   │   ├── F001/
│   │   │   ├── ARCHITECTURE.md
│   │   │   ├── IMPLEMENTATION.md
│   │   │   ├── DELIVERY.md
│   │   │   └── TESTING.md
│   │   ├── F002/
│   │   │   ├── ARCHITECTURE.md
│   │   │   ├── IMPLEMENTATION.md
│   │   │   ├── DELIVERY.md
│   │   │   └── TESTING.md
│   │   ├── F003/  ... F012/
│   │   └── FEXT004/
│   │       └── IMPLEMENTATION.md
│   ├── guides/                        ← guías de setup y uso
│   │   ├── QUICKSTART.md
│   │   ├── MAKEFILE-GUIDE.md
│   │   ├── SETUP-MERCADOPAGO.md
│   │   └── PROJECT-STRUCTURE.md
│   ├── progress/                      ← seguimiento
│   │   ├── PROGRESS.md
│   │   └── dashboard.html
│   └── design/                        ← (se mueve design/ acá)
│       ├── design-system.md
│       ├── research/
│       └── wireframes/
│
├── supabase/                          ← se queda en raíz (config de infra)
│   └── migrations/
│
└── Makefile                           ← se actualiza para monorepo
```

---

### Opción B: Reorganización mínima (sin monorepo)

Si preferís no reestructurar a monorepo todavía, estos cambios dan el 80% del beneficio con 20% del esfuerzo:

1. **Mover MDs de la raíz a `documentacion/planning/`**
2. **Crear subcarpetas por feature en `documentacion/`** (F001/, F002/, etc.)
3. **Agrupar componentes sueltos** en subcarpetas (resume-editor/, resume-flow/, job-analysis/, ui/)
4. **Eliminar `utils/`** y mover sus archivos a `lib/`
5. **Crear `lib/storage/`** para agrupar los 6 archivos de storage
6. **Mover `progress/`** dentro de `documentacion/`

---

## Comparación

| Criterio | Opción A (Monorepo) | Opción B (Mínima) |
|----------|--------------------|--------------------|
| Esfuerzo | Alto (4-6 horas) | Bajo (1-2 horas) |
| Separación ext/web | Total | Parcial |
| Escalabilidad | Excelente | Limitada |
| Riesgo de romper imports | Medio (hay que actualizar paths) | Bajo |
| Código compartido futuro | Fácil (packages/shared) | Difícil |
| CI/CD independiente | Sí | No |

---

## Recomendación

**Empezar con Opción B ahora** para limpiar el desorden inmediato, y **migrar a Opción A cuando** vayas a agregar código compartido entre la extensión y la web (tipos, utilidades de parsing, etc.).

Los beneficios inmediatos más grandes son:

1. **Sacar los MD de la raíz** — limpia visualmente el proyecto.
2. **Organizar `documentacion/` por feature** — encontrás todo de una feature en un solo lugar.
3. **Agrupar componentes** — el código se entiende en 30 segundos al abrir el directorio.
4. **Eliminar `utils/`** — una sola ubicación para lógica de negocio.
