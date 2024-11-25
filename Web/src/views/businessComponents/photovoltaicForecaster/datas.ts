import { ref, reactive, computed } from 'vue'
import { reqGetBuildingPredictionParameters } from '~/api/business/forecasting'
import { deepCopy, message } from '~/utils/commonFun'
import { reqGetProjectAll } from '~/api/business/project'
import useProject from '~/composables/useProject'

import type { BasePhotovoltaicPrediction, ReturnPhotovoltaicPrediction, LocationOption } from '~/types/photovoltaicForecaster'
import type { FormRules } from 'element-plus'
import type { WeatherMapType } from '~/types/loadsForecaster'
import type { GetProject } from '~/types/project'
import { GetforecastingType } from '~/types/commonType'


export default function useDatas(ruleFormRef:any){

    // 页面loading
    const loading = ref(false)

    // 预测结果
    const forecastResults = ref<ReturnPhotovoltaicPrediction>()
    
    
    // 光伏组件类型
    const pvModuleTypeOptions = [
        {label: '单晶硅', value: 'MONOCRYSTALLINE_SILICON'},
        {label: '多晶硅', value: 'POLYCRYSTALLINE_SILICON'},
        {label: '铜铟镓硒', value: 'COPPER_INDIUM_GALLIUM_SELENIDE'},
        {label: '碲化镉', value: 'CADMIUM_TELLURIDE'},
        {label: '其他', value: 'OTHER'},
    ]

    const baseInfo = reactive<BasePhotovoltaicPrediction>({
        // startTime:'',
        // endTime: '',
        // duration: '',
        "@type": ".PhotovoltaicParameter",

        // address: "成都",  //项目地址
        // longitude: 104.02,  //经度
        // latitude: 30.67,  //纬度

        weatherDataId: "",  //上传的天气预置数据id
        temperatureDataId: "",  //上传的气温预置数据id

        reflectance: 0.2,  //光伏所在建筑表面反射比ρ
        shadedAreaDataId: "",  //上传的遮挡面积比例预置数据id

        pvModuleType: "MONOCRYSTALLINE_SILICON",  //光伏板类型
        pvModuleName: '',
        effectiveArea: 100,  //光伏板有效面积 S
        pvAngle: 20,  //光伏板安装倾角β
        pvAzimuth: -5,  //光伏板安装方位角γ
        conversionEfficiency: 23,  //光电转换效率
        operatingTemperature: 45,  //额定运行温度
        temperatureCoefficient: 0.004,  //温度系数
        attenuationRate: 2.5,  //衰减率 2.5%
        dcCorrectionFactor: 0.95,  //直流回路线路损失修正系数K1
        acCorrectionFactor: 0.95,  //交流回路线路损失修正系数K2
        pvArrayCorrectionFactor: 0.95,  //光伏阵列失配损失修正系数K3
        dustMaskingCorrectionFactor: 0.9,  //尘埃遮挡损失修正系数K4
        inverterConversionEfficiency: 98,  //逆变器转换效率
        systemBuildTime: '',  //光伏系统建成时间
    })
    // 默认数据
    const defaultBaseInfo = deepCopy(baseInfo)

    // 表单验证规则
    const rules = reactive<FormRules<typeof baseInfo>>({
        // address: [{ trigger: 'blur', message: '请输入项目地址', required: true }],
        // longitude: [{ trigger: 'blur', message: '请输入经度', required: true }],
        // latitude: [{ trigger: 'blur', message: '请输入纬度', required: true }],

        weatherDataId: [{ trigger: 'blur', message: '请上传天气预置数据', required: true }],
        temperatureDataId: [{ trigger: 'blur', message: '请上传气温预置数据', required: true }],

        reflectance: [
            { trigger: 'blur', message: '请输入参数', required: true },
            {validator: handleMinAndMaxRule(0,1, '',true), trigger: ['change', 'blur']}
        ],
        shadedAreaDataId: [{ trigger: 'blur', message: '请上传遮挡面积比例预置数据', required: true }],

        pvModuleType: [{ trigger: 'blur', message: '请选择光伏板类型', required: true }],
        effectiveArea: [
            { trigger: 'blur', message: '请输入参数', required: true },
            {validator: handleNumberRule, trigger: ['change', 'blur']}
        ],
        pvAngle: [
            { trigger: 'blur', message: '请输入参数', required: true },
            {validator: handleMinAndMaxRule(0,90,'°', true, true), trigger: ['change', 'blur']}
        ],
        pvAzimuth: [
            { trigger: 'blur', message: '请输入参数', required: true },
            {validator: handleMinAndMaxRule(-90,90,'°', true, true), trigger: ['change', 'blur']}
        ],
        conversionEfficiency: [
            { trigger: 'blur', message: '请输入参数', required: true },
            {validator: handleMinAndMaxRule(0,30,'%', true), trigger: ['change', 'blur']}
        ],
        operatingTemperature: [
            { trigger: 'blur', message: '请输入参数', required: true },
            {validator: handleMinAndMaxRule(40,50,'°C', true, true), trigger: ['change', 'blur']}
        ],
        temperatureCoefficient: [
            { trigger: 'blur', message: '请输入参数', required: true },
            {validator: handleMinAndMaxRule(0,0.01,'', true), trigger: ['change', 'blur']}
        ],
        attenuationRate: [
            { trigger: 'blur', message: '请输入参数', required: true },
            {validator: handleMinAndMaxRule(0,100,'%', true), trigger: ['change', 'blur']}
        ],
        dcCorrectionFactor: [
            { trigger: 'blur', message: '请输入参数', required: true },
            {validator: handleMinAndMaxRule(0.8,1,'', true), trigger: ['change', 'blur']}
        ],
        acCorrectionFactor: [
            { trigger: 'blur', message: '请输入参数', required: true },
            {validator: handleMinAndMaxRule(0.8,1,'', true), trigger: ['change', 'blur']}
        ],
        pvArrayCorrectionFactor: [
            { trigger: 'blur', message: '请输入参数', required: true },
            {validator: handleMinAndMaxRule(0.8,1,'', true), trigger: ['change', 'blur']}
        ],
        dustMaskingCorrectionFactor: [
            { trigger: 'blur', message: '请输入参数', required: true },
            {validator: handleMinAndMaxRule(0.8,1,'', true), trigger: ['change', 'blur']}
        ],
        inverterConversionEfficiency: [
            { trigger: 'blur', message: '请输入参数', required: true },
            {validator: handleMinAndMaxRule(80,100,'%', true), trigger: ['change', 'blur']}
        ],
        systemBuildTime: [{ trigger: 'blur', message: '请选择日期', required: true }],
    })

    // 最小值，最大值验证规则
    function handleMinAndMaxRule(min: number, max: number, unit:string='', inMin:boolean=false, inMax:boolean=false){
        return function (rule: any, value: any, callback: any){
            if((inMin ? value < min : value <= min) || (inMax ? value > max : value >= max)){
                callback(new Error(`请输入${!inMin ? '大于':''}${min}${unit}~${!inMax ? '小于':''}${max}${unit}之间的数值`))
            }else{
                callback()
            }
        }
    }

    // 数字必须大于0
    function handleNumberRule(rule: any, value: any, callback: any){
        if(value <= 0){
            callback(new Error(`请输入大于0的数值`))
        }else{
            callback()
        }
    }


    // 天气映射数据
    const weatherMap = ref<{label: string, value: number}[]>([])
    function handleOptions(options: WeatherMapType){
        return Object.keys(options).map(item=>{
            return {
                label: item,
                value: options[item]
            }
        })
    }

    // use 项目
    const { projectOptions, currentProjectID, currentProject, exportParams, isUpdate, getProjectAll } = useProject('pvForecastId', loading, forecastingCallback)
    // 获取预测记录后的回调
    const fields = ['attenuationRate', 'conversionEfficiency', 'inverterConversionEfficiency']
    function forecastingCallback(data?: GetforecastingType<BasePhotovoltaicPrediction, ReturnPhotovoltaicPrediction>){
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
                    baseInfo[key] = data.parameter[key] * 100
                }else {
                    // @ts-ignore
                    baseInfo[key] = data.parameter[key]
                }
                
            })
        }
    }

    // 获取数据
    async function getDate(){
        try{
            loading.value = true
            getProjectAll()
            const res1 = await reqGetBuildingPredictionParameters()
            weatherMap.value = handleOptions(res1.content.weather_map)
        }catch(e){
            message('获取地理数据失败', 'error')
        }finally{
            loading.value = false
        }
    }

    return {
        forecastResults, pvModuleTypeOptions, baseInfo, rules, loading, weatherMap, projectOptions, currentProjectID, currentProject, exportParams, isUpdate,
        getDate, getProjectAll
    }
}