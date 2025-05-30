import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), dts({
    include: './src',
    insertTypesEntry: true,
    cleanVueFileName: true,
  })],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'vue-wf',
      fileName: 'index',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    },
    target: 'modules',
  },
})
