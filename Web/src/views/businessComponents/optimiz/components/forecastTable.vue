<template>
  <div class="forecast-table" :style="{ height }">
    <div class="m-b-20px flex justify-between items-center">
      <span>结果</span>
      <el-button @click="confirmResult">导出结果</el-button>
    </div>

    <div>
      <div class="m-b-15px">
        <el-row :gutter="20">
          <el-col :span="12"
            ><count-show-card
              :count="minCount"
              :zh-title="'最低电费'"
              :en-title="'Min Count'"
              color="report"
              icon="iconfont icon-zuixiaozhi"
              icon-color="#4287fe"
              unit="元"
              :precision="2"
            ></count-show-card
          ></el-col>
          <el-col :span="12"
            ><count-show-card
              :count="maxCount"
              :zh-title="'最高电费'"
              :en-title="'Max Count'"
              color="member"
              icon="iconfont icon-zuidazhi"
              icon-color="#ffd58d"
              unit="元"
              :precision="2"
            ></count-show-card
          ></el-col>
        </el-row>
      </div>
      <show-table v-bind="$attrs" ref="showTable" :table-data="valueData" />

      <div
        id="chartBox"
        ref="chartBox"
        class="relative bg-#ffffff overflow-auto"
      >
        <div class="relative text-16px mt-10px z-10 pl-20px">
          <fullIcon class="cursor-pointer" @click="fullScreen"> </fullIcon>
        </div>
        <div class="h-500px mt-20px">
          <echart-box
            ref="chart1"
            :type="'multiLine'"
            :other-config="{
              xAxisName: '时间',
            }"
            :x-data="lineData.xData"
            :y-data="lineData.yData"
            @datazoom="dataZoom($event, '1')"
          ></echart-box>
        </div>
        <div class="h-500px mt-20px">
          <echart-box
            ref="chart2"
            :type="'bar'"
            :other-config="{
              xAxisName: '时间',
            }"
            :x-data="barData.xData"
            :y-data="barData.yData"
            @datazoom="dataZoom($event, '2')"
          ></echart-box>
        </div>
        <div class="h-500px mt-20px">
          <echart-box
            ref="chart3"
            :type="'result-line'"
            :other-config="{
              xAxisName: '时间',
            }"
            :x-data="resultData.xData"
            :y-data="resultData.yData"
            @datazoom="dataZoom($event, '3')"
          ></echart-box>
        </div>
        <div class="h-500px mt-20px">
          <echart-box
            ref="chart4"
            :type="'on-off-line'"
            :other-config="{
              xAxisName: '时间',
            }"
            :x-data="onoffData.xData"
            :y-data="onoffData.yData"
            @click="chartClick"
            @datazoom="dataZoom($event, '4')"
          ></echart-box>
        </div>
        <div class="flex justify-center mt-10px">
          <template v-for="(item, idx) in legend">
            <span
              v-if="item.name !== '时间'"
              class="flex items-center mr-10px"
              :key="idx"
            >
              <switch-icon :ratio="0.7" :type="item.name" :icon="item.convert">
              </switch-icon>
              <span class="ml-5px">{{ item.title }}{{ item.label }}</span>
            </span>
          </template>
        </div>
        <el-table
          class="mt-20px"
          :data="tableData"
          style="width: 100%"
          :span-method="objectSpanMethod"
          border
        >
          <el-table-column
            prop="name"
            label="状态"
            width="100"
            align="center"
            fixed="left"
          >
            <template #default="scope">
              <span v-if="scope.row.name !== '时间'">
                <span>{{ scope.row.title }}</span>
                <br />
                <span>{{ scope.row.name }}</span>
              </span>
              <span v-else></span>
            </template>
          </el-table-column>
          <el-table-column
            v-for="(item, idx) in onoffData.xData"
            :key="item"
            :prop="`value${idx + 1}`"
            width="180"
            align="center"
          >
            <template #default="scope">
              <span v-if="scope.row.name === '时间'">
                <span>{{ formatTime(scope.row[`value${idx + 1}`]) }}</span>
                <br />
                <span>{{
                  formatTime(scope.row[`value${idx + 1}`], `HH:mm`)
                }}</span>
              </span>
              <el-tooltip
                v-else-if="scope.row[`value${idx + 1}`] === 1"
                :content="
                  scope.row.title + '开关' + scope.row.name + scope.row.label
                "
                placement="top"
              >
                <switch-icon :type="scope.row.name" :icon="scope.row.convert">
                </switch-icon>
              </el-tooltip>
              <span v-else> </span>
            </template>
            <template #header="scope">
              <div :key="idx" v-for="(item, idx) in handleColumnName(scope)">
                <span>
                  {{ item }}
                </span>
                <br />
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <switch-panel v-if="switchVisible" :cancel="cancelFn"></switch-panel>
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
  onMounted,
  useTemplateRef,
  getCurrentInstance,
} from "vue";
import ShowTable from "./showTable.vue";
import SwitchPanel from "./switchPanel.vue";
import { formatTime, formatDecimal } from "@/utils/commonFun";
import { FullScreen } from "@element-plus/icons-vue";
import fullIcon from "~/assets/svg/full_screen.svg?component";
import SwitchIcon from "./SwitchIcon.vue";

