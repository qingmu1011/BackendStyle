import { ref, reactive, computed } from 'vue'
import useProject from '~/composables/useProject'
import { deepCopy } from '~/utils/commonFun'

import type { BaseElectricPrediction, ReturnElectricPrediction } from '~/types/tariffForecaster'
import type { FormRules } from 'element-plus'
import type { GetforecastingType } from '~/types/commonType'


export default function useDatas(ruleFormRef:any){
    // 页面loading
    const loading = ref(false)
    // 预测结果
    const forecastResults = ref<ReturnElectricPrediction>()
    
    // 基础表单数据
    const baseInfo = reactive<BaseElectricPrediction>({
        peakestPrice: 0.8,
        peakPrice: 0.6,
        normalPrice: 0.5,
        lowPeakPrice: 0.3,
        lowestPeakPrice: 0.2,
        peakestPeriods: [],
        peakPeriods: [],
        normalPeriods: [],
        lowPeakPeriods: [],
        lowestPeakPeriods: [],
        "@type": ".TariffParameter"
    })


    // 默认数据
    const defaultBaseInfo = deepCopy(baseInfo)

    // 时段集合
    const timeSet = computed(()=>{
        return [...baseInfo.peakPeriods, ...baseInfo.normalPeriods, ...baseInfo.lowPeakPeriods, ...baseInfo.peakestPeriods, ...baseInfo.lowestPeakPeriods]
    })

    // 表单验证规则
    const rules = reactive<FormRules<typeof baseInfo>>({
        peakestPrice: [
            { trigger: 'blur', message: '请输入电价', required: true },
            { validator: priceValidator, trigger: 'change' }
        ],
        peakPrice: [
            { trigger: 'blur', message: '请输入电价', required: true },
            { validator: priceValidator, trigger: 'change' }
        ],
        normalPrice: [
            { trigger: 'blur', message: '请输入电价', required: true },
            { validator: priceValidator, trigger: 'change' }
        ],
        lowPeakPrice: [
            { trigger: 'blur', message: '请输入电价', required: true },
            { validator: priceValidator, trigger: 'change' }
        ],
        lowestPeakPrice: [
            { trigger: 'blur', message: '请输入电价', required: true },
            { validator: priceValidator, trigger: 'change' }
        ],
        // peakestPeriods: [{ validator: arrValidator, trigger: 'change', required: true }],
        // peakPeriods: [{ validator: arrValidator, trigger: 'change', required: true }],
        // normalPeriods: [{ validator: arrValidator, trigger: 'change', required: true }],
        // lowPeakPeriods: [{ validator: arrValidator, trigger: 'change', required: true }],
        // lowestPeakPeriods: [{ validator: arrValidator, trigger: 'change', required: true }],
    })

    function priceValidator(rule: any, value: number, callback: any) {
        if(value > 0){
            callback()
        }else{
            callback(new Error('请输入大于0的数字'))
        }
    }

    function arrValidator(rule: any, value: any, callback: any) {
        if(value.length > 0){
            callback()
        }else{
            callback(new Error('请选择时间段'))
        }
    }

    

    // use 项目
    const { projectOptions, currentProjectID, currentProject, isUpdate, getProjectAll } = useProject('tariffForecastId', loading, forecastingCallback)
    // 获取预测记录后的回调
    const fields = ['peakestPeriods', 'peakPeriods', 'normalPeriods', 'lowPeakPeriods', 'lowestPeakPeriods']
    function forecastingCallback(data?: GetforecastingType<BaseElectricPrediction, ReturnElectricPrediction>){
        const dData = deepCopy(defaultBaseInfo)
        ruleFormRef.value?.resetFields()
        if(!data || !data.parameter) {
            Object.keys(baseInfo).forEach((key) => {
                 // @ts-ignore
                baseInfo[key] = dData[key]
            })
            forecastResults.value = void 0
        }else{
            forecastResults.value = data.result || void 0
            Object.keys(baseInfo).forEach((key) => {
                if(fields.indexOf(key) > -1){
                    // @ts-ignore
                    baseInfo[key] = data.parameter[key].map((item) => {
                        if(item.endTime === '23:59:59' || item.endTime === '00:00:00'){
                            item.endTime = '24:00:00'
                        }
                        return item
                        // @ts-ignore
                    })
                }else {
                    // @ts-ignore
                    baseInfo[key] = data.parameter[key]
                }
            })
        }
        
    }

    // 数据上传时将endTime 24:00:00 改为 23:59：59
    function changeEndTime(data:BaseElectricPrediction){
        fields.forEach((key) => {
            // @ts-ignore
            data[key].forEach((item) => {
                if(item.endTime === '24:00:00'){
                    item.endTime = '23:59:59'
                }
            })
        })
    }

    return {
        forecastResults, baseInfo, rules, timeSet, loading, projectOptions, currentProjectID, currentProject, isUpdate, getProjectAll, changeEndTime
    }
}