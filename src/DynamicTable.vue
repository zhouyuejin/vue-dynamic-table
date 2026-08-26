<template>
  <div class="dynamic-table-wrapper" :class="{ 'is-plain': plain }">
    <!-- 搜索表单区域 -->
    <div v-if="showSearch" class="search-container">
      <el-form :model="searchForm" inline>
        <el-form-item
          v-for="field in visibleSearchFields"
          :key="field.prop"
          :label="field.label"
        >
          <!-- 输入框 -->
          <el-input
            v-if="field.type === 'input'"
            v-model="searchForm[field.prop]"
            :placeholder="field.placeholder || `请输入${field.label}`"
            clearable
            @keyup.enter="handleSearch"
          />
          <!-- 下拉选择 -->
          <el-select
            v-else-if="field.type === 'select'"
            v-model="searchForm[field.prop]"
            :placeholder="field.placeholder || `请选择${field.label}`"
            :multiple="field.multiple"
            :collapse-tags="field.multiple"
            :collapse-tags-tooltip="field.multiple"
            :clearable="field.clearable ?? true"
            :style="field.style"
            filterable
            :loading="field.remote ? remoteLoading[field.prop] : false"
            @change="(val: any) => handleSelectChange(field, val)"
            @visible-change="(visible: boolean) => handleRemoteVisible(field, visible)"
          >
            <el-option
              v-for="opt in (field.remote ? remoteOptions[field.prop] : field.options)"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
          <!-- 日期选择 -->
          <el-date-picker
            v-else-if="field.type === 'date'"
            v-model="searchForm[field.prop]"
            :type="field.dateType || 'date'"
            :value-format="field.valueFormat || 'YYYY-MM-DD'"
            :placeholder="field.placeholder || `请选择${field.label}`"
            :style="field.style"
            :start-placeholder="'开始日期'"
            :end-placeholder="'结束日期'"
            range-separator="至"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <slot name="searchActions"></slot>
        </el-form-item>
      </el-form>
    </div>

    <!-- 工具栏区域 -->
    <div v-if="showToolbar" class="toolbar-container">
      <div class="toolbar-left">
        <!-- schema 工具栏按钮（优先）：disabled/show/onClick 基于选中行 -->
        <template v-if="props.toolbar?.length">
          <template v-for="(action, idx) in visibleToolbarActions" :key="idx">
            <el-tooltip v-if="action.tooltip" :content="action.tooltip" placement="top">
              <el-button
                :type="action.type || 'default'"
                :link="action.link"
                :disabled="resolveToolbarDisabled(action)"
                @click="handleToolbarClick(action)"
              >
                {{ action.label }}
              </el-button>
            </el-tooltip>
            <el-button
              v-else
              :type="action.type || 'default'"
              :link="action.link"
              :disabled="resolveToolbarDisabled(action)"
              @click="handleToolbarClick(action)"
            >
              {{ action.label }}
            </el-button>
          </template>
        </template>
        <!-- 回退：JSX 渲染函数 -->
        <ToolbarRenderer v-else-if="props.toolbarRender" />
        <!-- 回退：具名插槽 -->
        <slot v-else name="toolbar"></slot>
      </div>
      <div class="toolbar-right">
        <el-button v-if="showRefresh" :icon="Refresh" @click="handleRefresh" circle />
        <el-button
          v-if="showFullscreen"
          :icon="isFullscreen ? Close : FullScreen"
          @click="toggleFullscreen"
          circle
        />
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-container" :class="{ 'is-fullscreen': isFullscreen }">
      <!-- 全屏状态下的关闭按钮 -->
      <div v-if="isFullscreen" class="fullscreen-close-btn">
        <el-button type="primary" :icon="Close" @click="toggleFullscreen">
          退出全屏
        </el-button>
      </div>

      <el-table
        ref="tableRef"
        :data="tableData"
        :height="tableHeight"
        :border="border"
        v-bind="$attrs"
        @selection-change="handleSelectionChange"
      >
        <!-- 选择列（showSelection 控制） -->
        <el-table-column v-if="showSelection" type="selection" width="55" />

        <!-- 序号列（showIndex 控制） -->
        <el-table-column v-if="showIndex" type="index" label="序号" width="60" />

        <!-- 动态列 -->
        <template v-for="column in columns" :key="column.prop">
          <!-- type=selection 列（columns schema 中定义） -->
          <el-table-column v-if="column.type === 'selection'" type="selection" width="55" />

          <!-- type=index 列（columns schema 中定义） -->
          <el-table-column
            v-else-if="column.type === 'index'"
            type="index"
            :label="column.label || '序号'"
            :width="column.width || 60"
          />
          <!-- 操作列（actions 配置） -->
          <el-table-column
            v-else-if="column.actions"
            v-bind="getColumnProps(column)"
          >
            <template #default="scope">
              <div v-if="scope && scope.row" style="display: flex; gap: 8px">
                <template v-for="(action, idx) in getActions(scope.row, scope.column, scope.$index, column.actions)" :key="idx">
                  <el-tooltip v-if="action.tooltip" :content="action.tooltip" :placement="action.popConfirm?.placement || 'top'">
                    <el-button
                      :type="action.type || 'default'"
                      :link="action.link !== false"
                      :disabled="action.disabled"
                      size="small"
                      @click="handleActionClick(action, scope.row, scope.column, scope.$index)"
                    >
                      {{ action.label }}
                    </el-button>
                  </el-tooltip>
                  <el-button
                    v-else
                    :type="action.type || 'default'"
                    :link="action.link !== false"
                    :disabled="action.disabled"
                    size="small"
                    @click="handleActionClick(action, scope.row, scope.column, scope.$index)"
                  >
                    {{ action.label }}
                  </el-button>
                </template>
              </div>
            </template>
          </el-table-column>

          <!-- 自定义渲染列（兼容旧版） -->
          <el-table-column
            v-else-if="column.render"
            v-bind="getColumnProps(column)"
          >
            <template #default="scope">
              <VNodeRenderer v-if="scope && scope.row" :vnode="column.render({ row: scope.row, column: scope.column, index: scope.$index })" />
              <template v-else />
            </template>
          </el-table-column>

          <!-- customRender 列（新版） -->
          <el-table-column
            v-else-if="column.customRender"
            v-bind="getColumnProps(column)"
          >
            <template #default="scope">
              <VNodeRenderer v-if="scope && scope.row" :vnode="column.customRender({ row: scope.row, column: scope.column, index: scope.$index })" />
              <template v-else />
            </template>
          </el-table-column>

          <!-- 插槽列 -->
          <el-table-column
            v-else-if="column.slot"
            v-bind="getColumnProps(column)"
          >
            <template #default="scope">
              <slot v-if="scope && scope.row" :name="column.slot" :row="scope.row" :column="scope.column" :index="scope.$index" />
              <template v-else />
            </template>
          </el-table-column>

          <!-- 标签列 -->
          <el-table-column
            v-else-if="column.tag"
            v-bind="getColumnProps(column)"
          >
            <template #default="scope">
              <el-tag v-if="scope && scope.row && column.prop" :type="getTagType(scope.row[column.prop], column.tagMap)">
                {{ getTagText(scope.row[column.prop], column.tagMap) }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 图片列 -->
          <el-table-column
            v-else-if="column.image"
            v-bind="getColumnProps(column)"
          >
            <template #default="scope">
              <el-image
                v-if="scope && scope.row && column.prop"
                :src="scope.row[column.prop]"
                :preview-src-list="[scope.row[column.prop]]"
                fit="cover"
                style="width: 60px; height: 60px"
              />
            </template>
          </el-table-column>

          <!-- 普通列 -->
          <el-table-column
            v-else
            v-bind="getColumnProps(column)"
          >
            <template #default="scope">
              <template v-if="scope && scope.row">{{ formatCellValue(scope.row, column) }}</template>
            </template>
          </el-table-column>
        </template>

        <!-- 空数据 -->
        <template #empty>
          <el-empty :description="emptyText" />
        </template>
      </el-table>

      <!-- 分页 -->
      <div v-if="showPagination" class="pagination-container" :style="{ justifyContent: paginationAlign === 'left' ? 'flex-start' : paginationAlign === 'center' ? 'center' : 'flex-end' }">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onActivated, watch, h, defineComponent, inject } from 'vue';
