/**
 * 权限判断函数签名。
 * 调用方通过 `app.use(DynamicTable, { hasPermission })` 注入；未注入则 perms 字段失效（按钮始终显示）。
 */
export type HasPermission = (code: string) => boolean;

/**
 * install 选项。
 */
export interface DynamicTableOptions {
  /** 权限判断函数；不传则 perms 字段无效（按钮始终显示） */
  hasPermission?: HasPermission;
}

export interface SearchField {
  prop: string;
  label: string;
  type: 'input' | 'select' | 'date';
  /**
   * 下拉选项（支持静态数组或函数）。
   * 函数模式：根据当前搜索表单数据动态返回选项，用于联动场景（如反馈类型切换时问题分类选项随之变化）。
   * @param form 当前搜索表单的全部值
   */
  options?: Array<{ label: string; value: any }> | ((form: Record<string, any>) => Array<{ label: string; value: any }>);
  dateType?: 'year' | 'month' | 'date' | 'dates' | 'datetime' | 'datetimerange' | 'daterange' | 'monthrange';
  valueFormat?: string;
  /** 下拉是否支持多选 */
  multiple?: boolean;
  /** 是否允许清空（select） */
  clearable?: boolean;
  /** 占位文案，默认根据 label 自动生成 */
  placeholder?: string;
  /** 默认值 */
  defaultValue?: any;
  /** 透传给底层 el 控件的内联样式（如 { width: '120px' } 固定宽度） */
  style?: Record<string, any>;
  /**
   * 是否远程查询下拉（仅 type=select 生效）。
   * 开启后下拉展开时调用 remoteMethod 加载全量选项（带缓存），输入关键字由前端本地过滤，不再请求接口。
   */
  remote?: boolean;
  /**
   * 远程查询方法（配合 remote 使用）。
   * @param query 关键字，当前实现恒为空串（过滤交给前端 filterable），保留形参仅为向后兼容
   * @param form 当前搜索表单的全部值，可据此实现联动（如商品查询带上已选学校/项目 id）
   * 返回选项列表。
   */
  remoteMethod?: (
    query: string,
    form: Record<string, any>
  ) => Promise<Array<{ label: string; value: any }>> | Array<{ label: string; value: any }>;
  /**
   * select 值变更回调（联动用）。
   * @param value 当前选中值
   * @param form 搜索表单全部值，可在此清空下级字段（如切换学校后置空 projectId/goodsId）
   */
  onChange?: (value: any, form: Record<string, any>) => void;
  /**
   * 是否显示（支持函数，依赖 searchForm 当前值）。
   * 不声明则默认显示。
   */
  show?: boolean | ((form: Record<string, any>) => boolean);
  /**
   * 远程查询依赖的上级字段 prop 列表（配合 remote 使用）。
   * 下拉展开时，仅当这些字段的值相较上次查询发生变化才重新请求，否则复用已缓存选项。
   * 不声明则视为无依赖，仅首次展开查询一次后一直复用缓存。
   */
  deps?: string[];
}

