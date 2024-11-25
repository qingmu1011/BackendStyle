<template>
  <div class="line-title">
    <span>{{ title }}</span>
  </div>
</template>
<script lang="ts" setup>
import {
  defineOptions,
  defineProps,
  defineEmits,
  ref,
  toRefs,
  defineExpose,
  computed,
} from "vue";

defineOptions({
  name: "LineTile",
});

const props = defineProps({
  title: {
    type: String,
    default: "",
    required: true,
  },
});

const { title } = toRefs(props);
</script>
<style scoped lang="scss">
.line-title {
  position: relative;
  display: flex;
  align-items: center;
  span {
    margin-right: 20px;
    font-size: 16px;
    font-weight: bold;
    color: var(--el-text-color-placeholder);
  }
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background-color: var(--el-border-color);
  }
}
</style>
