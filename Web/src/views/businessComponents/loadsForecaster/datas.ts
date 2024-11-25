import { ref, reactive } from 'vue'
import { reqGetBuildingPredictionParameters } from '~/api/business/forecasting'
import { deepCopy, message } from '~/utils/commonFun'
import useProject from '~/composables/useProject'

import type { ApplianceList, BaseLoadsForecaster, ParameterList, ReturnLoadsForecaster, WeatherMapType } from '~/types/loadsForecaster'
import type { FormRules } from 'element-plus'
import { GetforecastingType } from '~/types/commonType'

export default function useDatas(ruleFormRef:any){
    // 页面loading
    const loading = ref(false)
    // 参数列表
    const parameterList = ref<ParameterList>({
        applianceType: [],
        lightType: [],
        acEnergyEfficiencyRating: [],
        windowFactor: [],
        externalWallFactor: [],
        roofFactor: [],
        weather_map:{},
        ac_model: {
            model_division_point: 0,
            heating_condition:{
                terms: 12,
                intercept: 0,
                linear: [],
                quadratic: [],
                cross:[[],[],[],[],[],[],[],[],[],[],[],[]]
            },
            cooling_condition:{
                terms: 12,
                intercept: 0,
                linear: [],
                quadratic: [],
                cross:[[],[],[],[],[],[],[],[],[],[],[],[]]
            }
        }
    })
    // 预测结果
    const forecastResults = ref<ReturnLoadsForecaster>()
    // 家电列表
    const applianceList = reactive<ApplianceList[]>([])

    // 基础数据
    const baseInfo = reactive<BaseLoadsForecaster>({
        "@type": ".LoadsParameter",

        buildingArea: 400.05,  //建筑面积（平方米）

        //以下是空调负荷预测相关参数，如果useAc为false下面的参数可以不传
        useAc: true,
        forceMiddleSeasonCalc: false,
        middleSeasonTemperature: 23,
        coolingTemperature: 26.0,  //制冷温度
        heatingTemperature: 18.0,  //供暖温度
        coolingTimePeriods: [    // 制冷区间
            {startTime: '06-15', endTime: '08-31'}
        ],
        heatingTimePeriods: [  // 供暖区间
            {startTime: '01-01', endTime: '02-28'},
            {startTime: '12-01', endTime: '12-31'}
        ],
        // coolingStartTime: "",  //制冷区间开始时间
        // coolingEndTime: "",  //制冷区间结束时间
        acCoolingCOP: 0,  //空调制冷COP，选空调能耗等级，带出COP
        acHeatingCOP: 0,  //空调制热COP，选空调能耗等级，带出COP
        acInfo: '', // 空调信息，用于参数回显，格式前端定，后台不处理该字段
        indoorPersonDataId: "",
        outdoorTemperatureDataId: "",  //室外温度数据id, valueHead = 室外温度(℃)
        windowWallRatio: 0.3,  //窗墙比，数据范围[0,1]
        windowFactor: 0,  // 外窗传热系数，选外窗材质类型及厚度，带出传热系数
        windowInfo: '',  // 外窗信息，用于参数回显，格式前端定，后台不处理该字段
        externalWallFactor: 0,  //外墙传热系数，选外墙材质类型及厚度，带出传热系数
        externalWallInfo: '',  // 外墙信息，用于参数回显，格式前端定，后台不处理该字段
        roofFactor: 0,  //屋顶传热系数，选屋顶材质类型及厚度，带出传热系数
        roofInfo: '',  // 屋顶信息，用于参数回显，格式前端定，后台不处理该字段
        
        //以下是可选参数(和空调负荷预测相关)
        buildingHeight: 0,  //建筑高度（米）
        buildingBasePerimeter: 0,  //建筑底面周长（米）
        buildingBaseArea: 0,  //建筑底面积（平方米）
        buildingStories: 0,  //建筑层数（整数）

        //以下是照明负荷预测相关参数
        lightingPowers: 300,  //照明灯具总功率(W)
        lightingType: "",  //照明灯具类型
        lightingLoadsRateDataId: "",  //照明负荷率逐时数据id, valueHead = 照明负荷率(%)

        //以下是家电负荷预测相关参数
        homeAppliancePowers: 0,  //家电总功率(W)，填入家电类型、数量、功率，得到汇总数据
        homeApplianceCalorific: 0,  //家电总热量(kcal/h)，填入家电类型、数量、功率，得到汇总数据
        homeApplianceLoadsRateDataId: "",  //家电负荷率逐时数据id, valueHead = 家电负荷率(%)
        outletTempLoadsDataId: "",  //插座临时负荷逐时数据id, valueHead = 插座临时负荷(W)
        homeApplianceInfo: [],  // 家电信息，用于参数回显，格式前端定，后台不处理该字段
    })

    // 默认数据
    let defaultBaseInfo = deepCopy(baseInfo)


    function isInteger(value: any) {
        let num = Number(value);
        return Number.isInteger(num);
    }

    // 表单验证规则
    const rules = reactive<FormRules<typeof baseInfo>>({
        middleSeasonTemperature: [
            { trigger: 'blur', message: '请填写过渡季节室内设定温度', required: true }
        ],
        coolingTemperature:[
            { trigger: 'blur', message: '请填写制冷温度', required: true }
        ],
        heatingTemperature:[
            { trigger: 'blur', message: '请填写制热温度', required: true }
        ],
        // coolingStartTime:[
        //     { trigger: 'blur', message: '请选择制冷区间开始时间', required: true }
        // ],
        coolingTimePeriods: [  // 制冷区间
            { validator: arrValidator, trigger: 'blur', required: true },
        ],
        heatingTimePeriods: [   // 制热区间
            { validator: arrValidator, trigger: 'blur', required: true },
        ],

        buildingArea:[  // 建筑面积
            { trigger: 'blur', message: '请填写建筑面积', required: true }
        ],
        
        outdoorTemperatureDataId: [  // 室外温度数据id
            { trigger: 'blur', message: '请导入气温数据', required: true }
        ],
        indoorPersonDataId: [  // 室外温度数据id
            { trigger: 'blur', message: '请导入室内人数逐时数据', required: true }
        ],
        windowWallRatio: [  // 窗墙比
            { validator: windowWallRatioValidator, trigger: 'change' },
            { trigger: 'blur', message: '请填写窗墙比', required: true }
        ],
        

        buildingStories: [ // 层数
            { validator: buildingStoriesValidator, trigger: 'change' }
        ],
        lightingType: [ // 灯具类型
            { trigger: 'blur', message: '请选择灯具类型', required: true }
        ],
        lightingPowers: [  // 照明灯具总功率
            { trigger: 'blur', message: '请填写照明灯具总功率', required: true }
        ],
        lightingLoadsRateDataId: [  // 照明负荷率逐时数据id
            { trigger: 'blur', message: '请导入照明负荷率数据', required: true }
        ],
        homeApplianceLoadsRateDataId: [  // 家电负荷率逐时数据id
            { trigger: 'blur', message: '请导入家电负荷率逐时数据', required: true }
        ],
        outletTempLoadsDataId: [  // 插座临时负荷逐时数据id
            { trigger: 'blur', message: '请导入插座临时负荷逐时数据', required: true }
        ]
    })
    // 窗墙比校验规则
    function windowWallRatioValidator(rule:any, value:number, callback:any){
        if(value < 0 || value > 1) {
            callback(new Error('请输入窗墙比数据, 窗墙比数据范围0-1'))
        }else {
            callback()
        }
    }
    // 室内人数校验规则
    function indoorPersonsValidator(rule:any, value:number, callback:any){
        if(value < 0) {
            callback(new Error('室内人数不能小于0'))
        }else if(!isInteger(value)){
            callback(new Error('室内人数必须是整数'))
        }else {
            callback()
        }
    }
    // 建筑层数校验规则
    function buildingStoriesValidator(rule:any, value:number, callback:any){
        if(!isInteger(value)){
            callback(new Error('建筑层数必须是整数'))
        }else{
            callback()
        }
    }
    function arrValidator(rule: any, value: any, callback: any) {
        if(value.length > 0){
            callback()
        }else{
            callback(new Error('请选择日期段'))
        }
    }

    // use 项目
    const { projectOptions, currentProjectID, currentProject, exportParams, isUpdate, getProjectAll } = useProject('loadsForecastId', loading, forecastingCallback)
    // 获取预测记录后的回调
    function forecastingCallback(data?: GetforecastingType<BaseLoadsForecaster, ReturnLoadsForecaster>){
        const dData = deepCopy(defaultBaseInfo)
        ruleFormRef.value?.resetFields()
        applianceList.length = 0
        if(!data  || !data.parameter) {
            Object.keys(baseInfo).forEach((key) => {
                 // @ts-ignore
                baseInfo[key] = dData[key]
            })
            forecastResults.value = data?.result || void 0
        }else{
            forecastResults.value = data.result || void 0
            Object.keys(baseInfo).forEach((key) => {
                if(key === 'homeApplianceInfo'){
                    data.parameter[key].forEach(item=>{
                        const r = item.split('-')
                        applianceList.push({
                            title: r[0],
                            power: Number(r[1].slice(0, -1)),
                            count: Number(r[2].slice(0, -2)),
                            calorific: parameterList.value.applianceType.find((i) => i.title === r[0])?.calorific || 0
                        })
                    })
                    baseInfo[key] = data.parameter[key]
                }else if(key === 'coolingTimePeriods' || key === 'heatingTimePeriods'){
                    baseInfo[key] = data.parameter[key].filter(item=>Object.keys(item).length)
                }else{
                    // @ts-ignore
                    baseInfo[key] = data.parameter[key]
                }
            })
            
        }
    }

    // 获取参数列表数据
    async function getData(){
        try{
            loading.value = true
            const res = await reqGetBuildingPredictionParameters()
            getProjectAll()
            baseInfo.model || (baseInfo.model = res.content.ac_model)
            defaultBaseInfo = deepCopy(baseInfo)
            parameterList.value = res.content
        }catch(err){
            message('获取参数列表失败', 'error')
        }finally{
            loading.value = false
        }
    }

    return {
        loading, baseInfo, rules, parameterList, forecastResults, exportParams, projectOptions, currentProjectID, currentProject, applianceList, isUpdate,
        getData, getProjectAll
    }
}