<template>
  <div class="count-show-container" :style="style">
    <div class="count-show-header">
      <div class="icon" :style="{ color: iconColor }">
        <slot name="icon"><i class="iconfont" :class="icon"></i></slot>
      </div>
      <common-title
        style="margin-bottom: 0"
        :title="zhTitle"
        :smallTitle="enTitle"
      ></common-title>
    </div>
    <div class="count-show-content text-center">
      <span class="flex justify-center">
        <el-statistic :value="outputValue" :precision="precision" />
        <span class="!text-20px pb-5px ml-5px" style="align-self: end">{{
          unit
        }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineOptions, defineProps, computed, toRefs, ref } from "vue";
import { useTransition } from "@vueuse/core";
defineOptions({
  name: "CountShowCard",
});
const props = defineProps({
  count: {
    type: Number,
    default: 0,
  },
  zhTitle: {
    type: String,
    default: "",
  },
  enTitle: {
    type: String,
    default: "",
  },
  color: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
    default: "",
  },
  iconColor: {
    type: String,
    default: "",
  },
  unit: {
    type: String,
    default: "",
  },
  precision: {
    type: Number,
    default: 0,
  },
});

const { count, iconColor, unit, precision } = toRefs(props);

const style = computed(() => {
  return {
    backgroundColor: `var(--el-bg-color-${props.color})`,
  };
});

const outputValue = useTransition(count, {
  duration: 1500,
});
// /**对数字进行格式化 234567 > 234.5k*/
// function numProcessing(num: number) {
//   let numStr = num.toString();
//   if (numStr.length < 5) return numStr;
//   let str = numStr.slice(0, numStr.length - 2);
//   return str.slice(0, -1) + "." + str.slice(-1) + "k";
// }

// const count = computed(() => {
//   return numProcessing(props.count);
// });
</script>

<style lang="scss" scoped>
.count-show-container {
  box-sizing: border-box;
  text-align: start;
  // background-color: #e5f8fc;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  padding: 30px 20px;
  box-shadow: var(--el-box-shadow-light);
  transition: background 0.3s;
  ::v-deep {
    --el-font-size-extra-large: 45px;
  }

  .span-style {
    font-size: 12px;
    margin-top: 4px;
    color: var(--el-text-color-secondary);
  }

  .count-show-header {
    display: flex;
    align-items: center;
    margin-bottom: 30px;

    .icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 20px;
      box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.08);
      .iconfont {
        font-size: 30px;
      }
    }

    .title {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .zh-title {
        font-size: 20px;
        font-weight: bold;
      }
    }
  }

  .count-show-content {
    display: flex;
    flex-direction: column;
    & span:nth-child(1) {
      font-size: 45px;
      font-weight: 500;
    }
  }

  .count-show-header .title .en-title,
  .count-show-content span:nth-child(1) span,
  .count-show-content span:nth-child(2) {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
