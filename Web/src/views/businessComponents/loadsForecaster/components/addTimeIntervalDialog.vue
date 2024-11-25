<template>
    <base-edit-form
        title="日期区间"
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
            <div class="err-message">{{errMessage}}</div>
            <el-form-item label="开始日期" prop="startTime">
                <el-date-picker
                    class="timeInterval"
                    v-model="BaseInfo.startTime"
                    type="date"
                    placeholder="开始日期"
                    format="MM月DD日"
                    value-format="MM-DD"
                    :disabled-date="disabledStartDate"
                />
            </el-form-item>
            <el-form-item label="结束日期" prop="endTime">
                <el-date-picker
                    class="timeInterval"
                    v-model="BaseInfo.endTime"
                    type="date"
                    placeholder="结束日期"
                    format="MM月DD日"
                    value-format="MM-DD"
                    :disabled-date="disabledEndDate"
                />
            </el-form-item>
            <el-form-item label="日期列表">
                <listDisplay :list="props.selectedInterval">
                    <template #default="{ item }">
                        {{ item.startTime.replace('-', '月') }}日 - {{ item.endTime.replace('-', '月')}}日
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
    import { message } from '~/utils/commonFun'
    import listDisplay from './listDisplay.vue'

    import type { Periods } from '~/types/loadsForecaster'

    interface Props {
        type: 'add' | 'edit' | 'details' | 'copy',
        data?: any,
        selectedInterval:Periods[],
        isRepeatInterval:(value:Periods)=>boolean,
        isTimeInInterval:(value:string)=>boolean
    }

    const value = ref('')

    const loading = ref(false)

    const emits = defineEmits(["close"]);

    const props = withDefaults(defineProps<Props>(), {})

    const errMessage = ref('')

    // 基础数据
    const BaseInfo = reactive<Periods>({
        startTime: '',
        endTime: '',
    })
    
    // 表达校验规则
    const rules = {
        startTime: [
            { required: true, message: '请选择开始日期', trigger: 'blur' },
            { validator: validateDate, trigger: ['blur', 'change'] },
        ],
        endTime: [
            { required: true, message: '请选择结束日期', trigger: 'blur' },
            { validator: validateDate, trigger: ['blur', 'change'] },
        ],
    }
    // 校验日期
    function validateDate(rule: any, value: string, callback: any){
        if(props.isTimeInInterval(value)){
            callback(new Error('所选日期有重叠，请重新选择'))
        }else{
            callback()
        }
    }

    // 禁用开始日期
    function disabledStartDate(time: Date) {
        const minTime = new Date(new Date().getFullYear() + '-01-01').getTime() - (60*1000*60*24)
        return minTime > time.getTime()
    }

    // 禁用结束日期
    function disabledEndDate(time: Date) {
        const maxTime = new Date(new Date().getFullYear() + '-12-31').getTime()
        const startTime = new Date(new Date().getFullYear() + '-' + BaseInfo.startTime).getTime()
        return maxTime < time.getTime() || time.getTime() < startTime
    }


    // 添加按钮
    function saveCluster(callback:()=>void){
        // 校验时段
        if(props.isRepeatInterval({...BaseInfo})){
            message('日期区间有重叠，请重新选择', 'error')
            errMessage.value = '日期区间有重叠，请重新选择'
            callback()
            return
        }
        // 添加
        props.selectedInterval.push({...BaseInfo})
        callback()
        errMessage.value = ''
        BaseInfo.startTime = ''
        BaseInfo.endTime = ''
        // emits('addAppliance', BaseInfo)
        // emits("close")
    }

    // 保存
    function cancelDialog(){
        emits("close")
    }

</script>

<style lang='scss' scoped>
    .err-message{
        font-size: 12px;
        color: var(--el-color-error);
        text-align: center;
        transform: translateY(-10px);
    }
</style>