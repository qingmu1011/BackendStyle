<template>
  <div
    :class="[
      'import-btn',
      { 'is-disabled': disabled },
      { 'is-loading': loading },
    ]"
  >
    <input
      :accept="allowAccept"
      type="file"
      ref="fileInput"
      @change="handleFileChange"
    />
    <div class="flex justify-center items-center">
      <span
        class="w-full"
        v-show="!loading || !progressVisible"
        @click.native="fileInputClick"
      >
        <slot></slot>
      </span>
      <div v-if="progressVisible && loading" class="min-w-120px">
        <el-progress :type="progressType" :percentage="progress" />
      </div>
      <span v-if="loading" class="loading-icon color-#0055ff">
        <el-icon><Loading /></el-icon>
      </span>
    </div>
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
import { getToken, formatToken } from "~/utils/auth";
import axios from "axios";
import { Loading } from "@element-plus/icons-vue";

const token = getToken();

defineOptions({
  name: "ImportBtn",
});

defineExpose({
  uploadFile,
});

const props = defineProps({
  /**
   * 上传文件类型
   */
  accept: {
    type: Array,
    default: () => ["image", "video", "audio", "document"],
  },
  /**
   * 允许上传文件后缀
   */
  suffix: {
    type: Array,
    default: () => [],
  },
  /**
   * 上传地址
   */
  url: {
    type: String,
    default: "",
  },
  /**
   * 上传请求头
   */
  headers: {
    type: Object,
    default: () => ({}),
  },
  /**
   * 上传参数
   */
  params: {
    type: Object,
    default: () => ({}),
  },
  /**
   * 是否立即上传
   */
  immediate: {
    type: Boolean,
    default: true,
  },
  /**
   * 文件大小限制
   */
  maxSize: {
    type: Number,
    default: 0,
  },
  /**
   * 开启文件选择器前回调
   */
  beforeSelect: {
    type: Function,
    default: null,
  },
  /**
   * 是否禁用
   */
  disabled: {
    type: Boolean,
    default: false,
  },
  /**
   * 是否显示进度条
   */
  progressVisible: {
    type: Boolean,
    default: false,
  },
  /**
   * 进度条类型
   */
  progressType: {
    type: String,
    default: "line",
    validator: (value: string) => {
      return ["line", "circle"].includes(value);
    },
  },
});
const emits = defineEmits(["error", "success", "change"]);

const {
  headers,
  url,
  params,
  immediate,
  accept,
  suffix,
  maxSize,
  beforeSelect,
  disabled,
} = toRefs(props);

const fileInput = ref(null);
const loading = ref(false);
const fileValue = ref(null);
const progress = ref(0);

const allowAccept = computed(() => {
  if (suffix.value && suffix.value.length > 0) {
    return `.${suffix.value.join(",.")}`;
  } else {
    if (accept.value && accept.value.length > 0) {
      return `${accept.value.join("/*,")}/*`;
    } else {
      return ``;
    }
  }
});

async function fileInputClick(e: Event) {
  e && e.preventDefault();
  if (disabled.value || loading.value) {
    return;
  }
  if (beforeSelect.value && beforeSelect.value instanceof Function) {
    const flag = await beforeSelect.value();
    if (flag) {
      fileInput.value.click();
    }
  } else {
    fileInput.value.click();
  }
}

function handleFileChange(e: Event) {
  const inputElement = e.target as HTMLInputElement;
  const files = inputElement.files;
  if (files) {
    fileValue.value = files[0];
    if (immediate.value) {
      uploadFile();
    } else {
      emits("change", fileValue.value);
    }
  }

  if (fileInput.value) {
    fileInput.value.value = "";
  }
}

async function uploadFile(file: File) {
  const curFile = file || fileValue.value;
  if (!curFile) {
    return;
  }

  console.log(curFile);
  if (!url.value) {
    console.error("请设置上传地址");
    return;
  }
  const isVerify = verifyFile(curFile);
  if (!isVerify) {
    return;
  }
  loading.value = true;
  progress.value = 0;
  let config = {
    headers: {
      "Content-Type": "multipart/form-data",
      ...headers.value,
    },
    onUploadProgress: (event: any) => {
      progress.value = Math.round((event.loaded / event.total) * 100).toFixed(
        1
      );
    },
  };
  if (token && token.tokenValue) {
    config.headers["Authorization"] = "Bearer " + formatToken(token.tokenValue);
  }

  let formData = new FormData();
  formData.append("file", curFile);

  Object.keys(params.value).forEach((key) => {
    formData.append(key, params.value[key]);
  });

  await axios
    .post(url.value, formData, config)
    .then((res: any) => {
      if (res.data.code == 1) {
        progress.value = 100;
        handleSuccess(res.data, curFile);
      } else {
        handleError(res.data);
      }
    })
    .catch((err) => {
      handleError("上传失败");
    })
    .finally(() => {
      loading.value = false;
      fileValue.value = null;
    });
}

function handleError(data: string | object) {
  emits("error", {
    status: "error",
    data,
  });
}
function handleSuccess(arg: object, file: File) {
  emits("success", { status: "success", data: arg, file });
}

// 验证文件:后缀-只对设置了后缀的情况进行验证
function verifyFile(file: File) {
  const suffixArr = suffix.value;
  let flag = true;
  if (suffixArr.length > 0) {
    const exit = file.name.split(".").pop();
    if (suffixArr.indexOf(exit) === -1) {
      handleError("文件格式不正确");
      flag = false;
    }
  }

  if (!flag) {
    return flag;
  }

  const size = file.size / 1024 / 1024;
  if (maxSize.value > 0 && size > maxSize.value) {
    handleError("文件大小超出限制");
    flag = false;
  }
  return flag;
}
</script>
<style scoped lang="scss">
@keyframes xz {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.import-btn {
  display: inline-block;
  position: relative;
  cursor: pointer;

  input[type="file"] {
    display: none;
  }
  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
  &.is-loading {
    cursor: not-allowed;
  }

  .loading-icon {
    animation: xz 5s linear infinite;
  }
}
</style>
