import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))

/* The v2 app is deployed into a subfolder of the existing site, so it reads
   data.json and the 455MB image library straight from the site root rather
   than bundling them. In dev we serve those paths from the checkout above
   this folder, so nothing is copied and `dist/` stays around half a megabyte. */
const SITE_ROOT = process.env.DRIP_SITE_ROOT ?? path.resolve(here, '..')

const TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
}

const siteAssets = () => ({
  name: 'site-assets',
  configureServer(server: { middlewares: { use: (fn: (req: any, res: any, next: () => void) => void) => void } }) {
    server.middlewares.use((req, res, next) => {
      const url = decodeURIComponent((req.url || '').split('?')[0])
      if (!/^\/(images|product|data\.json|icon|favicon)/.test(url)) return next()
      const file = path.join(SITE_ROOT, url)
      if (!file.startsWith(SITE_ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return next()
      const type = TYPES[path.extname(file)]
      if (type) res.setHeader('Content-Type', type)
      fs.createReadStream(file).pipe(res)
    })
  },
})

export default defineConfig({
  // deployed at /v2/ under two different site roots, so never absolute
  base: './',
  plugins: [react(), tailwindcss(), siteAssets()],
  build: { outDir: '../v2', emptyOutDir: true, assetsDir: 'a', chunkSizeWarningLimit: 900 },
})
