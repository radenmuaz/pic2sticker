import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "node:path"

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react() as any, tailwindcss() as any, cloudflare() as any],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        about: path.resolve(__dirname, 'about/index.html'),
        howIPorted: path.resolve(__dirname, 'how-i-ported-rembg-to-onnxruntime-web/index.html'),
        gallery: path.resolve(__dirname, 'gallery/index.html'),
      },
    },
  },
})