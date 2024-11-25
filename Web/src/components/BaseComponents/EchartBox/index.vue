<script lang="ts">
import {
  defineComponent,
  toRefs,
  onMounted,
  onBeforeUnmount,
  ref,
  reactive,
  watch,
} from "vue";
import {
  getBar,
  getPie,
  getMultiLine,
  getResultLine,
  getOnOffLine,
} from "./chart_uitls";
export default defineComponent({
  name: "EchartBox",
  props: {
    /** 图表类型 */
    type: {
      type: String,
    },
    /** 高度 */
    height: {
      type: String,
      default: `100%`,
    },
    /** 宽度 */
    width: {
      type: String,
      default: `100%`,
    },
    /** x轴数据 */
    xData: {
      type: Array,
      default: () => {
        return [];
      },
    },
    /** y轴数据 */
    yData: {
      type: Array,
      default: () => {
        return [];
      },
    },
    /** 配置信息 */
    otherConfig: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  emits: ["click"],
  setup(props: any, { emit }) {
    const { type, height, width, xData, yData, otherConfig } = toRefs(props);
    let options = reactive<object>({ value: {} });
    const chart = ref(null);

    onMounted(() => {
      initChart();
    });
    onBeforeUnmount(() => {
      clearEvent();
    });

    /** watch */
    watch(
      xData,
      () => {
        initChart();
      },
      {
        deep: true,
      }
    );
    watch(
      yData,
      () => {
        initChart();
      },
      {
        deep: true,
      }
    );
    watch(
      otherConfig,
      () => {
        initChart();
      },
      {
        deep: true,
      }
    );

    /** methods */
    const initChart = () => {
      switch (type.value) {
        case `bar`:
          options.value = reactive<object>(getBar(xData.value, yData.value));
          break;
        case `pie`:
          options.value = reactive<object>(getPie(otherConfig.value));
          break;
        case `multiLine`:
          options.value = reactive<object>(
            getMultiLine(xData.value, yData.value, otherConfig.value)
          );
          break;
        case `result-line`:
          options.value = reactive<object>(
            getResultLine(xData.value, yData.value, otherConfig.value)
          );
          break;
        case `on-off-line`:
          options.value = reactive<object>(
            getOnOffLine(xData.value, yData.value, otherConfig.value)
          );
          break;
        default:
          break;
      }
    };

    function bindEvent() {
      if (chart.value) {
        chart.value.off("click");
        chart.value.on("click", function (params) {
          emit("click", params);
        });
      }
    }

    function clearEvent() {
      if (chart.value) {
        chart.value.off("click");
        chart.value.off("datazoom");
      }
    }

    function chartClick(params: any) {
      emit("click", params);
    }

    function initedChart(_chart: any) {
      chart.value = _chart;
      bindEvent();
    }
    function moveOver() {
      if (!chart.value) return;
      chart.value.off("datazoom");
      chart.value.on("datazoom", function (params) {
        emit("datazoom", params);
      });
    }
    function moveOut() {
      if (!chart.value) return;
      chart.value.off("datazoom");
    }
    return {
      width,
      height,
      options,
      initedChart,
      chart,
      moveOver,
      moveOut,
    };
  },
});
</script>

<template>
  <chart-box
    :width="width"
    :height="height"
    :options="options.value"
    @init="initedChart"
    @mouseover="moveOver"
    @mouseout="moveOut"
  ></chart-box>
</template>