import { Refresh, FullScreen, Close } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import { DYNAMIC_TABLE_HAS_PERMISSION, type HasPermission } from './types';
import type { DynamicTableColumn, SearchField, Pagination, ToolbarAction } from './types';

/**
 * 动态表格组件
 *
 * 使用示例：
 * ```vue
 * <DynamicTable
 *   :columns="columns"
 *   :data-request="fetchData"
 *   :search-fields="searchFields"
 * />
 * ```
 */

defineOptions({
  name: 'DynamicTable',
  inheritAttrs: false
});

/**
 * 权限判断函数（由 app.use(DynamicTable, { hasPermission }) 注入；未注入则 perms 字段失效）。
 */
const _hasPermission = inject<HasPermission | undefined>(DYNAMIC_TABLE_HAS_PERMISSION, undefined);
/** 包装函数：未注入 hasPermission 时所有 perms 都视为通过（向后兼容老用法） */
const _hasPerm = (code: string): boolean => _hasPermission ? _hasPermission(code) : true;

// ==================== Props ====================
const props = withDefaults(
  defineProps<{
    /** 表格列配置 */
    columns: DynamicTableColumn[];
    /** 静态数据：直接传入数据（与 dataRequest 二选一，优先 dataRequest） */
    data?: any[];
    /** 数据请求函数 */
    dataRequest?: (params: any) => Promise<any>;
    /** 搜索表单字段 */
    searchFields?: SearchField[];
    /** 是否显示搜索区域 */
    showSearch?: boolean;
    /** 是否显示工具栏 */
    showToolbar?: boolean;
    /** 是否显示刷新按钮 */
    showRefresh?: boolean;
    /** 是否显示全屏按钮 */
    showFullscreen?: boolean;
    /** 是否显示序号列 */
    showIndex?: boolean;
    /** 是否显示选择列 */
    showSelection?: boolean;
    /** 是否显示分页 */
    showPagination?: boolean;
    /** 是否显示边框 */
    border?: boolean;
    /** 表格高度 */
    height?: string | number;
    /** 是否自动高度 */
    autoHeight?: boolean;
    /** 是否立即加载数据 */
    immediate?: boolean;
    /** keepAlive 重新激活时是否自动刷新数据；默认跟随 immediate（自动加载的表格才自动刷新），可显式关闭 */
    refreshOnActivated?: boolean;
    /** 额外的请求参数 */
    extraParams?: Record<string, any>;
    /** 分页字段映射 */
    pageField?: string;
    pageSizeField?: string;
    /** 分页对齐方式 */
    paginationAlign?: 'left' | 'center' | 'right';
    /** 工具栏渲染函数（JSX） */
    toolbarRender?: () => any;
    /** 工具栏按钮 schema（声明式，优先于 toolbarRender/slot；按钮 disabled/onClick 基于选中行） */
    toolbar?: ToolbarAction[];
    /** 嵌入模式：去除背景/内边距，用于子组件、对话框、StepSection 内部的表格 */
    plain?: boolean;
    /** 空数据文案 */
    emptyText?: string;
  }>(),
  {
    showSearch: true,
    showToolbar: true,
    showRefresh: true,
    showFullscreen: true,
    showIndex: false,
    showSelection: false,
    showPagination: true,
    border: true,
    autoHeight: false,
    immediate: true,
    pageField: 'page',
    pageSizeField: 'rows',
    paginationAlign: 'right',
    plain: false,
    emptyText: '暂无数据',
    data: () => [],
    extraParams: () => {
      return {};
    }
  }
);

