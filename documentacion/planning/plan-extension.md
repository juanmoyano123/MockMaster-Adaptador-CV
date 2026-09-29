# PLAN DE EJECUCION: MockMaster Chrome Extension

**PM:** Agent 1 - Product Manager (Senior, 15+ years exp.)
**Fecha:** 2026-02-24
**Version:** 1.0
**Estado:** Aprobado para ejecucion
**Metodologia:** Google Project Management + Agile/Scrum + RICE Framework

---

## 1. RESUMEN EJECUTIVO

### Que es

MockMaster Chrome Extension es una extension de navegador tipo sidebar panel que permite a buscadores de empleo extraer descripciones de trabajo de LinkedIn e Indeed, adaptar su CV con IA, copiar secciones individuales para pegar en formularios de aplicacion, y registrar cada postulacion en un tracker centralizado -- todo sin salir de la pagina del aviso de empleo.

### Por que importa

El flujo actual de MockMaster requiere que el usuario copie manualmente la descripcion del trabajo desde LinkedIn/Indeed, cambie de pestana a la web app, pegue el texto, adapte el CV, y luego vuelva a la pestana del aviso para completar la aplicacion. Este ida-y-vuelta genera friccion, consume tiempo, y rompe el flow mental del usuario. La extension elimina ese ciclo de cambio de tabs convirtiendo la adaptacion de CV en una accion contextual que ocurre en la misma pagina del aviso.

Adicionalmente, los formularios de aplicacion en LinkedIn e Indeed tienen campos separados (Resumen, Experiencia, Educacion, Habilidades), y actualmente el usuario no tiene forma de copiar secciones individuales del CV adaptado. Los botones de "Copiar" por seccion resuelven este problema directamente.

### Integracion con la web app existente

La extension NO es un producto standalone. Es un cliente alternativo que consume la misma API de MockMaster:

- **Reutiliza endpoints existentes:** `/api/analyze-job`, `/api/adapt-resume`, `/api/calculate-ats-breakdown`, `/api/generate-pdf`, `/api/subscriptions/status`
- **Comparte la misma base de datos:** Supabase (PostgreSQL) con las tablas `user_subscriptions` y `subscription_usage`
- **Comparte autenticacion:** Supabase Auth con la sesion del usuario logueado en la web
- **Agrega nueva tabla:** `applications` en Supabase para el tracker de postulaciones
- **Agrega nuevo endpoint:** `/api/applications` (CRUD) para el tracker
- **Agrega nueva pagina web:** `/applications` en la web app para el dashboard del tracker

### Propuesta de valor

"Permitimos a buscadores de empleo adaptar su CV y postularse a ofertas en LinkedIn e Indeed sin cambiar de pestana, con copia por secciones y tracking automatico de aplicaciones."

### Metricas de exito (North Star)

- **North Star:** Adaptaciones completadas desde la extension por semana - Target: 200+ por semana (mes 2 post-lanzamiento)
- **Input Metric 1:** Tasa de extraccion exitosa de job descriptions - Target: >95%
- **Input Metric 2:** Uso de botones "Copiar seccion" por adaptacion - Target: >3 secciones copiadas por sesion
- **Input Metric 3:** Aplicaciones guardadas en tracker por usuario por semana - Target: >5
- **Guardrail Metric:** Errores de extraccion que requieren fallback a Vision API - Umbral maximo: <15%

---

## 2. PROBLEMA

### Pain points del flujo actual

**Pain Point 1: Cambio constante de tabs (Severidad: CRITICA)**
El usuario encuentra un aviso en LinkedIn, tiene que abrir MockMaster en otra pestana, copiar la URL o el texto del aviso, pegarlo, esperar el analisis, adaptar el CV, luego volver a LinkedIn para aplicar. Este proceso fragmentado toma 5-8 minutos vs. los 2-3 minutos que tomaria si todo ocurriera en la misma pagina. La carga cognitiva del context-switching reduce la motivacion de aplicar a multiples posiciones.

**Pain Point 2: Copy-paste manual de descripciones (Severidad: ALTA)**
Las descripciones de trabajo en LinkedIn e Indeed son largas (500-2000 palabras) y estan mezcladas con UI del sitio (botones, sidebar, ads). El usuario tiene que seleccionar cuidadosamente solo el texto relevante, copiarlo, y pegarlo en MockMaster. Frecuentemente pierde partes del texto o incluye contenido irrelevante.

**Pain Point 3: Imposibilidad de copiar por secciones (Severidad: ALTA)**
Despues de que MockMaster genera el CV adaptado, el usuario lo descarga como PDF. Pero los formularios de LinkedIn e Indeed tienen campos separados: Resumen Profesional, Experiencia, Habilidades. El PDF no sirve para pegar en estos campos -- el usuario tiene que volver a editar manualmente o transcribir desde el PDF.

**Pain Point 4: Tracking manual de aplicaciones (Severidad: MEDIA)**
El usuario no tiene forma de saber a que trabajos aplico, con que version del CV, ni cuando. Resulta en confusion durante callbacks de entrevistas y en re-aplicar a posiciones a las que ya postulo.

### Cuantificacion del problema

| Metrica | Sin extension | Con extension | Mejora |
|---------|--------------|---------------|--------|
| Tiempo por aplicacion | 5-8 min | 2-3 min | 60% mas rapido |
| Tabs abiertos necesarios | 3-4 | 1 | 75% menos tabs |
| Pasos manuales (copy-paste) | 4 | 0 | 100% eliminados |
| Aplicaciones trackeadas | 0% | 100% | Automatico |
| Secciones copiables individualmente | 0 | 5 | Nuevo |

---

## 3. USUARIOS OBJETIVO

### Persona principal: Buscador de empleo activo

**Nombre:** Maria Lopez
**Edad:** 25-40
**Ocupacion:** Profesional tech en busqueda activa de empleo (developer, designer, PM, data analyst)
**Ubicacion:** Argentina (LATAM), aplicando a empresas locales y remotas en USA/Europa
**Nivel tecnologico:** 4/5 - Usa extensiones de Chrome, familiarizada con herramientas de productividad
**Segmento de mercado:** 1.2M buscadores de empleo activos en tech en Argentina (LinkedIn data 2025)

**Contexto de uso de la extension:**
Maria tiene 15 pestanas abiertas en Chrome: LinkedIn con busquedas de trabajo, Indeed con filtros aplicados, y MockMaster en otra pestana. Cuando encuentra un aviso interesante, en lugar de copiar-pegar y cambiar de tab, abre el sidebar de MockMaster directamente sobre la pagina del aviso. El sidebar extrae automaticamente la descripcion, le muestra el analisis, y con un click adapta su CV. Luego copia "Resumen Profesional" y lo pega en el campo correspondiente del formulario de LinkedIn. Repite con Experiencia y Habilidades. Finalmente clickea "Guardar Aplicacion" que registra la URL, fecha, empresa y CV usado.

**Jobs-to-be-Done:**
- **Funcional:** Adaptar mi CV y aplicar a esta oferta especifica en menos de 3 minutos, sin salir de esta pagina
- **Emocional:** Sentir que tengo control sobre mi busqueda de empleo y que ninguna aplicacion se pierde
- **Social:** Presentar un CV profesional y personalizado que demuestre que investigue la empresa

### Flujo actual (As-Is)

```
1. Encuentra aviso en LinkedIn/Indeed -> 30seg -> Friccion: ninguna
2. Abre MockMaster en nueva tab -> 10seg -> Friccion: buscar la tab correcta
3. Copia descripcion del aviso -> 45seg -> Friccion: seleccionar texto correcto, evitar UI
4. Pega en MockMaster y analiza -> 20seg -> Friccion: cambio de contexto
5. Adapta CV -> 60seg -> Friccion: esperar carga
6. Descarga PDF -> 15seg -> Friccion: no puede copiar secciones
7. Vuelve a LinkedIn para aplicar -> 10seg -> Friccion: buscar la tab del aviso
8. Transcribe manualmente secciones del PDF -> 3-5min -> Friccion: MAXIMA
```
**Total:** 6-8 minutos, 5 puntos de friccion, 70% tasa de completado (muchos abandonan en paso 8)

### Flujo deseado (To-Be con extension)

```
1. Encuentra aviso en LinkedIn/Indeed -> 30seg -> Sin friccion
2. Abre sidebar MockMaster -> 2seg -> Auto-detecta pagina y extrae descripcion
3. Click "Adaptar CV" -> 60seg -> CV adaptado visible en sidebar
4. Copia secciones individualmente -> 30seg -> Botones "Copiar" por seccion
5. Pega en formulario de aplicacion -> 30seg -> Sin cambio de tab
6. Click "Guardar Aplicacion" -> 2seg -> Automatico con URL + metadata
```
**Total:** 2-3 minutos (62% mas rapido), 0 puntos de friccion, 95%+ tasa de completado

---

## 4. ESPECIFICACIONES DE FEATURES

---

### F-EXT-001: Extraccion de Job Description (Hibrida)

**RICE Score:** (100 x 3 x 100%) / 3 = **100**
- Reach: 100% - Todos los usuarios la necesitan (feature core)
- Impact: 3 (Masivo) - Sin extraccion, la extension no tiene razon de existir
- Confidence: 100% - DOM parsing es tecnica probada
- Effort: 3 dias (content scripts para LinkedIn + Indeed + fallback Vision)

**User Story:**
```
Como buscador de empleo activo
Quiero que la extension extraiga automaticamente la descripcion del trabajo
de la pagina de LinkedIn o Indeed que estoy viendo
Para no tener que copiar-pegar manualmente el texto en MockMaster
```

**Detalle Tecnico:**

La extraccion opera con un sistema hibrido de dos capas:

**Capa 1: Extraccion DOM (metodo primario)**

Content scripts especificos por sitio que leen el HTML/DOM de la pagina para extraer datos estructurados.

Para LinkedIn (`linkedin-extractor.ts`):
- Selector titulo: `.job-details-jobs-unified-top-card__job-title` o `h1.t-24`
- Selector empresa: `.job-details-jobs-unified-top-card__company-name` o `.topcard__org-name-link`
- Selector ubicacion: `.job-details-jobs-unified-top-card__bullet` o `.topcard__flavor--bullet`
- Selector descripcion: `.jobs-description-content__text` o `#job-details`
- Selector modalidad: texto que contiene "Remote", "Hybrid", "On-site" dentro de `.workplace-type`
- Selector salario: `.salary-main-rail__salary-range` o `.compensation__salary`

Para Indeed (`indeed-extractor.ts`):
- Selector titulo: `h1.jobsearch-JobInfoHeader-title` o `.icl-u-xs-mb--xs`
- Selector empresa: `div[data-company-name]` o `.jobsearch-InlineCompanyRating-companyHeader`
- Selector ubicacion: `div[data-testid="job-location"]` o `.jobsearch-JobInfoHeader-subtitle > div:nth-child(2)`
- Selector descripcion: `#jobDescriptionText` o `.jobsearch-jobDescriptionText`
- Selector salario: `#salaryInfoAndJobType` o `.salary-snippet`
- Selector modalidad: texto que contiene "Remote", "Hybrid" en el metadata del aviso

