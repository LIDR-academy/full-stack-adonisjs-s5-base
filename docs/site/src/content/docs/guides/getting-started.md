---
title: Empezar
description: Arranca el backend y el frontend de FlowSync en local.
---

FlowSync es un monorepo con dos apps independientes: `backend/` (AdonisJS 7) y
`frontend/` (React 19 + Vite). Estos son los pasos mínimos de arranque, reutilizados
del `README.md` de la raíz del repo.

## Requisitos

- **Node.js 22** o superior (recomendado). El backend AdonisJS 7 funciona desde
  Node 20.3+, pero algunas herramientas de docs (Astro/Starlight) requieren Node 22.
- npm 10+.

## 1. Backend (`http://localhost:3333`)

```bash
cd backend
npm install
cp .env.example .env
node ace generate:key      # rellena APP_KEY en .env
npm run migration:run      # crea las tablas users + auth_access_tokens
npm run dev                # servidor con HMR
```

> Si `migration:run` falla con un error de *bindings* de `better-sqlite3`, ejecuta
> `npm rebuild better-sqlite3` y asegúrate de que existe la carpeta `backend/tmp/`
> (la base de datos vive en `backend/tmp/db.sqlite3`).

La documentación interactiva de la API queda disponible en
`http://localhost:3333/docs` (Scalar) y el documento OpenAPI en
`http://localhost:3333/openapi`.

## 2. Frontend (`http://localhost:5173`)

```bash
cd frontend
npm install
cp .env.example .env       # VITE_API_URL ya apunta al backend
npm run dev
```

Abre `http://localhost:5173`, regístrate, entra al dashboard y cierra sesión.

## 3. Documentación (este sitio)

```bash
cd docs/site
npm install
npm run dev                # Starlight en http://localhost:4321
```

Los ADRs se sincronizan automáticamente desde `docs/adr/` antes de `dev` y `build`.
