import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import DynamicTable from '../../src/index';
import App from './App.vue';

createApp(App)
  .use(ElementPlus)
  // 演示权限注入：这里直接给一个空 Set，所有 perms 都视为无权限
  .use(DynamicTable, {
    hasPermission: (code: string) => !code.startsWith('btn_')
  })
  .mount('#app');