**Estructura de datos extraidos:**
```typescript
interface ExtractedJobData {
  source: 'linkedin' | 'indeed';
  url: string;
  title: string;
  company: string;
  location: string;
  salary: string | null;
  modality: 'remote' | 'hybrid' | 'onsite' | null;
  description: string;     // Texto completo de la descripcion
  requirements: string;    // Si se puede separar de la descripcion
  benefits: string | null; // Si estan en seccion separada
  extracted_at: string;    // ISO 8601
  extraction_method: 'dom' | 'vision';
  raw_text: string;        // Todo el texto concatenado para enviar a analyze-job
}
```

**Capa 2: Fallback con Claude Vision (metodo secundario)**

Se activa cuando:
- El DOM extraction devuelve description con menos de 50 caracteres
- Los selectores principales fallan (LinkedIn/Indeed cambiaron su DOM)
- El content script detecta que la pagina esta en un formato no reconocido

Proceso:
1. Captura screenshot de la tab visible usando `chrome.tabs.captureVisibleTab()`
2. Convierte a base64
3. Envia al nuevo endpoint `/api/extract-job-vision` que usa Claude Vision para interpretar la imagen
4. Claude Vision extrae los mismos campos estructurados

**Nuevo endpoint necesario:** `POST /api/extract-job-vision`
```typescript
// Request
{
  screenshot_base64: string;  // Imagen de la pagina
  source: 'linkedin' | 'indeed';
  url: string;
}

// Response
{
  extracted_data: ExtractedJobData;
  confidence: number;  // 0-100, que tan seguro esta Claude de la extraccion
}
```

**Criterios de Aceptacion:**

**Escenario 1: Extraccion exitosa en LinkedIn (happy path)**
```gherkin
Given que el usuario esta en una pagina de aviso de trabajo en LinkedIn
  And la pagina ha cargado completamente (DOM ready)
  And la URL coincide con el patron linkedin.com/jobs/view/*
When el usuario abre el sidebar de MockMaster
Then el content script extrae titulo, empresa, ubicacion, y descripcion completa del DOM
  And la descripcion tiene al menos 50 caracteres
  And el sidebar muestra los datos extraidos en menos de 2 segundos
  And el campo extraction_method es "dom"
```

**Escenario 2: Extraccion exitosa en Indeed (happy path)**
```gherkin
Given que el usuario esta en una pagina de aviso de trabajo en Indeed
  And la URL coincide con el patron indeed.com/viewjob* o indeed.com/rc/clk*
When el usuario abre el sidebar de MockMaster
Then el content script extrae titulo, empresa, ubicacion, y descripcion completa del DOM
  And la descripcion tiene al menos 50 caracteres
  And el sidebar muestra los datos extraidos en menos de 2 segundos
```

**Escenario 3: Fallback a Vision cuando DOM falla**
```gherkin
Given que el usuario esta en una pagina de aviso de trabajo en LinkedIn o Indeed
  And el content script no logra extraer la descripcion (menos de 50 caracteres o selectores fallan)
When el sistema detecta la extraccion incompleta
Then automaticamente captura un screenshot de la tab visible
  And envia el screenshot al endpoint /api/extract-job-vision
  And muestra un spinner con el mensaje "Analizando pagina con vision..."
  And muestra los datos extraidos cuando Claude Vision responde
  And el campo extraction_method es "vision"
```

**Escenario 4: Pagina no es un aviso de trabajo**
```gherkin
Given que el usuario esta en una pagina de LinkedIn que NO es un aviso de trabajo
  (por ejemplo, linkedin.com/feed o linkedin.com/in/some-profile)
When el usuario abre el sidebar de MockMaster
Then el sidebar muestra el mensaje "Esta pagina no parece ser un aviso de trabajo"
  And muestra una lista de sitios compatibles: "LinkedIn Jobs, Indeed"
  And no intenta extraer datos
  And muestra un campo de texto manual con placeholder "O pega la descripcion aqui..."
```

**Escenario 5: Descripcion parcial extraida**
```gherkin
Given que el usuario esta en un aviso de trabajo en LinkedIn
  And la descripcion completa esta oculta detras de un boton "Show more"
When el content script extrae el DOM
  And detecta que hay un boton "Show more" o "Ver mas"
Then automaticamente hace click en el boton para expandir la descripcion
  And espera 500ms para que el DOM se actualice
  And re-extrae la descripcion completa expandida
```

**Escenario 6: Pagina con login wall**
```gherkin
Given que el usuario esta en LinkedIn pero no ha iniciado sesion en LinkedIn
  And la pagina muestra un login wall en lugar del contenido del aviso
When el content script intenta extraer datos
  And no encuentra los selectores esperados
  And el fallback a Vision detecta un formulario de login en lugar de un aviso
Then el sidebar muestra el mensaje "Necesitas iniciar sesion en LinkedIn para ver este aviso"
  And no intenta la extraccion
```

**Consideraciones tecnicas:**

- **Rate limiting:** Maximo 10 extracciones por Vision por hora por usuario (para controlar costos)
- **Cache:** Cachear extraccion por URL (sha256 del URL) durante 24 horas en `chrome.storage.local`
- **Tamano de screenshot:** Reducir a 1280x720 y calidad JPEG 80% antes de enviar (reducir costos de Vision)
- **Timeout:** 10 segundos maximo para extraccion DOM, 30 segundos para Vision fallback
- **Deteccion de pagina soportada:** Evaluar URL contra patrones regex en el background service worker

---

### F-EXT-002: Application Tracker

**RICE Score:** (80 x 2 x 90%) / 4 = **36**
- Reach: 80% - La mayoria de usuarios querran trackear, algunos no
- Impact: 2 (Alto) - Resuelve un pain point real pero no es blocker del flujo principal
- Confidence: 90% - CRUD estandar, baja incertidumbre tecnica
- Effort: 4 dias (tabla Supabase + API endpoints + pagina en web app + boton en extension)

**User Story:**
```
Como buscador de empleo que usa MockMaster
Quiero guardar un registro de cada postulacion con un click
Para tener un historial centralizado de a que aplique, cuando, y con que CV
```

**Detalle Tecnico:**

**Nueva tabla en Supabase: `applications`**

```sql
-- ==================================================
-- Migration: 002_applications.sql
-- Feature: F-EXT-002 - Application Tracker
-- ==================================================

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Job metadata (captured at time of application)
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  job_url TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('linkedin', 'indeed', 'manual')),
  location TEXT,
  salary TEXT,
  modality TEXT CHECK (modality IN ('remote', 'hybrid', 'onsite', NULL)),

  -- Application data
  status TEXT NOT NULL DEFAULT 'aplicada' CHECK (status IN (
    'aplicada', 'entrevista', 'oferta', 'rechazada', 'descartada'
  )),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- CV reference (snapshot of adapted content at time of application)
  adapted_content JSONB,           -- Full AdaptedContent object
  ats_score INTEGER,                -- ATS score at time of application
  template_used TEXT,               -- 'clean', 'modern', 'compact'

  -- Job analysis reference
  job_analysis JSONB,              -- Full job analysis at time of application

  -- User notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================================================
-- Indexes
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON applications(user_id, applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(user_id, company_name);

-- ==================================================
-- RLS Policies
-- ==================================================
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own applications
DROP POLICY IF EXISTS "Users can read own applications" ON applications;
CREATE POLICY "Users can read own applications"
ON applications FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own applications
DROP POLICY IF EXISTS "Users can create own applications" ON applications;
CREATE POLICY "Users can create own applications"
ON applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own applications
DROP POLICY IF EXISTS "Users can update own applications" ON applications;
CREATE POLICY "Users can update own applications"
ON applications FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own applications
DROP POLICY IF EXISTS "Users can delete own applications" ON applications;
CREATE POLICY "Users can delete own applications"
ON applications FOR DELETE
USING (auth.uid() = user_id);

-- ==================================================
-- Trigger: Update updated_at on changes
-- ==================================================
CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_application_updated ON applications;
CREATE TRIGGER on_application_updated
BEFORE UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION update_applications_updated_at();
```

**Nuevos API endpoints:**

**POST /api/applications** - Crear aplicacion
```typescript
// Request body
{
  job_title: string;
  company_name: string;
  job_url: string;
  source: 'linkedin' | 'indeed' | 'manual';
  location?: string;
  salary?: string;
  modality?: 'remote' | 'hybrid' | 'onsite';
  adapted_content?: AdaptedContent;  // Snapshot del CV adaptado
  ats_score?: number;
  template_used?: string;
  job_analysis?: JobAnalysis['analysis'];
  notes?: string;
}

// Response 201
{
  id: string;
  ...all fields;
}

// Response 401
{ error: 'No autenticado', code: 'UNAUTHORIZED' }
```

**GET /api/applications** - Listar aplicaciones del usuario
```typescript
// Query params
?status=aplicada,entrevista  // Filtro opcional por status (comma-separated)
&sort=applied_at             // Campo de ordenamiento (default: applied_at)
&order=desc                  // Direccion (default: desc)
&limit=50                    // Paginacion (default: 50)
&offset=0                    // Offset (default: 0)

// Response 200
{
  applications: Application[];
  total: number;
  stats: {
    total: number;
    by_status: {
      aplicada: number;
      entrevista: number;
      oferta: number;
      rechazada: number;
      descartada: number;
    };
    this_week: number;
    this_month: number;
  };
}
```

**PATCH /api/applications/[id]** - Actualizar status/notas
```typescript
// Request body
{
  status?: 'aplicada' | 'entrevista' | 'oferta' | 'rechazada' | 'descartada';
  notes?: string;
}

// Response 200
{ ...updated application }

// Response 404
{ error: 'Aplicacion no encontrada', code: 'NOT_FOUND' }
```

**DELETE /api/applications/[id]** - Eliminar aplicacion
```typescript
// Response 200
{ success: true }

// Response 404
{ error: 'Aplicacion no encontrada', code: 'NOT_FOUND' }
```

**Flujo de estados:**
```
aplicada --> entrevista --> oferta
    |             |            |
    v             v            v
descartada    rechazada    (fin exitoso)
    |
    v
  (fin)
```

**Criterios de Aceptacion:**

**Escenario 1: Guardar aplicacion desde extension (happy path)**
```gherkin
Given que el usuario tiene un CV adaptado visible en el sidebar
  And el usuario esta logueado en MockMaster
  And la pagina actual es un aviso de LinkedIn con URL linkedin.com/jobs/view/12345
When el usuario hace click en el boton "Guardar Aplicacion"
Then el sistema crea un registro en la tabla applications con:
  - job_title: el titulo extraido del aviso
  - company_name: la empresa extraida
  - job_url: la URL completa de la tab actual
  - source: "linkedin"
  - status: "aplicada"
  - applied_at: fecha/hora actual
  - adapted_content: snapshot del CV adaptado actual
  - ats_score: el score ATS calculado
  And muestra un toast de confirmacion "Aplicacion guardada correctamente"
  And el boton cambia a "Aplicacion guardada" (deshabilitado, color verde)
```

