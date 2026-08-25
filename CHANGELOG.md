# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> 从 v0.5.0 起改用 [release-please](https://github.com/googleapis/release-please) 自动生成 CHANGELOG；此前版本由维护者手写。

## [0.1.0](https://github.com/zhouyuejin/vue-dynamic-table/releases/tag/vue-dynamic-table-v0.1.0) (2026-08-25)


### Features

* 首次发布：从 schoolUniform 项目抽离 DynamicTable 为独立组件库
* 搜索表单：input / select / date 三种类型，支持函数式联动、远程查询缓存
* 列渲染：tag / image / dictMap / formatter / render / customRender / slot 6 种模式
* 工具栏：schema / JSX 渲染函数 / 具名插槽三种方式，按选中行 + 权限过滤
* 权限注入：`app.use(DynamicTable, { hasPermission })`，未注入时向后兼容
* 多选 / 序号 / 分页 / 全屏 / 嵌入模式（plain）