defineOptions({
  name: "ForecastTable",
});

const props = defineProps({
  height: {
    type: String,
    default: "auto",
  },
  valueData: {
    type: Object,
    default: () => {
      return {
        result: {},
        pvData: [],
        tariffData: [],
        loadsData: [],
      };
    },
  },
});

const { height, valueData } = toRefs(props);
const chart1 = ref(null);
const chart2 = ref(null);
const chart3 = ref(null);
const chart4 = ref(null);
const chartBox = ref(null);
const instance = getCurrentInstance();
const legend = ref([
  {
    name: `K1`,
    title: "电池",
    value: 2,
    label: "放电",
    idx: 0,
    convert: 2,
  },
  {
    name: `K1`,
    title: "电池",
    value: 1,
    label: "断电",
    idx: 0,
    convert: 1,
  },
  {
    name: `K1`,
    title: "电池",
    value: 0,
    label: "充电",
    idx: 0,
    convert: 3,
  },
  {
    name: `K2`,
    title: "电网",
    value: 2,
    label: "供电",
    idx: 1,
    convert: -2,
  },
  {
    name: `K2`,
    title: "电网",
    value: 1,
    label: "断开",
    idx: 1,
    convert: -1,
  },
  {
    name: `K2`,
    title: "电网",
    value: 0,
    label: "受电",
    idx: 1,
    convert: -3,
  },
  {
    name: "时间",
  },
]);
const showTable = useTemplateRef('showTable');

const lineData = ref({
  xData: [],
  yData: [],
});
const barData = ref({
  xData: [],
  yData: [],
});
const resultData = ref({
  xData: [],
  yData: [],
});
const onoffData = ref({
  xData: [],
  yData: [],
});
const tableData = ref([]);

const switchVisible = ref(false);
const minCount = ref(0);
const maxCount = ref(0);

onMounted(() => {
  initLineData();
});

/**
 * 解析数据
 */
function initLineData() {
  const { result, pvData, tariffData, loadsData } = valueData.value;
  const { min, max } = result;
  analyzeResult(result);
  let qdData: number[] = []; //弃电量数据
  let k1Data: number[] = []; //电池开关K1
  let k2Data: number[] = []; //电网开关K2数据
  lineData.value.xData = pvData.map((c: any, idx: number) => {
    qdData.push(Math.abs(min.pvAbandonedPowerDataList[idx] || 0));
    k1Data.push(min.electricQuantityDataList[idx] || 0);
    k2Data.push(min.powerGridDataList[idx] || 0);
    return formatTime(c.time, "yyyy-MM-dd HH:mm");
  });
  lineData.value.yData = [
    {
      name: "实时光伏发电量",
      data: pvData.map((c: any) => c.value),
      unit: "kW",
    },
    {
      name: "建筑实时负荷",
      data: loadsData.map((c: any) => c.value * -1),
      unit: "kW",
    },
    {
      name: "实时电价",
      data: tariffData.map((c: any) => c.value),
      unit: "元/kWh",
      yAxisIndex: 1,
      icon: true,
    },
    {
      name: "光伏弃电量",
      data: qdData,
      unit: "kW",
    },
    {
      name: "电池开关K1充电/放电量",
      data: k1Data,
      unit: "kW",
    },
    {
      name: "电网开关K2供电/受电量",
      data: k2Data,
      unit: "kW",
    },
  ];
}

/**
 * 解析结果数据
 */