**Escenario 2: Evitar duplicados**
```gherkin
Given que el usuario ya guardo una aplicacion para la URL actual
When el usuario abre el sidebar en la misma URL
Then el boton muestra "Ya aplicaste a esta oferta" con la fecha de aplicacion
  And el boton esta deshabilitado
  And no permite crear un duplicado
```

**Escenario 3: Actualizar status desde web dashboard**
```gherkin
Given que el usuario esta en la pagina /applications del dashboard web
  And tiene una aplicacion en status "aplicada" para Google
When hace click en el dropdown de status y selecciona "entrevista"
Then el sistema actualiza el status via PATCH /api/applications/[id]
  And la UI refleja el cambio inmediatamente
  And el campo updated_at se actualiza automaticamente
```

**Escenario 4: Guardar sin CV adaptado**
```gherkin
Given que el usuario esta en el sidebar de la extension
  And NO ha adaptado su CV aun (solo extrajo la descripcion)
When hace click en "Guardar Aplicacion"
Then el sistema guarda la aplicacion con adapted_content como null
  And muestra el toast "Aplicacion guardada (sin CV adaptado)"
  And en el dashboard, la aplicacion aparece con un indicador "Sin CV adaptado"
```

**Escenario 5: Agregar notas a una aplicacion**
```gherkin
Given que el usuario esta en la pagina /applications del dashboard web
  And selecciona una aplicacion existente
When hace click en "Agregar nota" y escribe "Contactar a Juan del equipo de Eng"
  And hace click en "Guardar"
Then la nota se guarda via PATCH /api/applications/[id]
  And la nota es visible al expandir los detalles de la aplicacion
```

**Dashboard web (nueva pagina `/applications`):**

Elementos principales:
- **Stats bar:** Total de aplicaciones, por status (con colores), aplicaciones esta semana
- **Tabla/lista de aplicaciones:** Sorteable por fecha, empresa, status
- **Filtros:** Por status, por fuente (LinkedIn/Indeed), por rango de fecha
- **Detalle expandible:** Al clickear una aplicacion, muestra el CV adaptado usado, ATS score, notas
- **Acciones por fila:** Cambiar status (dropdown), eliminar, agregar nota
- **Busqueda:** Por empresa o titulo de trabajo

---

### F-EXT-003: Chrome Extension Sidebar UI

**RICE Score:** (100 x 3 x 95%) / 5 = **57**
- Reach: 100% - Es la UI de toda la extension
- Impact: 3 (Masivo) - Define la experiencia completa
- Confidence: 95% - Side Panel API es estable pero relativamente nueva
- Effort: 5 dias (UI completa del sidebar con todos los estados + auth flow + copia por secciones)

**User Story:**
```
Como buscador de empleo que instalo la extension de MockMaster
Quiero un sidebar amplio que me muestre todo el flujo de adaptacion de CV
directamente al costado de la pagina del aviso de trabajo
Para completar mi aplicacion sin cambiar de pestana
```

**Detalle Tecnico:**

**Side Panel API de Chrome (Manifest V3):**

El sidebar se abre usando la API `chrome.sidePanel` disponible desde Chrome 114+. Se implementa como Side Panel global que se activa en las pestanas de LinkedIn e Indeed.

**Ancho del panel:** ~480px (aproximadamente 40% del ancho de pantalla en un monitor de 1920px). El usuario puede redimensionar el panel nativamente.

**Flujo completo del sidebar:**

```
[Estado 1: No autenticado]
  -> Pantalla de login con boton "Iniciar sesion en MockMaster"
  -> Redirige a la web app para login, luego sincroniza sesion

[Estado 2: Autenticado, pagina no soportada]
  -> Mensaje "Navega a un aviso en LinkedIn o Indeed"
  -> Input manual de texto como fallback

[Estado 3: Autenticado, pagina soportada, extrayendo]
  -> Spinner "Extrayendo descripcion del trabajo..."

[Estado 4: Job extraido, mostrando analisis]
  -> Tarjeta con: Titulo | Empresa | Ubicacion | Salario | Modalidad
  -> Descripcion colapsable (primeras 3 lineas + "Ver mas")
  -> Skills requeridos (tags)
  -> Boton "Adaptar mi CV" (prominente, primario)
  -> Si no tiene CV subido: "Sube tu CV primero" con link a web app

[Estado 5: Adaptando CV]
  -> Spinner con progreso "Adaptando tu CV... (esto toma ~30 segundos)"
  -> Barra de progreso animada

[Estado 6: CV adaptado, listo para copiar]
  -> ATS Score prominente (badge con color segun rango)
  -> Secciones copiables:
     ┌─────────────────────────────────┐
     │ Resumen Profesional    [Copiar] │
     │ "Texto del resumen..."          │
     ├─────────────────────────────────┤
     │ Experiencia Laboral    [Copiar] │
     │ > Empresa 1 - Titulo           │
     │   - Bullet 1                    │
     │   - Bullet 2                    │
     │ > Empresa 2 - Titulo           │
     │   - Bullet 1                    │
     ├─────────────────────────────────┤
     │ Educacion              [Copiar] │
     │ > Universidad - Titulo          │
     ├─────────────────────────────────┤
     │ Habilidades            [Copiar] │
     │ Python, React, AWS, Docker...   │
     ├─────────────────────────────────┤
     │ Idiomas                [Copiar] │
     │ Espanol (Nativo), Ingles (C1)   │
     └─────────────────────────────────┘
  -> [Descargar PDF] boton secundario
  -> [Guardar Aplicacion] boton primario

[Estado 7: Aplicacion guardada]
  -> Badge "Aplicacion guardada" con fecha
  -> Link a "Ver en dashboard"
  -> Boton "Adaptar para otra oferta" (reset)
```

**Formato de texto copiado por seccion:**

Cuando el usuario hace click en "Copiar" en una seccion, el texto se copia al clipboard en formato plano optimizado para formularios:

**Resumen Profesional:**
```
Ingeniero de Software Senior con 5+ anos de experiencia en desarrollo full-stack...
```

**Experiencia Laboral:**
```
Empresa ABC | Ingeniero Senior | Enero 2022 - Presente
- Lidere el desarrollo de una plataforma de pagos que proceso USD 5M mensuales
- Implemente arquitectura de microservicios reduciendo latencia en 40%
- Mentoring de 3 desarrolladores junior

Empresa XYZ | Desarrollador | Marzo 2019 - Diciembre 2021
- Desarrolle APIs RESTful con Node.js sirviendo 10K requests/segundo
- Migre base de datos de MongoDB a PostgreSQL mejorando queries en 60%
```

**Habilidades:**
```
Python, JavaScript, TypeScript, React, Node.js, PostgreSQL, AWS, Docker, Kubernetes, CI/CD
```

**Criterios de Aceptacion:**

**Escenario 1: Apertura del sidebar en pagina de LinkedIn (happy path)**
```gherkin
Given que el usuario tiene la extension instalada
  And esta logueado en MockMaster
  And tiene un CV master subido
  And esta en una pagina linkedin.com/jobs/view/12345
When hace click en el icono de MockMaster en la toolbar de Chrome
Then se abre el Side Panel con ancho ~480px al costado derecho del navegador
  And automaticamente extrae la descripcion del trabajo
  And muestra los datos extraidos (titulo, empresa, ubicacion) en menos de 3 segundos
  And muestra el boton "Adaptar mi CV" prominente
```

**Escenario 2: Copiar seccion al clipboard**
```gherkin
Given que el usuario tiene un CV adaptado visible en el sidebar
  And esta viendo la seccion "Experiencia Laboral"
When hace click en el boton "Copiar" junto a "Experiencia Laboral"
Then el texto de experiencia se copia al clipboard del sistema en formato plano
  And el boton cambia temporalmente a "Copiado" (icono de check, 2 segundos)
  And se puede pegar en cualquier campo de texto (probado en formularios de LinkedIn)
```

**Escenario 3: Usuario no autenticado**
```gherkin
Given que el usuario tiene la extension instalada
  And NO esta logueado en MockMaster
When abre el sidebar de la extension
Then ve una pantalla de login con:
  - Logo de MockMaster
  - Texto "Inicia sesion para usar la extension"
  - Boton "Iniciar sesion" que abre mockmaster.com/login en nueva tab
  And despues de que el usuario se loguea en la web
  And vuelve a la extension
  Then el sidebar detecta la sesion activa y muestra el estado autenticado
```

**Escenario 4: Usuario sin CV master subido**
```gherkin
Given que el usuario esta logueado en MockMaster
  And NO tiene un CV master subido (localStorage vacio)
When abre el sidebar en una pagina de aviso de LinkedIn
Then extrae la descripcion normalmente
  And en lugar del boton "Adaptar mi CV", muestra:
  - Mensaje: "Necesitas subir tu CV primero"
  - Boton "Subir CV" que abre mockmaster.com/upload en nueva tab
  And despues de subir el CV en la web, al volver al sidebar y refrescar,
  el boton "Adaptar mi CV" aparece habilitado
```

**Escenario 5: Limite de plan Free alcanzado**
```gherkin
Given que el usuario tiene plan Free
  And ya uso 5 adaptaciones este mes (limite alcanzado)
When intenta clickear "Adaptar mi CV" en el sidebar
Then el boton esta deshabilitado
  And muestra el mensaje "Alcanzaste el limite de 5 adaptaciones este mes"
  And muestra un boton "Actualizar a Pro" que abre la pagina de billing en nueva tab
  And no consume una adaptacion adicional
```

**Escenario 6: Descarga de PDF desde sidebar**
```gherkin
Given que el usuario tiene un CV adaptado en el sidebar
When hace click en el boton "Descargar PDF"
Then se abre un mini-selector de template (clean, modern, compact) inline
  And al seleccionar un template, se llama a /api/generate-pdf
  And el PDF se descarga automaticamente al directorio de descargas del usuario
  And muestra un toast "PDF descargado correctamente"
```

**Escenario 7: Adaptacion falla por error de API**
```gherkin
Given que el usuario hace click en "Adaptar mi CV"
  And la llamada a /api/adapt-resume falla con un error 500
When la extension recibe el error
Then muestra un mensaje de error amigable: "Hubo un error al adaptar tu CV. Intenta de nuevo."
  And muestra un boton "Reintentar"
  And no consume una adaptacion del limite mensual (el decremento ocurre post-exito)
```

**Escenario 8: Input manual de texto (pagina no soportada)**
```gherkin
Given que el usuario esta en una pagina que no es LinkedIn ni Indeed
  (por ejemplo, glassdoor.com o un email con un aviso)
When abre el sidebar
Then muestra el mensaje "Esta pagina no es compatible con la extraccion automatica"
  And muestra un textarea con placeholder "Pega la descripcion del trabajo aqui..."
  And un boton "Analizar" debajo del textarea
When el usuario pega texto y hace click en "Analizar"
Then se envia el texto a /api/analyze-job
  And continua el flujo normal de adaptacion
```

---

## 5. ARQUITECTURA TECNICA

### 5.1 Estructura del proyecto

