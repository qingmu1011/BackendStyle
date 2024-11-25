<template>
    <base-edit-form
        title="时段"
        subTitle="Scene Define"
        labelWidth="110"
        :width="550"
        :type="props.type"
        :formData="BaseInfo"
        :rules="rules"
        :loading="loading"
        :disabled="props.type === 'details'"
        :cancel="closeClusterDialog"
        :submit="saveCluster"
    >
        <template #form>
            <el-form-item label="开始时间" prop="startTime">
                <el-select v-model="BaseInfo.startTime" clearable placeholder="选择开始时间">
                    <el-option
                        v-for="time in timeOptions"
                        :key="time"
                        :label="time.slice(0, 5)"
                        :value="time"
                        :disabled="isDisabledStartTime(time)"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="结束时间" prop="endTime">
                <el-select v-model="BaseInfo.endTime" clearable :placeholder="!BaseInfo.startTime ?'请先选择开始时间':'选择结束时间'" :disabled="!BaseInfo.startTime">
                    <el-option
                        v-for="time in timeOptions"
                        :key="time"
                        :label="time.slice(0, 5)"
                        :value="time"
                        :disabled="isDisabledEndTime(time)"
                    />
                </el-select>
            </el-form-item>
        </template>
    </base-edit-form>
</template>

<script setup lang='ts'>
    import { ref, reactive, onMounted, watch } from 'vue'
    import type { Periods } from '~/types/tariffForecaster'

    interface Props {
        type: 'add' | 'edit' | 'details' | 'copy',
        data?: any,
        timeSet: Periods[]
    }

    const loading = ref(false)

    const emits = defineEmits(["close", 'saveTime']);

    const props = withDefaults(defineProps<Props>(), {})

    function closeClusterDialog(){
        emits("close")
    }

    // 基础数据
    const BaseInfo = reactive({
        startTime: '',
        endTime: ''
    })
    const timeOptions = Array.from({ length: 25 }, (_, i) => 
        i.toString().padStart(2, '0') + ":00:00"
    );

    watch(()=>BaseInfo.startTime, ()=>{
        BaseInfo.endTime = ''
    })
    
    // 表达校验规则
    const rules = {
        startTime: [
            {required: true, message: '请选择开始时间', trigger: 'blur'}
        ],
        endTime: [
            {required: true, message: '请选择结束时间', trigger: 'blur'}
        ],
    }

    // 检查时间是否在已选择的开始时间段内
    function isTimeInSelectedStartRanges(time: string) {
        return props.timeSet.some(range => (range.endTime === '24:00:00' && time === '24:00:00')|| (time >= range.startTime && time < range.endTime))
    }
    // 禁用不可选择的开始时间
    function isDisabledStartTime(time: string) {
        // 禁用已选时间段内的开始时间，以及当前选定的结束时间之后的时间
        return isTimeInSelectedStartRanges(time) || (!!BaseInfo.endTime && time >= BaseInfo.endTime);
    }
    // 禁用不可选择的结束时间
    function isDisabledEndTime(time: string) {
        if (!BaseInfo.startTime) return false; // 没有选择开始时间时不禁用
        // 检查是否是选中的开始时间之前的时间
        if (time <= BaseInfo.startTime) {
            return true;
        }

        const closestStartTime = findClosestStartTime(BaseInfo.startTime);

        // 如果找到了最近的开始时间
        if (closestStartTime) {
            const closestStartHour = parseInt(closestStartTime.split(':')[0]);
            // 禁用所有大于最近开始时间的选项
            return parseInt(time.split(':')[0]) > closestStartHour;
        }

        return false; // 如果没有找到最近的开始时间，则不禁用
    }
    // 找出离当前选择的开始时间最近的开始时间
    function findClosestStartTime(selectedStartTime: string) {
        let closestStartTime = '';

        props.timeSet.forEach(range => {
            const rangeStartHour = parseInt(range.startTime.split(':')[0]);
            const selectedStartHour = parseInt(selectedStartTime.split(':')[0]);

            // 找到所有大于当前选择的开始时间的最近的开始时间
            if (rangeStartHour > selectedStartHour) {
                if (!closestStartTime || range.startTime < closestStartTime) {
                closestStartTime = range.startTime;
                }
            }
        });

        return closestStartTime; // 返回找到的最近开始时间
    }

    // 保存按钮
    function saveCluster(callback:()=>void){
        const data = { startTime: BaseInfo.startTime, endTime: BaseInfo.endTime }
        if(data.endTime == '00:00:00'){
            data.endTime = '24:00:00'
        }
        emits('saveTime', data)
        callback()
        emits("close")
    }


    onMounted(()=>{
        
    })
</script>

<style lang='scss' scoped>
    .demo-time-range{
        display: flex;
    }
</style>