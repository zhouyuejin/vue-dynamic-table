import type { App } from 'vue';
import DynamicTable from './DynamicTable.vue';
import type { DynamicTableOptions } from './types';
import { DYNAMIC_TABLE_HAS_PERMISSION } from './types';
import './styles/index.scss';

/**
 * 运行时 CSS 注入：
 * - Vite/Webpack 等打包器看到 `./styles/index.scss` 这个 import 会自动把 CSS 抽到 chunk 里；
 * - 但是如果消费方用了不支持这种行为的工具（如纯 CDN / 运行时 import），或者根本没引 dist 里的 CSS 文件，
 *   样式会缺失。所以这里再做一层兜底：把同一份 SCSS 编译产物当字符串内联进 JS，组件挂载时塞进 <head>。
 * - 仅在浏览器环境执行，SSR 安全。
 */
import dynamicTableCss from './styles/index.scss?inline';

const STYLE_ID = 'zhouyuejin1995-vue-dynamic-table-styles';

function ensureStyleInjected(css: string): void {
  if (typeof document === 'undefined') return; // SSR
  if (document.getElementById(STYLE_ID)) return; // 已注入，避免重复
  const styleEl = document.createElement('style');
  styleEl.id = STYLE_ID;
  styleEl.setAttribute('data-zhouyuejin1995-vue-dynamic-table', '');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);
}

// 模块加载即注入（覆盖 named import 与默认 import 两种用法）
ensureStyleInjected(dynamicTableCss);

// 具名导出：方便按需 import
export { default as DynamicTable } from './DynamicTable.vue';

// 导出注入 key（高级用法：调用方想手动 provide 时用）
export { DYNAMIC_TABLE_HAS_PERMISSION };

// 类型 / 接口导出
export * from './types';
export type { HasPermission, DynamicTableOptions } from './types';

/**
 * Vue 插件入口。
 *
 * ```ts
 * import { createApp } from 'vue';
 * import DynamicTable from '@zhouyuejin1995/vue-dynamic-table';
 * import '@zhouyuejin1995/vue-dynamic-table/style.css';
 * import ElementPlus from 'element-plus';
 *
 * createApp(App)
 *   .use(ElementPlus)
 *   .use(DynamicTable, {
 *     hasPermission: (code) => myPerms.has(code),
 *   })
 *   .mount('#app');
 * ```
 *
 * 局部注册：
 * ```vue
 * <script setup lang="ts">
 * import { DynamicTable } from '@zhouyuejin1995/vue-dynamic-table';
 * import '@zhouyuejin1995/vue-dynamic-table/style.css';
 * </script>
 * ```
 */
export default {
  install(app: App, options: DynamicTableOptions = {}) {
    if (options.hasPermission) {
      app.provide(DYNAMIC_TABLE_HAS_PERMISSION, options.hasPermission);
    }
    app.component('DynamicTable', DynamicTable);
  }
};
