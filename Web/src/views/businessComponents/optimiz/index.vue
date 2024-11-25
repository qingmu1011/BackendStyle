<template>
  <common-panel>
    <div class="h-full overflow-y-auto overflow-x-hidden">
      <el-form
        ref="editFormRef"
        :rules="!disabled ? rules : []"
        :model="formData"
        label-width="120px"
        label-position="left"
      >
        <line-title :title="`项目选择`" class="m-b-20px"></line-title>
        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="项目名称" prop="projectId">
              <dict-select
                clearable
                v-model="formData.projectId"
                :disabled="disabled"
                :data="projectList"
                placeholder="请选择项目"
                :option="{
                  label: 'name',
                  value: 'id',
                }"
                @change="handleProjectChange"
              >
              </dict-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="选择方案" prop="programmaticType">
              <dict-select
                v-model="formData.programmaticType"
                dict="programmaticType"
                :disabled="disabled"
                placeholder="请选择方案"
              ></dict-select>
            </el-form-item>
          </el-col>
        </el-row>
        <line-title :title="`常规参数`" class="m-b-20px"></line-title>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="预测时间">
              <template #label>
                <span>预测时间</span>
                <el-tooltip
                  content="最大预测时间范围不大于7天,预测时间间隔为1小时"
                  placement="top-end"
                  effect="light"
                >
                  <span class="ml-5px"
                    ><el-icon><Warning /></el-icon
                  ></span>
                </el-tooltip>
              </template>

              <el-date-picker
                v-model="projectInfo.date"
                type="datetimerange"
                range-separator="至"
                start-placeholder="Start date"
                end-placeholder="End date"
                format="YYYY-MM-DD HH:mm"
                date-format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                time-format="HH:mm"
                :disabled="true"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="地区" label-width="50px">
              <el-input
                v-model="projectInfo.city"
                placeholder="请选择地区"
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="经度" label-width="50px">
              <el-input
                v-model="projectInfo.longitude"
                placeholder="请输入经度"
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="纬度" label-width="50px">
              <el-input
                v-model="projectInfo.latitude"
                placeholder="请输入纬度"
                :disabled="true"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <map-box
          :longitude="projectInfo.longitude"
          :latitude="projectInfo.latitude"
        ></map-box>
        <line-title :title="`电池参数`" class="m-b-20px"></line-title>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="额定容量" prop="batteryRatedCapacity">
              <template #label>
                <span>额定容量</span>
                <el-tooltip
                  content="电池电量=电池电压（V）×电池容量（Ah）。例如，一块锂电池电压为 3.7V，容量为 10Ah，其能量为 3.7V×10Ah = 37Wh"
                  placement="top-end"
                  effect="light"
                >
                  <span class="ml-5px"
                    ><el-icon><Warning /></el-icon
                  ></span>
                </el-tooltip>
              </template>
              <el-input
                clearable
                v-model="formData.batteryRatedCapacity"
                placeholder="请输入额定容量"
                :disabled="disabled"
              >
                <template #append>kWh</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="额定功率" prop="batteryRating">
              <el-input
                clearable
                v-model="formData.batteryRating"
                placeholder="请输入额定功率"
                :disabled="disabled"
              >
                <template #append>kW</template></el-input
              >
            </el-form-item></el-col
          >
          <el-col :span="6">
            <el-form-item label="初始容量" prop="batteryInitCapacity">
              <el-input
                clearable
                v-model="formData.batteryInitCapacity"
                placeholder="请输入初始容量"
                :disabled="disabled"
              >
                <template #append>kWh</template></el-input
              >
            </el-form-item></el-col
          >
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="放电下限" prop="batteryLowerLimit">
              <el-input
                clearable
                v-model="formData.batteryLowerLimit"
                placeholder="请输入放电下限参数"
                :disabled="disabled"
              >
                <template #append>%</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="充电上限" prop="batteryUpperLimit">
              <el-input
                clearable
                v-model="formData.batteryUpperLimit"
                placeholder="请输入充电上限参数"
                :disabled="disabled"
              >
                <template #append>%</template>
              </el-input>
            </el-form-item></el-col
          >
        </el-row>
        <line-title :title="`光伏发电参数`" class="m-b-20px"> </line-title>
        <excel-upload
          label="发电实时数据"
          prop="pvDataId"
          exportName="光伏发电实时数据"
          data-type="PV"
          :params="exportParams"
          :before-export="beforeExport"
          :disabled="disabled"
          v-model="formData.pvDataId"
        ></excel-upload>
        <line-title :title="`电网参数`" class="m-b-20px"></line-title>
        <excel-upload
          label="电价实时数据"
          prop="tariffDataId"
          exportName="电价实时数据"
          data-type="TARIFF"
          :params="exportParams"
          :before-export="beforeExport"
          :disabled="disabled"
          v-model="formData.tariffDataId"
        ></excel-upload>
        <line-title :title="`建筑负荷参数`" class="m-b-20px"></line-title>
        <excel-upload
          label="实时数据"
          prop="loadsDataId"
          exportName="建筑负荷实时数据"
          data-type="LOADS"
          :params="exportParams"
          :before-export="beforeExport"
          :disabled="disabled"
          v-model="formData.loadsDataId"
        ></excel-upload>
      </el-form>
      <div v-if="!disabled">
        <common-btn
          :type="hasResult ? 'warning' : 'primary'"
          :loading="loading"
          size="large"
          @click="beginForecast"
          >{{ hasResult ? "重新预测" : "开始预测" }}</common-btn
        >
      </div>

      <forecast-table
        v-if="hasResult"
        :value-data="resultData"
        :p-info="projectInfo"
        :form-data="formData"
        class="m-t-10px"
      ></forecast-table>
    </div>
  </common-panel>
