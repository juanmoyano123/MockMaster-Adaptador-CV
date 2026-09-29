# Guía de Uso del Makefile

Este proyecto incluye un `Makefile` completo con automatizaciones para facilitar el desarrollo, testing, deploy y gestión del proyecto.

## ¿Por qué usar Make?

- **Comandos unificados**: Un solo punto de entrada para todas las tareas
- **Documentación ejecutable**: Los comandos documentan lo que hacen
- **Consistencia**: Mismos comandos en todos los entornos
- **Ahorro de tiempo**: Automatiza tareas repetitivas

## Inicio Rápido

```bash
# Ver todos los comandos disponibles
make help

# Setup inicial del proyecto
make setup

# Iniciar desarrollo
make dev
```

## Categorías de Comandos

### 📦 Instalación y Setup

```bash
make install        # Instalar dependencias
make setup          # Setup completo (install + env)
make setup-env      # Crear .env.local desde ejemplo
make setup-jest     # Configurar Jest para testing
```

**Uso típico al clonar el proyecto:**
```bash
git clone <repo>
cd mockmaster
make setup
make dev
```

### 🚀 Desarrollo

```bash
make dev            # Servidor de desarrollo (localhost:3000)
make build          # Compilar para producción
make start          # Iniciar servidor de producción
make clean          # Limpiar archivos generados (.next, cache)
make clean-all      # Limpiar TODO (incluye node_modules)
```

**Workflow diario:**
```bash
# Empezar el día
make dev

# Hacer cambios...

# Antes de commit
make qa
```

### 🧪 Testing y QA

```bash
make test           # Ejecutar todos los tests
make test-watch     # Tests en modo watch (útil durante desarrollo)
make test-coverage  # Tests con reporte de cobertura
make lint           # Ejecutar ESLint
make lint-fix       # Auto-corregir errores de lint
make type-check     # Verificar tipos de TypeScript
make qa             # QA completo (lint + type-check)
make qa-full        # QA completo + tests
```

**Antes de cada commit:**
```bash
make qa-full        # Ejecuta lint, type-check y tests
```

**Durante desarrollo:**
```bash
make test-watch     # Tests automáticos al guardar
```

### 🗄️ Database (Supabase)

```bash
make db-status      # Ver estado de la DB
make db-types       # Generar tipos TypeScript desde Supabase
```

**Workflow con DB:**
```bash
# Después de cambios en esquema de Supabase
make db-types       # Regenerar tipos
make type-check     # Verificar que todo compile
```

### 📝 Git y Commits

```bash
make commit m="mensaje"                     # Commit simple
make commit-feature id=F-005 m="mensaje"   # Commit de feature
make push                                   # Push a remote
make pull                                   # Pull desde remote
make status                                 # Ver status detallado
```

**Ejemplos:**
```bash
# Commit simple
make commit m="fix: corregir validación de email"

# Commit de feature
make commit-feature id=F-012 m="implementar autenticación con Google"

# Ver status antes de commit
make status
```

### 📚 Documentación

```bash
make docs-list      # Listar archivos de documentación
make docs-summary   # Resumen de docs por feature
make docs-open      # Abrir carpeta de documentación
```

**Ver documentación:**
```bash
make docs-summary   # Ver qué está documentado por feature
make docs-open      # Abrir en Finder/Explorer
```

### 🚢 Deploy

```bash
make deploy-check   # Verificar que todo está listo (QA + build)
make deploy-staging # Deploy a staging (Vercel)
make deploy-prod    # Deploy a producción (Vercel)
```

**Workflow de deploy:**
```bash
# 1. Verificar que todo funciona
make deploy-check

# 2. Deploy a staging para pruebas
make deploy-staging

# 3. Probar en staging, luego deploy a prod
make deploy-prod
```

### 🔧 Utilidades

```bash
make logs           # Ver logs del servidor
make ports          # Ver puertos en uso
make kill-port      # Matar proceso en puerto 3000
make deps-check     # Ver dependencias desactualizadas
make deps-update    # Actualizar dependencias
make security-audit # Auditoría de seguridad
make security-fix   # Corregir vulnerabilidades
```

**Troubleshooting común:**
```bash
# Error: Puerto 3000 en uso
make kill-port
make dev

# Actualizar dependencias
make deps-check     # Ver qué está desactualizado
make deps-update    # Actualizar todo

# Problemas de seguridad
make security-audit # Ver vulnerabilidades
make security-fix   # Intentar auto-corrección
```

### 📊 Información

```bash
make version        # Versiones de Node, NPM, etc.
make info          # Información completa del proyecto
make help          # Lista de comandos (default)
```

## Workflows Recomendados

### 🌅 Comenzar el día

```bash
make pull          # Traer últimos cambios
make install       # Actualizar deps si cambiaron
make dev           # Empezar a trabajar
```

### 🏗️ Implementar nueva feature

```bash
# En el código, usa /build-feature F-XXX

# Después de implementar
make test          # Verificar tests
make lint-fix      # Corregir estilo
make qa-full       # QA completo
make commit-feature id=F-XXX m="descripción"
make push
```

### 🐛 Fix de bug

```bash
# Hacer cambios...

make test          # Verificar que no rompes nada
make lint-fix      # Limpiar código
make commit m="fix: descripción del bug"
make push
```

### 📤 Antes de Pull Request

```bash
make qa-full       # QA completo con tests
make build         # Verificar que compila
make security-audit # Verificar seguridad
```

### 🚀 Antes de Deploy

```bash
make deploy-check  # Ejecuta QA + build
make deploy-staging # Deploy a staging
# Probar en staging...
make deploy-prod   # Deploy a producción
```

### 🧹 Limpieza periódica

```bash
# Limpieza ligera (cache, .next)
make clean

# Limpieza profunda (reinstalar todo)
make clean-all
make install
```

## Personalización

Puedes agregar tus propios comandos editando el `Makefile`. Ejemplo:

```makefile
##@ Custom

my-command: ## Mi comando personalizado
	@echo "Haciendo algo custom..."
	npm run custom-script
```

## Tips

1. **Tab completion**: Make soporta autocompletado en muchas shells
2. **Encadenar comandos**: Puedes hacer `make clean build test`
3. **Variables**: Personaliza con variables de entorno
4. **Ayuda contextual**: Cada comando tiene descripción en `make help`

## Solución de Problemas

### "make: command not found"

Make no está instalado:
```bash
# macOS
xcode-select --install

# Linux
sudo apt-get install build-essential  # Debian/Ubuntu
sudo yum install make                  # CentOS/RHEL
```

### "npm: command not found"

Node.js no está instalado:
```bash
# Instala Node.js desde https://nodejs.org
# O usa nvm: https://github.com/nvm-sh/nvm
```

### Tests fallan con "Jest not configured"

```bash
make setup-jest    # Configura Jest
make test          # Ahora debería funcionar
```

### Error de permisos

```bash
chmod +x Makefile  # Dar permisos de ejecución
```

## Comandos vs npm scripts

- **Make**: Orquestación de alto nivel, workflows complejos
- **npm scripts**: Comandos específicos de Node.js/JavaScript

Ambos se complementan:
- `make test` → llama a `npm test` → ejecuta Jest
- `make qa` → llama a `npm run lint && npm run type-check`

## Recursos

- [GNU Make Manual](https://www.gnu.org/software/make/manual/)
- [Make para JavaScript](https://blog.logrocket.com/using-makefile-in-node-js/)
- [Makefile Best Practices](https://makefiletutorial.com/)

---

**Tip**: Ejecuta `make` o `make help` en cualquier momento para ver todos los comandos disponibles.