function analyzeResult(res: any) {
  const { min, max } = res;
  if (min && max) {
    minCount.value = min.total;
    maxCount.value = max.total;
    onoffData.value.xData =
      resultData.value.xData =
      barData.value.xData =
        max.timeList;
    barData.value.yData = [
      {
        name: "电池逐时电量",
        data: min.batteryDataList,
      },
    ];
    let minSum = 0,
      maxSum = 0;
    //电价结果
    resultData.value.yData = [
      {
        name: "最低分时电费",
        data: min.electricChargeDataList.map((c: string) => {
          minSum += parseFloat(c);
          return formatDecimal(minSum, 6);
        }),
      },
      {
        name: "最高分时电费",
        data: max.electricChargeDataList.map((c: string) => {
          maxSum += parseFloat(c);
          return formatDecimal(maxSum, 6);
        }),
      },
    ];

    //解析开关状态
    const data = min.switchDataList.map((c: string) => c.split(""));
    const convertFormula = [
      {
        key: 1,
        value: "断电",
      },
      {
        key: 2,
        value: "放电",
      },
      {
        key: 3,
        value: "充电",
      },
      {
        key: -1,
        value: "断开",
      },
      {
        key: -2,
        value: "供电",
      },
      {
        key: -3,
        value: "受电",
      },
    ];
    let onoffYData = [
      {
        name: "电池开关K1",
        data: data.map((d: any) => parseInt(d[0])),
        convertFormula: [
          { key: 0, value: 3 },
          { key: 1, value: 1 },
          { key: 2, value: 2 },
        ],
      },
      {
        name: "电网开关K2",
        data: data.map((d: any) => parseInt(d[1])),
        convertFormula: [
          { key: 0, value: -3 },
          { key: 1, value: -1 },
          { key: 2, value: -2 },
        ],
      },
    ];
    onoffYData.forEach((c: any) => {
      c.convertData = c.data.map((d: any) => {
        const convertValue = c.convertFormula.find((f: any) => f.key === d);
        return convertValue ? convertValue.value : d;
      });
      c.converLabel = c.convertData.map((d: any) => {
        const convertValue = convertFormula.find((f: any) => f.key === d);
        return convertValue ? convertValue.value : d;
      });
    });

    onoffData.value.yData = onoffYData;
    let _data = legend.value.map((c: any) => {
      return { ...c };
    });

    //解析表格数据
    data.forEach((c: any, idx: number) => {
      _data.forEach((d: any) => {
        if (d.name === "时间") {
          d[`value${idx + 1}`] = formatTime(
            min.timeList[idx],
            "yyyy-MM-dd HH:mm"
          );
        } else {
          d[`value${idx + 1}`] = d.value === parseInt(c[d.idx]) ? 1 : 0;
        }
      });
    });
    tableData.value = _data;
  }
}

/**
 * 暂时不用
 */
function chartClick(params: any) {
  // const dataIndex = params.dataIndex;
  // switchVisible.value = true;
}

/**
 * 取消按钮
 */
function cancelFn() {
  switchVisible.value = false;
}

/**
 * 联动图表缩放
 */
function dataZoom(params: any, type: string) {
  const idxs = [1, 2, 3, 4];

  console.log(instance);
  idxs.forEach((idx: number) => {
    if (idx !== parseInt(type)) {
      instance?.proxy?.$refs[`chart${idx}`].chart.dispatchAction({
        type: "dataZoom",
        start: params.start,
        end: params.end,
      });
    }
  });
}

/**
 * 全屏/取消全屏
 */
function fullScreen() {
  if (document.fullscreen) {
    exitFullScreen();
  } else {
    handleFullScreen();
  }
}
/**
 * 全屏
 */
function handleFullScreen() {
  if (chartBox.value.requestFullscreen) {
    chartBox.value.requestFullscreen();
  } else if (chartBox.value.mozRequestFullScreen) {
    chartBox.value.mozRequestFullScreen();
  } else if (chartBox.value.webkitRequestFullscreen) {
    chartBox.value.webkitRequestFullscreen();
  } else if ((chartBox.value as any).msRequestFullscreen) {
    chartBox.value.msRequestFullscreen();
  }
}
/**
 * 退出全屏
 */
function exitFullScreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

/**
 * 表格合并单元格
 * @param {Number} row
 * @param {Number} column
 * @param {Number} rowIndex
 * @param {Number} columnIndex
 */
function objectSpanMethod({ row, column, rowIndex, columnIndex }) {
  if (columnIndex === 0) {
    if (rowIndex % 3 === 0) {
      return {
        rowspan: 3,
        colspan: 1,
      };
    } else {
      return {
        rowspan: 0,
        colspan: 0,
      };
    }
  }
}

/**
 * 表格列名
 */
function handleColumnName(column: any) {
  const { $index } = column;
  let str: string[] = [];
  const data = tableData.value.forEach((d: any) => {
    if (d[`value${$index}`] === 1) {
      str.push(d.title + d.label);
    }
  });

  return str;
}

/**
 * 导出excel
 */
function confirmResult() {
  showTable.value && showTable.value.confirmResult();
}
</script>
