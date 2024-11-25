<script lang="ts">
import {
  defineComponent,
  toRefs,
  onMounted,
  onBeforeUnmount,
  nextTick,
  ref,
  watch,
} from "vue";
import * as echarts from "echarts";

import eventBus from "~/utils/eventBus";
import { isDark } from "~/composables/dark";

export default defineComponent({
  name: "ChartBox",
  props: {
    options: {
      type: Object,
      default: () => {},
    },
    width: {
      type: String,
      default: "100%",
    },
    height: {
      type: String,
      default: "100%",
    },
  },

  emits: ["init"],
  setup(props: any, { emit, expose }) {
    const { width, height, options } = toRefs(props);

    const chartRef = ref<HTMLElement | null>(null);
    let myChart: any = null;

    /** watch */
    watch(
      options,
      () => {
        initChart(isDark.value);
      },
      {
        deep: true,
      }
    );
    onMounted(() => {
      initChart(isDark.value);
      window.addEventListener("resize", () => {
        myChart && myChart.resize();
      });
      eventBus.on("changeTheme", initChart);
    });
    const initChart = (isdark?: boolean) => {
      myChart?.dispose();
      myChart = echarts.init(chartRef.value, isdark ? "dark" : "");
      myChart.setOption(options.value, {
        notMerge: true,
      });
      myChart.on("finished", function () {
        emit("init", myChart);
      });
    };

    onBeforeUnmount(() => {
      if (!myChart) {
        return;
      }
      myChart.dispose();
      myChart = null;
      window.removeEventListener("resize", () => {});
      eventBus.off("changeTheme", initChart);
    });

    expose({
      myChart,
    });
    return {
      width,
      height,
      options,
      myChart,
      chartRef,
    };
  },
});
</script>

<template>
  <div ref="chartRef" :style="{ height, width }"></div>
</template>
