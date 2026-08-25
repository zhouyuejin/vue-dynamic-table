<script setup lang="ts">
import { ref } from 'vue';
import { ElButton, ElMessage } from 'element-plus';
import type { DynamicTableColumn, SearchField, ToolbarAction } from '../../src/types';

const tableRef = ref();

const searchFields: SearchField[] = [
  { prop: 'keyword', label: '关键字', type: 'input', placeholder: '姓名/账号/电话' },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '正常', value: 1 },
      { label: '禁用', value: 0 }
    ],
    clearable: true
  },
  {
    prop: 'dateRange',
    label: '注册时间',
    type: 'date',
    dateType: 'daterange',
    valueFormat: 'YYYY-MM-DD'
  }
];

const columns: DynamicTableColumn[] = [
  { prop: 'userName', label: '用户名', width: 120 },
  { prop: 'phone', label: '账号', width: 140 },
  {
    prop: 'role',
    label: '角色',
    tag: true,
    tagMap: {
      admin: { type: 'danger', text: '管理员' },
      user: { type: 'info', text: '普通用户' }
    }
  },
  {
    prop: 'status',
    label: '状态',
    width: 80,
    render: ({ row }) => (row.status === 1 ? '✅ 正常' : '⛔ 禁用')
  },
  {
    prop: 'avatar',
    label: '头像',
    width: 80,
    image: true
  },
  {
    label: '操作',
    width: 240,
    actions: () => [
      { label: '编辑', type: 'primary', link: true, perms: 'btn_user_edit', onClick: ({ row }) => ElMessage.success(`编辑 ${row.userName}`) },
      { label: '删除', type: 'danger', link: true, perms: 'btn_user_delete', confirm: '确认删除？', onClick: ({ row }) => ElMessage.warning(`删除 ${row.userName}`) },
      { label: '详情', type: 'info', link: true, onClick: ({ row }) => ElMessage.info(`查看 ${row.userName}`) }
    ]
  }
];

const toolbar: ToolbarAction[] = [
  { label: '批量删除', type: 'danger', perms: 'btn_user_delete', confirm: '确认批量删除？', onClick: (sel) => ElMessage.warning(`批量删除 ${sel.length} 项`) },
  { label: '导出', type: 'primary', onClick: (sel) => ElMessage.success(`导出 ${sel.length} 项`) }
];

const allRows = Array.from({ length: 87 }, (_, i) => ({
  id: i + 1,
  userName: `user_${String(i + 1).padStart(3, '0')}`,
  phone: `138${String(10000000 + i).slice(-8)}`,
  role: i % 3 === 0 ? 'admin' : 'user',
  status: i % 4 === 0 ? 0 : 1,
  avatar: `https://i.pravatar.cc/60?img=${(i % 70) + 1}`,
  registerTime: `2024-${String((i % 12) + 1).padStart(2, '0')}-15`
}));

const loadData = (params: Record<string, any>) => {
  const { page = 1, rows = 10 } = params;
  let rows2 = allRows;
  if (params.keyword) {
    const k = String(params.keyword);
    rows2 = rows2.filter(r => r.userName.includes(k) || r.phone.includes(k));
  }
  if (params.status !== undefined && params.status !== '') {
    rows2 = rows2.filter(r => r.status === Number(params.status));
  }
  // 前端做分页
  const start = (page - 1) * rows;
  return Promise.resolve({
    total: rows2.length,
    data: rows2.slice(start, start + rows)
  });
};

const onSelectionChange = (sel: any[]) => {
  console.log('[playground] selection:', sel.length);
};
</script>

<template>
  <div style="padding: 24px; height: 100vh; box-sizing: border-box">
    <h2 style="margin-top: 0">vue-dynamic-table playground</h2>
    <p style="color: #666; font-size: 13px">
      演示搜索、列渲染、操作列（perms 自动过滤）、工具栏按钮（perms 自动过滤）、多选、分页、全屏。
      <ElButton text type="primary" @click="tableRef?.reload()">手动 reload</ElButton>
    </p>
    <div style="height: calc(100vh - 120px)">
      <DynamicTable
        ref="tableRef"
        :columns="columns"
        :data-request="loadData"
        :search-fields="searchFields"
        :show-selection="true"
        :show-index="true"
        :toolbar="toolbar"
        @selection-change="onSelectionChange"
      />
    </div>
  </div>
</template>
