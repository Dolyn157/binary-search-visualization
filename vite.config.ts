import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import unocss from 'unocss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/binary-search-visualization/',
  plugins: [
    vue(),
    unocss()
  ],
  css: {
    preprocessorOptions: {
      sass: {
        api: 'modern-compiler' // or "modern"
      }
    }
  }
})
