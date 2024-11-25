import { reactive, watch } from 'vue'
import useDialog from '~/composables/useDialog';

import type { ApplianceList, BaseLoadsForecaster } from '~/types/loadsForecaster'


export default function useApplianceHandle(baseInfo: BaseLoadsForecaster, applianceList:ApplianceList[]) {
    // 弹窗数据
    const {
        dialogInfo,
        openDialog,
        closeDialog,
    } = useDialog(()=>{})

    

    // 添加家电
    function addAppliance(item: ApplianceList) {
        applianceList.push(item)
    }


    // 计算总功率
    watch(applianceList,()=>{
        baseInfo.homeAppliancePowers = applianceList.reduce((pre, cur)=>{
            pre += cur.power * cur.count
            return pre
        },0)
        baseInfo.homeApplianceCalorific = applianceList.reduce((pre, cur)=>{
            pre += cur.calorific * cur.count
            return pre
        }, 0)
        baseInfo.homeApplianceInfo = applianceList.map(item=>{
            return `${item.title}-${item.power}W-${item.count}/台`
        })
    })

    return { dialogInfo, openDialog, closeDialog, applianceList, addAppliance }
}