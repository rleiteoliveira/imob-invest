import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  // Adicione esta linha com o nome do repositório entre barras:
  base: "/imob-invest/",

  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    global: 'window',
  },
})