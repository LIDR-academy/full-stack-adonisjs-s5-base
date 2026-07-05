# Auditoría de documentación — full-stack-adonisjs-s5-base

> **Fecha de auditoría**: 2026-07-05
> **Auditor**: revisión asistida por IA (rol: auditor de código)
> **Alcance**: repositorio completo (`backend/`, `frontend/`, `docs/`, `openspec/`, raíz)
> **Método**: lectura directa de artefactos + comparación cruzada spec ↔ código real (rutas, controllers, modelos)

## Leyenda de estado

| Estado | Significa |
|---|---|
| 🟢 **Completo** | Existe, está actualizado y cumple su función |
| 🟡 **Parcial** | Existe pero es pobre, incompleto o disperso |
| 🔴 **Inexistente** | No hay nada que cubra esa función |
| ⚪ **No aplica** | La categoría no es relevante para este proyecto en su estado actual |

---

## 1. README de proyecto — 🟢 Completo

**Dónde**: [`README.md`](../README.md) (raíz) + [`backend/README.md`](../backend/README.md)

Cubre exactamente lo que se le pide a un README de arranque: estructura del monorepo, requisitos (Node 24+), pasos de instalación para backend y frontend por separado, comando de generación de `APP_KEY`, migraciones, y una tabla de endpoints. Existen `backend/.env.example` y `frontend/.env.example`, y el README raíz referencia explícitamente `cp .env.example .env`. El README de `backend/` añade el detalle de estructura de carpetas (`controllers/`, `models/`, `validators/`, `transformers/`) y convenciones básicas.

**Observación**: alguien nuevo puede clonar, instalar, migrar y levantar ambos servidores sin preguntar nada. Único matiz: el README raíz incluye una nota ("El endpoint `GET /api/v1/users/active` se implementa en vivo en la Sesión 3") que solo cobra sentido con contexto externo al repo — leído en frío, es una referencia a un endpoint que no está y que no se explica dónde ni cuándo se resolverá (ver §8). No hay README en `frontend/` (solo `.env.example`), pero como el README raíz ya cubre el arranque del frontend, el hueco es menor.

---

## 2. Descripción de la arquitectura general — 🟡 Parcial

**Dónde disperso**: [`README.md`](../README.md) (árbol de carpetas + tabla de stack), [`CLAUDE.md`](../CLAUDE.md) (tabla de stack + convenciones), [`docs/PRD.md`](../docs/PRD.md) §5 (stack técnico, informativo), `backend/README.md` (estructura de `app/`).

No existe un documento único de arquitectura (ni `ARCHITECTURE.md`, ni diagrama C4 real, ni descripción de cómo se relacionan frontend↔backend más allá de `VITE_API_URL`). Lo que hay es una descripción de **stack** repetida en tres sitios distintos (README, CLAUDE.md, PRD §5) y una descripción de **estructura de carpetas** (no de arquitectura ni de flujos). El PRD menciona "diagrama C4" como algo que se genera en un ejercicio futuro ("Ejercicio 3"), pero el archivo no lo contiene todavía.

**Observación**: falta un documento que explique el flujo real (SPA → fetch a `/api/v1` → guard `api` con Bearer token → Lucid → SQLite) y cómo se relacionan las piezas del backend entre sí (controller → validator → model → transformer). Hoy esa relación solo se infiere leyendo código o `CLAUDE.md`, no está dibujada ni narrada en un sitio.

---

## 3. Documentación de la API / endpoints — 🟡 Parcial

