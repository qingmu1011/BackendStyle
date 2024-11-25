<template>
  <el-row :gutter="20">
    <el-col :span="6">
      <el-form-item :label="label" :prop="prop">
        <import-btn
          class="w-full"
          :suffix="['xlsx']"
          :url="url"
          :params="uploadParams"
          :before-select="beforeExport"
          :disabled="disabled"
          @success="handleSuccess"
          @error="handleError"
        >
          <el-input v-model="inputCont" placeholder="请导入Excel" readonly>
            <template #append>导入</template>
          </el-input>
        </import-btn>
      </el-form-item>
    </el-col>
    <el-form-item label-width="0">
      <common-btn
        v-if="previewVisible"
        type="success"
        size="default"
        :name="modelValue?'查看/修改':'按默认值创建'"
        icon="icon-view-fill"
        @click="handlePreview"
      >
      </common-btn>
      <common-btn
        v-if="!disabled"
        type="warning"
        size="default"
        name="导出模版"
        icon="icon-download"
        @click="exportExeclTemplate"
      ></common-btn>
      <common-btn
        v-if="inputVisible && !disabled"
        size="default"
        name="预测生成"
        @click="hanleInput"
      ></common-btn>
    </el-form-item>
    <data-preview
      v-if="dataPreview"
      :id="modelValue"
      :disabled="disabled"
      :params="uploadParams"
      :dicts="dicts"
      :max="max"
      :min="min"
      :isPositive="isPositive"
      :canRestore="dataTypeInfo.hasDefault"
      :cancel="() => (dataPreview = false)"
      @change="handleChange"
      @close="() => (dataPreview = false)"
    ></data-preview>
  </el-row>
</template>
<script lang="ts" setup>
import {
  defineOptions,
  defineProps,
  defineEmits,
  ref,
  toRefs,
  computed,
} from "vue";

import { presetDataTemplate } from "@/api/business/presetData";
import { saveAs } from "@/utils/businessFun";
import { message } from "@/utils/commonFun";
import DataPreview from "@/components/BusinessComponents/DataPreview/index.vue";
import { useUserStoreHook } from "@/store/modules/user";

defineOptions({
  name: "ExcelUpload",
});

const emits = defineEmits(["update:modelValue", "change", "click"]);
const props = defineProps({
  /**
   * 表单项的label
   */
  label: {
    type: String,
    default: "",
  },
  prop: {
    type: String,
    default: "",
  },
  /**
   * 导出模版的名称
   */
  exportName: {
    type: String,
    default: "",
  },
  /**
   * 表单项的值
   */
  modelValue: {
    type: String,
    default: "",
    require: true,
  },
  /**
   * 下载模版前的钩子函数
   */
  beforeExport: {
    type: Function,
    default: null,
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
   * 是否显示预览按钮
   */
  previewVisible: {
    type: Boolean,
    default: true,
  },
  /**
   * 是否显示输入按钮
   */
  inputVisible: {
    type: Boolean,
    default: false,
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
    type: [Array, undefined],
    default: undefined,
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
   * 数据类型
   */
  dataType: {
    type: String,
    default: "",
    require: true,
  },
});
const {
  label,
  prop,
  exportName,
  dataType,
  modelValue,
  beforeExport,
  params,
  previewVisible,
  inputVisible,
  disabled,
  dicts,
  max,
  min,
  isPositive,
} = toRefs(props);

const dataPreview = ref<Boolean>(false);
const userStore = useUserStoreHook();
const allDict = ref(userStore.allDict);

/**
 * 上传参数
 */
const uploadParams = computed(() => {
  return {
    ...params.value,
    dataType: dataType.value,
  };
});

/**
 * 数据类型信息
 */
const dataTypeInfo = computed(() => {
  const info = allDict.value.dataType.find((item: any) => item.value === dataType.value);
  return info || {};
});

const inputCont = computed(() => (!modelValue.value ? "" : "已导入"));

//上传文件接口
const url = import.meta.env.VITE_APP_BASE_API + "/api/preset_data";

/**
 * 导出模版
 */
async function exportExeclTemplate() {
  validateFormat().then((res: boolean) => {
    if (res) {
      const name = exportName.value || "模版";
      presetDataTemplate(uploadParams.value).then((res: any) => {
        saveAs(res.data, name + ".xlsx");
      });
    }
  });
}

/**
 * 数据预览-编辑
 */
function handlePreview() {
  validateFormat().then((res: boolean) => {
    if (res) {
      dataPreview.value = true;
    }
  });
}

/**
 * 上传成功
 */
function handleSuccess(res: any) {
  if (res.data.code === 1) {
    message("上传成功");
    emitChange(res.data.content);
  } else {
    handleError();
  }
}

/**
 * 上传失败
 */
function handleError(res?: any) {
  if (res && res.data && typeof res.data === "object") {
    message(res.data.message, "error");
  } else {
    message("上传失败", "error");
  }
}

/**
 * 预测生成
 */
async function hanleInput() {
  validateFormat().then((res: boolean) => {
    if (res) {
      emits("click");
    }
  });
}

/**
 * 格式校验
 */
async function validateFormat(): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      let flag = true;
      if (beforeExport.value) {
        flag = await beforeExport.value();
      }
      resolve(flag);
    } catch {
      resolve(false);
    }
  });
}

/**
 * 数据预览-数据变化
 */
function handleChange(id: string) {
  emitChange(id);
}

function emitChange(id: string) {
  emits("update:modelValue", id);
  emits("change", id);
}
</script>
