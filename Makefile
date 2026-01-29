.PHONY: help install dev build start clean test lint format deploy-staging deploy-prod qa setup-db docs

# Variables
NPM := npm
NODE := node
SUPABASE := npx supabase

# Colors for terminal output
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

##@ General

help: ## Mostrar esta ayuda
	@echo "$(GREEN)MockMaster - Adaptador de CV$(NC)"
	@echo "Comandos disponibles:"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(YELLOW)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Instalación y Setup

install: ## Instalar dependencias del proyecto
	@echo "$(GREEN)📦 Instalando dependencias...$(NC)"
	$(NPM) install

setup: install setup-env ## Setup completo del proyecto (install + env)
	@echo "$(GREEN)✅ Setup completo!$(NC)"
	@echo "Ejecuta 'make dev' para iniciar el servidor de desarrollo"

setup-env: ## Crear archivo .env.local desde ejemplo
	@if [ ! -f .env.local ]; then \
		echo "$(YELLOW)⚙️  Creando .env.local...$(NC)"; \
		cp .env.local.example .env.local; \
		echo "$(RED)⚠️  Recuerda configurar tus variables de entorno en .env.local$(NC)"; \
	else \
		echo "$(GREEN)✅ .env.local ya existe$(NC)"; \
	fi

##@ Desarrollo

dev: ## Iniciar servidor de desarrollo
	@echo "$(GREEN)🚀 Iniciando servidor de desarrollo...$(NC)"
	$(NPM) run dev

build: ## Compilar proyecto para producción
	@echo "$(GREEN)🏗️  Compilando proyecto...$(NC)"
	$(NPM) run build

start: ## Iniciar servidor de producción (requiere build previo)
	@echo "$(GREEN)▶️  Iniciando servidor de producción...$(NC)"
	$(NPM) run start

clean: ## Limpiar archivos generados
	@echo "$(YELLOW)🧹 Limpiando archivos generados...$(NC)"
	rm -rf .next
	rm -rf node_modules/.cache
	rm -rf out
	@echo "$(GREEN)✅ Limpieza completada$(NC)"

clean-all: clean ## Limpiar todo (incluye node_modules)
	@echo "$(RED)🗑️  Limpiando TODO (incluye node_modules)...$(NC)"
	rm -rf node_modules
	rm -rf package-lock.json
	@echo "$(GREEN)✅ Limpieza completa$(NC)"

##@ Testing y QA

test: ## Ejecutar todos los tests
	@echo "$(GREEN)🧪 Ejecutando tests...$(NC)"
	@if [ -f "jest.config.js" ] || [ -f "jest.config.ts" ]; then \
		$(NPM) test; \
	else \
		echo "$(RED)❌ Jest no está configurado. Ejecuta 'make setup-jest' primero$(NC)"; \
		exit 1; \
	fi

test-watch: ## Ejecutar tests en modo watch
	@echo "$(GREEN)👀 Ejecutando tests en modo watch...$(NC)"
	$(NPM) test -- --watch

test-coverage: ## Ejecutar tests con reporte de cobertura
	@echo "$(GREEN)📊 Generando reporte de cobertura...$(NC)"
	$(NPM) test -- --coverage

lint: ## Ejecutar linter
	@echo "$(GREEN)🔍 Ejecutando linter...$(NC)"
	$(NPM) run lint

lint-fix: ## Ejecutar linter y auto-corregir errores
	@echo "$(GREEN)🔧 Auto-corrigiendo errores de lint...$(NC)"
	$(NPM) run lint -- --fix

type-check: ## Verificar tipos de TypeScript
	@echo "$(GREEN)📝 Verificando tipos...$(NC)"
	npx tsc --noEmit

qa: lint type-check ## Ejecutar suite completa de QA (lint + type-check)
	@echo "$(GREEN)✅ QA completo ejecutado$(NC)"

qa-full: qa test ## QA completo incluyendo tests
	@echo "$(GREEN)✅ QA completo con tests ejecutado$(NC)"

##@ Database (Supabase)

db-status: ## Ver estado de la base de datos
	@echo "$(GREEN)📊 Estado de la base de datos:$(NC)"
	@echo "Para conectarte a Supabase, verifica tu .env.local"
	@echo "SUPABASE_URL: $$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f2)"

db-types: ## Generar tipos TypeScript desde Supabase
	@echo "$(GREEN)🔄 Generando tipos de Supabase...$(NC)"
	@echo "$(YELLOW)Asegúrate de tener el CLI de Supabase instalado$(NC)"
	$(SUPABASE) gen types typescript --local > types/supabase.ts || echo "$(RED)Ejecuta: npm install -g supabase$(NC)"

##@ Git y Commits

commit: ## Crear commit siguiendo convenciones (uso: make commit m="mensaje")
ifndef m
	@echo "$(RED)❌ Debes proporcionar un mensaje: make commit m=\"tu mensaje\"$(NC)"
	@exit 1
endif
	@echo "$(GREEN)📝 Creando commit...$(NC)"
	git add .
	git commit -m "$(m)"

commit-feature: ## Commit de feature (uso: make commit-feature id=F-005 m="mensaje")
ifndef id
	@echo "$(RED)❌ Debes proporcionar el ID de feature: make commit-feature id=F-005 m=\"mensaje\"$(NC)"
	@exit 1
endif
ifndef m
	@echo "$(RED)❌ Debes proporcionar un mensaje: make commit-feature id=F-005 m=\"mensaje\"$(NC)"
	@exit 1
endif
	@echo "$(GREEN)📝 Creando commit para feature $(id)...$(NC)"
	git add .
	git commit -m "feat($(id)): $(m)\n\nCo-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

