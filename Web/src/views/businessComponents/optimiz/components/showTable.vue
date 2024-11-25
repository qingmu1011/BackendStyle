<template>
  <div class="show-table">
    <table-pagination
      :data="tableDataShow"
      :total="total"
      :pageObj="pageObj"
      @size-change="sizeChange"
      @current-change="currentChange"
      layout="total, prev, pager, next, jumper"
    >
      <el-table-column prop="time" label="时间" align="center">
        <template #default="scope">
          {{ formatTime(scope.row.time, "yyyy-MM-dd HH") }}时
        </template>
      </el-table-column>
      <el-table-column
        prop="k1"
        label="电池开关K1状态"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="k2"
        label="电网开关K2状态"
        align="center"
      ></el-table-column>
      <el-table-column prop="qd" label="光伏弃电量(kW)" align="center">
        <template #default="scope">
          {{ formatDecimal(scope.row.qd) }}
        </template>
      </el-table-column>
      <el-table-column prop="price" label="分时电价(元/kWh)" align="center">
        <template #default="scope">
          {{ formatDecimal(scope.row.price) }}
        </template></el-table-column
      >
      <el-table-column prop="use" label="分时电费(元)" align="center">
        <template #default="scope">
          {{ formatDecimal(scope.row.use) }}
        </template>
      </el-table-column>
      <el-table-column prop="sum" label="累计电费(元)" align="center">
        <template #default="scope">
          {{ formatDecimal(scope.row.sum) }}
        </template>
      </el-table-column>
    </table-pagination>
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
import { formatTime, formatDecimal } from "@/utils/commonFun";
import { exportExcel } from '~/utils/exportExcel'

defineOptions({
  name: "ShowTable",
});

const props = defineProps({
  tableData: {
    type: Object,
    default: () => {},
  },
  pInfo: {
    type: Object,
    default: () => {},
  },
  formData: {
    type: Object,
    default: () => {},
  },
});

const { tableData, pInfo, formData } = toRefs(props);

const pageObj = ref({
  pageSize: 24,
  pageNum: 1,
});

// 合并数据
const allData = computed(() => {
  // 解析数据
  return analyzeData(tableData.value);
});

const tableDataShow = computed(() => {
  const { pageSize, pageNum } = pageObj.value;
  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize;
  return allData.value.slice(start, end);
});

const total = computed(() => {
  return allData.value.length;
});

/**
 * 解析数据
 * @param data any
 */
function analyzeData(data: any) {
  const { result, pvData, tariffData, loadsData } = tableData.value;
  const { min, max } = result;
  if (!min || !max) return [];
  let sum = 0;
  const _data = min.timeList.map((item: any, index: number) => {
    const switchData = min.switchDataList[index].split("");
    sum += min.electricChargeDataList[index];
    return {
      time: item,
      k1: formatData(switchData[0], "k1"),
      k2: formatData(switchData[1], "k2"),
      qd: Math.abs(min.pvAbandonedPowerDataList[index] || 0),
      price: tariffData[index]?.value,
      use: min.electricChargeDataList[index],
      sum: sum,
    };
  });
  return _data;
}

/**
 * 格式化数据
 * @param num string
 * @param type string k1/k2
 */
function formatData(num: string, type: string) {
  let str = "";
  if (type === "k1") {
    switch (num) {
      case "0":
        str = "充电";
        break;
      case "1":
        str = "断电";
        break;
      case "2":
        str = "放电";
        break;
      default:
        str = "";
        break;
    }
  } else {
    switch (num) {
      case "0":
        str = "受电";
        break;
      case "1":
        str = "断开";
        break;
      case "2":
        str = "供电";
        break;
      default:
        str = "";
        break;
    }
  }
  return str;
}

/** 翻页 */
const currentChange = (val: number) => {
  pageObj.value.pageNum = val;
};

/** 修改页数 */
const sizeChange = (val: number) => {
  pageObj.value.pageSize = val;
};

/**
 * 导出excel
 */
function confirmResult() {
  const { name, startTime, endTime, city, longitude, latitude, createAt } =
    pInfo.value || {};
  const projectInfo = [
    { name: "项目名称", value: name || "" },
    { name: "预测时间", value: `${startTime || ""} - ${endTime || ""}` },
    {
      name: "地理位置",
      value: `${city || ""}  ${longitude || ""},${latitude || ""}`,
    },
    { name: "项目创建时间", value: createAt || "" },
  ];
  const header = [
    { name: "时间", key: "time" },
    { name: "电池开关K1状态", key: "k1" },
    { name: "电网开关K2状态", key: "k2" },
    { name: "光伏弃电量(kW)", key: "qd" },
    { name: "分时电价(元/kWh)", key: "price" },
    { name: "分时电费(元)", key: "use" },
    { name: "累计电费(元)", key: "sum" },
  ];
  exportExcel(
    projectInfo,
    header,
    allData.value,
    (name || "") + "-电费寻优预测结果"
  );
}

defineExpose({
  confirmResult,
});
</script>
