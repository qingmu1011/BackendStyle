<script lang="ts">
import {
  defineComponent,
  toRefs,
  ref,
  reactive,
  computed,
  onMounted,
  watch,
  nextTick,
} from "vue";
import { type FormInstance, type FormRules, ElLoading } from "element-plus";
export default defineComponent({
  name: "BaseEditForm",
  props: {
    /** 宽度 */
    width: {
      default: 500,
    },
    top:{
      type: String,
      defalut: "15vh",
    },
    /** 菜单名称 */
    title: {
      type: String,
      default: "",
    },
    subTitle: {
      type: String,
      default: "",
    },
    titleIcon: {
      type: String,
      default: "",
    },
    /** 弹窗类型 */
    type: {
      type: String,
      default: "",
    },
    /** 是否禁用 */
    disabled: {
      type: Boolean,
      default: false,
    },

    /** 提交按钮文字 */
    submitText: {
      type: String,
      default: "保 存",
    },
    /** 提交按钮类型 */
    submitType: {
      type: String,
      default: "primary",
    },
    /** 取消按钮文字 */
    cancelText: {
      type: String,
      default: "取 消",
    },
     /** 取消按钮类型 */
     cancelType: {
      type: String,
      default: "",
    },
     /** 取消按钮是否显示 */
     canceldisabled: {
      type: Boolean,
      default: false,
    },
    /** 取消按钮是否显示 */
    isCancel:{
      type: Boolean,
      default: true,
    },
    /** 提交按钮点击事件 */
    submit: {
      type: Function,
      default: () => {},
    },
    submitVisibel: {
      type: Boolean,
      default: true,
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
      default: "100",
    },
    labelPosition: {
      type: String,
      default: "right",
    },
    /** 表单数据 */
    formData: {
      type: Object,
      default: () => ({}),
    },
    /** 表单验证规则 */
    rules: {
      type: Object as () => FormRules,
      default: () => ({}),
    },
    loading: {
      type: Boolean,
      default: false,
    },
    /** 表单字段 */
    formItems: {
      type: Array as () => Array<any>,
      default: () => [],
    },
    /** 是否显示提交按钮 */
    showSubmit: {
      type: Boolean,
      default: true,
    },
    /** 是否显示取消按钮 */
    showCancel: {
      type: Boolean,
      default: true,
    },
  },
  setup(props: any) {
    const editFormRef = ref<FormInstance>();
    const saveLoading = ref<boolean>(false);
    const loadService = ref<any>(null);
    const classRandom = `base-dialog-form_t${new Date().getTime()}-r${Math.ceil(Math.random() * 100)}`;

    /** computed */
    const fromTitle = computed(() => {
      switch (props.type) {
        case "add":
          return `${props.title}新增`;
        case "edit":
          return `${props.title}编辑`;
        case "details":
          return `${props.title}详情`;
        case "copy":
          return `${props.title}复制`;
        default:
          return `${props.title}`;
      }
    });

    const icon = computed(() => {
      switch (props.type) {
        case "add":
          return "icon-add-btn-fill";
        case "edit":
          return "icon-customization";
        case "details":
          return "icon-order-inspection";
        case "copy":
          return "icon-order-inspection";
        default:
          return props.titleIcon;
      }
    });
    const subTitle = computed(() => {
      if (!props.subTitle) return;
      switch (props.type) {
        case "add":
          return `${props.subTitle} Add`;
        case "edit":
          return `${props.subTitle} Edit`;
        case "details":
          return `${props.subTitle} Details`;
        default:
          return `${props.subTitle}`;
      }
    });
    const beforeClose = (done: () => void) => {
      done();
    };
    /** watch */
    watch(
      () => props.loading,
      (val) => {
        if (val) {
          createLoading();
        } else {
          closeLoading();
        }
      },
      {
        immediate: true,
      }
    );

    const validateForm = async () => {
      if (!editFormRef.value) return;
      await editFormRef.value.validate((valid: boolean, fields: any) => {
        if (valid) {
          saveLoading.value = true;
          props.submit(() => {
            saveLoading.value = false;
          });
        } else {
          console.warn("error submit!", fields);
        }
      });
    };

    function createLoading() {
      loadService.value = ElLoading.service({
        target: classRandom,
        lock: true,
        text: "加载中...",
        background: "rgba(0, 0, 0, 0.7)",
      });
    }

    function closeLoading() {
      loadService.value && loadService.value.close();
      loadService.value = null;
    }

    return {
      ...toRefs(props),
      classRandom,
      editFormRef,
      fromTitle,
      icon,
      subTitle,
      saveLoading,
      beforeClose,
      validateForm,
    };
  },
});
</script>

<template>
  <el-dialog
    :title="fromTitle"
    :width="width"
    :top="top"
    :before-close="beforeClose"
    :model-value="true"
    @close="cancel"
    :class="classRandom"
    :destroy-on-close="true"
  >
    <template #header>
      <common-title
        :title="fromTitle"
        :icon="icon"
        :smallTitle="subTitle"
      ></common-title>
    </template>
    <el-form
      ref="editFormRef"
      size="large"
      :rules="!disabled ? rules : []"
      :model="formData"
      class="demo-form-inline"
      style="padding: 30px 30px 10px 20px"
      :disabled="disabled"
      :label-width="labelWidth"
      :label-position="labelPosition"
    >
      <slot name="form"></slot>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <common-btn @click="cancel" :type="cancelType" :disabled="canceldisabled" v-if="isCancel">{{ cancelText }}</common-btn>
        <common-btn
          v-if="!disabled && submitVisibel"
          :type="submitType"
          :plain="false"
          @click="validateForm"
          :loading="saveLoading"
          >{{ submitText }}</common-btn
        >
        <slot name="footer-btn"></slot>
      </div>
    </template>
  </el-dialog>
</template>