</template>
<script lang="ts" setup>
import { ref, computed, watch, onMounted, defineOptions, nextTick } from "vue";
import { type FormInstance, type FormRules, ElLoading } from "element-plus";
import { Warning, Notebook } from "@element-plus/icons-vue";
import ForecastTable from "./components/ForecastTable.vue";
import { validatorNumber, validatorLength } from "@/utils/validate";
import { deepCopy } from "@/utils/commonFun";
import { pcsOptimize, pcsDetails, pcsGetResult } from "@/api/business/pcs";
import { message, confirm } from "@/utils/commonFun";
import { formatDuration } from "@/utils/businessFun";
import { useRoute } from "vue-router";
import { reqGetProjectList } from "~/api/business/project";
import MapBox from "./components/MapBox.vue";

const disabled = ref(false);
const route = useRoute();

onMounted(() => {});

const formData = ref<FormRules>({
  projectId: void 0, //项目选择
  programmaticType: void 0, //方案选择

  tariffDataId: "", //电价数据id
  pvDataId: "", //光伏发电数据id
  loadsDataId: "", //大楼负载数据id

  batteryInitCapacity: void 0, //电池初始容量
  batteryRatedCapacity: void 0, //电池额定容量
  batteryUpperLimit: void 0, //电池充电上限
  batteryLowerLimit: void 0, //电池放电下限
  batteryRating: void 0, //电池额定功率
  "@type": ".PCSOptimizationParameter",
});