const emit = defineEmits<{
  selectionChange: [selection: any[]];
  reload: [];
  /** 搜索表单重置后触发，外部可据此复位 tab/卡片等关联状态 */
  reset: [];
  /** 搜索后触发，回传当前搜索条件 */
  search: [params: Record<string, any>];
}>();

// ==================== 响应式状态 ====================
const tableRef = ref();
const internalData = ref<any[]>([]);
const selectedRows = ref<any[]>([]);

/** 展示数据：无 dataRequest 时使用静态 data（开启分页则自动前端分页），否则使用请求结果 */
const tableData = computed(() => {
  if (!props.dataRequest && props.data) {
    if (props.showPagination) {
      const start = (pagination.current - 1) * pagination.pageSize;
      return props.data.slice(start, start + pagination.pageSize);
    }
    return props.data;
  }
  return internalData.value;
});

const isFullscreen = ref(false);

const pagination = reactive<Pagination>({
  current: 1,
  pageSize: 10,
  total: 0
});

// 分页对齐方式
const paginationAlign = computed(() => props.paginationAlign || 'right');

// 工具栏渲染内容：用渲染函数包裹，兼容 toolbarRender 返回单个 VNode 或数组
const ToolbarRenderer = defineComponent({
  name: 'DynamicTableToolbarRenderer',
  setup() {
    return () => {
      const content = props.toolbarRender?.();
      if (content == null) return null;
      return h('div', { class: 'toolbar-inner' }, Array.isArray(content) ? content : [content]);
    };
  }
});

