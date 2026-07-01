/**
 * Sincroniza los ADRs de log4brains (docs/adr) dentro del sitio Starlight.
 *
 * Los ADRs viven en `docs/adr/*.md` en formato MADR (sin frontmatter). Starlight
 * exige frontmatter con `title`, así que este script copia cada ADR a
 * `docs/site/src/content/docs/adr/` añadiendo el frontmatter necesario (el título
 * se extrae del primer encabezado `# ...`). Se ejecuta automáticamente en `prebuild`.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const adrSrcDir = join(here, '..', '..', 'adr') // docs/adr
const adrDestDir = join(here, '..', 'src', 'content', 'docs', 'adr') // docs/site/src/content/docs/adr

// Sólo los ADRs con nombre por fecha (YYYYMMDD-*.md); ignoramos index/README/template.
const isAdr = (name) => /^\d{8}-.*\.md$/.test(name)

function extractTitle(md) {
  const match = md.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : 'ADR'
}

function toStarlightDoc(md) {
  const title = extractTitle(md)
  // Quitamos el H1 original para no duplicar el título que ya renderiza Starlight.
  const body = md.replace(/^#\s+.+$/m, '').replace(/^\n+/, '')
  const safeTitle = title.replace(/"/g, '\\"')
  return `---\ntitle: "${safeTitle}"\n---\n\n${body}`
}

// Regeneramos el directorio destino desde cero para no dejar ADRs obsoletos.
rmSync(adrDestDir, { recursive: true, force: true })
mkdirSync(adrDestDir, { recursive: true })

const files = readdirSync(adrSrcDir).filter(isAdr).sort()
let count = 0
for (const file of files) {
  const md = readFileSync(join(adrSrcDir, file), 'utf8')
  writeFileSync(join(adrDestDir, file), toStarlightDoc(md), 'utf8')
  count++
}

// Índice de la sección de ADRs.
const indexBody = files
  .map((file) => {
    const md = readFileSync(join(adrSrcDir, file), 'utf8')
    const slug = file.replace(/\.md$/, '')
    return `- [${extractTitle(md)}](./${slug}/)`
  })
  .join('\n')

writeFileSync(
  join(adrDestDir, 'index.md'),
  `---\ntitle: "Decisiones de arquitectura (ADRs)"\ndescription: "Registro de decisiones de arquitectura de FlowSync, gestionado con log4brains (formato MADR)."\n---\n\nRegistro de decisiones de arquitectura de FlowSync. Se gestionan con **log4brains** en \`docs/adr/\` (formato MADR) y se publican aquí automáticamente.\n\n${indexBody}\n`,
  'utf8'
)

console.log(`[sync-adrs] ${count} ADR(s) sincronizados en ${adrDestDir}`)
