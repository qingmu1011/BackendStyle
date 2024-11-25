<template>
  <el-dialog
    :title="title"
    :width="width"
    :before-close="beforeClose"
    :model-value="true"
    @close="cancel"
    :destroy-on-close="true"
  >
    <div id="switch-panel" class="w-full h-600px"></div>
  </el-dialog>
</template>
<script lang="ts" setup>
import {
  defineOptions,
  defineProps,
  ref,
  toRefs,
  onMounted,
  nextTick,
} from "vue";
import SwitchControl from "./SwitchControl.ts";
defineOptions({
  name: "SwitchPanel",
});

const props = defineProps({
  /* 取消按钮点击事件 */
  cancel: {
    type: Function,
    default: () => {},
  },
});
const title = "开关示意图";
const width = "50%";

const switchControl = ref(null);
onMounted(() => {
  nextTick(() => {
    // 创建开关控件
    switchControl.value = new SwitchControl({
      target: "switch-panel",
    });
  });
});
const beforeClose = (done: () => void) => {
  done();
};
</script>