/** VNode 渲染器：可靠地渲染 customRender/render 返回的 VNode 或 VNode 数组 */
const VNodeRenderer = defineComponent({
  name: 'DynamicTableVNodeRenderer',
  props: { vnode: { type: [Object, Array, String, Number], default: null } },
  setup(props) {
    return () => props.vnode;
  }
});

const searchForm = reactive<Record<string, any>>({});

// ==================== 远程查询下拉 ====================
/** 各远程字段当前的选项列表，key 为 field.prop */
const remoteOptions = reactive<Record<string, Array<{ label: string; value: any }>>>({});
/** 各远程字段的加载状态 */
const remoteLoading = reactive<Record<string, boolean>>({});
/** 记录各字段上次查询时的依赖签名，用于判断是否需要重查 */
const remoteDepsSnapshot = reactive<Record<string, string>>({});

/** 计算字段当前依赖值的签名：无 deps 时返回固定值（仅首次查询） */
const getDepsSignature = (field: SearchField) => {
  if (!field.deps?.length) return '__static__';
  return JSON.stringify(field.deps.map(dep => searchForm[dep] ?? null));
};

/** 执行远程查询并写回选项，透传当前表单值以支持联动 */
const runRemoteQuery = async (field: SearchField, query: string) => {
  if (!field.remoteMethod) return;
  remoteLoading[field.prop] = true;
  try {
    const list = await field.remoteMethod(query, { ...searchForm });
    remoteOptions[field.prop] = list ?? [];
    // 记录本次查询的依赖签名，供下次展开比对
    remoteDepsSnapshot[field.prop] = getDepsSignature(field);
  } catch (error) {
    console.error(`[DynamicTable] 远程查询「${field.label}」失败:`, error);
    remoteOptions[field.prop] = [];
  } finally {
    remoteLoading[field.prop] = false;
  }
};

/** 下拉展开时：依赖值未变且已有缓存则复用，否则按当前表单值重查 */
const handleRemoteVisible = (field: SearchField, visible: boolean) => {
  if (!field.remote || !visible) return;
  const hasCache = remoteOptions[field.prop] !== undefined;
  const depsChanged = remoteDepsSnapshot[field.prop] !== getDepsSignature(field);
  if (hasCache && !depsChanged) return;
  runRemoteQuery(field, '');
};

/** select 值变更：执行字段 onChange（联动，如清空下级） */
const handleSelectChange = (field: SearchField, value: any) => {
  field.onChange?.(value, searchForm);
};

// ==================== 计算属性 ====================
const tableHeight = computed(() => {
  if (isFullscreen.value) return 'calc(100vh - 200px)';
  return props.height || (props.autoHeight ? '100%' : undefined);
});

