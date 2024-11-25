<template>
    <el-row :gutter="20">
        <el-col :span="6">
            <el-form-item label="空调能耗等级" :rules="infoRule" prop="acInfo">
                <el-cascader
                    class="input-with-select"
                    v-model="valueInfo"
                    :options="props.options"
                    :props="cascaderProp"
                />
            </el-form-item>
        </el-col>
        <el-col :span="6">
            <el-form-item label="空调制冷COP" :rules="rules" prop="acCoolingCOP">
                <el-tooltip :content="tooltipContent">
                    <el-input 
                        type="number" 
                        :model-value="modelCool" 
                        @input="modelCool = Number($event)"
                        placeholder="请输入" 
                        :step="0.1"
                        :min="currentOption?.min || 0"
                        :max="currentOption?.max || Number.MAX_SAFE_INTEGER"
                        :disabled="!modelInfo"
                    >
                        <template #append>COP</template>
                    </el-input>
                </el-tooltip>
            </el-form-item>
        </el-col>
        <el-col :span="6">
            <el-form-item label="空调制热COP" :rules="rules" prop="acHeatingCOP">
                <el-tooltip :content="tooltipContent">
                    <el-input 
                        type="number" 
                        :model-value="modelHeat" 
                        @input="modelHeat = Number($event)"
                        placeholder="请输入" 
                        :step="0.1"
                        :min="currentOption?.min || 0"
                        :max="currentOption?.max || Number.MAX_SAFE_INTEGER"
                        :disabled="!modelInfo"
                    >
                        <template #append>COP</template>
                    </el-input>
                </el-tooltip>
            </el-form-item>
        </el-col>
        <el-button @click="reset" v-show="btnShow">恢复默认值</el-button>
    </el-row>
</template>

<script setup lang='ts'>
    import { ref, reactive, computed, watch, customRef } from 'vue'
    import { formatDecimal } from '~/utils/commonFun'

    interface Props {
        /**选项 */
        options: any[];
    }

    const props = defineProps<Props>()
    const modelHeat = defineModel('heat', {required: true, type: Number})
    const modelCool = defineModel('cool', {required: true, type: Number})
    const modelInfo = defineModel<string>('info', {required: true})
    const valueInfo = customRef<string[]>(()=>{
        return {
            get(){
                return modelInfo.value.split('/')
            },
            set(val:string[]){
                modelInfo.value = val.join('/')
            }
        }
    })
    // 当前选择的option
    const currentOption = computed(()=>{
        let result = props.options;
        modelInfo.value.split('/').forEach((item: any) => {
            const res = result.find((item2: any) => item2.title === item)
            result = res?.children || res
        })
        result && (modelCool.value = (result as any)['cop'])
        return (result as any)
    })

    const multiple = 0.93
    
    // 级联选择器配置
    const cascaderProp = {
        expandTrigger: 'hover' as const,
        value: 'title',
        label: 'title',
    }

    watch(modelCool,()=>{
        if(modelCool.value === 0){
            modelHeat.value = 0
            return
        }
        const value = Number(formatDecimal(modelCool.value * multiple,1))
        if(value < currentOption.value.min){
            modelHeat.value = currentOption.value.min
        }else if(value > currentOption.value.max){
            modelHeat.value = currentOption.value.max || value
        }else {
            modelHeat.value = value
        }
    })

    // 重置
    function reset(){
        modelCool.value = currentOption.value['cop']
    }
    // 提示文本
    const tooltipContent = computed(()=>{
        if(!currentOption.value) {
            return '请先选择'
        }else if(currentOption.value.max) {
            return `取值范围：最小值：${currentOption.value.min}，最大值：${currentOption.value.max}，默认值：${currentOption.value['cop']}`
        }else {
            return `取值范围：最小值：${currentOption.value.min}，默认值：${currentOption.value['cop']}`
        }
    })
    // 是否显示重置按钮
    const btnShow = computed(()=>{
        return currentOption.value && (modelCool.value !== currentOption.value['cop'])
    })
    // 验证规则
    const infoRule = [
        { trigger: 'blur', message: '请输入', required: true }
    ]
    const rules = [
        { validator: numberValidator, trigger: ["change", 'blur']},
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
    
</style>