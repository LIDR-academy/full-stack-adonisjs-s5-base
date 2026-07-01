// @ts-check
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'FlowSync Docs',
      // Sitio en español (locale raíz, sin prefijo /es en las URLs).
      defaultLocale: 'root',
      locales: {
        root: { label: 'Español', lang: 'es' },
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/LIDR-academy/full-stack-adonisjs-master',
        },
      ],
      sidebar: [
        {
          label: 'Guías',
          autogenerate: { directory: 'guides' },
        },
        {
          label: 'API Reference',
          autogenerate: { directory: 'api' },
        },
        {
          label: 'Decisiones (ADRs)',
          autogenerate: { directory: 'adr' },
        },
      ],
    }),
  ],
})