/** 是否在 keepAlive 重新激活时自动刷新：未显式指定时跟随 immediate（自动加载的表格才自动刷新） */
const shouldRefreshOnActivated = computed(() => props.refreshOnActivated ?? props.immediate);

// ==================== 方法 ====================
const getTagType = (value: any, tagMap: any) => {
  return tagMap?.[value]?.type || 'info';
};

const getTagText = (value: any, tagMap: any) => {
  return tagMap?.[value]?.text || value;
};

const formatCellValue = (row: any, column: DynamicTableColumn) => {
  const value = row[column.prop!];

  // 使用自定义格式化
  if (column.formatter) {
    return column.formatter(row, value, column, 0);
  }

  // 使用字典映射
  if (column.dictMap && column.dictMap[value]) {
    return column.dictMap[value];
  }

  return value;
};

const getColumnProps = (column: DynamicTableColumn) => {
  const { render, customRender, slot, tag, image, type, formatter, dictMap, actions, ...props } = column;
  return props;
};

// 获取操作列的 actions
const getActions = (row: any, col: any, index: number, actionsFn?: DynamicTableColumn['actions']) => {
  if (!actionsFn) return [];

  const actions = actionsFn({ row, column: col, index });
  return actions.filter(action => {
    // 配了 perms 字段：先按 perms 过滤，无权限直接不渲染
    if (action.perms && !_hasPerm(action.perms)) return false;
    // 处理 show 属性
    if (typeof action.show === 'boolean') return action.show;
    if (typeof action.show === 'function') return action.show({ row, column: col, index });
    return true;
  }).map(action => ({
    ...action,
    // 处理 disabled 属性
    disabled: typeof action.disabled === 'function'
      ? action.disabled({ row, column: col, index })
      : action.disabled
  }));
};

