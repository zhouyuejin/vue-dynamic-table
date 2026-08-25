import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['**/*.test.ts', 'src/__tests__/**'],
      rollupTypes: true,
      insertTypesEntry: true
    })
  ],
  build: {
    target: 'es2020',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DynamicTable',
      fileName: (format) => `vue-dynamic-table.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['vue', 'element-plus', '@element-plus/icons-vue', 'dayjs'],
      output: {
        // 强制把 default export 也按 named 输出，
        // 这样 import DynamicTable from '@zhouyuejin1995/vue-dynamic-table' 才能直接拿到 plugin 对象
        exports: 'named',
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus',
          '@element-plus/icons-vue': 'ElementPlusIconsVue',
          dayjs: 'dayjs'
        }
      }
    },
    cssCodeSplit: false,
    sourcemap: true,
    emptyOutDir: true
  }
});
