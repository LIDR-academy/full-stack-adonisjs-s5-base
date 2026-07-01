# Uso de VineJS para validación en lugar de Zod

- Status: accepted
- Deciders: Equipo FlowSync (formación AI4Devs)
- Date: 2026-07-01
- Tags: validación, dx, adonisjs

Technical Story: Elegir la librería de validación de input para los endpoints de FlowSync.

## Context and Problem Statement

Los endpoints de FlowSync validan el input del cliente antes de tocar la base de datos:
el registro (`signupValidator`) y el login (`loginValidator`) definidos en
`backend/app/validators/auth.ts`. Necesitamos una librería de validación que se integre
de forma natural con AdonisJS 7 y con `request.validateUsing(...)`, que produzca errores
HTTP 422 coherentes y que permita validaciones asíncronas (p. ej. comprobar que un email
no está ya registrado). ¿Qué librería de validación deberíamos adoptar?

## Decision Drivers

- **Integración nativa con AdonisJS 7:** debe funcionar con `request.validateUsing()` y
  con el manejo de errores del framework (respuestas 422 con el shape estándar).
- **Validaciones asíncronas de negocio:** el registro necesita `unique()` contra la BD.
- **Rendimiento:** la validación está en el camino caliente de cada request.
- **Coste de dependencias y mantenimiento:** preferimos no añadir librerías redundantes
  con lo que ya trae el framework.
- **Curva de aprendizaje** coherente con el resto del stack de AdonisJS.

## Considered Options

- VineJS (`@vinejs/vine`), la librería de validación oficial de AdonisJS
- Zod
- Yup

## Decision Outcome

Chosen option: **"VineJS (`@vinejs/vine`)"**, porque es la librería de validación que
AdonisJS 7 trae e integra de forma nativa: `request.validateUsing(validator)` consume
directamente un validador de VineJS y traduce sus fallos a respuestas HTTP 422 con el
shape estándar del framework, sin código de pegamento. Además soporta reglas asíncronas
—como el `unique()` sobre la tabla `users` que usa `signupValidator`— y está optimizada
para rendimiento (compila los esquemas). Adoptar Zod o Yup añadiría una dependencia
redundante y un adaptador manual para lograr lo que VineJS ya hace de fábrica.

### Positive Consequences

- Cero código de integración: los validadores se usan con `request.validateUsing()`.
- Manejo de errores 422 uniforme y automático en toda la API.
- Reglas asíncronas de negocio (`unique`, `normalizeEmail`, `trim`) listas para usar.
- Una dependencia menos que mantener: es parte del ecosistema oficial de AdonisJS.

### Negative Consequences

- VineJS está acoplado al ecosistema AdonisJS; fuera de él tiene menos tracción que Zod.
- No genera tipos "inferidos" tan idiomáticos como Zod en proyectos front puramente TS
  (aunque en el backend Adonis el tipado de los validadores es suficiente).
- Menor cantidad de ejemplos/recetas en la comunidad general comparado con Zod.

## Pros and Cons of the Options

### VineJS (`@vinejs/vine`)

Librería de validación oficial de AdonisJS. Evidencia real:
`backend/app/validators/auth.ts` define `signupValidator` (con `email().unique(...)`,
`normalizeEmail()`, `minLength/maxLength`) y `loginValidator`, consumidos por los
controllers vía `request.validateUsing()`.

- Good, porque se integra de forma nativa con AdonisJS 7 y `validateUsing()`.
- Good, porque traduce los fallos a 422 con el shape estándar sin adaptadores.
- Good, porque soporta reglas asíncronas (`unique`) y transformaciones (`normalizeEmail`).
- Good, porque está optimizada para rendimiento (compila los esquemas).
- Bad, porque está acoplada al ecosistema AdonisJS.

### Zod

Librería de validación TS muy popular, con excelente inferencia de tipos.

- Good, porque tiene una comunidad enorme y gran inferencia de tipos.
- Bad, porque no se integra de forma nativa con `request.validateUsing()`: requiere un
  adaptador manual para el manejo de errores 422 del framework.
- Bad, porque añade una dependencia redundante con lo que AdonisJS ya provee.

### Yup

Librería de validación por esquemas, anterior a Zod.

- Good, porque es madura y conocida.
- Bad, porque tampoco se integra de forma nativa con AdonisJS.
- Bad, porque su tipado e integración con TS son inferiores a los de VineJS/Zod.

## Links

- Refines [Uso de SQLite + better-sqlite3 en lugar de PostgreSQL](20260701-uso-de-sqlite-better-sqlite3-en-lugar-de-postgresql.md)
- Evidencia: `backend/app/validators/auth.ts`