export interface DynamicTableColumn<T = any> {
  prop?: string;
  label: string;
  width?: number | string;
  minWidth?: number | string;
  align?: 'left' | 'center' | 'right';
  fixed?: boolean | 'left' | 'right';
  showOverflowTooltip?: boolean;
  // 渲染方式
  render?: (params: { row: T; column: any; index: number }) => any;
  customRender?: (params: { row: T; column: any; index: number }) => any;
  slot?: string;
  tag?: boolean;
  tagMap?: Record<any, { type: string; text: string }>;
  image?: boolean;
  /** 列类型，对应 el-table-column type；支持 'index' | 'selection' */
  type?: 'index' | 'selection';
  // 格式化
  formatter?: (row: T, value: any, column: any, index: number) => string;
  dictMap?: Record<any, string>;
  // 操作列配置
  actions?: (params: { row: T; column: any; index: number }) => Array<{
    label?: string;
    icon?: string;
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
    link?: boolean;
    tooltip?: string;
    /**
     * 按钮权限码（后端 perms 字段）。配置后 DynamicTable 内部按注入的 hasPermission 判断 show：
     *  - 有权限 → show
     *  - 无权限 → 不渲染该按钮
     * 与 show 字段叠加：两者都为 true 才展示。
     * 注意：必须通过 `app.use(DynamicTable, { hasPermission })` 注入；未注入则 perms 字段失效（按钮始终显示）。
     */
    perms?: string;
    show?: boolean | ((params: { row: T; column: any; index: number }) => boolean);
    disabled?: boolean | ((params: { row: T; column: any; index: number }) => boolean);
    onClick?: (params: { row: T; column: any; index: number }) => void | Promise<void>;
    popConfirm?: {
      title?: string;
      placement?: 'left' | 'right' | 'top' | 'bottom';
      onConfirm?: (params: { row: T; column: any; index: number }) => void | Promise<void>;
    };
    /**
     * 二次弹窗确认：点击后先弹 ElMessageBox.confirm，用户确认后再执行 onClick。
     * 传 string 当提示文案（最简写法）；传 object 可自定义标题/类型/按钮文案。
     * 与 popConfirm 二选一即可，二者都未配置时直接执行 onClick。
     */
    confirm?:
      | string
      | {
          /** 提示文案 */
          message?: string;
          /** 弹窗标题，默认「提示」 */
          title?: string;
          /** 弹窗类型，默认 warning */
          type?: 'success' | 'warning' | 'info' | 'error';
          /** 确认按钮文案，默认「确定」 */
          confirmButtonText?: string;
          /** 取消按钮文案，默认「取消」 */
          cancelButtonText?: string;
        };
  }>;
  [key: string]: any; // 允许其他任意属性
}

export interface Pagination {
  current: number;
  pageSize: number;
  total: number;
}

/**
 * 工具栏按钮配置（schema 风格）
 * 与操作列 actions 同构，但上下文是「选中行数组」而非「单行」：
 * show / disabled / onClick 都基于选中行判断，由 DynamicTable 内部 selectedRows 驱动。
 * link 默认 false（工具栏按钮默认实心，与操作列默认 link 相反）。
 */
export interface ToolbarAction {
  /** 按钮文案 */
  label?: string;
  /** 图标名（element-plus 图标组件） */
  icon?: string;
  /** 按钮类型 */
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
  /** 是否链接样式，默认 false */
  link?: boolean;
  /** 悬浮提示 */
  tooltip?: string;
  /**
   * 按钮权限码（后端 perms 字段）。配置后 DynamicTable 内部按注入的 hasPermission 判断 show：
   *  - 有权限 → show
   *  - 无权限 → 不渲染该按钮
   * 与 show 字段叠加：两者都为 true 才展示。
   * 注意：必须通过 `app.use(DynamicTable, { hasPermission })` 注入；未注入则 perms 字段失效（按钮始终显示）。
   */
  perms?: string;
  /** 是否显示，可基于选中行判断 */
  show?: boolean | ((selection: any[]) => boolean);
  /** 是否禁用，可基于选中行判断 */
  disabled?: boolean | ((selection: any[]) => boolean);
  /**
   * 点击回调，入参为当前选中行数组
   * @param selection - 当前选中行
   */
  onClick?: (selection: any[]) => void | Promise<void>;
  /**
   * 二次确认：点击后先弹 ElMessageBox.confirm，用户确认后再执行 onClick。
   * 传 string 当提示文案（最简写法）；传 object 可自定义标题/类型/按钮文案。
   * 未配置时直接执行 onClick。
   */
  confirm?:
    | string
    | {
        /** 提示文案 */
        message?: string;
        /** 弹窗标题，默认「提示」 */
        title?: string;
        /** 弹窗类型，默认 warning */
        type?: 'success' | 'warning' | 'info' | 'error';
        /** 确认按钮文案，默认「确定」 */
        confirmButtonText?: string;
        /** 取消按钮文案，默认「取消」 */
        cancelButtonText?: string;
      };
}

import type { InjectionKey } from 'vue';

/**
 * Vue provide/inject 的 key（避免循环依赖：在 types.ts 里声明，组件与 install 都从这里 import）。
 */
export const DYNAMIC_TABLE_HAS_PERMISSION: InjectionKey<HasPermission> = Symbol(
  'DYNAMIC_TABLE_HAS_PERMISSION'
);