```
extension/
  manifest.json                     # Manifest V3
  package.json                      # Build dependencies
  tsconfig.json                     # TypeScript config
  webpack.config.js                 # Bundle config (o vite/rollup)

  src/
    background/
      service-worker.ts             # Background service worker

    content-scripts/
      detector.ts                   # Detecta si la pagina es un aviso soportado
      linkedin-extractor.ts         # Extraccion DOM para LinkedIn
      indeed-extractor.ts           # Extraccion DOM para Indeed

    sidepanel/
      index.html                    # Entry point del Side Panel
      index.tsx                     # React root
      App.tsx                       # Main app con routing de estados

      components/
        LoginScreen.tsx             # Pantalla de autenticacion
        UnsupportedPage.tsx         # Pagina no soportada + input manual
        JobExtraction.tsx           # Muestra datos extraidos
        AdaptationProgress.tsx      # Spinner de adaptacion
        AdaptedResumeView.tsx       # CV adaptado con botones copiar
        CopyableSection.tsx         # Componente de seccion copiable
        ApplicationSaved.tsx        # Confirmacion de aplicacion guardada
        ErrorState.tsx              # Estado de error generico
        SubscriptionLimit.tsx       # Limite de plan alcanzado

      hooks/
        useAuth.ts                  # Hook de autenticacion con la web app
        useJobExtraction.ts         # Hook de extraccion de job description
        useAdaptation.ts            # Hook de adaptacion de CV
        useSubscription.ts          # Hook de estado de suscripcion
        useApplication.ts           # Hook de tracker de aplicaciones

      api/
        mockmaster-client.ts        # Cliente HTTP para la API de MockMaster

      styles/
        sidepanel.css               # Estilos del sidebar (Tailwind o CSS custom)

    shared/
      types.ts                      # Tipos compartidos (extension-specific)
      constants.ts                  # URLs, patterns, feature flags
      storage.ts                    # chrome.storage.local helpers

    assets/
      icons/
        icon-16.png
        icon-32.png
        icon-48.png
        icon-128.png
```

### 5.2 manifest.json

```json
{
  "manifest_version": 3,
  "name": "MockMaster - Adaptador de CV",
  "version": "1.0.0",
  "description": "Adapta tu CV a ofertas de LinkedIn e Indeed con IA, sin cambiar de pestana.",

  "permissions": [
    "sidePanel",
    "activeTab",
    "tabs",
    "storage",
    "clipboardWrite"
  ],

  "host_permissions": [
    "https://www.linkedin.com/jobs/*",
    "https://linkedin.com/jobs/*",
    "https://www.indeed.com/*",
    "https://indeed.com/*",
    "https://ar.indeed.com/*",
    "https://*.indeed.com/*"
  ],

  "background": {
    "service_worker": "background/service-worker.js",
    "type": "module"
  },

  "content_scripts": [
    {
      "matches": [
        "https://www.linkedin.com/jobs/view/*",
        "https://www.linkedin.com/jobs/search/*",
        "https://www.linkedin.com/jobs/collections/*"
      ],
      "js": ["content-scripts/linkedin-extractor.js"],
      "run_at": "document_idle"
    },
    {
      "matches": [
        "https://www.indeed.com/viewjob*",
        "https://www.indeed.com/rc/clk*",
        "https://www.indeed.com/jobs*",
        "https://ar.indeed.com/viewjob*",
        "https://ar.indeed.com/rc/clk*"
      ],
      "js": ["content-scripts/indeed-extractor.js"],
      "run_at": "document_idle"
    }
  ],

  "side_panel": {
    "default_path": "sidepanel/index.html"
  },

  "action": {
    "default_icon": {
      "16": "assets/icons/icon-16.png",
      "32": "assets/icons/icon-32.png",
      "48": "assets/icons/icon-48.png",
      "128": "assets/icons/icon-128.png"
    },
    "default_title": "MockMaster"
  },

  "icons": {
    "16": "assets/icons/icon-16.png",
    "32": "assets/icons/icon-32.png",
    "48": "assets/icons/icon-48.png",
    "128": "assets/icons/icon-128.png"
  },

  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### 5.3 Background Service Worker

Responsabilidades:
1. Detectar navegacion a paginas soportadas y actualizar el badge del icono
2. Gestionar la comunicacion entre content scripts y el sidebar via `chrome.runtime.onMessage`
3. Abrir el Side Panel cuando el usuario hace click en el icono
4. Cachear sesion de autenticacion

```typescript
// background/service-worker.ts (pseudocodigo estructural)

// Abrir side panel al clickear el icono
chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ tabId: tab.id });
});

// Habilitar side panel solo en paginas soportadas (o globalmente)
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Escuchar mensajes de content scripts y side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'EXTRACT_JOB':
      // Reenviar solicitud de extraccion al content script de la tab activa
      break;
    case 'JOB_EXTRACTED':
      // Reenviar datos extraidos al side panel
      break;
    case 'CAPTURE_SCREENSHOT':
      // Capturar screenshot para fallback Vision
      chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 80 }, (dataUrl) => {
        sendResponse({ screenshot: dataUrl });
      });
      return true; // Indica que sendResponse se llamara de forma asincrona
    case 'CHECK_AUTH':
      // Verificar si hay sesion activa
      break;
    case 'GET_TAB_URL':
      // Retornar URL de la tab activa
      break;
  }
});

// Detectar navegacion y actualizar badge
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const isSupported = isJobListingPage(tab.url);
    chrome.action.setBadgeText({
      tabId,
      text: isSupported ? '' : ''
    });
    // Cambiar icono a color vs gris segun si la pagina es soportada
    chrome.action.setIcon({
      tabId,
      path: isSupported
        ? { 16: 'assets/icons/icon-16.png', 32: 'assets/icons/icon-32.png' }
        : { 16: 'assets/icons/icon-16-gray.png', 32: 'assets/icons/icon-32-gray.png' }
    });
  }
});

function isJobListingPage(url: string): boolean {
  const patterns = [
    /linkedin\.com\/jobs\/view\//,
    /linkedin\.com\/jobs\/search\//,
    /linkedin\.com\/jobs\/collections\//,
    /indeed\.com\/viewjob/,
    /indeed\.com\/rc\/clk/,
    /indeed\.com\/jobs/,
  ];
  return patterns.some(p => p.test(url));
}
```

### 5.4 Content Scripts (Extractores)

**linkedin-extractor.ts:**
```typescript
// Escuchar mensajes del background/sidebar pidiendo extraccion
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXTRACT_JOB') {
    try {
      const data = extractLinkedInJob();
      sendResponse({ success: true, data });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }
  return true;
});

function extractLinkedInJob(): ExtractedJobData {
  // Expandir descripcion si esta colapsada
  const showMoreBtn = document.querySelector('.jobs-description__footer-button');
  if (showMoreBtn) {
    (showMoreBtn as HTMLElement).click();
    // Nota: el sidebar deberia esperar ~500ms y re-pedir extraccion
  }

  const title = getTextContent([
    '.job-details-jobs-unified-top-card__job-title',
    'h1.t-24',
    '.topcard__title',
  ]);

  const company = getTextContent([
    '.job-details-jobs-unified-top-card__company-name',
    '.topcard__org-name-link',
  ]);

  const location = getTextContent([
    '.job-details-jobs-unified-top-card__bullet',
    '.topcard__flavor--bullet',
  ]);

  const description = getTextContent([
    '.jobs-description-content__text',
    '#job-details',
    '.jobs-box__html-content',
  ]);

  const salary = getTextContent([
    '.salary-main-rail__salary-range',
    '.compensation__salary',
  ]);

  return {
    source: 'linkedin',
    url: window.location.href,
    title: title || 'Sin titulo',
    company: company || 'Sin empresa',
    location: location || '',
    salary: salary || null,
    modality: detectModality(document.body.innerText),
    description: description,
    requirements: '',
    benefits: null,
    extracted_at: new Date().toISOString(),
    extraction_method: 'dom',
    raw_text: [title, company, location, description].filter(Boolean).join('\n\n'),
  };
}

function getTextContent(selectors: string[]): string {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent?.trim()) {
      return el.textContent.trim();
    }
  }
  return '';
}

function detectModality(text: string): 'remote' | 'hybrid' | 'onsite' | null {
  const lower = text.toLowerCase();
  if (lower.includes('remote') || lower.includes('remoto')) return 'remote';
  if (lower.includes('hybrid') || lower.includes('hibrido')) return 'hybrid';
  if (lower.includes('on-site') || lower.includes('presencial')) return 'onsite';
  return null;
}
```

**indeed-extractor.ts:** Misma estructura pero con selectores de Indeed (detallados en F-EXT-001).

### 5.5 Comunicacion con API de MockMaster

La extension se comunica con la API existente de MockMaster a traves de fetch requests directos. El dominio base es configurable via constante.

```typescript
// sidepanel/api/mockmaster-client.ts

const API_BASE = 'https://mockmaster.vercel.app'; // O variable de entorno en build

class MockMasterClient {
  private accessToken: string | null = null;

  setToken(token: string) {
    this.accessToken = token;
  }

  private async request(path: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new MockMasterAPIError(error.error, error.code, response.status);
    }

