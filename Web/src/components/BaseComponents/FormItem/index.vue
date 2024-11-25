<script lang="ts">
import { defineComponent, ref } from "vue";
export default defineComponent({
  name: "FormItem",
  props: {
    label: {
      type: String,
      default: "",
    },
    labelWidth: {
      type: String,
      default: "100px",
    },
    auto: {
      type: Boolean,
      default: true,
    },
  },
  setup() {},
});
</script>
<template>
  <div class="form-item">
    <label
      :class="['form-item_label', { auto: auto }]"
      for="form-item_inner"
      :style="auto ? {} : { width: labelWidth }"
      >{{ label }}</label
    >
    <div class="form-item_inner">
      <slot></slot>
    </div>
  </div>
</template>
<style scoped lang="scss">
.form-item {
  display: flex;
  min-width: 160px;
  align-items: center;
  padding-right: 10px;
  .form-item_label {
    min-width: 60px;
    font-size: var(--font-size);
    color: var(--el-text-color-regular);
    font-weight: bold;
    text-align: left;
    &.auto {
      margin-right: 20px;
    }
  }

  .form-item_inner {
    flex: 1;
    overflow: hidden;
    ::v-deep {
      .el-date-editor {
        width: 100%;
      }
    }
  }
}
</style>
