<template>
  <div class="common-panel">
    <div class="common-panel_cont">
      <common-title
        vertical
        :title="title || $route.meta?.title"
        :icon="titleIcon || $route.meta?.titleIcon"
        :smallTitle="enTitle || $route.meta?.enTitle"
      ></common-title>
      <el-card
        class="common-panel_statistic !p-unset !bg-transparent"
        v-show="$slots.statistic"
      >
        <slot name="statistic"></slot>
      </el-card>
      <el-card class="common-panel_search" v-show="$slots.search">
        <div
          class="common-panel_search-row"
          :style="{ '--splitNum': rowSplitNumber }"
        >
          <slot name="search"></slot>
          <div class="common-panel_search-btn flex items-center">
            <slot name="btn"></slot>
          </div>
        </div>
      </el-card>

      <el-card class="common-panel_body">
        <div class="mb-10px" v-if="$slots.listBtn">
          <slot name="listBtn"></slot>
        </div>
        <div class="flex-1 min-h-0">
          <slot name="default"></slot>
        </div>
      </el-card>
    </div>
    <slot name="dialog"></slot>
  </div>
</template>
<script lang="ts" setup>
import { defineProps } from "vue";
defineOptions({
  name: "CommonPanel",
});
const props = defineProps({
  rowSplitNumber: {
    type: Number,
    default: 4,
  },
  titleIcon: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "",
  },
  enTitle: {
    type: String,
    default: "",
  },
});
</script>
<style scoped lang="scss">
.common-panel {
  height: 100%;
  position: relative;
}
.common-panel_cont {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.common-panel_search-row {
  display: grid;
  grid-template-columns: repeat(var(--splitNum), 1fr);
  column-gap: 10px;
}
.common-panel_search-btn {
  text-align: left;
}
.common-panel_body {
  flex: 1;
  padding: var(--box-padding);
  overflow: hidden;
  margin-bottom: unset;
  display: flex;
  flex-direction: column;
  :deep(.el-card__body) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}
</style>
