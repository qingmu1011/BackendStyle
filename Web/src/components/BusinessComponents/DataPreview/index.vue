<template>
  <el-dialog
    :title="title"
    :width="width"
    :before-close="beforeClose"
    :model-value="true"
    @close="cancel"
    :destroy-on-close="true"
    top="5vh"
  >
    <div class="pt-10px">
      <el-row class="my-10px">
        <el-col :span="6">
          <form-item label="开始时间">
            <span>{{ info.startTime }}</span>
          </form-item>
        </el-col>
        <el-col :span="6">
          <form-item label="结束时间">
            <span>{{ info.endTime }}</span>
          </form-item>
        </el-col>
        <el-col :span="6">
          <form-item label="时间间隔">
            <span>{{ duration }}</span>
          </form-item>
        </el-col>
        <!-- <el-col :span="6">
          <form-item label="过期时间">
            <span>{{ info.expireTime }}</span>
          </form-item>
        </el-col> -->
        <el-col :span="4" v-if="!disabled">
          <common-btn icon="" name="保存" @click="saveData('1')"></common-btn>
          <common-btn
            icon=""
            name="确认数据"
            @click="saveData('2')"
          ></common-btn>
        </el-col>
      </el-row>
      <el-row class="my-10px" v-if="!dicts">
        <el-col :span="6">
          <form-item label="平均值">
            <span>{{ formatDecimal(calculate.average) }}</span>
          </form-item>
        </el-col>
        <el-col :span="6">
          <form-item label="最大值">
            <span>{{ formatDecimal(calculate.max) }}</span>
          </form-item>
        </el-col>
        <el-col :span="6">
          <form-item label="最小值">
            <span>{{ formatDecimal(calculate.min) }}</span>
          </form-item>
        </el-col>
      </el-row>
    </div>
    <el-form :model="currentPageData" :rules="rules" ref="tableForm">
      <div class="h-60vh">
        <table-pagination
          :data="currentPageData"
          :loading="loading"
          :total="tableData.length"
          :pageObj="pageObj"
          layout="total, prev, pager, next, jumper"
          @current-change="currentChange"
        >
          <el-table-column
            v-for="prop in columns"
            :key="prop.prop"
            :prop="prop.prop"
            :label="prop.label"
            align="center"
          >
            <template #default="scope">
              <el-form-item
                v-if="!disabled && prop.prop === 'value'"
                :prop="'[' + scope.$index + '].value'"
                :rules="rules.value"
              >
                <el-input
                  v-if="!dicts"
                  v-model="scope.row[prop.prop]"
                  placeholder="请输入"
                />
                <dict-select
                  v-else
                  v-model="scope.row[prop.prop]"
                  :data="dicts"
                  placeholder="请选择"
                ></dict-select>
              </el-form-item>
              <span v-else>{{ scope.row[prop.prop] }}</span>
            </template>
          </el-table-column>
        </table-pagination>
      </div></el-form
    >
    <div v-if="!disabled" class="pt-10px">
      <el-row gutter="10" type="flex" justify="end">
        <el-col :span="8">
          <el-form :model="inputFormData" :rules="rules" ref="inputForm">
            <el-form-item prop="value" :rules="rules.value">
              <el-input
                v-if="!dicts"
                v-model="inputFormData.value"
                placeholder="请输入"
              />
              <dict-select
                v-else
                v-model="inputFormData.value"
                :data="dicts"
                placeholder="请选择"
              ></dict-select>
            </el-form-item>
          </el-form>
        </el-col>
        <common-btn
          icon=""
          size="default"
          name="应用数据到本页"
          @click="applyToPage"
        ></common-btn>
        <common-btn
          icon=""
          type="warning"
          size="default"
          name="应用本页数据到全部"
          @click="applyToAll"
        ></common-btn>
        <common-btn
          v-if="canRestore"
          icon=""
          type="danger"
          size="default"
          name="恢复默认值"
          @click="restoreDefault"
        ></common-btn>
      </el-row>
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
import {
  defineOptions,
  defineProps,
  defineEmits,
  ref,
  toRefs,
  onMounted,
  computed,
  useTemplateRef,
  nextTick,
} from "vue";
import {
  presetDataDetails,
  presetDataUpdate,
  pcsEmptyData,
} from "@/api/business/presetData";
import { ElLoading } from "element-plus";
import { validatorNumber } from "@/utils/validate";
import { message, formatDecimal, defined, confirm } from "@/utils/commonFun";
defineOptions({
  name: "DataPreView",
});