**Dónde**: tabla de endpoints en [`README.md`](../README.md#endpoints-del-backend) + las specs de OpenSpec ([`openspec/specs/authentication/spec.md`](../openspec/specs/authentication/spec.md), [`openspec/specs/users/spec.md`](../openspec/specs/users/spec.md)).

No hay Swagger/OpenAPI, ni colección Postman/Insomnia, ni documentación de contrato formal (schemas de request/response, códigos de error enumerados fuera de las specs). Lo que existe es:
- Una tabla Markdown en el README con método, ruta, auth y descripción de una línea — suficiente para orientarse, insuficiente para integrarse sin leer código (no especifica shape de payloads ni códigos de error).
- Las specs de OpenSpec, que sí documentan request/response con detalle alto (incluyen escenarios Given/When/Then, códigos de error como `E_INVALID_CREDENTIALS`, `E_UNAUTHORIZED_ACCESS`, `E_ROW_NOT_FOUND`) — pero cubren solo `authentication` y `users`, no incluyen ejemplos de JSON crudo, y **una de ellas documenta como implementado un endpoint que no existe en el código** (ver §8), lo que resta fiabilidad a la spec como fuente de integración: no basta con leerla, hay que verificarla contra el código.

**Observación**: para integrarse contra `/account/register`, `/account/login` o `/account/logout` sin leer el código, las specs de OpenSpec son la mejor fuente hoy — pero no están pensadas como documentación de integración (no hay ejemplos de curl, no hay OpenAPI importable). El endpoint raíz `GET /` (que devuelve `{ app, status }`) no está documentado en ningún sitio.

---

## 4. Docstrings y comentarios significativos en código — 🟡 Parcial

**Inspeccionado**: los 5 controllers (`new_accounts_controller.ts`, `access_tokens_controller.ts`, `profiles_controller.ts`, `users_controller.ts`, `health_controller.ts`), el modelo `User` ([`backend/app/models/user.ts`](../backend/app/models/user.ts)), `UserTransformer`, y los validators de VineJS.

**Lo que está bien**: todos los controllers tienen un comentario JSDoc-style de 2 líneas por método (verbo HTTP + ruta + una frase de qué hace), por ejemplo en `access_tokens_controller.ts`:
```ts
/**
 * POST /account/login
 * Verifica credenciales y emite un access token.
 */
```
Esto es consistente en los 5 controllers — es un patrón deliberado, no accidental. `UserTransformer` y los validators de `auth.ts` también llevan un comentario de una línea explicando su propósito (no el qué, sino el porqué de centralizar la serialización).

También está documentado con el mismo patrón el middleware [`backend/app/middleware/auth_middleware.ts`](../backend/app/middleware/auth_middleware.ts) ("protege rutas verificando el access token en la cabecera `Authorization: Bearer <token>`").

**Lo que falta**: son comentarios de "qué hace" (redundantes con el nombre del método + la ruta), no TSDoc real con `@param`/`@returns`/`@throws`. El modelo `User` (`user.ts`) **no tiene ningún comentario** — ni sobre `withAuthFinder`, ni sobre por qué `password` usa `serializeAs: null`, ni sobre la configuración de `DbAccessTokensProvider` (prefijo `oat_`, expiración 30 días), que son decisiones no obvias a simple vista. No hay comentarios sobre casos de error o edge cases (p. ej. qué pasa si `auth.getUserOrFail()` falla).

**Observación**: el patrón de comentario "ruta + una frase" es útil pero mínimo; el archivo con más lógica no trivial (`user.ts`, por la configuración de auth) es el que menos documentación inline tiene.

---

## 5. Decisiones técnicas registradas (ADRs) — 🔴 Inexistente

**Búsqueda realizada**: no existe carpeta `docs/adr/`, ni `adr/`, ni ningún archivo con patrón `*ADR*` en el repo. `docs/README.md` menciona textualmente: *"ADRs y diagramas de arquitectura se añaden en sesiones posteriores"* — es decir, se reconoce el hueco pero está pendiente, no es un olvido silencioso.

**Observación**: hay varias decisiones técnicas no triviales tomadas en el código (SQLite vía `better-sqlite3`, guard `api` con access tokens en vez de sesiones, scrypt para hash de password, expiración de token de 30 días, prefijo `oat_`) que hoy no tienen ningún registro de *por qué* se eligieron ni qué alternativas se descartaron. Todo vive implícito en el código y en `CLAUDE.md`.

---

## 6. Guía operacional (deploy / runbooks / troubleshooting) — 🔴 Inexistente

**Búsqueda realizada**: no hay `Dockerfile`, `docker-compose.yml`, carpeta `.github/workflows/` (ni ningún otro CI/CD), ni documento de troubleshooting o runbook. No hay instrucciones de despliegue a ningún entorno (solo `NODE_ENV=development` en `.env.example`, sin contraparte de producción documentada).

**Observación**: el proyecto está documentado únicamente para desarrollo local. No hay guía de qué hacer si `migration:run` falla, cómo rotar `APP_KEY`, cómo desplegar a un entorno real, ni pipeline de CI que valide `typecheck`/`test` en cada cambio. Coherente con el propósito del repo (starter kit educativo), pero es un hueco real si se evalúa como "producto".

---

## 7. Convenciones de código del proyecto — 🟢 Completo

**Dónde**: [`CLAUDE.md`](../CLAUDE.md) (raíz), reforzado por `backend/README.md` (sección "Convenciones") y `openspec/config.yaml` (bloque `context`).

`CLAUDE.md` cubre stack, comandos de ambas apps, convenciones de backend (lógica en controllers, validación siempre con VineJS, serialización siempre vía `UserTransformer`, rutas bajo `/api/v1`, subpath imports, qué NO hacer) y referencia el flujo OpenSpec. Es explícito, corto y accionable — cumple bien su función de "memoria para copilotos de IA". El propio archivo documenta su origen: nace como `AGENTS.md` y se enlaza como `CLAUDE.md` vía symlink (mencionado en el encabezado del archivo, aunque en este checkout concreto `CLAUDE.md` aparece como archivo regular, no como symlink — divergencia menor respecto a lo que el propio documento describe).

**Observación**: es el documento mejor logrado de todo el repo — corto, sin relleno, y las tres fuentes (CLAUDE.md, backend/README.md, openspec/config.yaml) son consistentes entre sí, no contradictorias. Único matiz: no cubre convenciones del lado frontend (naming de componentes, estructura de `services/`, manejo de estado) — todas las convenciones documentadas son de backend.

---

## 8. Especificación OpenSpec y su trazabilidad con el código — 🔴 Divergencia confirmada

**Dónde**: [`openspec/specs/authentication/spec.md`](../openspec/specs/authentication/spec.md), [`openspec/specs/users/spec.md`](../openspec/specs/users/spec.md), comparadas contra [`backend/start/routes.ts`](../backend/start/routes.ts) y los controllers reales.

**Lo que coincide** (spec ↔ código, verificado línea por línea):

| Spec | Endpoint documentado | Existe en `routes.ts` | Controller |
|---|---|---|---|
| authentication | `POST /api/v1/account/register` | ✅ | `new_accounts_controller.ts#store` |
| authentication | `POST /api/v1/account/login` | ✅ | `access_tokens_controller.ts#store` |
| authentication | `POST /api/v1/account/logout` | ✅ | `access_tokens_controller.ts#destroy` |
| authentication | `GET /api/v1/account/profile` | ✅ | `profiles_controller.ts#show` |
| users | `GET /api/v1/users` | ✅ | `users_controller.ts#index` |
| users | `GET /api/v1/users/:id` | ✅ | `users_controller.ts#show` |

**Divergencia confirmada**: la spec de `users` ([`openspec/specs/users/spec.md:51-77`](../openspec/specs/users/spec.md)) documenta el requirement **"Listado de usuarios activos"**, `GET /api/v1/users/active`, con 3 escenarios completos, y afirma en su cabecera que *"esta spec documenta el comportamiento **ya implementado**"*. Sin embargo:
- No existe la ruta `/users/active` en `backend/start/routes.ts`.
- `UsersController` solo tiene los métodos `index` y `show`; no hay método `active`.
- El propio código deja un comentario en `users_controller.ts` señalando que ese endpoint "se implementa EN VIVO durante la demo de la Sesión 3" — una referencia a un evento externo al repo, sin fecha ni issue asociado, que no aporta certeza sobre cuándo o si se resolverá.
- El campo de datos que necesitaría (`lastSeenAt`) **sí existe** en el modelo `User` y se actualiza en el login — el dato está listo, pero el endpoint no está expuesto.

**Esto es un defecto real de trazabilidad**, no un matiz cosmético: la spec afirma explícitamente que el comportamiento "ya está implementado", lo cual es falso a día de hoy. Cualquiera que confíe en la spec sin verificar contra el código (por ejemplo, para integrarse contra la API) se encontrará con un `404`/`400` inesperado. El README lo mitiga parcialmente con su nota, pero la spec de OpenSpec —que debería ser la fuente de verdad viva del comportamiento— no lo refleja: no marca el requirement como pendiente, borrador o futuro, lo presenta como hecho consumado.

**Recomendación**: marcar explícitamente en la spec el requirement "Listado de usuarios activos" como pendiente de implementación (o moverlo a un `change` de OpenSpec en curso en vez de la spec archivada), hasta que el endpoint exista en `backend/start/routes.ts` y en `users_controller.ts`.

**Observación adicional**: no hay spec de OpenSpec para el endpoint `GET /` (raíz, fuera de `/api/v1`) ni para `GET /api/v1/health`, aunque este último sí está en el README y tiene un comentario en el código ("Creado en S2 vía OpenSpec") que sugiere que existió un ciclo OpenSpec para él, sin spec archivada visible en `openspec/specs/`.

---

## 9. Documentación adicional detectada (fuera de la lista original)

### 9.1 PRD (Product Requirements Document) — 🟡 Parcial (completo en forma, divergente en fondo)
**Dónde**: [`docs/PRD.md`](../docs/PRD.md) — "FlowSync MVP", v1.0, Q3 2026.
Documento de producto extenso y bien estructurado: resumen ejecutivo, alcance in/out, usuario objetivo y JTBD, requisitos funcionales por área (auth, CRUD de tareas, filtrado, exportación CSV, sync con Google Calendar), requisitos no funcionales, stack técnico, criterios de éxito del MVP y riesgos conocidos. Como documento en sí mismo, está bien escrito y cumpliría su función de referencia para decomponer en backlog.

**Observación importante — divergencia grave con el código**: el PRD describe un producto (**FlowSync**, gestor de tareas con sincronización a Google Calendar) que **no es el que existe en el código actual**. El backend implementado es un starter kit de autenticación (registro, login, logout, perfil, listado de usuarios) sin ningún modelo de tareas (`Task`), sin CRUD de tareas, sin exportación CSV y sin integración con Google Calendar — es decir, ninguno de los requisitos funcionales §3.2 a §3.5 del PRD tiene rastro en `backend/app/` ni en `frontend/src/`. Solo §3.1 (autenticación) tiene correspondencia real con el código.

`docs/README.md` da una pista de que el PRD podría ser insumo para un ejercicio posterior ("a partir de él se generan las historias de usuario"), pero **no hay ninguna nota en el propio PRD, ni una fecha, ni una marca de versión/estado que indique que estos requisitos no aplican todavía al código de este repositorio**. Sin más contexto que los archivos del propio repo, un lector razonable concluiría que el PRD está gravemente desactualizado respecto a lo implementado, o que documenta un roadmap sin ninguna señal explícita de en qué fase se encuentra cada requisito. Se marca como **parcial** y no como "no aplica", porque el PRD sí pretende describir el producto del repositorio y actualmente no lo hace con precisión frente al código real.

### 9.2 CHANGELOG / CONTRIBUTING — 🔴 Inexistente
No hay `CHANGELOG.md` ni `CONTRIBUTING.md` en ningún nivel del repo. Dado que el historial de commits es corto y sigue conventional commits (declarado en `openspec/config.yaml`), el hueco es menor en el estado actual, pero sería el primer artefacto a añadir si el repo creciera más allá del contexto de curso.

### 9.3 Tests como documentación viva — 🔴 Inexistente
`backend/README.md` referencia `npm run test` (Japa) como script disponible, pero no se encontró carpeta `backend/tests/` con casos reales más allá del scaffold — no hay suite de tests que sirva de documentación ejecutable del comportamiento de la API.

---

## Resumen ejecutivo

| # | Categoría | Estado |
|---|---|---|
| 1 | README de proyecto | 🟢 Completo |
| 2 | Arquitectura general | 🟡 Parcial (disperso, sin diagrama) |
| 3 | Documentación de API/endpoints | 🟡 Parcial (sin OpenAPI, cubierto solo por specs + tabla README) |
| 4 | Docstrings/comentarios en código | 🟡 Parcial (controllers sí, modelo no) |
| 5 | ADRs / decisiones técnicas | 🔴 Inexistente (reconocido como pendiente en `docs/README.md`) |
| 6 | Guía operacional (deploy/runbooks) | 🔴 Inexistente |
| 7 | Convenciones de código (CLAUDE.md) | 🟢 Completo |
| 8 | OpenSpec y trazabilidad | 🔴 **Divergencia confirmada** — `GET /api/v1/users/active` documentado como "ya implementado" y no existe en el código |
| 9.1 | PRD de producto | 🟡 Parcial — bien escrito, pero describe un producto (FlowSync + tareas + Google Calendar) sin correspondencia con el código actual, sin nota que lo aclare |
| 9.2 | CHANGELOG/CONTRIBUTING | 🔴 Inexistente |
| 9.3 | Tests como documentación viva | 🔴 Inexistente |

**Lectura global**: la documentación de arranque y convenciones (README, CLAUDE.md) está muy por encima de la media — es clara, verificada y sin relleno. Los huecos declarados como pendientes por el propio proyecto (ADRs, diagramas de arquitectura) son aceptables porque están anunciados como tales en `docs/README.md`. Sin embargo, hay dos hallazgos que sí requieren corrección:

1. **La spec de OpenSpec de `users` afirma como implementado un endpoint (`GET /api/v1/users/active`) que no existe en el código.** Esto rompe la fiabilidad de la spec como fuente de verdad — cualquier integración basada en ella fallará en ese endpoint.
2. **El PRD (`docs/PRD.md`) describe un producto sustancialmente distinto al implementado**, sin ninguna nota de estado, versión o alcance que explique la distancia entre lo documentado y lo que hay en `backend/` y `frontend/`.

Ambos hallazgos son del tipo "la documentación dice algo que el código no confirma" — el riesgo real de este repositorio no es la falta de documentación, sino la presencia de documentación que no se puede tomar al pie de la letra sin verificarla contra el código.

---

## Top 3 carencias

1. **Spec de OpenSpec desincronizada del código (`GET /api/v1/users/active`)** — [§8](#8-especificación-openspec-y-su-trazabilidad-con-el-código--divergencia-confirmada). La spec de `users` afirma que el endpoint "ya está implementado" y no lo está; es la única fuente de documentación de contrato de API que existe para esa capability, y falla en el peor sitio posible: en la afirmación de que algo funciona cuando no lo hace.
2. **Ausencia total de guía operacional (deploy, CI/CD, runbooks)** — [§6](#6-guía-operacional-deploy--runbooks--troubleshooting--inexistente). No hay Dockerfile, pipeline de CI ni instrucciones más allá de `desarrollo local`. Cualquier intento de llevar este proyecto a un entorno real (o simplemente de validar `typecheck`/`test` automáticamente en cada cambio) parte de cero.
3. **PRD sin relación declarada con el código actual** — [§9.1](#91-prd-product-requirements-document--parcial-completo-en-forma-divergente-en-fondo). Describe un producto (FlowSync + tareas + Google Calendar) que no tiene ninguna implementación en `backend/` ni `frontend/`, y no incluye ninguna nota de alcance/estado que evite la lectura de "documento abandonado o gravemente desactualizado".

## Top 3 fortalezas

1. **README de arranque sin fricción** — [§1](#1-readme-de-proyecto--completo). Instalación, `.env`, migraciones y arranque de ambos servicios están cubiertos con comandos copiables y verificados contra el código real; nadie necesita preguntar cómo levantar el proyecto.
2. **Convenciones de código explícitas y consistentes (`CLAUDE.md`)** — [§7](#7-convenciones-de-código-del-proyecto--completo). Documento corto, sin relleno, y corroborado por tres fuentes independientes (`CLAUDE.md`, `backend/README.md`, `openspec/config.yaml`) que no se contradicen entre sí — la mejor pieza de documentación de todo el repositorio.
3. **Patrón de comentarios de ruta en controllers** — [§4](#4-docstrings-y-comentarios-significativos-en-código--parcial). Los cinco controllers y el middleware de auth siguen de forma consistente el mismo formato mínimo (verbo HTTP + ruta + una frase), lo que da trazabilidad rápida entre código y endpoint sin necesidad de abrir `routes.ts`.