const rules = {
  projectId: [{ required: true, message: "请选择项目", trigger: "change" }],
  programmaticType: [
    { required: true, message: "请选择方案", trigger: "change" },
  ],
  batteryRatedCapacity: [
    { required: true, message: "请输入电池额定容量", trigger: "blur" },
    {
      validator: validatorNumber,
      trigger: "blur",
      type: "positive",
      min: formData.value.batteryInitCapacity,
      compareMessage: "电池额定容量不小于初始容量",
    },
  ],
  batteryRating: [
    { required: true, message: "请输入电池额定功率", trigger: "blur" },
    {
      validator: validatorNumber,
      trigger: "blur",
      type: "positive",
    },
  ],
  batteryInitCapacity: [
    { required: true, message: "请输入电池初始容量", trigger: "blur" },
    {
      validator: validatorNumber,
      trigger: "blur",
      type: "positive",
      max: formData.value.batteryRatedCapacity,
      compareMessage: "电池初始容量不大于额始容量",
    },
  ],
  batteryLowerLimit: [
    { required: true, message: "请输入电池放电下限", trigger: "blur" },
    {
      validator: validatorNumber,
      trigger: "blur",
      type: "positive",
      min: 0,
      max: 100,
      compareMessage: "放电下限取值区间[0,100]",
    },
  ],
  batteryUpperLimit: [
    { required: true, message: "请输入电池充电上限", trigger: "blur" },
    {
      validator: validatorNumber,
      trigger: "blur",
      type: "positive",
      min: 0,
      max: 100,
      compareMessage: "充电上限取值区间[0,100]",
    },
  ],
  tariffDataId: [
    { required: true, message: "请上传电价数据", trigger: "change" },
  ],
  pvDataId: [
    { required: true, message: "请上传光伏发电数据", trigger: "change" },
  ],
  loadsDataId: [
    { required: true, message: "请上传大楼负载数据", trigger: "change" },
  ],
};

/**
 * 监听表单数据变化
 */
watch(
  [
    () => formData.value.batteryRatedCapacity,
    () => formData.value.batteryInitCapacity,
  ],
  ([val1, val2], [oldVal1, oldVal2]) => {
    if (val1 !== oldVal1 || val2 !== oldVal2) {
      rules.batteryInitCapacity[1].max = val1;
      rules.batteryRatedCapacity[1].min = val2;
      try {
        let fileds = [];
        if (formData.value.batteryInitCapacity) {
          fileds.push("batteryInitCapacity");
        }

        if (formData.value.batteryInitCapacity) {
          fileds.push("batteryRatedCapacity");
        }
        editFormRef.value && editFormRef.value.validateField(fileds, () => {});
      } catch {}
    }
  }
);

const editFormRef = ref<FormInstance>();
const loading = ref(false);
const loadService = ref();
const resultData = ref({
  parameter: {},
  result: {},
  pvData: [],
  tariffData: [],
  loadsData: [],
});
const projectList = ref([]);

onMounted(() => {
  getProjectList();
});

const exportParams = computed(() => {
  if (!projectInfo.value.date) return {};
  return {
    startTime: projectInfo.value.date[0],
    endTime: projectInfo.value.date[1],
    duration: formatDuration(projectInfo.value.duration),
  };
});

const projectInfo = computed(() => {
  if (!formData.value.projectId) return {};
  const info = projectList.value.find(
    (item: any) => item.id === formData.value.projectId
  );

  return info ? { ...info, date: [info.startTime, info.endTime] } : {};
});

const hasResult = ref(false);

/**
 * 开始预测
 */
async function beginForecast() {
  if (!editFormRef.value) return;
  await editFormRef.value.validate((valid: boolean, fields: any) => {
    if (valid) {
      if (hasResult.value) {
        confirm("重新预测后数据不可恢复,是否继续?")
          .then(() => {
            handleSaveResult();
          })
          .catch(() => {});
      } else {
        handleSaveResult();
      }
    } else {
      console.warn("error submit!", fields);
    }
  });
}

/**
 * 保存结果
 */
function handleSaveResult() {
  loading.value = true;
  createLoading();
  let obj = deepCopy(formData.value);
  delete obj.projectId;
  obj.batteryUpperLimit = Number(obj.batteryUpperLimit) / 100;
  obj.batteryLowerLimit = Number(obj.batteryLowerLimit) / 100;
  pcsOptimize({ projectId: formData.value.projectId }, obj)
    .then((res: ResponseContent) => {
      if (res.code === 1) {
        getResult(res.content);
      } else {
        message(res.message, "error");
        loading.value = false;
        closeLoading();
      }
    })
    .catch(() => {
      message("预测失败", "error");
      loading.value = false;
      closeLoading();
    });
}

/**
 * 轮询获取结果
 */