const props = defineProps({
  title: {
    type: String,
    default: "数据预览",
  },
  width: {
    type: String,
    default: "60%",
  },
  /* 取消按钮点击事件 */
  cancel: {
    type: Function,
    default: () => {},
  },
  /**
   * 数据预览的id
   */
  id: {
    type: String,
    default: "",
  },
  /**
   * 是否禁用
   */
  disabled: {
    type: Boolean,
    default: false,
  },
  /**
   * 数据字典, 用于需要映射的场景
   */
  dicts: {
    type: Array<any> || undefined,
    default: undefined,
  },
  /**
   * 其他参数
   */
  params: {
    type: Object,
    default: () => {
      return {};
    },
  },
  /**
   * 最大值
   */
  max: {
    type: Number,
  },
  /**
   * 最小值
   */
  min: {
    type: Number,
  },
  /**
   * 是否是正数
   */
  isPositive: {
    type: Boolean,
    default: true,
  },
  /**
   * 是否可以恢复默认值
   */
  canRestore: {
    type: Boolean,
    default: false,
  },
});
const {
  id,
  title,
  width,
  disabled,
  params,
  dicts,
  max,
  min,
  isPositive,
  canRestore,
} = toRefs(props);

const emits = defineEmits(["change", "close"]);

const loading = ref(false);
const pageObj = ref({
  pageNum: 1,
  pageSize: 24,
});
const tableData = ref([]);
const info = ref({});
const rules = ref({
  value: [],
});

const tableForm = ref(null);
const loadService = ref();
const inputFormRef = useTemplateRef("inputForm");
const inputFormData = ref({
  value: void 0,
});

/** 时间间隔 */
const duration = computed(() => {
  if (!info.value.duration) return "";
  const _duration = parseInt(info.value.duration / 60);
  const hour = Math.floor(_duration / 60);
  const minute = _duration % 60;
  return `${hour}时${minute}分`;
});

/** 表头 */
const columns = computed(() => {
  if (!info.value.headers) return [];
  // TODO: 处理表头
  // let keys = [];
  // if (info.value.values && info.value.values.length > 0) {
  //   keys = Object.keys(info.value.values[0]);
  // }
  // return info.value.headers.map((item: string, index: number) => {
  //   return {
  //     prop: keys[index] || "",
  //     label: item,
  //   };
  // });
  return [
    { prop: "time", label: info.value.headers[0] },
    { prop: "value", label: info.value.headers[1] },
  ];
});

/** 计算最小值、最大值、平均值 */
const calculate = computed(() => {
  let _calculate = {
    min: 0,
    max: 0,
    average: 0,
  };
  if (!tableData.value || tableData.value.length === 0 || dicts.value)
    return _calculate;
  _calculate.max = Math.max.apply(
    null,
    tableData.value.map((o: any) => o.value)
  );
  _calculate.min = Math.min.apply(
    null,
    tableData.value.map((o: any) => o.value)
  );
  let sum = 0;
  tableData.value.forEach((item: any) => {
    sum += parseFloat(item.value);
  });

  _calculate.average = sum / tableData.value.length;
  return _calculate;
});

/** 开始索引 */
const startIndex = computed(() => {
  return (pageObj.value.pageNum - 1) * pageObj.value.pageSize;
});

/** 结束索引 */
const endIndex = computed(() => {
  return pageObj.value.pageNum * pageObj.value.pageSize;
});

/**
 * 当前页数据
 */
const currentPageData = computed(() => {
  if (!tableData.value) return [];
  return tableData.value.slice(startIndex.value, endIndex.value);
});

onMounted(() => {
  handleDict();
  getData();
});

