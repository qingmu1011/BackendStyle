<template>
    <base-edit-form
        title="家电"
        subTitle="Scene Define"
        labelWidth="110"
        :width="550"
        :type="props.type"
        :formData="BaseInfo"
        :rules="rules"
        :loading="loading"
        :disabled="props.type === 'details'"
        :submit="saveCluster"
        :cancel="cancelDialog"
        submitText="添 加"
        cancelType="success"
        :isCancel="false"
        :submitType="'success'"
    >
        <template #form>
            <el-form-item label="家电类型" prop="title">
                <el-select v-model="BaseInfo.title" clearable placeholder="选择家电类型" @change="changeApplianceType">
                    <el-option
                        v-for="time in applianceType"
                        :key="time.title"
                        :label="time.title"
                        :value="time.title"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="家电功率" prop="power">
                <div style="display: flex; width: 100%;">
                    <el-tooltip :content="tooltipContent" placement="top">
                        <el-input 
                            style="flex: 1;"
                            v-model="BaseInfo.power" 
                            type="number" 
                            inputmode="numeric"
                            :min="currentApplianceType?.min || 0"
                            :max="currentApplianceType?.max || 0"
                            :disabled="!currentApplianceType"
                        ><template #append>W</template></el-input>
                    </el-tooltip>
                    <el-tooltip placement="top" content="恢复默认值">
                        <el-button 
                            style="margin-left: 10px;" 
                            :icon="Refresh" 
                            @click="restoreDefault"
                            :disabled="!BaseInfo.title || BaseInfo.power === currentApplianceType?.power"
                        ></el-button>
                    </el-tooltip>
                </div>
            </el-form-item>
            <el-form-item label="家电数量" prop="count">
                <el-input 
                    v-model="BaseInfo.count" 
                    type="number" 
                    :step="1"
                    :disabled="!currentApplianceType"
                ></el-input>
            </el-form-item>
            <el-form-item label="家电列表">
                <listDisplay :list="props.applianceList">
                    <template #default="{item}">
                        {{ item.title }} - {{ item.power }}W - {{ item.count }}/台 
                    </template>
                </listDisplay>
            </el-form-item>
        </template>
        <template #footer-btn>
            <common-btn @click="cancelDialog" type="primary" :plain="false">保 存</common-btn>
        </template>
    </base-edit-form>
</template>

<script setup lang='ts'>
    import { ref, reactive, computed } from 'vue'
    import { Refresh } from '@element-plus/icons-vue'
    import listDisplay from './listDisplay.vue'

    import type { ApplianceList, ApplianceType } from '~/types/loadsForecaster'

    interface Props {
        type: 'add' | 'edit' | 'details' | 'copy',
        data?: any,
        applianceType: ApplianceType[]  // 家电类型列表
        applianceList: ApplianceList[] 
    }

    const loading = ref(false)

    const emits = defineEmits(["close", 'addAppliance', 'deleteAppliance']);

    const props = withDefaults(defineProps<Props>(), {})

    // 保存
    function cancelDialog(){
        emits("close")
    }

    // 基础数据
    const BaseInfo = reactive<ApplianceList>({
        title: '',
        power: 0,
        count: 1,
        calorific: 0
    })

    // 当前家电类型
    const currentApplianceType = ref<ApplianceType>()

    function changeApplianceType(title: string){
        currentApplianceType.value = props.applianceType.find(item => item.title === title)
        BaseInfo.power = currentApplianceType.value?.power || 0
        BaseInfo.calorific = currentApplianceType.value?.calorific || 0
    }

    // 恢复默认值
    function restoreDefault(){
        BaseInfo.power = currentApplianceType.value?.power || 0
    }

    // 提示文本
    const tooltipContent = computed(()=>{
        return currentApplianceType.value ? 
            `取值范围：最小值：${currentApplianceType.value.min}，最大值：${currentApplianceType.value.max}，默认值：${currentApplianceType.value.power}`
             : 
            '请先选择家电类型'
    })

    function isInteger(value: any) {
        let num = Number(value);
        return Number.isInteger(num);
    }
    
    // 表达校验规则
    const rules = {
        title: [
            {required: true, message: '请选择家电类型', trigger: 'blur'}
        ],
        power: [
            {required: true, message: '请输入家电功率', trigger: 'blur'},
            { validator: numberValidator, trigger: 'blur' },
        ],
        count: [
            {required: true, message: '请输入家电数量', trigger: 'blur'},
            { validator: countValidator, trigger: 'blur' },
        ],
    }

    // 数量校验规则
    function countValidator(rule:any, value:number, callback:any){
        if(value < 0) {
            callback(new Error('家电数量不能小于0'))
        }else if(!isInteger(value)){
            callback(new Error('家电数量必须是整数'))
        }else {
            callback()
        }
    }

    function numberValidator(rule: any, value: any, callback: any) {
        if(!currentApplianceType.value){
            callback(new Error('请先选择家电类型'))
        }else if (value < currentApplianceType.value.min || value > currentApplianceType.value.max) {
            callback(new Error(`取值范围：最小值：${currentApplianceType.value.min}，最大值：${currentApplianceType.value.max}`));
        } else {
            callback();
        }
    }


    // 保存按钮
    function saveCluster(callback:()=>void){
        emits('addAppliance', {...BaseInfo})
        callback()
        BaseInfo.calorific = 0
        BaseInfo.count = 1
        BaseInfo.power = 0
        BaseInfo.title = ''
        // emits("close")
    }

</script>

<style lang='scss' scoped>

</style>