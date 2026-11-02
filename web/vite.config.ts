import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [react(), tailwindcss()],
    // MathJax (dibujo de fórmulas) pesa ~1,7 MB, pero va en su propio archivo y solo se
    // descarga al ver la primera fórmula: no hace falta el aviso de archivo grande.
    build: { chunkSizeWarningLimit: 1800 },
    server: {
      proxy: {
        '/api': env.VITE_API_PROXY_TARGET ?? 'http://localhost:8080',
      },
    },
  }
})