push: ## Push a remote
	@echo "$(GREEN)⬆️  Haciendo push...$(NC)"
	git push

pull: ## Pull desde remote
	@echo "$(GREEN)⬇️  Haciendo pull...$(NC)"
	git pull

status: ## Ver status de git y proyecto
	@echo "$(GREEN)📊 Status del proyecto:$(NC)"
	@echo ""
	@echo "$(YELLOW)Git Status:$(NC)"
	git status --short
	@echo ""
	@echo "$(YELLOW)Rama actual:$(NC)"
	git branch --show-current
	@echo ""
	@echo "$(YELLOW)Último commit:$(NC)"
	git log -1 --oneline

##@ Documentación

docs-list: ## Listar archivos de documentación
	@echo "$(GREEN)📚 Documentación disponible:$(NC)"
	@ls -lh documentacion/*.md | awk '{print $$9, "(" $$5 ")"}'

docs-summary: ## Resumen de documentación por feature
	@echo "$(GREEN)📋 Resumen de documentación:$(NC)"
	@echo ""
	@for feature in $$(ls documentacion/ | grep -E '^F[0-9]+-' | sed 's/-.*//g' | sort -u); do \
		echo "$(YELLOW)$$feature:$(NC)"; \
		ls documentacion/$$feature-*.md 2>/dev/null | sed 's/.*\///g' | sed 's/^/  - /'; \
	done

docs-open: ## Abrir carpeta de documentación
	@echo "$(GREEN)📂 Abriendo carpeta de documentación...$(NC)"
	open documentacion/ || xdg-open documentacion/ || echo "Abre manualmente: documentacion/"

##@ Deploy

deploy-check: qa-full build ## Verificar que todo está listo para deploy
	@echo "$(GREEN)✅ Proyecto listo para deploy$(NC)"

deploy-staging: deploy-check ## Deploy a staging (Vercel)
	@echo "$(GREEN)🚀 Desplegando a staging...$(NC)"
	@echo "$(YELLOW)Asegúrate de tener Vercel CLI instalado: npm i -g vercel$(NC)"
	npx vercel --yes || echo "$(RED)Ejecuta: npm install -g vercel$(NC)"

deploy-prod: deploy-check ## Deploy a producción (Vercel)
	@echo "$(RED)⚠️  ADVERTENCIA: Estás a punto de desplegar a PRODUCCIÓN$(NC)"
	@echo "Presiona Ctrl+C para cancelar, o Enter para continuar..."
	@read confirm
	@echo "$(GREEN)🚀 Desplegando a producción...$(NC)"
	npx vercel --prod || echo "$(RED)Ejecuta: npm install -g vercel$(NC)"

##@ Utilidades

logs: ## Ver logs recientes del servidor
	@echo "$(GREEN)📜 Logs del servidor:$(NC)"
	@tail -n 50 .next/server/app-paths-manifest.json 2>/dev/null || echo "No hay logs disponibles"

ports: ## Ver puertos en uso
	@echo "$(GREEN)🔌 Puertos en uso:$(NC)"
	@lsof -i :3000 2>/dev/null || echo "Puerto 3000 libre"

kill-port: ## Matar proceso en puerto 3000
	@echo "$(YELLOW)🔪 Matando proceso en puerto 3000...$(NC)"
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "Puerto 3000 ya está libre"

deps-check: ## Verificar dependencias desactualizadas
	@echo "$(GREEN)🔍 Verificando dependencias...$(NC)"
	$(NPM) outdated

deps-update: ## Actualizar dependencias
	@echo "$(YELLOW)⬆️  Actualizando dependencias...$(NC)"
	$(NPM) update

security-audit: ## Auditoría de seguridad de dependencias
	@echo "$(GREEN)🔒 Ejecutando auditoría de seguridad...$(NC)"
	$(NPM) audit

security-fix: ## Corregir vulnerabilidades de seguridad
	@echo "$(GREEN)🔧 Corrigiendo vulnerabilidades...$(NC)"
	$(NPM) audit fix

##@ Configuración de Testing

setup-jest: ## Configurar Jest para testing
	@echo "$(GREEN)⚙️  Configurando Jest...$(NC)"
	$(NPM) install --save-dev jest @testing-library/react @testing-library/jest-dom @types/jest jest-environment-jsdom
	@echo "module.exports = {\n  testEnvironment: 'jsdom',\n  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],\n  testMatch: ['**/__tests__/**/*.test.ts?(x)'],\n  moduleNameMapper: {\n    '^@/(.*)$$': '<rootDir>/$$1'\n  }\n};" > jest.config.js
	@echo "import '@testing-library/jest-dom';" > jest.setup.js
	@echo "$(GREEN)✅ Jest configurado. Actualiza package.json con:$(NC)"
	@echo '  "test": "jest",'
	@echo '  "test:watch": "jest --watch",'
	@echo '  "test:coverage": "jest --coverage"'

##@ Información

version: ## Mostrar versiones de herramientas
	@echo "$(GREEN)📌 Versiones:$(NC)"
	@echo "Node: $$(node --version)"
	@echo "NPM: $$(npm --version)"
	@echo "Next.js: $$(npm list next --depth=0 2>/dev/null | grep next | cut -d '@' -f 2)"
	@echo "TypeScript: $$(npm list typescript --depth=0 2>/dev/null | grep typescript | cut -d '@' -f 2)"

info: version status ## Mostrar información completa del proyecto
	@echo ""
	@echo "$(GREEN)📊 Información del proyecto:$(NC)"
	@echo "Nombre: $$(jq -r .name package.json)"
	@echo "Versión: $$(jq -r .version package.json)"
	@echo "Descripción: $$(jq -r .description package.json)"

##@ Default

.DEFAULT_GOAL := help
