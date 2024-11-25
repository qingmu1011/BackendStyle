import { ref, reactive, watch, computed } from 'vue'
import useDialog from '~/composables/useDialog';

import type { BaseLoadsForecaster, Periods } from '~/types/loadsForecaster'

export default function addTimeIntervalDialog(baseInfo: BaseLoadsForecaster){
    // 弹窗数据
    const {
        dialogInfo,
        openDialog,
        closeDialog,
    } = useDialog(()=>{})

    // 当前选中的区间数组
    const selectedInterval = ref<Periods[]>([])

    // 打开弹窗前更换当前选中的区间数组
    function openAddTimeIntervalDialog(data: Periods[]){
        selectedInterval.value = data
        openDialog('add')
    }

    // 数组区间合集
    const intervalList = computed(()=>{
        return [...baseInfo.coolingTimePeriods, ...baseInfo.heatingTimePeriods]
    })

    // 验证区间是否重复
    function isRepeatInterval(newInterval: Periods){
        // 遍历已有的时间区间，判断是否有冲突
        for (const interval of intervalList.value) {
            if (
                new Date(`2000-${newInterval.startTime}`) <= new Date(`2000-${interval.endTime}`) &&
                new Date(`2000-${newInterval.endTime}`) >= new Date(`2000-${interval.startTime}`)
            ) {
                return true;
            }
        }
        // 如果所有区间都无冲突，返回 false
        return false;
    }

    // 验证一个时间是否在已有区间内
    function isTimeInInterval(time: string){
        // 遍历已有的时间区间，判断是否有冲突
        for (const interval of intervalList.value) {
            if (
                new Date(`2000-${time}`) >= new Date(`2000-${interval.startTime}`) &&
                new Date(`2000-${time}`) <= new Date(`2000-${interval.endTime}`)
            ) {
                return true;
            }
        }
        // 如果所有区间都无冲突，返回 false
        return false;
    }

    return {
        timeIntervalDialogInfo: dialogInfo, 
        timeIntervalCloseDialog: closeDialog,
        selectedInterval, isRepeatInterval, isTimeInInterval, openAddTimeIntervalDialog, 

    }
}