// 处理操作按钮点击
const handleActionClick = async (action: any, row: any, col: any, index: number) => {
  // 兜底：把外部回调的异常统一捕获，避免变成 Uncaught (in promise)
  // （Vue 的 @click 不 await async handler，async 函数 reject 就成了 unhandled rejection）
  const safeCall = async (fn: (...args: any[]) => any, args: any[], label: string) => {
    try {
      await fn(...args);
    } catch (err) {
      console.error(`[DynamicTable] ${label} 回调执行失败:`, err);
    }
  };
  const params = { row, column: col, index };

  // popConfirm 配置（旧版写法，保持兼容）
  if (action.popConfirm) {
    const { title = '确定要执行此操作吗？', onConfirm } = action.popConfirm;
    ElMessageBox.confirm(title, '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
      .then(async () => {
        if (onConfirm) await safeCall(onConfirm, [params], 'popConfirm.onConfirm');
      })
      .catch(() => {});
    return;
  }

  // confirm 二次弹窗确认（新版简写）：先弹窗，确认后再执行 onClick
  if (action.confirm) {
    const opts = typeof action.confirm === 'string' ? { message: action.confirm } : action.confirm;
    ElMessageBox.confirm(opts.message || '确定要执行此操作吗？', opts.title || '提示', {
      type: opts.type || 'warning',
      confirmButtonText: opts.confirmButtonText || '确定',
      cancelButtonText: opts.cancelButtonText || '取消'
    })
      .then(async () => {
        if (action.onClick) await safeCall(action.onClick, [params], 'onClick');
      })
      .catch(() => {});
    return;
  }

  // 无确认配置，直接执行 onClick
  if (action.onClick) await safeCall(action.onClick, [params], 'onClick');
};

// ==================== 工具栏 schema 处理 ====================
/** 工具栏可见按钮：按 show + perms 过滤（perms 走 usePermission()，show 函数则基于选中行判断） */
const visibleToolbarActions = computed(() => {
  if (!props.toolbar?.length) return [];
  return props.toolbar.filter(action => {
    // 配了 perms 字段：先按 perms 过滤，无权限直接不渲染
    if (action.perms && !_hasPerm(action.perms)) return false;
    if (typeof action.show === 'function') return action.show(selectedRows.value);
    if (typeof action.show === 'boolean') return action.show;
    return true;
  });
});

/** 解析工具栏按钮禁用状态：函数则基于选中行求值 */
const resolveToolbarDisabled = (action: ToolbarAction) => {
  if (typeof action.disabled === 'function') return action.disabled(selectedRows.value);
  return action.disabled;
};

// ==================== 搜索字段显隐处理 ====================
/** 判断单个搜索字段是否可见 */
const isFieldVisible = (field: SearchField) => {
  if (typeof field.show === 'function') return field.show(searchForm);
  if (typeof field.show === 'boolean') return field.show;
  return true;
};

/** 当前可见的搜索字段（用于模板 v-for） */
const visibleSearchFields = computed(() => {
  if (!props.searchFields?.length) return [];
  return props.searchFields
    .filter(isFieldVisible)
    .map((field) => ({
      ...field,
      // 解析函数形式的 options：动态下拉选项（如反馈类型联动问题分类）
      options:
        typeof field.options === 'function' ? field.options(searchForm) : field.options
    }));
});

/**
 * 工具栏按钮点击：confirm 二次确认逻辑同操作列 handleActionClick，
 * 但 onClick 入参为当前选中行数组（而非 {row,column,index}）。
 * @param action - 工具栏按钮配置
 */
const handleToolbarClick = async (action: ToolbarAction) => {
  // 兜底：把外部回调的异常统一捕获，避免变成 Uncaught (in promise)
  const safeCall = async (fn: (...args: any[]) => any, args: any[], label: string) => {
    try {
      await fn(...args);
    } catch (err) {
      console.error(`[DynamicTable] ${label} 回调执行失败:`, err);
    }
  };
  const selection = selectedRows.value;

  // confirm 二次弹窗确认：先弹窗，确认后再执行 onClick
  if (action.confirm) {
    const opts = typeof action.confirm === 'string' ? { message: action.confirm } : action.confirm;
    ElMessageBox.confirm(opts.message || '确定要执行此操作吗？', opts.title || '提示', {
      type: opts.type || 'warning',
      confirmButtonText: opts.confirmButtonText || '确定',
      cancelButtonText: opts.cancelButtonText || '取消'
    })
      .then(async () => {
        if (action.onClick) await safeCall(action.onClick, [selection], 'toolbar.onClick');
      })
      .catch(() => {});
    return;
  }

  // 无确认配置，直接执行 onClick
  if (action.onClick) await safeCall(action.onClick, [selection], 'toolbar.onClick');
};

const buildRequestParams = () => {
  const params: Record<string, any> = {
    ...props.extraParams,
    ...searchForm,
    [props.pageField]: pagination.current,
    [props.pageSizeField]: pagination.pageSize
  };

  // 清理空值
  Object.keys(params).forEach(key => {
    if (params[key] === '' || params[key] === null || params[key] === undefined) {
      delete params[key];
    }
  });

  return params;
};

const fetchData = async () => {
  // 静态数据模式：无 dataRequest 时直接使用 data，total 取其长度
  if (!props.dataRequest) {
    if (props.showPagination && props.data) {
      pagination.total = props.data.length;
    }
    return;
  }

  try {
    const params = buildRequestParams();
    const response = await props.dataRequest(params);

    // 处理响应数据
    if (response?.data) {
      internalData.value = response.data;
      pagination.total = response.total || 0;
    } else if (Array.isArray(response)) {
      internalData.value = response;
      pagination.total = response.length;
    }
  } catch (error) {
    console.error('[DynamicTable] 数据加载失败:', error);
  }
};

const handleSearch = () => {
  pagination.current = 1;
  fetchData();
  emit('search', { ...searchForm });
};

const handleReset = () => {
  // 按字段定义恢复默认值（multiple 字段恢复为 []）
  if (props.searchFields) {
    props.searchFields.forEach(field => {
      if (field.defaultValue !== undefined) {
        searchForm[field.prop] = field.defaultValue;
      } else if (field.multiple) {
        searchForm[field.prop] = [];
      } else {
        searchForm[field.prop] = undefined;
      }
    });
  }
  pagination.current = 1;
  // 先通知外部复位关联状态（如 tab → extraParams），emit 是同步的，
  // 外部 handler 执行完毕后 extraParams 已更新，随后 fetchData 用最新参数查询
  emit('reset');
  fetchData();
};

const handleRefresh = () => {
  fetchData();
};

const handlePageChange = (page: number) => {
  pagination.current = page;
  fetchData();
};

const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.current = 1;
  fetchData();
};

