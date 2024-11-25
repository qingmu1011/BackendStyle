import { http } from "~/utils/http";
import type { ResResult } from '../types/responseType'
import type { BaseElectricPrediction, ReturnElectricPrediction } from '~/types/tariffForecaster'
import type { BasePhotovoltaicPrediction, LocationOption, ReturnPhotovoltaicPrediction } from '~/types/photovoltaicForecaster'
import type { BaseLoadsForecaster, ParameterList, ReturnLoadsForecaster } from '~/types/loadsForecaster'


/**
 * 电价预测
 * @param data 电价预测数据
 * @returns 
 */
export function reqElectricPrediction(data: BaseElectricPrediction, projectId: string){
    return http.request<ResResult<ReturnElectricPrediction>>("post", `/api/forecasting?forecasterType=TARIFF&projectId=${projectId}`, { data });
}

/**
 * 光伏发电预测
 * @param data 光伏发电预测数据
 * @returns 
 */
export function reqPhotovoltaicPrediction(data: BasePhotovoltaicPrediction, projectId: string){
    return http.request<ResResult<ReturnPhotovoltaicPrediction>>("post", `/api/forecasting?forecasterType=PHOTOVOLTAIC&projectId=${projectId}`, { data });
}

/**
 * 建筑负载预测
 * @param data 负荷预测数据
 * @returns 
 */
export function reqLoadsForecaster(data: BaseLoadsForecaster, projectId: string){
    return http.request<ResResult<ReturnLoadsForecaster>>("post", `/api/forecasting?forecasterType=LOADS&projectId=${projectId}`, { data });
}

/**
 * 获取地理位置信息
 * @returns 
 */
export function reqGetGeographic(){
    return http.request<ResResult<{location:LocationOption[]}>>("get", '/api/forecasting/parameter_map?forecasterType=PHOTOVOLTAIC');
}


/**
 * 获取建筑预测参数
 * @returns 
 */
export function reqGetBuildingPredictionParameters(){
    return http.request<ResResult<ParameterList>>("get", '/api/forecasting/parameter_map?forecasterType=LOADS');
}

/**
 * 获取预测记录
 * @param id 预测记录id
 * @returns 
 */
export function reqGetPredictionRecord(id: string){
    return http.request<ResResult<any>>("get", `/api/forecasting/${id}`);
}