    return response;
  }

  // REUTILIZA endpoints existentes
  async analyzeJob(text: string) {
    const res = await this.request('/api/analyze-job', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    return res.json();
  }

  async adaptResume(resume: ResumeData, jobAnalysis: JobAnalysis) {
    const res = await this.request('/api/adapt-resume', {
      method: 'POST',
      body: JSON.stringify({ resume, jobAnalysis }),
    });
    return res.json();
  }

  async getSubscriptionStatus() {
    const res = await this.request('/api/subscriptions/status');
    return res.json();
  }

  async calculateATSBreakdown(adapted_content: AdaptedContent, job_analysis: JobAnalysis) {
    const res = await this.request('/api/calculate-ats-breakdown', {
      method: 'POST',
      body: JSON.stringify({ adapted_content, job_analysis }),
    });
    return res.json();
  }

  async generatePDF(adapted_content: AdaptedContent, template: string, company_name: string) {
    const res = await this.request('/api/generate-pdf', {
      method: 'POST',
      body: JSON.stringify({ adapted_content, template, company_name }),
    });
    return res.blob();
  }

  // NUEVO endpoint para extraccion por Vision
  async extractJobVision(screenshot_base64: string, source: string, url: string) {
    const res = await this.request('/api/extract-job-vision', {
      method: 'POST',
      body: JSON.stringify({ screenshot_base64, source, url }),
    });
    return res.json();
  }

  // NUEVOS endpoints para Application Tracker
  async createApplication(data: CreateApplicationRequest) {
    const res = await this.request('/api/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async getApplications(params?: ApplicationQueryParams) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await this.request(`/api/applications?${query}`);
    return res.json();
  }

  async checkApplicationExists(jobUrl: string) {
    const res = await this.request(`/api/applications?job_url=${encodeURIComponent(jobUrl)}&limit=1`);
    const data = await res.json();
    return data.applications.length > 0 ? data.applications[0] : null;
  }
}

export const apiClient = new MockMasterClient();
```

### 5.6 Autenticacion en la Extension

La extension necesita acceso al token de sesion de Supabase Auth del usuario. Hay dos estrategias:

**Estrategia elegida: Token relay via cookies compartidas**

Supabase Auth en la web app almacena el session token en cookies del dominio `mockmaster.vercel.app`. La extension puede:

1. **Opcion A (preferida): Leer cookies del dominio MockMaster**
   - Requiere permiso `cookies` en manifest y `host_permissions` para el dominio de la web app
   - El background service worker lee las cookies `sb-*-auth-token` del dominio
   - Extrae el access_token y lo usa en los headers de las API calls

2. **Opcion B (fallback): Login redirect flow**
   - La extension abre `mockmaster.vercel.app/auth/extension-callback` en una nueva tab
   - El usuario se loguea (o ya esta logueado)
   - La web app redirige a un scheme custom que la extension intercepta
   - La extension almacena el token en `chrome.storage.local`

**Implementacion (Opcion A):**

Agregar al manifest.json:
```json
{
  "permissions": ["cookies"],
  "host_permissions": [
    "https://mockmaster.vercel.app/*"
  ]
}
```

```typescript
// background/auth.ts

async function getSupabaseSession(): Promise<string | null> {
  const cookies = await chrome.cookies.getAll({
    domain: 'mockmaster.vercel.app',
  });

  // Supabase stores session in cookies named sb-{project-ref}-auth-token
  const authCookie = cookies.find(c => c.name.includes('auth-token'));

  if (!authCookie) return null;

  try {
    // El valor de la cookie es el session object JSON
    const session = JSON.parse(decodeURIComponent(authCookie.value));
    return session.access_token;
  } catch {
    return null;
  }
}

// Verificar sesion periodicamente
setInterval(async () => {
  const token = await getSupabaseSession();
  if (token) {
    // Almacenar en chrome.storage para acceso rapido del sidebar
    chrome.storage.local.set({ auth_token: token });
  } else {
    chrome.storage.local.remove('auth_token');
  }
}, 60000); // Cada minuto
```

**Nuevo endpoint necesario en la web app:** `GET /api/auth/extension-verify`

```typescript
// Verifica que el token es valido y retorna datos basicos del usuario
// Response:
{
  authenticated: true,
  user: {
    id: string,
    email: string,
    name: string,
  },
  has_resume: boolean,  // Si tiene CV en localStorage (check via API no posible, ver nota)
}
```

**Nota sobre el CV master:** El CV master se almacena actualmente en `localStorage` del navegador en el dominio de MockMaster. La extension NO puede acceder al localStorage de otro dominio. Soluciones:

1. **Fase 1 (MVP):** La extension llama a un nuevo endpoint `/api/user/resume` que retorna el CV parseado. Esto requiere que el CV se guarde tambien en Supabase (nueva tabla o campo en user profile). Alternativamente, el usuario debe tener la web app abierta en algun tab y la extension comunica con ella via `chrome.runtime.sendMessage` al content script inyectado en la web app.

2. **Solucion recomendada:** Crear un endpoint `/api/user/resume` con POST (guardar) y GET (obtener) que almacene el CV parseado en Supabase. Esto ademas resuelve el problema existente de que el CV se pierde al limpiar localStorage.

**Nuevo endpoint: POST/GET `/api/user/resume`**

```sql
-- Tabla para persistir CVs (tambien beneficia a la web app)
CREATE TABLE IF NOT EXISTS user_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  original_text TEXT NOT NULL,
  parsed_content JSONB NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)  -- Un CV master por usuario (V1)
);

ALTER TABLE user_resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own resume"
ON user_resumes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own resume"
ON user_resumes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resume"
ON user_resumes FOR UPDATE
USING (auth.uid() = user_id);
```

```typescript
// GET /api/user/resume - Obtener CV del usuario
// Response 200: { resume: ResumeData } o { resume: null }

// POST /api/user/resume - Guardar/actualizar CV
// Request: { name, original_text, parsed_content, uploaded_at }
// Response 201: { resume: ResumeData }
```

### 5.7 Resumen de endpoints

**Endpoints EXISTENTES reutilizados:**

| Endpoint | Metodo | Uso en extension |
|----------|--------|-----------------|
| `/api/analyze-job` | POST | Analizar la descripcion extraida |
| `/api/adapt-resume` | POST | Adaptar el CV master al trabajo |
| `/api/calculate-ats-breakdown` | POST | Calcular score ATS detallado |
| `/api/generate-pdf` | POST | Generar y descargar PDF |
| `/api/subscriptions/status` | GET | Verificar plan y limite de adaptaciones |

**Endpoints NUEVOS necesarios:**

| Endpoint | Metodo | Proposito | Prioridad |
|----------|--------|-----------|-----------|
| `/api/extract-job-vision` | POST | Extraccion por screenshot con Claude Vision | P0 |
| `/api/user/resume` | GET | Obtener CV master del usuario | P0 |
| `/api/user/resume` | POST | Guardar CV master en Supabase | P0 |
| `/api/auth/extension-verify` | GET | Verificar sesion para extension | P0 |
| `/api/applications` | POST | Crear aplicacion en tracker | P0 |
| `/api/applications` | GET | Listar aplicaciones del usuario | P0 |
| `/api/applications/[id]` | PATCH | Actualizar status/notas | P0 |
| `/api/applications/[id]` | DELETE | Eliminar aplicacion | P1 |

### 5.8 Cambios necesarios en endpoints existentes

**`/api/adapt-resume`:** Necesita aceptar autenticacion via header `Authorization: Bearer {token}` ademas de cookies. Actualmente usa `createClient()` de Supabase server que lee cookies. Para la extension, debe soportar ambos metodos.

Cambio requerido:
```typescript
// En /api/adapt-resume/route.ts
// Actualizar la funcion de autenticacion para soportar Bearer token

export async function POST(request: NextRequest) {
  // Intentar auth por cookie (web app)
  let supabase = await createClient();
  let { data: { user } } = await supabase.auth.getUser();

  // Si no hay usuario por cookie, intentar por Bearer token (extension)
  if (!user) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { data: { user: tokenUser } } = await supabase.auth.getUser(token);
      user = tokenUser;
    }
  }

  // ... resto del codigo
}
```

Este cambio debe aplicarse a TODOS los endpoints que la extension consume: `analyze-job`, `adapt-resume`, `calculate-ats-breakdown`, `generate-pdf`, `subscriptions/status`.

**Patron recomendado:** Extraer la logica de autenticacion a un helper reutilizable:

```typescript
// lib/auth-helper.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function getAuthenticatedUser(request: NextRequest) {
  // 1. Intentar por cookie (web app)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) return { user, supabase };

  // 2. Intentar por Bearer token (extension)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } }
      }
    );
    const { data: { user: tokenUser } } = await serviceClient.auth.getUser(token);
    if (tokenUser) return { user: tokenUser, supabase: serviceClient };
  }

  return { user: null, supabase };
}
```

### 5.9 CORS y seguridad

La extension hace requests desde un origen `chrome-extension://{extension-id}`. Los endpoints de Next.js necesitan aceptar este origen.

**Cambio en `next.config.ts`:**
```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // En produccion, restringir al extension ID especifico
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PATCH, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};
```

**Consideraciones de seguridad:**
- El `Access-Control-Allow-Origin: *` es necesario para que la extension pueda hacer requests. En produccion, se puede restringir al `chrome-extension://{static-extension-id}` si la extension se publica en Chrome Web Store (el ID es fijo).
- Todos los endpoints validan autenticacion via Supabase Auth, por lo que el CORS abierto no expone datos sin token.
- Rate limiting deberia implementarse a nivel de Vercel o con middleware custom.

---

## 6. PRIORIZACION RICE

| ID | Feature | Prioridad | RICE Score | Reach | Impact | Confidence | Effort (dias) | Dependencias |
|----|---------|-----------|------------|-------|--------|------------|---------------|--------------|
| F-EXT-001 | Extraccion Job Description (Hibrida) | P0 | **100** | 100% | 3 | 100% | 3d | - |
| F-EXT-003 | Chrome Extension Sidebar UI | P0 | **57** | 100% | 3 | 95% | 5d | F-EXT-001 |
| F-EXT-004 | Persistencia CV en Supabase (endpoint /api/user/resume) | P0 | **80** | 100% | 2 | 100% | 1.5d | - |
| F-EXT-005 | Auth en Extension (cookie relay + Bearer token) | P0 | **60** | 100% | 3 | 80% | 2d | - |
| F-EXT-006 | Botones Copiar por Seccion | P0 | **90** | 90% | 3 | 100% | 1d | F-EXT-003 |
| F-EXT-007 | CORS + Auth Helper para endpoints existentes | P0 | **133** | 100% | 2 | 100% | 1.5d | - |
| F-EXT-008 | Endpoint Vision Fallback | P0 | **48** | 100% | 2 | 80% | 2d | F-EXT-001 |
| F-EXT-002 | Application Tracker (DB + API + Dashboard) | P0 | **36** | 80% | 2 | 90% | 4d | F-EXT-005 |
| F-EXT-009 | Descarga PDF desde Sidebar | P1 | **30** | 70% | 1 | 100% | 1d | F-EXT-003 |
| F-EXT-010 | Input Manual de Texto (pagina no soportada) | P1 | **24** | 40% | 1 | 100% | 0.5d | F-EXT-003 |

### Criterios de prioridad:
- **P0 (Must Have):** Sin esto la extension no funciona o no se diferencia de copiar-pegar manualmente
- **P1 (Should Have):** Mejora la experiencia pero la extension es usable sin esto

### Fuera de alcance V1:

- Soporte para Glassdoor, ZipRecruiter u otros job boards - Razon: Reducir complejidad, LinkedIn e Indeed cubren 80%+ del mercado
- Edicion inline del CV adaptado en el sidebar - Razon: Complejidad de UI alta, la web app ya lo tiene
- Notificaciones push de nuevos avisos - Razon: Feature completamente diferente, no core
- Exportar tracker a CSV/Excel - Razon: V1.1, no critico para MVP
- Modo offline - Razon: La adaptacion requiere Claude API, no es posible sin conexion
- Soporte para Firefox/Safari - Razon: Chrome domina el mercado de extensiones, otros navegadores en V2
- Auto-fill de formularios de aplicacion - Razon: Alto riesgo de rotura, complejidad extrema
- Integracion con calendarios para trackear entrevistas - Razon: Feature de V2

---

## 7. ROADMAP POR FASES (OPTIMIZADO PARA EJECUCION PARALELA)

Cada fase se divide en **ciclos de tareas paralelas (tracks)**. Las tareas dentro de un mismo ciclo son independientes y pueden ejecutarse simultaneamente por multiples agentes. Los ciclos son secuenciales (el ciclo 2 depende de que el ciclo 1 este completo).

---

### Fase 1: Extension Shell + Extraccion + Auth

**Objetivo:** Extension instalable que extrae job descriptions y se autentica con MockMaster.

#### Ciclo 1.1 — Infraestructura base (sin dependencias entre si)

| Track | Tarea | Feature | Entregable | Depende de |
|-------|-------|---------|------------|------------|
| **A** | Setup proyecto extension (manifest.json, webpack/vite, estructura carpetas, build script) | F-EXT-003 | Extension esqueleto carga en Chrome | Nada |
| **B** | Auth helper + CORS en endpoints existentes del backend Next.js | F-EXT-007 | Endpoints aceptan Bearer token desde extension | Nada |
| **C** | Endpoint POST/GET `/api/user/resume` + migracion SQL | F-EXT-004 | CV se persiste en Supabase (no depende de localStorage) | Nada |