function getResult(id: string) {
  pcsGetResult({
    threadId: id,
  })
    .then((res: ResponseContent) => {
      if (res.code === 1) {
        if (res.content == "timeout") {
          message("预测超时，请重新预测", "error", 0);
          loading.value = false;
          closeLoading();
        } else if (res.content == "no result,please wait") {
          setTimeout(() => {
            getResult(id);
          }, 1000 * 10);
        } else {
          message("预测成功");
          const result = JSON.parse(res.content);
          Promise.all([getProjectList(), getDetails(result.id)]).finally(() => {
            loading.value = false;
            closeLoading();
          });
        }
      } else {
        message(res.message, "error", 0);
        loading.value = false;
        closeLoading();
      }
    })
    .catch(() => {
      message("预测失败", "error", 0);
      loading.value = false;
      closeLoading();
    })
    .finally(() => {});
}

/**
 * 导出前的处理
 */
async function beforeExport() {
  return new Promise((resolve) => {
    editFormRef.value.validateField(["projectId"], (valid: boolean) => {
      if (valid) {
        resolve(true);
      } else {
        message("请选择正确的预测时间", "warning");
        resolve(false);
      }
    });
  });
}

/**
 * 详情
 */
function getDetails(id: string, isResult: boolean = false) {
  createLoading();
  pcsDetails(id)
    .then((res: ResponseContent) => {
      let obj = res.content.parameter;
      obj.projectId = res.content.projectId;

      if (isResult) {
        obj.pvDataId = obj.pvDataId || formData.value.pvDataId;
        obj.tariffDataId = obj.tariffDataId || formData.value.tariffDataId;
        obj.loadsDataId = obj.loadsDataId || formData.value.loadsDataId;
      }

      formData.value = obj;
      formData.value.batteryUpperLimit = Number(obj.batteryUpperLimit) * 100;
      formData.value.batteryLowerLimit = Number(obj.batteryLowerLimit) * 100;

      if (res.content.result) {
        hasResult.value = true;
      }
      resultData.value.result = res.content.result;
      resultData.value.pvData = res.content.pvData;
      resultData.value.loadsData = res.content.loadsData;
      resultData.value.tariffData = res.content.tariffData;
      nextTick(() => {
        clearFormValide();
      });
    })
    .finally(() => {
      closeLoading();
    });
}

/**
 * 创建loading
 */
function createLoading() {
  loadService.value = ElLoading.service({
    lock: true,
    text: "加载中...",
    background: "rgba(0, 0, 0, 0.7)",
  });
}

/**
 * 关闭loading
 */
function closeLoading() {
  loadService.value && loadService.value.close();
  loadService.value = null;
}

/**
 * 接收预测生成数据id
 */
function handleDataId(id: string, dataType: string) {
  //TODO 预测生成数据id 凯哥
  switch (dataType) {
    case "pvDataId":
      formData.value.pvDataId = id;
      break;
    case "tariffDataId":
      formData.value.tariffDataId = id;
      break;
    case "loadsDataId":
      formData.value.loadsDataId = id;
      break;
    default:
      break;
  }
}

/**
 * 获取所有项目
 */
async function getProjectList() {
  try {
    const res = await reqGetProjectList({});
    projectList.value = res.content.records;
  } catch (e) {
    message("获取获取项目数据失败", "error");
  } finally {
  }
}

/**
 * 项目选择变化
 */
function handleProjectChange(val: any) {
  hasResult.value = false;
  formData.value.pvDataId = projectInfo.value.pvDataId || void 0;
  formData.value.tariffDataId = projectInfo.value.tariffDataId || void 0;
  formData.value.loadsDataId = projectInfo.value.loadsDataId || void 0;
  
  formData.value.programmaticType = void 0;
  formData.value.batteryInitCapacity = void 0;
  formData.value.batteryRatedCapacity = void 0;
  formData.value.batteryUpperLimit = void 0;
  formData.value.batteryLowerLimit = void 0;
  formData.value.batteryRating = void 0;

  if (projectInfo.value.pcsOptimizeId) {
    getDetails(projectInfo.value.pcsOptimizeId, true);
  }
  nextTick(() => {
    clearFormValide();
  });
}

function clearFormValide() {
  setTimeout(() => {
    editFormRef.value && editFormRef.value.clearValidate();
  });
}
</script>
