<script lang="ts">
import {
  defineComponent,
  toRefs,
  ref,
  computed,
  onMounted,
  onUnmounted,
  reactive,
} from "vue";

export default defineComponent({
  name: "TablePagination",
  props: {
    height: {
      type: String,
      default: "100%",
    },
    pageVisible: {
      type: Boolean,
      default: true,
    },
    //分页参数
    pageObj: {
      type: Object,
      default: () => {
        return {
          pageNum: 1,
          pageSize: 10,
        };
      },
    },
    pageSizes: {
      type: Array,
      default: () => {
        return [5, 10, 15, 20, 50];
      },
    },
    layout: {
      type: String,
      default: "total, prev, pager, next,sizes, jumper",
    },
    total: {
      type: Number || String,
      default: 0,
    },
    //列表数据
    data: {
      type: Array,
      default: () => {
        return [];
      },
    },
    //显示序号
    showIndex: {
      type: Boolean,
      default: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    highlightCurrentRow: {
      type: Boolean,
      default: false,
    },
    /** 显示表格右键菜单-暂未完成拓展 */
    showContextMenu: {
      type: Boolean,
      default: false,
    },
    cloumns: {
      type: Array,
      default: () => [],
    },
  },
  emits: {
    "size-change": (val: number) => val,
    "current-change": (val: number) => val,
    "row-click": (row: any) => row,
    "row-contextmenu": (row: any) => row,
  },
  setup(props: any, { emit }) {
    const {
      pageObj,
      total,
      loading,
      data,
      highlightCurrentRow,
      showContextMenu,
      pageVisible,
      cloumns,
    } = toRefs(props);
    const operationBtns = ref<HTMLElement | null>(null);

    const contextMenuVisible = ref(false);
    const contextMenuTop = ref(0);
    const contextMenuLeft = ref(0);
    const menuRow = reactive<object>({ value: {} });

    /** computed */
    const operationWidth = computed(() => {
      const width = operationBtns.value
        ? operationBtns.value.clientWidth + 30
        : 0;
      return width < 200 ? 200 : width;
    });
    //methods
    //翻页
    const handleCurrentChange = (val: number) => {
      emit("current-change", val);
    };
    //修改页数
    const handleSizeChange = (val: number) => {
      emit("size-change", val);
    };
    /**行点击 */
    const rowClick = (row: any) => {
      emit("row-click", { ...row });
    };
    /** 行右键点击 */
    const rowContextmenu = (row: any, column: any, event: Event) => {
      if (!showContextMenu.value) {
        emit("row-contextmenu", { ...row });
        event.preventDefault();
      } else {
        event.preventDefault();
        contextMenuVisible.value = true;
        menuRow.value = { ...row };
        contextMenuTop.value = event.clientY;
        contextMenuLeft.value = event.clientX;
      }
    };

    onMounted(() => {
      window.addEventListener("scroll", closeRightMenu, true);
      window.addEventListener("click", closeRightMenu, true);
    });
    onUnmounted(() => {
      window.removeEventListener("scroll", closeRightMenu);
      window.removeEventListener("click", closeRightMenu);
    });
    function closeRightMenu() {
      contextMenuVisible.value = false;
      // menuRow.value = {};
    }
    return {
      pageObj,
      total,
      data,
      loading,
      operationBtns,
      operationWidth,
      highlightCurrentRow,
      handleSizeChange,
      handleCurrentChange,
      rowClick,
      rowContextmenu,

      contextMenuVisible,
      contextMenuTop,
      contextMenuLeft,
      menuRow,
      pageVisible,
      cloumns,
    };
  },
  methods: {},
});
</script>
<template>
  <div class="table-pagination" :style="{ height: height }" v-loading="loading">
    <div class="table-pagination_table">
      <el-table
        :data="data"
        height="100%"
        style="width: 100%"
        stripe
        :highlight-current-row="highlightCurrentRow"
        :header-row-class-name="`blue-table-head`"
        @row-click="rowClick"
        @row-contextmenu="rowContextmenu"
      >
        <el-table-column
          type="index"
          width="100"
          v-if="showIndex"
          label="序号"
          align="center"
        >
          <template #default="scope">
            {{ pageObj.pageSize * (pageObj.pageNum - 1) + (scope.$index + 1) }}
          </template>
        </el-table-column>
        <el-table-column
          v-for="column in cloumns"
          :key="column.prop"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :sortable="column.sortable"
          :show-overflow-tooltip="column.showOverflowTooltip"
          :align="column.align"
          :class-name="column.className"
          :fixed="column.fixed"
        >
          <template #default="scope">
            <span v-if="!$slots[column.prop]">{{
              scope.row[column.prop]
            }}</span>
            <slot :name="column.prop" :scope="scope"></slot>
          </template>
        </el-table-column>
        <slot></slot>
        <el-table-column
          fixed="right"
          label="操作"
          :width="operationWidth"
          v-if="$slots.operations"
          align="center"
        >
          <template #default="scope">
            <div class="operation-btns" ref="operationBtns">
              <slot name="operations" :scope="scope"></slot>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div
        class="table-context-menu"
        v-show="contextMenuVisible && showContextMenu"
        :style="{ top: contextMenuTop + 'px', left: contextMenuLeft + 'px' }"
      >
        <slot name="context-menu" :scope="menuRow.value"></slot>
      </div>
    </div>
    <div class="table-pagination_foot" v-if="pageVisible">
      <el-pagination
        background
        :current-page="pageObj.pageNum"
        :page-size="pageObj.pageSize"
        :page-sizes="pageSizes"
        :layout="layout"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </div>
  </div>
</template>
<style lang="scss">
.table-pagination {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  min-height: 0;
}
.table-pagination_table {
  flex: 1;
  margin-bottom: 10px;
  overflow: hidden;
  .operation-btns {
    display: inline-block;
  }
}
.table-pagination_foot {
  margin: 5px 0;
  .el-pagination {
    justify-content: center;
  }
}
.table-context-menu {
  position: fixed;
  z-index: 3000;
}
</style>