> **Agentes en paralelo: 3** — Los 3 tracks son 100% independientes.

#### Ciclo 1.2 — Extraccion + Service Worker (depende de Ciclo 1.1)

| Track | Tarea | Feature | Entregable | Depende de |
|-------|-------|---------|------------|------------|
| **D** | Content script LinkedIn extractor (selectores DOM, parsing, fallback) | F-EXT-001 | Extraccion DOM funcional en LinkedIn | Track A (estructura extension) |
| **E** | Content script Indeed extractor (selectores DOM, parsing, fallback) | F-EXT-001 | Extraccion DOM funcional en Indeed | Track A (estructura extension) |
| **F** | Background service worker + deteccion de pagina + badge icon | F-EXT-003 | Side Panel se activa en paginas soportadas | Track A (estructura extension) |
| **G** | Auth en extension — cookie relay + token storage | F-EXT-005 | Extension detecta sesion del usuario | Track A + Track B (estructura + CORS/auth) |

> **Agentes en paralelo: 4** — D, E, F son independientes entre si (solo necesitan Track A). G necesita A+B.
> **Estrategia:** Lanzar D, E, F en paralelo inmediatamente. Lanzar G cuando B complete (o en paralelo si B es rapido).

#### Ciclo 1.3 — UI Sidebar + Vision Fallback (depende de Ciclo 1.2)

| Track | Tarea | Feature | Entregable | Depende de |
|-------|-------|---------|------------|------------|
| **H** | Sidebar UI: LoginScreen + JobExtractionView (muestra datos extraidos) | F-EXT-003 | Sidebar renderiza job data o pide login | Tracks D/E (extractores) + G (auth) |
| **I** | Endpoint `/api/extract-job-vision` (screenshot + Claude Vision fallback) | F-EXT-008 | Fallback Vision funcional para paginas con extraccion parcial | Track B (auth helper) |

> **Agentes en paralelo: 2** — H e I son independientes entre si.

#### Ciclo 1.4 — Integracion y testing

| Track | Tarea | Feature | Entregable | Depende de |
|-------|-------|---------|------------|------------|
| **J** | Testing end-to-end Fase 1: instalar extension, login, extraer en LinkedIn, extraer en Indeed, fallback Vision | ALL | Demo funcional completa de Fase 1 | Todos los tracks anteriores |

> **Agentes: 1** — Integracion secuencial.

**Criterio de exit Fase 1:** La extension se instala, detecta paginas de LinkedIn/Indeed, extrae la descripcion del trabajo (con fallback Vision), y el usuario esta autenticado.

---

### Fase 2: Adaptacion de CV en Sidebar + Copiar por Seccion

**Objetivo:** El flujo completo de adaptacion funciona dentro del sidebar.

#### Ciclo 2.1 — Hooks + Componentes base (sin dependencias entre si)

| Track | Tarea | Feature | Entregable | Depende de |
|-------|-------|---------|------------|------------|
| **K** | Hook `useAdaptation` (llama a `/api/adapt-resume` + `/api/calculate-ats-breakdown`) | F-EXT-003 | Adaptacion funcional desde extension | Fase 1 completa |
| **L** | Hook `useSubscription` (llama a `/api/subscriptions/status`, verifica limites) | F-EXT-003 | Verificacion de limites Free/Pro en extension | Fase 1 completa |
| **M** | Componente `CopyableSection` + clipboard API (copiar seccion individual) | F-EXT-006 | Componente reutilizable de copia al clipboard | Fase 1 completa |
| **N** | Input manual de texto fallback (textarea para paginas no soportadas) | F-EXT-010 | Paginas no soportadas pueden ingresar texto manual | Fase 1 completa |

> **Agentes en paralelo: 4** — Todos independientes, solo necesitan Fase 1.

#### Ciclo 2.2 — UI completa del sidebar (depende de Ciclo 2.1)

| Track | Tarea | Feature | Entregable | Depende de |
|-------|-------|---------|------------|------------|
| **O** | Sidebar UI: AdaptationProgress + AdaptedResumeView con CopyableSections | F-EXT-003 | Vista completa de CV adaptado con botones copiar por seccion | Tracks K + M (hook + componente) |
| **P** | Descarga PDF desde sidebar (boton + llamada a `/api/generate-pdf`) | F-EXT-009 | PDF descargable desde sidebar | Track K (hook adaptacion) |
| **Q** | ATS Score display en sidebar (reutilizar ATSScoreDisplay existente) | F-EXT-003 | Score visible con breakdown en sidebar | Track K (hook adaptacion) |

> **Agentes en paralelo: 3** — O necesita K+M. P y Q solo necesitan K, asi que pueden arrancar apenas K complete.

#### Ciclo 2.3 — Polish + Error handling

| Track | Tarea | Feature | Entregable | Depende de |
|-------|-------|---------|------------|------------|
| **R** | Error states, loading states, edge cases (sin CV, sin auth, limite alcanzado, extraccion fallida) | ALL | Todos los estados de error cubiertos | Ciclo 2.2 |
| **S** | Testing end-to-end Fase 2 | ALL | Demo completa: extraer + adaptar + copiar + PDF | Ciclo 2.2 |

> **Agentes en paralelo: 2** — R y S pueden correr en paralelo.

**Criterio de exit Fase 2:** El usuario puede abrir sidebar en LinkedIn, ver la extraccion, adaptar CV, copiar secciones al clipboard, y descargar PDF.

---

### Fase 3: Application Tracker + Dashboard Web

**Objetivo:** Tracker de aplicaciones funcional con dashboard en la web app.

#### Ciclo 3.1 — Backend + Sidebar button (sin dependencias entre si)

| Track | Tarea | Feature | Entregable | Depende de |
|-------|-------|---------|------------|------------|
| **T** | Migracion SQL: tabla `applications` + RLS policies + indexes | F-EXT-002 | Tabla creada en Supabase | Fase 2 completa |
| **U** | API endpoints `/api/applications` (POST, GET, PATCH, DELETE) + deteccion duplicados | F-EXT-002 | CRUD funcional con validacion | Track T (tabla SQL) |

> **Agentes: 2 secuenciales** — U depende de T. Pero T es rapido (solo SQL), asi que se puede hacer T primero y lanzar U inmediatamente.

#### Ciclo 3.2 — UI Extension + UI Web (sin dependencias entre si)

| Track | Tarea | Feature | Entregable | Depende de |
|-------|-------|---------|------------|------------|
| **V** | Boton "Guardar Aplicacion" en sidebar + confirmacion + feedback | F-EXT-002 | Guarda aplicacion con 1 click desde sidebar | Track U (API endpoints) |
| **W** | Pagina web `/applications` — lista, filtros por status, busqueda | F-EXT-002 | Dashboard basico funcional en web app | Track U (API endpoints) |

> **Agentes en paralelo: 2** — V (extension) y W (web app) son 100% independientes, ambos solo llaman a la misma API.

#### Ciclo 3.3 — Enriquecimiento dashboard (sin dependencias entre si)

| Track | Tarea | Feature | Entregable | Depende de |
|-------|-------|---------|------------|------------|
| **X** | Cambio de status dropdown + notas por aplicacion | F-EXT-002 | Flujo de estados funcional con notas | Track W (pagina basica) |
| **Y** | Stats bar (totales por status, aplicaciones esta semana, tasa de respuesta) | F-EXT-002 | Metricas visibles en dashboard | Track W (pagina basica) |
| **Z** | Detalle expandible por aplicacion (CV usado, ATS score, fecha, link) | F-EXT-002 | Vista detallada de cada aplicacion | Track W (pagina basica) |

> **Agentes en paralelo: 3** — X, Y, Z son independientes, todos extienden la pagina base W.

#### Ciclo 3.4 — Testing final + publicacion

| Track | Tarea | Feature | Entregable | Depende de |
|-------|-------|---------|------------|------------|
| **AA** | Testing end-to-end completo (3 fases): extraer → adaptar → copiar → guardar → dashboard | ALL | Extension completa verificada | Todos los ciclos anteriores |
| **AB** | Preparacion Chrome Web Store: assets, descripcion, screenshots, privacy policy | ALL | Paquete listo para publicar | Todos los ciclos anteriores |

> **Agentes en paralelo: 2** — AA y AB son independientes.

**Criterio de exit Fase 3:** El flujo completo funciona: extraer → adaptar → copiar → guardar aplicacion. El dashboard web muestra todas las aplicaciones con filtros y estados.

---

### Resumen de paralelismo por fase

| Fase | Ciclos | Max agentes en paralelo | Tracks totales |
|------|--------|------------------------|----------------|
| Fase 1 | 4 ciclos | Hasta 4 simultaneos (Ciclo 1.2) | 10 tracks (A-J) |
| Fase 2 | 3 ciclos | Hasta 4 simultaneos (Ciclo 2.1) | 9 tracks (K-S) |
| Fase 3 | 4 ciclos | Hasta 3 simultaneos (Ciclos 3.2, 3.3) | 9 tracks (T-AB) |
| **Total** | **11 ciclos** | **Max 4 agentes simultaneos** | **28 tracks** |

### Grafo de dependencias

```
FASE 1:
  Ciclo 1.1:  [A] [B] [C]           ← 3 en paralelo
                |   |   |
  Ciclo 1.2:  [D] [E] [F] [G]      ← 4 en paralelo (G espera A+B)
                |   |   |   |
  Ciclo 1.3:  [H]         [I]       ← 2 en paralelo
                |           |
  Ciclo 1.4:  [J]                    ← 1 (integracion)

FASE 2:
  Ciclo 2.1:  [K] [L] [M] [N]      ← 4 en paralelo
                |       |
  Ciclo 2.2:  [O]  [P]  [Q]        ← 3 en paralelo
                |    |    |
  Ciclo 2.3:  [R]  [S]              ← 2 en paralelo

FASE 3:
  Ciclo 3.1:  [T] → [U]             ← secuencial (SQL → API)
                      |
  Ciclo 3.2:  [V]   [W]             ← 2 en paralelo
                      |
  Ciclo 3.3:  [X] [Y] [Z]          ← 3 en paralelo
                |   |   |
  Ciclo 3.4:  [AA] [AB]             ← 2 en paralelo
```

### Instrucciones para ejecucion con Claude Code

Al ejecutar con `/build-feature`, lanzar los tracks de cada ciclo como **agentes paralelos** usando el Task tool con multiples invocaciones en un mismo mensaje. Esperar a que completen todos los tracks del ciclo antes de avanzar al siguiente ciclo. Ejemplo:

```
Ciclo 1.1 → Lanzar 3 agentes (Track A, B, C) en paralelo
  Esperar completacion de los 3
Ciclo 1.2 → Lanzar 4 agentes (Track D, E, F, G) en paralelo
  Esperar completacion de los 4
...
```

---

## 8. DEPENDENCIAS

### Dependencias con features existentes de MockMaster

