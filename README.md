# @zhouyuejin1995/vue-dynamic-table

> Schema-driven dynamic table for Vue 3 + Element Plus: search form, columns, toolbar, pagination, row selection, fullscreen — all configurable via JSON.

[![npm](https://img.shields.io/npm/v/@zhouyuejin1995/vue-dynamic-table)](https://www.npmjs.com/package/@zhouyuejin1995/vue-dynamic-table)
[![license](https://img.shields.io/npm/l/@zhouyuejin1995/vue-dynamic-table)](./LICENSE)

> 🚧 **0.1.x 早期版本**：API 仍在小幅调整，升级前请看 [CHANGELOG](./CHANGELOG.md)。

---

## ✨ 特性

- 🧾 **声明式 schema**：搜索表单 / 列 / 操作列 / 工具栏，全部用 TS 对象描述，告别重复模板
- 🔍 **搜索**：支持 `input` / `select` / `date`；select 支持静态选项、函数式联动、远程查询缓存
- 🏷️ **列渲染**：内置 `tag` / `image` / `dictMap` / `formatter` / 自定义 `render` / `customRender` / 插槽 6 种渲染模式
- 🛠️ **工具栏**：支持 schema（推荐）或 JSX 渲染函数或具名插槽；按钮按选中行 / 权限过滤
- 🔐 **权限注入**：`perms` 字段由 `app.use(DynamicTable, { hasPermission })` 注入判断，未注入则向后兼容
- 📑 **分页 / 多选 / 序号 / 全屏 / 空数据**，开箱即用
- 🎨 **嵌入模式**：`plain` 属性去掉装饰背景，适配弹窗、StepSection 等容器

---

## 📦 安装

```bash
npm install @zhouyuejin1995/vue-dynamic-table element-plus @element-plus/icons-vue
# 或
pnpm add @zhouyuejin1995/vue-dynamic-table element-plus @element-plus/icons-vue
```

> 这两个是 peer dep，请确保宿主项目已安装（`element-plus` ≥ 2.7、`@element-plus/icons-vue` ≥ 2.3、Vue 3.5+）。

---

## 🚀 快速开始

### 全局注册（推荐）

```ts
// main.ts
import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import DynamicTable from '@zhouyuejin1995/vue-dynamic-table';
import '@zhouyuejin1995/vue-dynamic-table/style.css';
import App from './App.vue';

createApp(App)
  .use(ElementPlus)
  .use(DynamicTable, {
    hasPermission: (code) => myUserStore.perms.has(code)
  })
  .mount('#app');
```

### 局部注册

```vue
<script setup lang="ts">
import { DynamicTable } from '@zhouyuejin1995/vue-dynamic-table';
import '@zhouyuejin1995/vue-dynamic-table/style.css';
import type { DynamicTableColumn, SearchField } from '@zhouyuejin1995/vue-dynamic-table';

const searchFields: SearchField[] = [
  { prop: 'keyword', label: '关键字', type: 'input', placeholder: '姓名/账号' },
  { prop: 'status', label: '状态', type: 'select', clearable: true,
    options: [{ label: '正常', value: 1 }, { label: '禁用', value: 0 }] }
];

const columns: DynamicTableColumn[] = [
  { prop: 'userName', label: '用户名', width: 120 },
  { prop: 'phone', label: '账号', width: 140 },
  { prop: 'role', label: '角色', tag: true,
    tagMap: { admin: { type: 'danger', text: '管理员' }, user: { type: 'info', text: '用户' } } },
  { prop: 'avatar', label: '头像', image: true },
  { label: '操作', width: 200,
    actions: () => [
      { label: '编辑', type: 'primary', link: true, perms: 'btn_user_edit',
        onClick: ({ row }) => console.log('edit', row) },
      { label: '删除', type: 'danger', link: true, perms: 'btn_user_delete',
        confirm: '确认删除？',
        onClick: ({ row }) => console.log('delete', row) }
    ]
  }
];

const fetchData = (params: Record<string, any>) => myApi.listUsers(params);
</script>

<template>
  <DynamicTable
    :columns="columns"
    :search-fields="searchFields"
    :data-request="fetchData"
    show-selection
    show-index
  />
</template>
```

### 纯前端静态数据

```ts
const data = [
  { id: 1, name: '张三', status: 1 },
  { id: 2, name: '李四', status: 0 }
];
// 不传 dataRequest，传 data 即可（开启分页会自动前端分页）
<DynamicTable :columns="columns" :data="data" />
```

---

## 📚 Props

完整 API 见 [`src/types.ts`](./src/types.ts)，下面列出常用项：

### 主体

| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `columns` | `DynamicTableColumn[]` | **必填** | 列配置 |
| `data` | `any[]` | `[]` | 静态数据；不传 `dataRequest` 时使用 |
| `dataRequest` | `(params) => Promise<{ data, total } \| any[]>` | - | 数据请求函数；返回 `{ data, total }` 或纯数组 |
| `searchFields` | `SearchField[]` | - | 搜索表单字段 |
| `toolbar` | `ToolbarAction[]` | - | 工具栏按钮 schema（优先于 `toolbarRender` / slot） |
| `toolbarRender` | `() => VNode \| VNode[]` | - | 工具栏 JSX 渲染函数（回退） |

### 显隐

| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `showSearch` | `boolean` | `true` | 显示搜索区 |
| `showToolbar` | `boolean` | `true` | 显示工具栏 |
| `showRefresh` | `boolean` | `true` | 显示刷新按钮 |
| `showFullscreen` | `boolean` | `true` | 显示全屏按钮 |
| `showIndex` | `boolean` | `false` | 显示序号列 |
| `showSelection` | `boolean` | `false` | 显示多选列 |
| `showPagination` | `boolean` | `true` | 显示分页 |
| `plain` | `boolean` | `false` | 嵌入模式：去背景/内边距 |
| `emptyText` | `string` | `'暂无数据'` | 空数据文案 |

### 数据 / 分页

| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `immediate` | `boolean` | `true` | 挂载后立即加载 |
| `refreshOnActivated` | `boolean` | 跟随 `immediate` | keepAlive 重新激活时自动刷新 |
| `extraParams` | `object` | `{}` | 额外请求参数（与搜索条件合并） |
| `pageField` | `string` | `'page'` | 分页页码字段名 |
| `pageSizeField` | `string` | `'rows'` | 分页大小字段名 |
| `paginationAlign` | `'left' \| 'center' \| 'right'` | `'right'` | 分页对齐 |

### 其他（透传给 el-table）

通过 `v-bind="$attrs"` 透传：`border`、`height`、`stripe`、`size` 等。

---

## 📡 Events

| Event | 参数 | 说明 |
|---|---|---|
| `selection-change` | `(selection: any[])` | 多选变化 |
| `search` | `(form: Record<string, any>)` | 点击「查询」后 |
| `reset` | `()` | 点击「重置」后 |
| `reload` | `()` | 内部触发，可监听 |

---

## 🎯 Exposed Methods（通过 ref 调用）

```ts
const tableRef = ref();
tableRef.value?.reload();         // 重载数据（保持当前页）
tableRef.value?.search();         // 触发搜索（回到第 1 页）
tableRef.value?.reset();          // 重置搜索表单
tableRef.value?.getSelectionRows(); // 当前选中行
tableRef.value?.clearSelection();   // 清空选中
```

---

## 🔐 权限注入

组件库本身**不耦合任何权限方案**。调用方在 `app.use()` 时注入：

```ts
app.use(DynamicTable, {
  hasPermission: (code: string) => myUserStore.perms.has(code)
});
```

之后 `actions[].perms` 和 `toolbar[].perms` 字段会自动过滤：

```ts
{ label: '删除', perms: 'btn_user_delete', onClick: ... }  // 无权限 → 不渲染
```

**未注入时**：perms 字段失效（按钮始终显示），向后兼容老代码。

---

## 🧪 本地开发

```bash
# 装依赖
npm install

# 启动 playground（http://localhost:5173）
npm run dev

# 类型检查
npm run typecheck

# 单测
npm test

# 库构建（产出 dist/）
npm run build

# 跑完整 prepublish 链路
npm run prepublishOnly
```

---

## 📤 发布

参见 [`PUBLISH.md`](./PUBLISH.md)。日常用：

```bash
npm run release:patch   # 0.1.0 → 0.1.1
npm run release:minor   # 0.1.0 → 0.2.0
npm run release:dry     # 只跑测试+构建，不改版本不 push
```

脚本会自动 commit + 打 tag + 触发 GitHub Actions 发布到 npm。

---

## 🤝 贡献

- Bug / 需求：[开 issue](https://github.com/zhouyuejin/vue-dynamic-table/issues/new/choose)
- PR：[开 PR](https://github.com/zhouyuejin/vue-dynamic-table/compare)
- CI：`main` 分支触发测试矩阵（Node 18/20/22），tag 触发 npm 发布

## 📄 License

[MIT](./LICENSE) © yuejin
