# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> 从 v0.1.4 起改用 [release-please](https://github.com/googleapis/release-please) 自动生成 CHANGELOG；此前版本由维护者手写。

## [0.1.5](https://github.com/zhouyuejin/vue-dynamic-table/releases/tag/vue-dynamic-table-v0.1.5) (2026-08-26)


### Bug Fixes

* **CSS 自动注入**：用 Vite `?inline` 把 `styles/index.scss` 编译产物当字符串内联进 JS，模块加载时检测 `<style id="zhouyuejin1995-vue-dynamic-table-styles">` 是否已注入，没有则 append 到 `document.head`。消费方无需再手动 `import '@zhouyuejin1995/vue-dynamic-table/style.css'`，样式自动跟随组件（修：分页不靠右、与表格没间距的问题）

## [0.1.4](https://github.com/zhouyuejin/vue-dynamic-table/releases/tag/vue-dynamic-table-v0.1.4) (2026-08-26)


### Bug Fixes

* **element-plus 显式 import**：库模板里用到的 14 个 Element Plus 组件（ElInput / ElButton / ElTable / ElTableColumn / ElForm / ElFormItem / ElSelect / ElOption / ElDatePicker / ElImage / ElTag / ElTooltip / ElEmpty / ElPagination）改为 `<script setup>` 里显式 `import { ... } from 'element-plus'`，不再依赖消费方的 auto-import。修复 "Failed to resolve component: el-input"（消费方常用 unplugin-vue-components 自动注册 Element Plus，但它默认不扫 node_modules）

## [0.1.3](https://github.com/zhouyuejin/vue-dynamic-table/releases/tag/vue-dynamic-table-v0.1.3) (2026-08-26)


### Bug Fixes

* **slot factory**: 把所有 `<template #default="{ row, ... }">` 改成 `<template #default="scope">` + `scope && scope.row` 守卫。
** 之前：el-table-column 在某些边界场景（如 `inheritAttrs: false` + `v-bind="$attrs"` 组合、keepAlive 切回、列 type 切换）会用 `undefined` scope 调用 slot factory，参数解构 `({ row })` 会 throw，被 Vue 调度器的 Promise.then 包成 "Uncaught (in promise) TypeError: Cannot destructure property 'row' of 'undefined'"。新版用 `r && r.row` 守卫，el-table 传 undefined 时降级渲染空片段，不再炸 promise
* **handleActionClick / handleToolbarClick**: 包裹外部回调 try/catch（前次修复保留）

## [0.1.2](https://github.com/zhouyuejin/vue-dynamic-table/releases/tag/vue-dynamic-table-v0.1.2) (2026-08-26)


### Bug Fixes

* **slot factory**: 把所有 `<template #default="{ row, ... }">` 改成 `<template #default="scope">` + `scope && scope.row` 守卫。
** 之前：el-table-column 在某些边界场景（如 `inheritAttrs: false` + `v-bind="$attrs"` 组合、keepAlive 切回、列 type 切换）会用 `undefined` scope 调用 slot factory，参数解构 `({ row })` 会 throw，被 Vue 调度器的 Promise.then 包成 "Uncaught (in promise) TypeError: Cannot destructure property 'row' of 'undefined'"。新版用 `r && r.row` 守卫，el-table 传 undefined 时降级渲染空片段，不再炸 promise
* **handleActionClick / handleToolbarClick**: 包裹外部回调 try/catch（前次修复保留）

## [0.1.1](https://github.com/zhouyuejin/vue-dynamic-table/releases/tag/vue-dynamic-table-v0.1.1) (2026-08-26)


### Bug Fixes

* **handleActionClick / handleToolbarClick**: 包裹外部回调（`onClick` / `popConfirm.onConfirm` / `toolbar.onClick`）增加 try/catch，避免用户在回调里抛错（包括 `({ row })` 解构 undefined 等）变成 `Uncaught (in promise)`；同时把原来静默吞错的 `.catch(() => {})` 改成 `console.error`，方便排查

## [0.1.0](https://github.com/zhouyuejin/vue-dynamic-table/releases/tag/vue-dynamic-table-v0.1.0) (2026-08-25)


### Features

* 首次发布：从 schoolUniform 项目抽离 DynamicTable 为独立组件库
* 搜索表单：input / select / date 三种类型，支持函数式联动、远程查询缓存
* 列渲染：tag / image / dictMap / formatter / render / customRender / slot 6 种模式
* 工具栏：schema / JSX 渲染函数 / 具名插槽三种方式，按选中行 + 权限过滤
* 权限注入：`app.use(DynamicTable, { hasPermission })`，未注入时向后兼容
* 多选 / 序号 / 分页 / 全屏 / 嵌入模式（plain）
