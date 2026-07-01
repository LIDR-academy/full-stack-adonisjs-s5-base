# Uso de SQLite + better-sqlite3 en lugar de PostgreSQL

- Status: accepted
- Deciders: Equipo FlowSync (formación AI4Devs)
- Date: 2026-07-01
- Tags: persistencia, base-de-datos, dx

Technical Story: Elegir el motor de base de datos y el driver de Lucid para el starter kit FlowSync.

## Context and Problem Statement

FlowSync es un starter kit full-stack de autenticación por access tokens usado como
hilo conductor del máster AI4Devs. Necesita persistir usuarios (`users`) y tokens de
acceso (`auth_access_tokens`) mediante Lucid ORM. El objetivo prioritario del repo es
que cualquier alumno pueda clonar y arrancar el backend en minutos, sin instalar ni
administrar servicios externos. ¿Qué motor de base de datos y driver deberíamos usar
para maximizar la facilidad de arranque sin renunciar a un ORM real?

## Decision Drivers

- **Facilidad de arranque (zero-config):** un `npm install && node ace migration:run`
  debe bastar; nada de levantar contenedores ni servidores.
- **Portabilidad:** debe funcionar igual en macOS, Linux y Windows y en CI.
- **Compatibilidad con Lucid:** el ORM y las migraciones deben soportarlo de forma
  first-class para no perder el valor didáctico de Lucid/VineJS.
- **Coste operativo nulo en desarrollo y en las demos en vivo.**
- **Ruta de crecimiento:** poder migrar a un motor cliente/servidor si el proyecto
  escalara, sin reescribir el código de acceso a datos.

## Considered Options

- SQLite con el driver `better-sqlite3`
- SQLite con el driver `sqlite3` (basado en libsqlite asíncrono)
- PostgreSQL con el driver `pg`

## Decision Outcome

Chosen option: **"SQLite con el driver `better-sqlite3`"**, porque cumple el driver
principal —arranque zero-config y portable— manteniendo Lucid como ORM real. La base de
datos vive en un único fichero local (`tmp/db.sqlite3`), no requiere servicios externos
y `better-sqlite3` ofrece el mejor rendimiento y la API más simple (síncrona) de los
drivers de SQLite. Como el acceso a datos está encapsulado en Lucid, migrar a PostgreSQL
en el futuro se reduce a cambiar la configuración de conexión en `config/database.ts`.

### Positive Consequences

- Arranque inmediato: no hay que instalar ni administrar un servidor de base de datos.
- Reproducibilidad total en local y CI; el fichero SQLite se puede borrar y recrear con
  `node ace migration:fresh`.
- `better-sqlite3` es rápido y su naturaleza síncrona simplifica el código y los tests.
- El código sigue siendo agnóstico del motor gracias a Lucid.

### Negative Consequences

- SQLite no cubre escenarios de alta concurrencia de escritura ni despliegues
  multi-nodo; no es apto tal cual para producción a escala.
- `better-sqlite3` es un módulo nativo: requiere recompilar los bindings
  (`npm rebuild better-sqlite3`) al cambiar de versión de Node.
- Algunas features avanzadas de SQL (tipos ricos, extensiones) de PostgreSQL no están
  disponibles.

## Pros and Cons of the Options

### SQLite con el driver `better-sqlite3`

Motor embebido en un fichero, con driver nativo síncrono. Es el configurado en
`backend/config/database.ts` (`client: 'better-sqlite3'`, `filename: tmp/db.sqlite3`).

- Good, porque no necesita ningún servicio externo: arranque zero-config.
- Good, porque es el driver de SQLite más rápido y con API más simple.
- Good, porque Lucid lo soporta de forma nativa (migraciones incluidas).
- Bad, porque es un binario nativo que hay que recompilar entre versiones de Node.
- Bad, porque no escala a concurrencia alta ni a despliegues distribuidos.

### SQLite con el driver `sqlite3`

Mismo motor embebido, pero con el driver asíncrono clásico basado en node-gyp.

- Good, porque también es zero-config y soportado por Lucid.
- Bad, porque es más lento que `better-sqlite3` y su instalación nativa es más frágil.
- Bad, porque su API asíncrona no aporta ventaja real en este caso de uso.

### PostgreSQL con el driver `pg`

Motor cliente/servidor completo, driver JS puro.

- Good, porque es apto para producción, alta concurrencia y features SQL avanzadas.
- Good, porque `pg` es JS puro (sin binarios nativos que recompilar).
- Bad, porque exige levantar y administrar un servidor (o Docker), rompiendo el
  arranque zero-config que es el objetivo del starter kit.
- Bad, porque añade fricción y coste operativo innecesarios para el ámbito formativo.

## Links

- Refined by [Uso de VineJS para validación en lugar de Zod](20260701-uso-de-vinejs-para-validacion-en-lugar-de-zod.md)
- Configuración de conexión: `backend/config/database.ts`
