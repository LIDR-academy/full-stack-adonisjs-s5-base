# Demo 1 — Arquitectura documentada (rama de fallback)

Esta rama (`demo/s05-demo1-fallback`) representa el **estado tras la Demo 1** de la
Sesión 5. Úsala como **fallback** si la Demo 1 falla en vivo: cambia a esta rama y
todo lo de abajo ya está resuelto.

## Qué contiene

1. **OpenAPI + Scalar** (`adonis-autoswagger`)
   - `backend/config/swagger.ts`: título "FlowSync API", esquema `bearerAuth`
     (http/bearer, tokens `oat_*`), `defaultSecurityScheme` y `tagIndex: 3`
     (agrupa los endpoints por recurso: `account`, `users`, `health`).
   - Rutas públicas en `backend/start/routes.ts`:
     - `GET /openapi` → documento OpenAPI.
     - `GET /docs` → UI de Scalar que consume `/openapi`.
   - JSDoc en los controllers de `account`, `users` y `health` con `@summary`,
     `@requestBody` y `@responseBody` de éxito y de error (400/401/404/422) según
     el comportamiento real.

2. **ADRs con log4brains** (formato MADR, en `docs/adr/`)
   - `Uso de SQLite + better-sqlite3 en lugar de PostgreSQL`.
   - `Uso de VineJS para validación en lugar de Zod`.
   - Config en `.log4brains.yml` (proyecto "FlowSync").

3. **Diagramas Mermaid** en el `README.md` de la raíz (sección "Arquitectura"):
   contexto C4 y secuencia del login real.

## Cómo arrancar la demo

```bash
# Backend + docs de la API
cd backend
npm install
cp .env.example .env && node ace generate:key
npm run migration:run
npm run dev            # servidor en http://localhost:3333
# Abre http://localhost:3333/docs  (Scalar)  y  /openapi (documento OpenAPI)

# Knowledge base de ADRs (desde la raíz del repo)
npm install
npm run docs:adr:preview   # log4brains en http://localhost:4004
```

## Notas de arranque (entorno)

- Si `npm run migration:run` falla con "bindings"/"directory does not exist":
  `npm rebuild better-sqlite3` y crea la carpeta `backend/tmp/` (la BD vive en
  `backend/tmp/db.sqlite3`).
- El binario `log4brains` debe estar accesible: usa los scripts de npm de la raíz
  (`npm run docs:adr:preview`) o `npx log4brains preview`.