const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection;
  emit('selectionChange', selection);
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

// 初始化搜索表单默认值
const initSearchForm = () => {
  if (props.searchFields) {
    props.searchFields.forEach(field => {
      if (field.defaultValue !== undefined) {
        searchForm[field.prop] = field.defaultValue;
      } else if (field.multiple) {
        searchForm[field.prop] = [];
      } else {
        searchForm[field.prop] = undefined;
      }
    });
  }
};

initSearchForm();

// 监听 searchFields 变化，重新初始化默认值（支持 searchFields 异步计算后更新 defaultValue）
watch(() => props.searchFields, () => {
  initSearchForm();
}, { deep: true });

// 立即加载数据
if (props.immediate && props.dataRequest) {
  onMounted(() => {
    fetchData();
  });
}

/**
 * keepAlive 缓存下，列表页返回时本组件 onMounted 不会再触发，
 * 这里在重新激活时自动刷新一次数据，免去每个列表页各自处理 onActivated。
 * 首次激活跳过（初次挂载上面 onMounted 已加载），避免重复请求；
 * 关闭 immediate 的表格默认不自动刷新，交由页面自行控制。
 */
let isFirstActivated = true;
onActivated(() => {
  if (isFirstActivated) {
    isFirstActivated = false;
    return;
  }
  if (shouldRefreshOnActivated.value && props.dataRequest) {
    fetchData();
  }
});

// 静态数据模式：data 变化时同步 total（data 常由父组件异步传入）
if (!props.dataRequest) {
  watch(
    () => props.data,
    val => {
      if (props.showPagination) {
        pagination.total = val?.length || 0;
        // 当前页越界时回到第一页
        const maxPage = Math.max(1, Math.ceil((val?.length || 0) / pagination.pageSize));
        if (pagination.current > maxPage) pagination.current = 1;
      }
    },
    { immediate: true }
  );
}

// ==================== 暴露方法 ====================
defineExpose({
  reload: fetchData,
  refresh: fetchData,
  search: handleSearch,
  reset: handleReset,
  getSelectionRows: () => selectedRows.value,
  clearSelection: () => tableRef.value?.clearSelection()
});
</script>

<style lang="scss" scoped>
.dynamic-table-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;

  /* 嵌入模式：去除装饰性背景/内边距，用于子组件、对话框、StepSection 内部 */
  &.is-plain {
    gap: 0;

    .table-container {
      padding: 0;
      background: transparent;
    }
  }

  .search-container {
    background: #fff;
    padding: 16px;
    border-radius: 4px;

    .el-form {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;

      :deep(.el-form-item) {
        margin-bottom: 0;
      }
    }
  }

  .toolbar-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    padding: 12px 16px;
    border-radius: 4px;

    .toolbar-left {
      display: flex;
      gap: 8px;

      .toolbar-inner {
        display: flex;
        gap: 8px;
        align-items: center;
      }
    }

    .toolbar-right {
      display: flex;
      gap: 8px;
    }
  }

  .table-container {
    flex: 1;
    background: #fff;
    padding: 16px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &.is-fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      padding: 70px 20px 20px 20px;
      background: #fff;

      .fullscreen-close-btn {
        position: absolute;
        top: 20px;
        right: 20px;
        z-index: 10000;
      }

      .el-table {
        height: 100%;
      }
    }

    .el-table {
      flex-shrink: 1;
      overflow: auto;
    }

    .pagination-container {
      display: flex;
      flex-shrink: 0;
      padding-top: 16px;
      background: #fff;
    }
  }
}
</style>
