<template>
  <div class="flex justify-center items-center cursor-pointer">
    <div
      :class="`flex justify-center items-center border-2 border-solid ${type === 'K1' ? 'rounded-full' : 'rounded-5px'}`"
      :style="`border-color:${iconColor};width:${30 * ratio}px;height:${30 * ratio}px;`"
    >
      <i
        :class="`iconfont icon-${switchIcon.icon}`"
        :style="`font-size:${iconSize};color:${iconColor};transform:rotate(${switchIcon.rotate}deg);`"
      ></i>
      <!-- <slot></slot> -->
    </div>
  </div>
</template>
<script lang="ts" setup>
import { defineOptions, defineProps, toRefs, computed } from "vue";
defineOptions({
  name: "SwitchIcon",
});

const props = defineProps({
  /**
   * 电池类型，K1-K2
   */
  type: {
    type: String,
    default: "K1",
    validator: (value: string) => {
      return ["K1", "K2"].includes(value);
    },
  },
  /**
   * icon的类型，1-3代表电池状态，-1-3代表电网状态
   */
  icon: {
    type: Number,
    default: 1,
    validator: (value: number) => {
      return [1, 2, 3, -1, -2, -3].includes(value);
    },
  },
  /**
   * icon的比例，0-1之间
   */
  ratio: {
    type: Number,
    default: 1,
    validator: (value: number) => {
      return value >= 0 && value <= 1;
    },
  },
});

const { type, icon, ratio } = toRefs(props);

/**
 * 根据type和icon返回对应的switchIcon
 */
const switchIcon = computed(() => {
  switch (icon.value) {
    case 1:
      return {
        icon: "duankailianjie",
        rotate: 0, //电池断电
      };
    case -1:
      return {
        icon: "duankailianjie",
        rotate: 0, //电网断开
      };
    case 2:
      return {
        icon: "chongfangdian-fang",
        rotate: 180, //电池放电
      };
    case -2:
      return {
        icon: "chongfangdian-fang",
        rotate: 180, //电网供电
      };
    case 3:
      return {
        icon: "chongdianzhong",
        rotate: 0, //电池充电
      };
    case -3:
      return {
        icon: "chongfangdian-fang",
        rotate: 0, //电网受电
      };
  }
});

/**
 * 根据icon返回对应的iconSize
 */
const iconSize = computed(() => {
  let size = 24;
  switch (icon.value) {
    case 1:
      size = 18;
      break;
    case -1:
      size = 18;
      break;
    default:
      size = 24;
      break;
  }
  return `${size * ratio.value}px`;
});

const iconColor = computed(() => {
  switch (icon.value) {
    case 1:
      return "#f56c6c";
    case -1:
      return "#f56c6c";
    case 2:
      return "#1a9bff";
    case -2:
      return "#1a9bff";
    case 3:
      return "#1aad19";
    case -3:
      return "#1aad19";
    default:
      return "#1a9bff";
  }
});
</script>
