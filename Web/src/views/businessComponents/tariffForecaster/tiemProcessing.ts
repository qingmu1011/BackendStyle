import { ref, ComputedRef } from 'vue' 
import { message } from '~/utils/commonFun'
import useDialog from '~/composables/useDialog'

import type { BaseElectricPrediction, Periods } from '~/types/tariffForecaster'

export default function useTiemProcessing(baseInfo: BaseElectricPrediction, timeSet:ComputedRef<Periods[]>){
    const {
        dialogInfo,
        openDialog,
        closeDialog,
    } = useDialog(()=>{})

    /** 时间段处理逻辑 */ 
    type Field = 'peakPeriods' | 'normalPeriods' | 'lowPeakPeriods' | 'peakestPeriods' | 'lowestPeakPeriods'
    const currentTimeField = ref<Field>('peakPeriods')
    function open(field:Field){
        currentTimeField.value = field
        openDialog('add')
    }
    // 判断两个时段是否冲突的函数
    function isConflict(newPeriod: Periods, existingPeriod: Periods) {
        const [newStart, newEnd] = [newPeriod.startTime, newPeriod.endTime];
        const [existStart, existEnd] = [existingPeriod.startTime, existingPeriod.endTime];

        return !(newEnd <= existStart || newStart >= existEnd);
    };
    // 检查是否有冲突的函数
    function hasConflict(newPeriod: Periods){
        return timeSet.value.some(existingPeriod => isConflict(newPeriod, existingPeriod))
    };
    // 保存时段
    function saveTime(data:Periods){
        if (!hasConflict(data)) {
            baseInfo[currentTimeField.value].push(data)
        } else {
            message('时段冲突，请重新选择', 'error')
        }
        // console.log(timeSet.value)
    }
    // 删除时段
    function deleteTime(data:Periods[], index:number){
        data.splice(index, 1)
    }
    // 时间转换函数，将时间 "HH:mm" 转换为分钟数（从 00:00 开始的分钟数）
    function timeToMinutes(time: string) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };
    // 检查是否覆盖一天所有时间段的函数
    function isFullDayCovered() {
        const allPeriods = [...timeSet.value]

        // 将所有时段按开始时间排序
        allPeriods.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

        // 确保第一个时段从 00:00 开始
        if (timeToMinutes(allPeriods[0].startTime) !== 0) {
            return false;
        }

        // 检查每个时段之间是否有空隙
        for (let i = 0; i < allPeriods.length - 1; i++) {
            if (timeToMinutes(allPeriods[i].endTime) !== timeToMinutes(allPeriods[i + 1].startTime)) {
                return false; // 有空隙
            }
        }

        // 确保最后一个时段在 24:00 结束
        if (timeToMinutes(allPeriods[allPeriods.length - 1].endTime) !== 24 * 60) {
            return false;
        }

        return true; // 所有时段无缝衔接，覆盖了整个一天
    };
    

    return {
        dialogInfo, closeDialog, open, saveTime, deleteTime, isFullDayCovered
    }
}