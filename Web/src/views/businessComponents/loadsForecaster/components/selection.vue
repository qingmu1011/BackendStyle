<template>
    <el-row :gutter="20">
        <el-col :span="12">
            <el-form-item :label="props.label" :prop="prop" :rules="rules" label-width="110px" label-position="left">
                <el-tooltip :content="tooltipContent" placement="top">
                    <el-input 
                        type="number" 
                        :model-value="model" 
                        @input="model = Number($event)"
                        :disabled="!modelInfo"
                        inputmode="numeric"
                        :min="currentOption?.min || 0"
                        :max="currentOption?.max || Number.MAX_SAFE_INTEGER"
                        :step="0.1"
                        class="input-with-select"
                    >
                        <template #prepend>
                            <el-select
                                v-model="modelInfo"
                                placeholder="请选择"
                                style="min-width: 160px"
                            >
                                <el-option
                                    v-for="item in options"
                                    :key="item.title"
                                    :label="item.title"
                                    :value="item.title"
                                />
                            </el-select>
                        </template>
                        <template #append>{{ append }}</template>
                    </el-input>
                </el-tooltip>
            </el-form-item>
        </el-col>
        <el-button @click="reset" v-show="btnShow">恢复默认值</el-button>
    </el-row>
</template>

<script setup lang='ts'>
    import { ref, computed } from 'vue'
    import type { CascaderValue } from 'element-plus';
    
    interface Props {
        /**标签名 */
        label: string;
        /**选项 */
        options: any[];
        /**表单验证字段 */
        prop: string;
        /**选项中字段名 */
        fieldNmae: string;
        /**输入框后缀 */
        append:string;
    }

    const props = defineProps<Props>()
    const model = defineModel<number>()
    const modelInfo = defineModel<string>('info')
    // 当前选择的option
    const currentOption = computed(()=>{
        const result = props.options.find((item: any) => item.title === modelInfo.value)
        result && (model.value = result[props.fieldNmae])
        return result
    })


    // 重置
    function reset(){
        model.value = currentOption.value[props.fieldNmae]
    }
    // 提示文本
    const tooltipContent = computed(()=>{
        if(!currentOption.value) {
            return '请先选择'
        }else if(currentOption.value.max) {
            return `取值范围：最小值：${currentOption.value.min}，最大值：${currentOption.value.max}，默认值：${currentOption.value[props.fieldNmae]}`
        }else {
            return `取值范围：最小值：${currentOption.value.min}，默认值：${currentOption.value[props.fieldNmae]}`
        }
    })
    // 是否显示重置按钮
    const btnShow = computed(()=>{
        return currentOption.value && model.value !== currentOption.value[props.fieldNmae]
    })
    // 验证规则
    const rules = [
        { validator: numberValidator, trigger: "change"},
        { validator: numberValidator, trigger: "blur"},
        { trigger: 'blur', message: '请输入数值', required: true }
    ]

    function numberValidator(rule: any, value: any, callback: any) {
        if(!currentOption.value) {
            callback(new Error('请选择'));
        }else if (value < currentOption.value.min || value > (currentOption.value.max || Number.MAX_SAFE_INTEGER)) {
            if(currentOption.value.max){
                callback(new Error(`取值范围：最小值：${currentOption.value.min}，最大值：${currentOption.value.max}`));
            }else {
                callback(new Error(`取值范围：最小值：${currentOption.value.min}`));
            }
        } else {
            callback();
        }
    }

    
</script>

<style lang='scss' scoped>

    :deep(.input-with-select .el-input-group__prepend) {
        background-color: var(--el-fill-color-blank);
    }
</style>