| Feature Extension | Depende de (Web App) | Tipo de dependencia | Riesgo |
|-------------------|---------------------|---------------------|--------|
| Adaptacion en sidebar | `/api/adapt-resume` (F-004) | Reutiliza endpoint | Bajo - endpoint probado y estable |
| Analisis de job | `/api/analyze-job` (F-003) | Reutiliza endpoint | Bajo - endpoint probado y estable |
| Score ATS | `/api/calculate-ats-breakdown` (F-005) | Reutiliza endpoint | Bajo |
| Descarga PDF | `/api/generate-pdf` (F-006) | Reutiliza endpoint | Bajo |
| Limites de plan | `/api/subscriptions/status` (F-009) | Reutiliza endpoint | Bajo |
| Auth | Supabase Auth (F-001) | Sesion compartida | Medio - cookies cross-domain necesitan testing |
| CV master | localStorage (F-002) | REQUIERE MIGRACION | Alto - necesita nuevo endpoint /api/user/resume |

### Dependencias con APIs externas

| API | Proposito | Complejidad | Costo estimado | Riesgo |
|-----|-----------|-------------|----------------|--------|
| Claude API (Anthropic) | Adaptacion CV, Analisis job, Vision fallback | Ya integrado | ~$0.01-0.03 por adaptacion, ~$0.05-0.15 por Vision call | Bajo (ya en uso) |
| Chrome Side Panel API | UI del sidebar | Media | Gratis | Medio (API relativamente nueva, Chrome 114+) |
| Chrome Extensions API | Content scripts, storage, cookies | Media | Gratis | Bajo (API madura) |
| Supabase | Auth, DB, RLS | Ya integrado | Dentro del plan actual | Bajo |

### Dependencias tecnicas

| Tecnologia | Version minima | Razon |
|------------|---------------|-------|
| Chrome | 114+ | Side Panel API |
| Manifest V3 | V3 | Requerido por Chrome para nuevas extensiones |
| Node.js | 18+ | Build tools de la extension |
| Webpack/Vite | Latest | Bundling de TypeScript + React para extension |

---

## 9. RIESGOS Y MITIGACIONES

### RIESGO ALTO

**R1: Cambios de DOM en LinkedIn/Indeed que rompen la extraccion**
- **Probabilidad:** 70% (LinkedIn cambia su DOM cada 2-4 meses)
- **Impacto:** La extraccion DOM falla, usuarios ven errores
- **Mitigacion 1:** Fallback automatico a Vision API cuando DOM falla (ya diseado en F-EXT-001)
- **Mitigacion 2:** Multiples selectores alternativos por cada campo (cascading selectors)
- **Mitigacion 3:** Monitoreo de tasa de exito de extraccion. Si cae debajo del 80%, alerta inmediata
- **Mitigacion 4:** Desacoplar selectores en un archivo de configuracion (no hardcoded) que se pueda actualizar sin nueva version de la extension via remote config
- **Owner:** Dev (monitoreo), PM (decision de priorizar fix)

**R2: Rechazo en Chrome Web Store review**
- **Probabilidad:** 40% (review es estricto con permisos)
- **Impacto:** No se puede distribuir la extension
- **Mitigacion 1:** Justificar cada permiso en la descripcion del listing (sidePanel, activeTab, cookies)
- **Mitigacion 2:** Minimizar permisos al absoluto minimo
- **Mitigacion 3:** Preparar documentacion de privacy policy explicando que datos se acceden y por que
- **Mitigacion 4:** Si rechazan `cookies` permission, usar Opcion B (login redirect flow) como fallback de auth
- **Owner:** PM (documentacion), Dev (implementar alternativas)

**R3: Costo de Claude Vision API en fallback**
- **Probabilidad:** 30% (depende de tasa de fallback)
- **Impacto:** Costos inesperados si muchos usuarios caen al fallback
- **Mitigacion 1:** Rate limit de 10 Vision calls por usuario por hora
- **Mitigacion 2:** Cachear resultados de Vision por URL (24 horas)
- **Mitigacion 3:** Optimizar imagen: JPEG quality 80%, max 1280x720
- **Mitigacion 4:** Monitoreo diario de costos de Vision con alertas
- **Calculo:** Si 15% de extracciones usan Vision y hay 100 usuarios activos con 5 extracciones/dia: 100 x 5 x 0.15 = 75 Vision calls/dia x $0.10 = $7.50/dia = $225/mes. Aceptable.
- **Owner:** PM (monitoreo de costos), Dev (rate limiting)

### RIESGO MEDIO

**R4: Compartir sesion entre web app y extension**
- **Probabilidad:** 30%
- **Impacto:** Usuarios no pueden usar la extension sin re-loguearse
- **Mitigacion 1:** Implementar ambas estrategias de auth (cookies + redirect flow)
- **Mitigacion 2:** Si cookies no funciona por SameSite restrictions, el redirect flow es backup confiable
- **Mitigacion 3:** Probar en Chrome canary y beta channels
- **Owner:** Dev

**R5: CV master solo en localStorage (no accesible desde extension)**
- **Probabilidad:** 100% (es un hecho, no un riesgo)
- **Impacto:** La extension no puede acceder al CV sin migracion
- **Mitigacion:** Implementar `/api/user/resume` que persiste CV en Supabase (F-EXT-004). Esto tambien beneficia a la web app (CV no se pierde al limpiar cache).
- **Owner:** Dev (Fase 1)

**R6: Rate limiting de API en Anthropic**
- **Probabilidad:** 20% (depende de la escala)
- **Impacto:** Adaptaciones fallan temporalmente
- **Mitigacion 1:** Retry con backoff exponencial (3 intentos)
- **Mitigacion 2:** Mostrar mensaje amigable al usuario: "Nuestro servicio esta ocupado, intenta en unos segundos"
- **Mitigacion 3:** El rate limit de Anthropic actual es generoso (1000 req/min en tier 2)
- **Owner:** Dev

### RIESGO BAJO

**R7: Chrome depreca Side Panel API**
- **Probabilidad:** 5% (Google la lanzo recientemente y la esta promoviendo)
- **Impacto:** Tendriamos que migrar a popup o standalone page
- **Mitigacion:** Monitorear Chrome Platform Status para deprecation notices
- **Owner:** PM

**R8: LinkedIn/Indeed bloquean content scripts**
- **Probabilidad:** 10% (no tienen incentivo para hacerlo)
- **Impacto:** Extraccion DOM deja de funcionar
- **Mitigacion:** Fallback a Vision API cubre este escenario completamente
- **Owner:** Dev

---

## 10. METRICAS DE EXITO

### Objetivo: Validar que la extension agrega valor real sobre la web app

**North Star Metric:**
**"Adaptaciones completadas desde la extension por semana"** - Target: 200+ por semana (mes 2)
(Indica que los usuarios prefieren el flujo de la extension al de la web app)

### Key Results:

**KR1: Instalaciones - 500 instalaciones en el primer mes**
- **Benchmark:** Extension de nicho en Chrome Web Store con audiencia existente: 200-1000 instalaciones mes 1 (source: Chrome Web Store Developer insights 2024)
- **Como medir:** Chrome Web Store dashboard + analytics event "extension_installed"
- **Criterio de exito:** 500 instalaciones activas (no uninstalls)

**KR2: Tasa de extraccion exitosa > 95%**
- **Benchmark:** Content scripts bien implementados logran 90-98% de exito (source: web scraping industry standard)
- **Definicion:** Extraccion exitosa = descripcion con >50 caracteres obtenida (DOM o Vision)
- **Como medir:** Evento "extraction_success" vs "extraction_fallback" vs "extraction_failed"
- **Criterio de exito:** >95% exito total (DOM + Vision combinados)

**KR3: Uso de botones "Copiar seccion" > 3 secciones por sesion**
- **Benchmark:** No hay benchmark directo. Baseline = usuarios que no copian nada (PDF only)
- **Definicion:** Promedio de secciones copiadas por sesion de adaptacion
- **Como medir:** Evento "section_copied" con label (summary, experience, education, skills, languages)
- **Criterio de exito:** Promedio > 3 secciones copiadas por adaptacion

**KR4: Aplicaciones guardadas en tracker > 5 por usuario por semana**
- **Benchmark:** Usuarios activos de job search aplican a 5-15 posiciones/semana (source: LinkedIn Workforce Report 2024)
- **Definicion:** Promedio de registros creados en tabla `applications` por usuario activo por semana
- **Como medir:** Query SQL: `COUNT(applications) / COUNT(DISTINCT user_id) WHERE applied_at > now() - interval '7 days'`
- **Criterio de exito:** Promedio > 5 por semana

**KR5: Retencion D7 de la extension > 40%**
- **Benchmark:** Extension de productividad D7 retention: 25-45% (source: Amplitude Retention Report 2024)
- **Definicion:** % de usuarios que instalan la extension y la usan al menos una vez en los dias 1-7
- **Como medir:** Cohort analysis de "extension_installed" vs "adaptation_completed" en ventana de 7 dias
- **Criterio de exito:** >40% D7 retention

**KR6: Conversion a Pro desde extension > 5%**
- **Benchmark:** Freemium conversion rate SaaS: 2-5% (source: OpenView 2024 SaaS Benchmarks)
- **Definicion:** % de usuarios Free que upgraden a Pro despues de usar la extension y agotar su limite
- **Como medir:** Evento "upgrade_clicked_from_extension" -> "subscription_created"
- **Criterio de exito:** >5% conversion (la friccion visible del limite deberia impulsar upgrade)

### Guardrail Metrics:

**G1: Tasa de fallback a Vision < 15%**
- Umbral: Si >15% de las extracciones caen a Vision, los selectores DOM estan rotos
- Como medir: `extraction_method === 'vision'` / total extracciones
- Accion si se supera: Actualizar selectores DOM urgentemente

**G2: Error rate de API < 2%**
- Umbral: Menos del 2% de llamadas a `/api/adapt-resume` desde la extension fallan
- Como medir: HTTP 5xx responses / total requests
- Accion si se supera: Investigar root cause, implementar fallback

**G3: Tiempo de adaptacion completo < 90 segundos**
- Umbral: Desde click en "Adaptar" hasta CV visible con botones copiar
- Como medir: Evento "adaptation_started" -> "adaptation_completed" timestamp diff
- Accion si se supera: Optimizar prompts, reducir payload

### La extension es EXITOSA si:

**VALIDADA:**
- [x] 500+ instalaciones activas en mes 1
- [x] >95% tasa de extraccion exitosa
- [x] >40% D7 retention
- [x] >200 adaptaciones por semana desde extension (mes 2)

**PIVOT:**
- [ ] <100 instalaciones en mes 1 (problema de distribucion, no de producto)
- [ ] <80% tasa de extraccion (selectores rotos, necesita re-ingenieria)

**KILL:**
- [ ] <50 instalaciones en mes 1 Y <20% D7 retention (usuarios no quieren una extension)
- [ ] Costo de Vision API > $500/mes sin suficientes Pro conversions para cubrirlo

### Setup de tracking:

