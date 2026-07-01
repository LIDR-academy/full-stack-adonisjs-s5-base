# Demo 2 — Pipeline de docs vivas (rama de fallback)

Esta rama (`demo/s05-demo2-fallback`) representa el **estado tras la Demo 2** de la
Sesión 5 y está **construida sobre la Demo 1** (`demo/s05-demo1-fallback`): incluye todo
lo de la Demo 1 (OpenAPI+Scalar, ADRs MADR, diagramas Mermaid) más el pipeline de
documentación viva. Úsala como **fallback** si la Demo 2 falla en vivo.

## Qué añade sobre la Demo 1

1. **Sitio Astro Starlight** (`docs/site/`)
   - Título "FlowSync Docs", en español, sidebar Guías / API Reference /
     Decisiones (ADRs, `autogenerate`).
   - `scripts/sync-adrs.mjs` sincroniza los ADRs de `docs/adr/` dentro del sitio
     (se ejecuta en `predev`/`prebuild`).
   - Contenido: landing, `guides/getting-started`, `api/index` (enlaza Scalar y OpenAPI).

2. **GitHub Actions** (`.github/workflows/`)
   - `docs.yml`: build de `docs/site` (Node 22, `npm ci`) y deploy a GitHub Pages
     en push a `main` que toque `docs/**`.
   - `docs-quality.yml`: markdownlint-cli2, lychee (enlaces) y Vale en `pull_request`;
     lychee además en cron semanal.

3. **Context7 MCP** (`.mcp.json` + regla en `CLAUDE.md`)
   - Server `context7` a nivel de repo para documentación actualizada de AdonisJS 7,
     Lucid, VineJS y React 19.

4. **`llms.txt`** en la raíz (estándar llmstxt.org): índice legible por LLMs.

## Cómo arrancar la demo

```bash
# Sitio de documentación (Starlight)
cd docs/site
npm install
npm run dev            # http://localhost:4321  (los ADRs se sincronizan en predev)
npm run build          # build estático en docs/site/dist

# Backend + docs de la API (igual que en la Demo 1)
cd ../../backend
npm install && cp .env.example .env && node ace generate:key
npm run migration:run
npm run dev            # http://localhost:3333/docs (Scalar)
```

## Notas de arranque (entorno)

- **Node 22 recomendado.** El template de `create-astro` v5 y `astro@7` exigen Node 22+.
  Aquí se fijó `astro@^5.18.2` + `@astrojs/starlight@^0.34.0` para funcionar también en
  Node 20.3+. Con Node 22 puedes actualizar a Astro 7/Starlight más reciente si quieres.
- El workflow `docs.yml` no define `base`/`site` de Astro; si se despliega en un
  *project page* de GitHub (`usuario.github.io/repo`), añade `base: '/<repo>'` en
  `astro.config.mjs` para que los assets resuelvan bien.
- El binario `log4brains` debe estar accesible (scripts npm de la raíz o `npx`).
