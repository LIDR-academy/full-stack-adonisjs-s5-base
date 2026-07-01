---
title: API Reference
description: Endpoints REST de FlowSync bajo /api/v1, documentados con OpenAPI + Scalar.
---

La API de FlowSync es una API JSON bajo el prefijo `/api/v1`, con autenticación por
**access tokens** (`oat_*`) vía cabecera `Authorization: Bearer oat_...`.

La especificación se genera automáticamente con `adonis-autoswagger` a partir de las
rutas, los modelos de Lucid y las anotaciones JSDoc de los controllers.

## Documentación interactiva

Con el backend arrancado (`cd backend && npm run dev`):

- **Scalar (UI):** [`http://localhost:3333/docs`](http://localhost:3333/docs)
- **Documento OpenAPI:** [`http://localhost:3333/openapi`](http://localhost:3333/openapi)

## Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/v1/health` | — | Liveness (`{ status: 'ok' }`) |
| POST | `/api/v1/account/register` | — | Registro → `{ user, token }` |
| POST | `/api/v1/account/login` | — | Login → `{ user, token }` |
| POST | `/api/v1/account/logout` | Bearer | Revoca el token actual |
| GET | `/api/v1/account/profile` | Bearer | Usuario autenticado |
| GET | `/api/v1/users` | Bearer | Lista de usuarios |
| GET | `/api/v1/users/:id` | Bearer | Usuario por id |

## Errores

Las respuestas de error siguen el sobre estándar de AdonisJS:

```json
{ "errors": [{ "message": "..." }] }
```

- `400` — credenciales inválidas en login (`E_INVALID_CREDENTIALS`).
- `401` — no autenticado (`E_UNAUTHORIZED_ACCESS`): token ausente o inválido.
- `404` — recurso no encontrado (`E_ROW_NOT_FOUND`).
- `422` — error de validación de VineJS.
