# Ejercicio S5 — Revisión de backlog + Auditoría de documentación

**Autor:** Emilio Fernández · **Fecha:** 2026-07-07
**Repo auditado:** clon del template `LIDR-academy/full-stack-adonisjs-s5-base` (carpeta `Ejercicio5B/full-stack-adonisjs-s5-base/`)
**Insumo Parte A:** entregable pre-S4 (`Ejercicio4/entregables/sesion-04/`: `prompt.md`, `output.md`, `poke-holes.md`, `reflexion.md`)

> Nota de trazabilidad: este repo es un clon limpio del mismo template que se auditó en `Ejercicio5/`. Se verificó que los archivos clave (README, CLAUDE.md, PRD, `start/routes.ts`, specs OpenSpec, controllers) son **idénticos** entre ambas carpetas, por lo que los hallazgos aplican al template base, no a una variante.

---

## Parte A — Revisión de mi backlog de historias de usuario

### Paso 1 — Entregable recuperado

Backlog de FlowSync generado en el ejercicio pre-S4 (`Ejercicio4/entregables/sesion-04/output.md`): 13 user stories en 5 épicas — Autenticación (3), CRUD de tareas (5), Organización/filtrado (1), Exportación (1), Sincronización con Google Calendar (3). Prompt de descomposición con rol de PO, alcance explícito, non-goals y marca `(asumido)` para inferencias. Más un ejercicio de *poke-holes* sobre `US-SYNC-02` y una reflexión.

### Paso 2 — Contraste con lo que sé hoy

**¿Siguen teniendo sentido? ¿El alcance sigue ceñido al MVP?**
Sí. El alcance sigue pegado al PRD (`docs/PRD.md` §3): auth, CRUD con estados `pending/completed/archived`, filtro por estado, export CSV, sync con Google. No se coló ninguna feature inventada — el prompt fijó non-goals explícitos (equipos, etiquetas, app nativa, sync inversa completa) y la IA los respetó. Acierto que mantengo: **no generé una story de sincronización bidireccional** pese a que el PRD §1 dice "los cambios fluyen en ambas direcciones"; la nota de producto §3.5 aclara que la inversa es un deseo sujeto a spike. La story habría sido *scope inventado sobre una frase optimista*.

**¿Criterios de aceptación incompletos o poco verificables?**
Sí, varios que hoy veo flojos:
- `US-SYNC-02` / `US-SYNC-03` — "se reintenta más tarde" **no es verificable**: sin política (nº reintentos, backoff, indicador de "sin sincronizar") no se puede medir el criterio de éxito del PRD "<5% de fallos no recuperables". Lo detecté en el poke-holes y sigue vigente.
- **Zona horaria e idempotencia sin definir** en el sync: fecha límite (día) → evento (hora inicio/fin) sin TZ; sin mapeo tarea↔evento, un reintento puede duplicar eventos.
- `US-TASK-02` — "las más relevantes para hoy primero" `(asumido)`: sin criterio de orden concreto, no es comprobable.
- `US-EXP-01` — alcance del CSV (¿respeta el filtro activo?) marcado `(asumido)`: es una decisión de producto pendiente, no un AC cerrado.

**¿Historias que cambiaron de naturaleza?**
La épica de **Sincronización** cambió de "features listas para refinar" a **enabler + spike**. El PRD §7 declara la sync como el mayor riesgo técnico y recomienda un spike *antes* de descomponerla. Hoy no la trataría como 3 stories entregables planas, sino como un spike técnico que precede y condiciona a `US-SYNC-01/02/03`. También aparece una **dependencia no explicitada**: SYNC-02/03 asumen conexión OAuth viva (token no expirado/revocado) — depende de SYNC-01 de forma que en su día no marqué.

**¿Historias nuevas que ahora deberían estar?**
- **"Quitar la fecha límite a una tarea ya sincronizada → se elimina su evento"**: gap que cae entre SYNC-02 (crear al añadir fecha) y SYNC-03 (cambiar/borrar). No lo cubre ninguna.
- **"Reconexión ante token OAuth expirado/revocado"**: qué ve el usuario y cómo re-autoriza. Supuesto implícito hoy convertido en story.
- **Spike técnico de sincronización con Google Calendar** (TZ, rate limits 429 vs 403, idempotencia, política de reintento) como historia habilitadora previa.

