import type { App } from 'vue';
import DynamicTable from './DynamicTable.vue';
import type { DynamicTableOptions } from './types';
import { DYNAMIC_TABLE_HAS_PERMISSION } from './types';
import './styles/index.scss';

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