/** 获取预览数据 */
function getData() {
  loading.value = true;
  // TODO: 获取数据并渲染
  if (!id.value) {
    //没有id，则请求空数据
    if (!disabled.value) {
      //调用接口
      pcsEmptyData({ ...params.value })
        .then((res: ResponseContent) => {
          if (res.code === 1) {
            emits("change", res.content);
            nextTick(() => {
              getData();
            });
          } else {
            message(res.msg, "error");
          }
        })
        .catch(() => {
          message("获取数据失败", "error");
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      loading.value = false;
    }
  } else {
    presetDataDetails(id.value)
      .then((res: ResponseContent) => {
        info.value = res.content;
        tableData.value = res.content.values;
      })
      .finally(() => {
        loading.value = false;
      });
  }
}

const beforeClose = (done: () => void) => {
  done();
};

/** 保存数据 */
function saveData(type: string) {
  if (!id.value || !tableForm.value) return;
  // TODO: 保存数据
  tableForm.value.validate((valid: boolean, fields: any) => {
    if (valid) {
      if (!verfyData()) return;
      createLoading();
      presetDataUpdate(id.value, {
        values: tableData.value,
      })
        .then((res: ResponseContent) => {
          if (res.code === 1) {
            message("保存成功");
            if (type === "1") {
              getData();
            } else {
              emits("close");
            }
          } else {
            message("保存失败", "error");
          }
        })
        .finally(() => {
          closeLoading();
        });
    } else {
      console.warn("error submit!", fields);
    }
  });
}

/** 验证数据 */
function verfyData() {
  let flag = true;
  tableData.value.some((item: any, index: number) => {
    if (!varfyType(item.value)) {
      const idx = Math.ceil((index + 1) / pageObj.value.pageSize);
      message(`请检查第${idx}页数据是否正确`, "error");
      flag = false;
      pageObj.value.pageNum = idx;
      nextTick(() => {
        tableForm.value && tableForm.value.validate();
      });
      return true;
    }
  });
  return flag;
}

/** 验证value的类型 */
function varfyType(value: any) {
  if (dicts.value && Array.isArray(dicts.value)) {
    return defined(value); //select类型
  } else {
    let flag = true;
    if (!defined(value)) {
      flag = false;
    } else {
      validatorNumber(
        {
          maxPots: 8,
          min: min.value,
          max: max.value,
          type: isPositive.value ? "positive" : "negative",
        },
        value,
        (err: any) => {
          if (err) {
            flag = false;
          }
        }
      ); // 验证数字类型
    }
    return flag;
  }
}

/** 处理value的校验规则 */
function handleDict() {
  // TODO: 处理字典
  if (dicts.value && Array.isArray(dicts.value)) {
    rules.value.value = [
      { required: true, message: "请选择值", trigger: "change" },
    ];
  } else {
    rules.value.value = [
      { required: true, message: "请输入值", trigger: "blur" },
      {
        validator: validatorNumber,
        trigger: "blur",
        maxPots: 8,
        min: min.value,
        max: max.value,
        type: isPositive.value ? "positive" : "negative",
      },
    ];
  }
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

/** 翻页 */
const currentChange = (val: number) => {
  pageObj.value.pageNum = val;
  /** 需要清空验证信息 */
  tableForm.value && tableForm.value.clearValidate();
};

/**
 * 应用到本页
 */
function applyToPage() {
  if (!inputFormRef.value) return;
  inputFormRef.value.validate((valid: boolean, fields: any) => {
    if (valid) {
      confirm("数据应用到本页后不可恢复，是否确认应用?")
        .then(() => {
          tableData.value
            .slice(startIndex.value, endIndex.value)
            .forEach((item: any) => {
              item.value = inputFormData.value.value;
            });
          message("应用成功");
        })
        .catch(() => {
          message("已取消应用", "info");
        });
    } else {
      console.warn("error apply!", fields);
    }
  });
}
/**
 * 应用本页数据到全部
 */
function applyToAll() {
  if (!tableForm.value) return;
  tableForm.value.validate((valid: boolean) => {
    if (valid) {
      confirm("本页数据应用到全部后不可恢复，是否确认应用?")
        .then(() => {
          // TODO: 应用本页数据到全部
          //总页数
          const pageTotal = Math.ceil(
            tableData.value.length / pageObj.value.pageSize
          );
          currentPageData.value.forEach((item: any, idx: number) => {
            for (let i = 0; i < pageTotal; i++) {
              const index = i * pageObj.value.pageSize + idx;
              tableData.value[index].value = item.value;
            }
          });
          message("应用成功");
        })
        .catch(() => {
          message("已取消应用", "info");
        });
    }
  });
}
/**
 * 恢复默认值
 */
function restoreDefault() {
  confirm("恢复到默认值后不可恢复到当前数据，是否确认恢复?")
    .then(() => {
      // TODO: 恢复默认值
      // message("恢复成功");
      loading.value = true;
      pcsEmptyData({ ...params.value })
        .then((res: ResponseContent) => {
          if (res.code === 1) {
            emits("change", res.content);
            nextTick(() => {
              getData();
            });
          } else {
            message(res.msg, "error");
          }
        })
        .catch(() => {
          message("获取数据失败", "error");
        })
        .finally(() => {
          loading.value = false;
        });
    })
    .catch(() => {
      message("已取消恢复默认值", "info");
    });
}
</script>
