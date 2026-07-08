# Auditoría de Documentación — FlowSync Starter Kit

> Fecha: 2026-07-08 · Auditor: copiloto IA · Commit base: rama actual

---

## Matriz de estado

| Tipo de documentación | Estado | Observación | Ubicación |
|---|---|---|---|
| README de proyecto (arranque desde cero) | **Completa** | Cubre requisitos, install, `.env`, migraciones y dev server para backend y frontend. Un nuevo desarrollador puede levantar el proyecto sin ayuda externa. | `README.md` (raíz) |
| Arquitectura general | **Parcial** | No existe documento dedicado. La información está dispersa: stack en `CLAUDE.md`, árbol en `README.md`, contexto en `openspec/config.yaml`. Falta diagrama de componentes, flujo de auth end-to-end y relación frontend↔backend. | Dispersa (ver observación) |
| Documentación de API / endpoints | **Parcial** | Tabla resumen en el README (7 endpoints, 1 línea c/u). Las specs OpenSpec detallan comportamiento con scenarios, pero no hay OpenAPI/Swagger, ni ejemplos de request/response body, ni catálogo de códigos de error. Un integrador no puede consumir la API sin leer validators. | `README.md` §Endpoints; `openspec/specs/authentication/spec.md`; `openspec/specs/users/spec.md` |
| Docstrings / comentarios en código | **Parcial** | Controllers tienen JSDoc mínimo (ruta + frase). `UserTransformer` tiene bloque descriptivo útil. Modelo `User` y todo el frontend carecen de docstrings. No hay TSDoc con `@param`/`@returns`/`@throws`. | `backend/app/controllers/*`; `backend/app/transformers/user_transformer.ts` |
| Decisiones técnicas (ADRs) | **Inexistente** | No hay ADRs ni equivalente. Decisiones como SQLite vs Postgres, tokens vs JWT stateless, sin service layer, quedan sin registro. `docs/README.md` reconoce que "se añaden en sesiones posteriores". | — |
| Guía operacional (deploy, runbooks) | **Inexistente** | No hay instrucciones de deploy, Dockerfile, CI/CD, ni troubleshooting. El proyecto solo contempla desarrollo local. | — |
| Convenciones de código | **Completa** | `CLAUDE.md` documenta de forma clara y accionable: lógica en controllers, validación con VineJS, salida vía transformers, subpath imports, prefijo `/api/v1`, lista de "No hacer". Aplicable tanto por humanos como por copilotos IA. | `CLAUDE.md` (raíz, symlink a `AGENTS.md`) |
| OpenSpec: trazabilidad spec ↔ código | **Parcial** | Divergencia confirmada: `openspec/specs/users/spec.md` documenta `GET /api/v1/users/active` (3 scenarios) como "ya implementado", pero el endpoint **no existe** en `routes.ts` ni en `users_controller.ts`. Inversamente, `GET /api/v1/health` y `GET /` están implementados sin spec. | Spec: `openspec/specs/users/spec.md` §"Listado de usuarios activos"; Código: `backend/start/routes.ts`, `backend/app/controllers/users_controller.ts` |
| Contratos frontend ↔ backend (tipos compartidos) | **Parcial** | El frontend define tipos en `@/types/auth` que duplican el shape de `UserTransformer` sin fuente de verdad compartida. No hay generación automática ni schema que los vincule. Un cambio en el transformer puede romper el frontend silenciosamente. | `frontend/src/types/auth.ts`; `backend/app/transformers/user_transformer.ts` |

---

## Top 3 carencias que más duelen

1. **La spec de `users` miente sobre lo implementado.** Documenta `GET /api/v1/users/active` como existente cuando no lo está. Cualquiera que confíe en la spec para integrar o testear va a chocar con un 404. La trazabilidad spec↔código queda en duda para todo el proyecto.

2. **No hay documentación de API consumible (OpenAPI o ejemplos de payload).** Un desarrollador frontend, un tester o un integrador externo no puede saber qué JSON enviar ni qué forma tiene la respuesta sin leer el código de validators y transformers. Esto frena la colaboración.

3. **Cero ADRs: las decisiones técnicas son orales.** No queda registro de por qué se eligió SQLite, access tokens en vez de JWT stateless, o por qué no hay service layer. Si alguien cuestiona una decisión o necesita cambiarla, no tiene contexto para evaluar trade-offs.

---

## Top 3 cosas que ya están bien

1. **El README permite arrancar el proyecto en < 5 minutos.** Pasos claros, sin ambigüedad, para ambos stacks. No deja preguntas pendientes sobre setup.

2. **`CLAUDE.md` es una guía de convenciones excelente.** Concisa, accionable, con reglas positivas y negativas. Tanto un humano como un copiloto IA producen código consistente siguiéndola.

3. **Las specs OpenSpec de `authentication` son fieles al código.** Los 4 requirements con sus scenarios reflejan exactamente lo que hacen los controllers. Sirven como contrato de comportamiento confiable (al contrario de la spec de `users`).
