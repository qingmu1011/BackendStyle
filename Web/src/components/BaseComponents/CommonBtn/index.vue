<script lang="ts">
import { defineComponent, toRefs, computed, ref } from "vue";

export default defineComponent({
  name: "CommonBtn",
  props: {
    /** 是否禁用 */
    disabled: {
      type: Boolean,
      default: false,
    },
    /** 是否加载状态 */
    loading: {
      type: Boolean,
      default: false,
    },
    /** 文字提示 */
    label: {
      type: String,
    },
    /** 按钮名称 */
    name: {
      type: String,
    },
    /** 按钮类型 */
    type: {
      type: String,
      default: "primary",
    },
    /** icon */
    icon: {
      type: String,
      default: "icon-edit",
    },
    /** 是否为朴素按钮 */
    plain: {
      type: Boolean,
      default: true,
    },
    /** 是否为圆形按钮 */
    circle: {
      type: Boolean,
      default: false,
    },
    /** 是否为圆角按钮 */
    round: {
      type: Boolean,
      default: false,
    },
    /** 大小 */
    size: {
      type: String,
      default: "small",
      validator: (value) => ["small", "default", "large"].includes(value),
    },
  },
  emits: ["click"],
  setup(props: any, { emit }) {
    const visible = computed(() => {
      return !!props.label && onBtn.value;
    });
    const onBtn = ref<boolean>(false);
    const clickFn = (args: any) => {
      emit("click");
    };

    return {
      ...toRefs(props),
      visible,
      onBtn,
      clickFn,
    };
  },
});
</script>
<template>
  <span class="common-btn-wrapper">
    <el-tooltip effect="light" placement="top" :visible="visible">
      <template #content>
        <span>{{ label }}</span>
      </template>
      <el-button
        class="common-btn"
        :loading="loading"
        :disabled="disabled"
        @click="clickFn"
        :type="type"
        :plain="plain"
        :circle="circle"
        :round="round"
        @mouseenter="onBtn = true"
        @mouseleave="onBtn = false"
        :size="size"
      >
        <span class="common-btn-content" v-if="!$slots.default">
          <i
            v-show="icon"
            v-if="!$slots.icon"
            :class="[
              'iconfont iconfont2 icon-no-margin',
              icon,
              { 'icon-no-margin': !name },
            ]"
          ></i>
          <slot name="icon"></slot>
          <span style="margin-left: 5px;" v-if="name"> {{ name }}</span>
        </span>
        <slot name="default"></slot>
      </el-button>
    </el-tooltip>
  </span>
</template>
<style scoped lang="scss">
.common-btn {
  .icon-no-margin {
    margin-right: unset;
  }
  .common-btn-content {
    display: flex;
    align-items: center;
  }
}
.common-btn-wrapper + .common-btn-wrapper {
  margin-left: 10px;
}
</style>
