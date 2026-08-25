import { describe, it, expect } from 'vitest';
import { createApp, defineComponent, h } from 'vue';
import DynamicTable, { DYNAMIC_TABLE_HAS_PERMISSION } from '../index';
import type { DynamicTableColumn, SearchField, ToolbarAction, HasPermission } from '../types';

describe('entry exports', () => {
  it('default export is a Vue plugin object', () => {
    expect(DynamicTable).toBeDefined();
    expect(typeof DynamicTable.install).toBe('function');
  });

  it('re-exports the injection key', () => {
    expect(DYNAMIC_TABLE_HAS_PERMISSION).toBeDefined();
    expect(typeof DYNAMIC_TABLE_HAS_PERMISSION).toBe('symbol');
  });
});

describe('plugin install', () => {
  it('registers <DynamicTable> as a global component without options', () => {
    const app = createApp(defineComponent({ render: () => h('div') }));
    app.use(DynamicTable);
    const components = (app as any)._context?.components;
    expect(components?.DynamicTable).toBeDefined();
    app.unmount();
  });

  it('accepts a hasPermission function in install options', () => {
    const seen: string[] = [];
    const hasPermission: HasPermission = (code) => {
      seen.push(code);
      return code !== 'btn_block';
    };
    const TestConsumer = defineComponent({ render: () => h('div') });
    const app = createApp(TestConsumer);
    app.use(DynamicTable, { hasPermission });
    expect(hasPermission('btn_a')).toBe(true);
    expect(hasPermission('btn_block')).toBe(false);
    expect(seen).toEqual(['btn_a', 'btn_block']);
    app.unmount();
  });

  it('still installs cleanly without hasPermission (backward compat)', () => {
    const app = createApp(defineComponent({ render: () => h('div') }));
    expect(() => app.use(DynamicTable, {})).not.toThrow();
    app.unmount();
  });
});

describe('types compile-time shape (runtime smoke)', () => {
  it('accepts a minimal SearchField / Column / ToolbarAction', () => {
    const searchFields: SearchField[] = [
      { prop: 'keyword', label: '关键字', type: 'input' }
    ];
    const columns: DynamicTableColumn[] = [
      { prop: 'name', label: '姓名' },
      { label: '操作', actions: () => [
        { label: '编辑', type: 'primary', link: true, perms: 'btn_edit', onClick: () => {} }
      ] }
    ];
    const toolbar: ToolbarAction[] = [
      { label: '批量删除', type: 'danger', perms: 'btn_del', confirm: '确认？', onClick: () => {} }
    ];
    expect(searchFields).toHaveLength(1);
    expect(columns).toHaveLength(2);
    expect(toolbar).toHaveLength(1);
  });
});