**Contraste con el backlog del mentor en Linear (S4).**
No conservo captura del tablero exacto del directo, así que lo enmarco como aprendizaje, no como veredicto. Yo **prioricé plano por épicas** (las 5 en paralelo, con igual peso). El mentor secuenció por **riesgo y dependencia** (walking skeleton auth+CRUD primero, sync detrás de spike). Ahí acertó él: mi agrupación por épica infravaloró que el sync es el 80% del riesgo del MVP y arrastra a las demás. Yo acerté en la **higiene de alcance y trazabilidad al PRD** (`(asumido)` explícito, non-goals), que hace el backlog auditable. Conclusión: buen *qué*, orden de ataque mejorable.

### Paso 3 — Ajustes concretos (no aplicados, solo identificados)

1. **Ajuste:** Convertir la épica de Sincronización en *spike técnico primero* + stories condicionadas a su resultado; reordenar el backlog a walking skeleton (auth → CRUD → filtro/export → sync).
   **Motivo:** El PRD §7 marca la sync como mayor riesgo y pide spike previo; tras S4/S5 entiendo que priorizar por riesgo/dependencia vale más que agrupar por épica.

2. **Ajuste:** Reescribir los AC de `US-SYNC-02/03` con política de reintento medible (nº, backoff, estado "sin sincronizar" visible) y distinguir error transitorio (429, reintentar) de permanente (403/auth revocada, no reintentar).
   **Motivo:** Sin esto el AC no es verificable y no se puede medir el criterio "<5% fallos no recuperables" del PRD.

3. **Ajuste:** Añadir la story "quitar fecha límite → borrar evento" y la de "reconexión OAuth tras token revocado".
   **Motivo:** Gaps reales detectados en poke-holes que caen entre stories o quedaban como supuesto implícito.

4. **Ajuste:** Cerrar los `(asumido)` de producto (orden por defecto, ocultar archivadas, alcance del CSV) como decisiones explícitas antes del refinamiento.
   **Motivo:** Son decisiones de producto pendientes disfrazadas de AC; deben resolverse, no asumirse.

---

## Parte B — Auditoría de documentación del proyecto

### Paso 4 — Formato elegido

Tabla en Markdown (tipo · estado · observación · ubicación) + cierre con dos Top 3. Artefacto consultable, un tipo por fila, más tipos adicionales detectados al final.

### Paso 5 — Auditoría por tipo

| # | Tipo de documentación | Estado | Observación | Ubicación |
|---|---|---|---|---|
| 1 | **README de proyecto** | **Completa** | Permite arrancar de cero sin preguntar: requisito Node 24, `npm install`, `cp .env.example .env`, `node ace generate:key`, `migration:run`, `npm run dev` para backend y frontend, con puertos. Falta menor: no menciona `typecheck` ni tests, y "VITE_API_URL ya apunta" sin verificar el valor. | `README.md` |
| 2 | **Arquitectura general** | **Parcial o pobre** | No hay documento dedicado. Se cubre a trozos: árbol de carpetas en `README.md` y tabla de stack en `CLAUDE.md`. **No hay diagrama de componentes ni de relaciones**; `docs/README.md` promete "diagramas de arquitectura" y el PRD menciona un "diagrama C4" que **no existen** en el repo. | `README.md`, `CLAUDE.md`, `docs/README.md` |
| 3 | **API / endpoints** | **Parcial o pobre** | Tabla de endpoints en README (método/ruta/auth/descripción) buena para descubrir la superficie; las specs OpenSpec de `auth`/`users` documentan comportamiento con códigos HTTP. Pero **no hay OpenAPI ni esquemas de request/response con ejemplos de payload**: integrarse aún exige leer specs + validators. | `README.md`, `openspec/specs/*/spec.md` |
| 4 | **Docstrings / TSDoc** | **Parcial o pobre** | Los controllers tienen comentario de cabecera útil (ruta + propósito): `users_controller.ts`, `new_accounts_controller.ts`, `health_controller.ts`. No es TSDoc formal (`@param`/`@returns`), y models/transformers/validators quedan sin doc inline. Aceptable pero desigual. | `backend/app/controllers/*.ts` |
| 5 | **Decisiones técnicas (ADRs)** | **Inexistente** | No hay carpeta ni archivo ADR. `docs/README.md` dice que "se añaden en sesiones posteriores". Decisiones relevantes (access tokens vs JWT, SQLite, patrón transformer, prefijo `/api/v1`) viven implícitas en `CLAUDE.md` sin justificar ni registrar alternativas descartadas. | — (esperable en `docs/adr/`) |
| 6 | **Guía operacional** | **Inexistente** | No hay instrucciones de despliegue, runbooks de incidencias ni troubleshooting. Solo arranque en local. Nada sobre producción, backups de SQLite, rotación de `APP_KEY`, ni qué hacer si falla una migración. | — |
| 7 | **Convenciones de código** | **Completa** | `CLAUDE.md` tiene secciones "Convenciones del backend" y "No hacer" claras: lógica en controllers (no en rutas), validación con VineJS, salida siempre vía `UserTransformer`, subpath imports, prefijo `/api/v1`. Matiz: afirma un symlink `AGENTS.md → CLAUDE.md` que **no existe** (solo hay `CLAUDE.md`). | `CLAUDE.md` |
| 8 | **OpenSpec y trazabilidad con el código** | **Parcial o pobre (divergencia)** | Las specs de `authentication` y `health` coinciden con el código (`routes.ts` + controllers). **Divergencia detectada:** `openspec/specs/users/spec.md` documenta `GET /api/v1/users/active` como *Requirement* completo con 3 scenarios, pero ese endpoint **no existe** en `routes.ts` ni en `users_controller.ts` (comentario: "se implementa en vivo en la Sesión 3"). La spec va por delante del código; el README lo relega a nota al pie. | `openspec/specs/users/spec.md` vs `backend/start/routes.ts`, `backend/app/controllers/users_controller.ts` |

