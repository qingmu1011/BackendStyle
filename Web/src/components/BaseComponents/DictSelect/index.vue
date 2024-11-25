<script lang="ts" setup>
import {
  defineOptions,
  defineEmits,
  defineProps,
  withDefaults,
  computed,
  toRefs,
  ref,
} from "vue";
import { useUserStoreHook } from "~/store/modules/user";

const userStore = useUserStoreHook();
const dicts = ref(userStore.allDict);

defineOptions({
  name: "DictSelect",
});

interface propsData {
  modelValue: string | Array;
  disabled?: boolean; //是否禁用
  multiple?: boolean; //是否多选
  placeholder?: string; //文本框占用符
  dict?: string; //字典名称
  data?: Array; //数据源
  option?: object;
  clearable?: boolean; //是否显示清除按钮
}

const props = withDefaults(defineProps<propsData>(), {
  modelValue: "",
  disabled: false,
  multiple: false,
  placeholder: "Please select",
  dict: "",
  data: void 0,
  clearable: true,
  option: {
    label: "label",
    value: "value",
  },
});

const {
  modelValue,
  disabled,
  multiple,
  placeholder,
  data,
  option,
  dict,
  clearable,
} = toRefs(props);

const emits = defineEmits(["update:modelValue", "change"]);

const selectedValue = computed({
  get: () => props.modelValue,
  set: (val: string | Array) => {
    emits("update:modelValue", val);
    emits("change", val);
  },
});

const options = computed(() => {
  if (data.value) {
    return data.value;
  } else if (dict.value) {
    return dicts.value[dict.value] || [];
  } else {
    return [];
  }
});

</script>

<template>
  <div class="dict-select">
    <el-select
      v-model="selectedValue"
      :placeholder="placeholder"
      :multiple="multiple"
      :clearable="clearable"
      filterable
      :disabled="disabled"
    >
      <el-option
        v-for="item in options"
        :key="item[option.value]"
        :label="item[option.label]"
        :value="item[option.value]"
      />
    </el-select>
  </div>
</template>
<style scoped>
.dict-select {
  width: 100%;
}
</style>
