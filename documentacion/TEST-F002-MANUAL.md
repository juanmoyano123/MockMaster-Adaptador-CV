# Guía de Testing Manual - F-002

## Estado Actual
✅ Código implementado
✅ API Key configurada
✅ Servidor corriendo en http://localhost:3000
✅ Sin errores de compilación

## Testing Checklist

### Test 1: Upload PDF (Drag & Drop)
1. Abre http://localhost:3000 en el navegador
2. Busca un archivo PDF de resume/CV
3. Arrastralo y soltalo en la zona de upload
4. **Esperado:**
   - Ver mensaje "Parsing your resume..."
   - Después de 5-10 segundos ver preview del resume parseado
   - Secciones: Contact Info, Summary, Experience, Education, Skills
   - Poder editar cualquier campo
   - Click "Save Resume" guarda en localStorage

### Test 2: Upload DOCX (Click)
1. En http://localhost:3000
2. Click en "Choose File" o botón de upload
3. Selecciona un archivo .docx
4. **Esperado:**
   - Mismo comportamiento que PDF
   - Contenido parseado correctamente

### Test 3: Paste Text
1. En http://localhost:3000
2. Click en tab/botón "Paste Text Instead"
3. Pega el texto de un resume
4. Click "Parse Resume"
5. **Esperado:**
   - Claude API estructura el texto
   - Ver preview organizado
   - Poder editar y guardar

### Test 4: Persistencia en localStorage
1. Sube un resume y guardalo
2. Cierra el navegador completamente
3. Vuelve a abrir http://localhost:3000
4. **Esperado:**
   - Resume todavía está guardado
   - Poder ver/editar
   - Poder "Upload New Resume" para reemplazar

### Test 5: Validación de errores
1. Intenta subir un archivo .jpg o .txt
   - **Esperado:** Error "Unsupported file format"
2. Intenta subir un PDF mayor a 10MB
   - **Esperado:** Error "File too large"
3. Intenta subir PDF corrupto o protegido con password
   - **Esperado:** Error con sugerencia de usar text paste

### Test 6: Edición de resume
1. Después de parsear, edita algún campo
2. Click "Save Resume"
3. Recarga la página
4. **Esperado:**
   - Cambios guardados
   - Ediciones persisten

## Errores Comunes Esperados

### Si ves error de API Key
- Verifica que .env.local tenga ANTHROPIC_API_KEY
- Reinicia el servidor: Ctrl+C y `npm run dev`

### Si parsing tarda mucho
- Normal en primer uso (Claude API puede tardar 5-15 seg)
- Si tarda >30 segundos, revisar console del navegador

### Si no guarda en localStorage
- Verifica que el navegador permita localStorage
- Chrome DevTools > Application > Local Storage > http://localhost:3000

## Cómo Ver Errores

### En Terminal
El servidor muestra logs de las API routes

### En Navegador
1. Abre DevTools (F12)
2. Tab "Console" - errores de JavaScript
3. Tab "Network" - errores de API calls
4. Tab "Application" > Local Storage - datos guardados

## Qué Reportar

Si encuentras errores, reporta:
1. ¿Qué paso exactamente?
2. ¿Qué archivo subiste? (PDF/DOCX/Text)
3. ¿Mensaje de error exacto?
4. Screenshot de la consola del navegador
5. Screenshot de la terminal (servidor)

## Próximos Pasos Después de Testing

Si todo funciona:
- ✅ Marcar F-002 como DONE
- ✅ Hacer git commit
- ⏭️ Continuar con F-003: Job Description Analysis

Si hay bugs:
- 🔧 Listar todos los bugs encontrados
- 🔧 Priorizarlos (críticos primero)
- 🔧 Corregirlos uno por uno
- 🔄 Re-testear

---

**Servidor corriendo en:** http://localhost:3000
**Estado:** ✅ Listo para testing manual
