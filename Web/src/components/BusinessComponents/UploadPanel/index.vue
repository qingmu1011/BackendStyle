<template>
  <el-dialog
    :title="title"
    :width="width"
    :before-close="beforeClose"
    :model-value="true"
    @close="cancel"
    :class="classRandom"
    :destroy-on-close="true"
  >
    <template #header>
      <common-title :title="title" :icon="titleIcon"></common-title>
    </template>
    <el-form
      ref="editFormRef"
      size="large"
      :rules="rules"
      :model="baseInfo"
      class="demo-form-inline"
      style="padding: 30px 30px 10px 20px"
      :label-width="labelWidth"
      :label-position="labelPosition"
    >
      <slot name="form"></slot>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <common-btn @click="cancel">{{ cancelText }}</common-btn>
        <common-btn
          type="primary"
          @click="validateForm"
          :loading="saveLoading"
          >{{ submitText }}</common-btn
        >
      </div>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { defineOptions, defineProps, defineEmits, ref, toRefs } from "vue";
import { type FormInstance, type FormRules, ElLoading } from "element-plus";
import { getToken, formatToken } from "~/utils/auth";
import axios from "axios";
import { message } from "~/utils/commonFun";
const token = getToken();
defineOptions({
  name: "UploadPanel",
});
const emits = defineEmits(["error", "success"]);
const props = defineProps({
  url: {
    type: String,
    required: true,
  },
  /** 宽度 */
  width: {
    default: 500,
  },
  /** 菜单名称 */
  title: {
    type: String,
    default: "文件上传",
  },
  titleIcon: {
    type: String,
    default: "",
  },
  /** 提交按钮文字 */
  submitText: {
    type: String,
    default: "确定",
  },
  /** 取消按钮文字 */
  cancelText: {
    type: String,
    default: "取消",
  },
  /* 取消按钮点击事件 */
  cancel: {
    type: Function,
    default: () => {},
  },

  /** form */
  /**label-width */
  labelWidth: {
    type: String,
    default: "150",
  },
  labelPosition: {
    type: String,
    default: "right",
  },
  /** 表单数据 */
  baseInfo: {
    type: Object,
    default: () => ({}),
  },
  /** 表单验证规则 */
  rules: {
    type: Object as () => FormRules,
    default: () => ({}),
  },
});

const { baseInfo, url } = toRefs(props);

const editFormRef = ref<FormInstance>();
const saveLoading = ref<boolean>(false);
const loadService = ref<any>(null);

const submit = function () {
  return new Promise((resolve, reject) => {
    let config = {
      headers: {
        "Content-Type": "multipart/form-data",
        ...props.headers,
      },
    };
    if (token && token.tokenValue) {
      config.headers["Authorization"] =
        "Bearer " + formatToken(token.tokenValue);
    }

    let formData = new FormData();

    for (let key in baseInfo.value) {
      formData.append(key, baseInfo.value[key]);
    }
    console.log(formData);
    axios
      .post(url.value, formData, config)
      .then((res: any) => {
        if (res.data.code === 1) {
          successFn("上传成功");
          resolve(res);
        } else {
          errorFn(res.data.message);
          reject(res.data);
        }
      })
      .catch((err) => {
        errorFn(err.message);
        reject(err);
      });
  });
};

const successFn = (msg: string) => {
  message(msg);
};

const errorFn = (msg: string) => {
  message(msg, "error");
};

const validateForm = async () => {
  if (!editFormRef.value) return;
  await editFormRef.value.validate((valid: boolean, fields: any) => {
    if (valid) {
      saveLoading.value = true;
      submit()
        .then((res) => {
          emits("success", res);
        })
        .catch((err) => {
          emits("error", err);
        })
        .finally(() => {
          saveLoading.value = false;
        });
    } else {
      console.warn("error submit!", fields);
    }
  });
};
</script>