- **Extension analytics:** Eventos custom via fetch a `/api/analytics/event` (nuevo endpoint simple)
- **Chrome Web Store:** Dashboard nativo para instalaciones, uninstalls, crash reports
- **Error monitoring:** Sentry SDK para extension (errors en content scripts + sidebar)
- **User feedback:** Link "Reportar problema" en el sidebar que abre formulario en web app

---

## 11. FUERA DE ALCANCE V1

| Feature excluida | Razon | Cuando |
|-----------------|-------|--------|
| Soporte Glassdoor, ZipRecruiter, Computrabajo | Reducir scope de V1, LinkedIn+Indeed cubren 80%+ | V1.1 |
| Edicion inline del CV en sidebar | Complejidad de UI alta, la web tiene editor completo | V2 |
| Auto-fill de formularios de aplicacion | Altisimo riesgo de rotura, cada sitio es diferente | V2+ |
| Notificaciones de nuevos avisos | Feature completamente diferente, no core del producto | V2 |
| Exportar tracker a CSV/Excel | Nice-to-have, no critico | V1.1 |
| Modo offline | Requiere Claude API, no viable offline | Nunca (arquitectura) |
| Firefox/Safari/Edge | Chrome tiene 65%+ market share de extensiones | V1.1 (Edge trivial, mismo Chromium) |
| Dark mode en sidebar | Estetico, no funcional | V1.1 |
| Multi-idioma en UI de extension | V1 todo en espanol, target LATAM | V1.1 |
| Estadisticas avanzadas del tracker (graficos, tendencias) | CRUD basico primero, analytics despues | V1.1 |
| Guardar multiples CVs master | V1 soporta 1 CV master por usuario | V2 |
| Comparacion side-by-side (CV original vs adaptado) | Complejidad de layout en sidebar estrecho | V2 |

---

## 12. REQUISITOS DE WIREFRAME (PARA DISENADOR UX/UI)

### Pantalla 1: Login Screen (sidebar)
**Proposito:** Invitar al usuario a loguearse cuando no tiene sesion activa.

**Elementos clave:**
- Logo MockMaster centrado (version icono, no logotipo completo)
- Headline: "Inicia sesion para adaptar tu CV"
- Subtext: "Conecta con tu cuenta de MockMaster para empezar"
- Boton primario: "Iniciar sesion en MockMaster" (abre tab)
- Link secundario: "Crear cuenta"

**Restriccion:** Ancho fijo ~480px, scroll no necesario, contenido centrado verticalmente.

### Pantalla 2: Job Extraction View (sidebar)
**Proposito:** Mostrar los datos extraidos del aviso y ofrecer el CTA de adaptacion.

**Elementos clave:**
- Badge de source (LinkedIn / Indeed) con icono
- Titulo del puesto (h2, bold, max 2 lineas con ellipsis)
- Empresa (text-lg, link clickeable a la pagina de la empresa)
- Ubicacion + Modalidad (inline, separados por pipe)
- Salario (si disponible, highlighted en verde)
- Descripcion: primeras 4 lineas + boton "Ver mas" que expande
- Tags de skills requeridos (chips)
- Divider
- **CTA prominente: "Adaptar mi CV" (boton full-width, primario, grande)**
- Texto micro debajo: "4 adaptaciones restantes este mes" o "Ilimitado (Pro)"

**Interacciones:**
- "Ver mas" expande/colapsa la descripcion con animacion suave
- Click en "Adaptar mi CV" -> transicion a pantalla de progreso

### Pantalla 3: Adaptation Progress (sidebar)
**Proposito:** Feedback visual mientras Claude adapta el CV.

**Elementos clave:**
- Animacion central (spinner o barra de progreso indeterminada)
- Texto cambiante: "Analizando la oferta..." -> "Adaptando tu CV..." -> "Calculando score ATS..."
- Tiempo estimado: "Esto toma aproximadamente 30 segundos"
- Boton "Cancelar" discreto en la parte inferior

### Pantalla 4: Adapted Resume View (sidebar) - PANTALLA PRINCIPAL
**Proposito:** Mostrar el CV adaptado con secciones copiables y acciones finales.

**Elementos clave (jerarquia):**

1. **Header:**
   - ATS Score badge (numero grande, color segun rango: rojo <50, amarillo 50-75, verde >75)
   - Texto: "Tu CV esta optimizado para [Empresa]"

2. **Secciones copiables (stack vertical, cada una en card):**
   - Cada seccion tiene:
     - Titulo de seccion (h3, bold) a la izquierda
     - Boton "Copiar" (icono clipboard) a la derecha, alineado con el titulo
     - Contenido de la seccion debajo (texto, colapsable si es largo)
   - Secciones:
     - Resumen Profesional
     - Experiencia Laboral (cada experiencia como sub-item)
     - Educacion
     - Habilidades (como lista horizontal de tags)
     - Idiomas (si existen en el CV)

3. **Acciones finales (sticky en la parte inferior del sidebar):**
   - Boton secundario: "Descargar PDF"
   - Boton primario: "Guardar Aplicacion"

**Interacciones:**
- "Copiar" -> texto del boton cambia a "Copiado" con icono check durante 2 segundos
- "Descargar PDF" -> mini-modal inline para seleccionar template
- "Guardar Aplicacion" -> toast de confirmacion, boton cambia a "Guardada" (disabled)
- Scroll vertical para todo el contenido

**Consideraciones mobile:** No aplica (extension de Chrome Desktop). El ancho minimo del sidebar deberia ser ~360px para resoluciones bajas.

### Pantalla 5: Dashboard de Aplicaciones (web app, nueva pagina)
**Proposito:** Vista centralizada de todas las aplicaciones trackeadas.

**Elementos clave:**
- **Stats bar (top):** 4 cards con: Total aplicaciones | Esta semana | En proceso (entrevista) | Tasa de respuesta
- **Filtros (below stats):** Dropdown status | Dropdown source | Date range | Busqueda por texto
- **Tabla de aplicaciones:** Columnas: Empresa | Puesto | Fecha | Source | Status (dropdown editable) | ATS Score | Acciones
- **Fila expandible:** Al clickear una fila, muestra: CV adaptado (preview), notas, URL del aviso
- **Empty state:** "Todavia no tienes aplicaciones. Instala la extension de Chrome para empezar a trackear."

**Benchmark visual:** Notion database view / Trello board (pero en formato tabla, no kanban para V1).

---

## 13. HANDOFF AL DISENADOR UX/UI

**El disenador recibe:**
- [x] Persona de usuario detallada con flujos As-Is y To-Be
- [x] 5 pantallas del sidebar con jerarquia de elementos
- [x] 1 pagina nueva en web app (dashboard aplicaciones)
- [x] Criterios de aceptacion con interacciones especificas
- [x] Restricciones de ancho (sidebar ~480px min)
- [x] Referencia visual: sidebar de Claude extension, Teal extension
- [x] Tech stack: React con Tailwind CSS (misma que web app)
- [x] Sistema de colores: Reutilizar design system existente de MockMaster

**Output esperado del disenador:**
1. Wireframes (low-fi) de las 5 pantallas del sidebar + 1 pagina web
2. Mockups (high-fi) con sistema de colores de MockMaster
3. Especificacion de micro-interacciones (copiar, transiciones de estado)
4. Assets exportados (iconos de extension en 16, 32, 48, 128px)

**Timeline esperado:** 3-4 dias

**Criterios de aprobacion:**
- [ ] Wireframes aprobados por PM
- [ ] Mockups implementables con React + Tailwind CSS
- [ ] Sidebar funciona visualmente en 480px de ancho
- [ ] Todos los estados representados (loading, error, empty, success)
- [ ] Consistencia visual con la web app existente

---

## 14. HANDOFF AL ARQUITECTO

**El arquitecto recibe:**
- [x] Manifest V3 completo con permisos justificados
- [x] Estructura de archivos de la extension
- [x] Schema SQL para nuevas tablas (applications, user_resumes)
- [x] Especificacion de nuevos endpoints (5 nuevos)
- [x] Cambios requeridos en endpoints existentes (auth helper)
- [x] Estrategia de autenticacion (cookie relay + Bearer token)
- [x] Configuracion de CORS
- [x] Diagramas de comunicacion (content script <-> background <-> sidebar <-> API)

**Output esperado del arquitecto:**
1. Diagrama de arquitectura final
2. Contratos de API detallados (OpenAPI/Swagger)
3. Decisiones tecnicas finales (webpack vs vite, estado management en sidebar)
4. Plan de migracion de datos (localStorage -> Supabase para CVs)

---

## 15. NOTAS FINALES

### Supuestos:

1. **Los usuarios tienen Chrome 114+:** El 95%+ de usuarios de Chrome estan en versiones recientes (auto-update). Side Panel API requiere Chrome 114. Riesgo: bajo.

2. **Los selectores DOM de LinkedIn/Indeed son relativamente estables:** LinkedIn cambia su DOM periodicamente, pero la estructura basica de los avisos de trabajo (titulo, empresa, descripcion) se mantiene. Riesgo: medio. Mitigado por fallback a Vision.

3. **Las cookies de Supabase Auth son accesibles desde la extension:** Las cookies del dominio `mockmaster.vercel.app` deberian ser legibles con el permiso `cookies`. Si `SameSite=Strict` bloquea esto, el redirect flow es el backup. Riesgo: medio.

4. **Los usuarios quieren adaptar su CV sin salir de LinkedIn:** Validado en la conversacion con el usuario. No hay data cuantitativa aun, pero es consistente con la tendencia de "reducir context switching" en herramientas de productividad.

5. **5 adaptaciones/mes es suficiente limite para Free en extension:** El limite aplica compartido entre web app y extension. Los usuarios Free que usan extension intensamente deberian convertir a Pro. Si la conversion es muy baja, considerar un limite separado o mayor para extension.

### Decisiones pendientes:

1. **Webpack vs Vite para build de extension:** Vite es mas rapido pero tiene menos soporte para Manifest V3. Webpack con `copy-webpack-plugin` es mas probado. Decision del arquitecto.

2. **Estado global en sidebar (Context vs Zustand vs signals):** El sidebar es una mini-app React. React Context es suficiente para V1 (pocos estados globales: auth, extracted job, adapted resume). Si crece, migrar a Zustand. Decision del arquitecto.

3. **Remote config para selectores DOM:** Implementar un endpoint que retorne los selectores actualizados, o hardcodear y publicar nueva version? Para V1, hardcodear. Para V1.1, remote config.

4. **Publicar en Chrome Web Store o distribucion directa?** Chrome Web Store requiere $5 de fee unico y review process (1-3 dias). La alternativa es distribuir como "unpacked extension" para beta testers. Recomendacion: beta testing con unpacked, luego publicar en Store para distribucion masiva.

---

**PLAN APROBADO - LISTO PARA FASE DE DISENO E IMPLEMENTACION**

**Sign-off:**
- [x] PM (Agent 1)
- [ ] Disenador (Agent 2) - Pendiente
- [ ] Arquitecto (Agent 3) - Pendiente
- [ ] Developer (Agent 4) - Pendiente

---

*Documento generado: 2026-02-24*
*Version: 1.0*
*Metodologia: Google Project Management + RICE*
*PM: Agent 1 (15+ years exp., FAANG background)*