**Tipos adicionales detectados:**

| # | Tipo | Estado | Observación | Ubicación |
|---|---|---|---|---|
| 9 | **Documentación de tests** | **Inexistente** | Solo existe `backend/tests/bootstrap.ts`; no hay tests reales ni doc de cómo/qué se testea. No hay comando de test documentado en README. | `backend/tests/` |
| 10 | **Coherencia CLAUDE.md ↔ repo** | **Parcial** | `CLAUDE.md` describe estado esperado (symlink `AGENTS.md`) que no se corresponde con el repo actual. Riesgo de instrucción obsoleta para copilotos. | `CLAUDE.md` |
| 11 | **PRD de producto** | **No aplica (a la auditoría de doc técnica)** — presente y completo | `docs/PRD.md` es insumo de producto, no documentación de ingeniería del código; está y es sólido. Se marca "no aplica" porque no es objeto de esta auditoría técnica. | `docs/PRD.md` |
| 12 | **NOTAS-FORMADOR.md** | **No aplica** | Material de facilitación del máster, no documentación del proyecto entregable. | `docs/NOTAS-FORMADOR.md` |

### Paso 6 — Cierre

**Top 3 carencias que más duelen:**
1. **Sin guía operacional (deploy / runbook / troubleshooting).** El proyecto no se puede llevar a producción ni recuperar de una incidencia siguiendo doc; todo es conocimiento tácito.
2. **Sin ADRs.** Las decisiones clave (access tokens, SQLite, patrón transformer) no tienen "por qué" ni alternativas descartadas registradas — el onboarding pierde el razonamiento y se repiten debates.
3. **Divergencia spec↔código en `users/active`.** La spec afirma un endpoint que no existe en el código; erosiona la confianza en OpenSpec como fuente de verdad y es exactamente el tipo de deriva que la trazabilidad debería impedir.

**Top 3 cosas que ya están bien (no romper):**
1. **README arrancable de cero**, comando a comando, backend + frontend con puertos y `.env`.
2. **`CLAUDE.md` con convenciones y "No hacer" explícitas** — alinea a copilotos y humanos en patrones del repo.
3. **Specs OpenSpec de `auth`/`users` bien escritas** (scenarios con códigos HTTP y contrato de salida) — base sólida de contrato de API.

---

## Paso 7 — Exploración rápida de tres formatos (una línea cada uno)

- **Diagrama C4:** aporta las *relaciones y fronteras* entre contenedores/componentes a un vistazo (quién llama a quién y por qué límite pasa), algo que una lista de carpetas en Markdown no transmite.
- **ADR:** captura el *porqué* de una decisión y las alternativas descartadas con su contexto y fecha, convirtiendo notas sueltas en memoria trazable y no re-litigable.
- **Especificación OpenAPI:** ofrece un *contrato máquina-legible* de la API (schemas, códigos, ejemplos) del que se generan clientes, mocks y validación — integrarse no depende de leer el código de las rutas.
