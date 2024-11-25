import { http } from "~/utils/http";
import type { ResResult } from './types'

type Category = 'member' | 'report' | 'device'

interface Params {
    select: string;
    create_at?: string;
}


/**
 * 查询会员、检测报告、设备的数量或最近新增数量
 * @param str 查询的具体项
 * @param times 查询时间，times[0]:开始时间，times[1]:结束时间，可选
 * @returns 
 */
export function getCurrentHomeCount(str:Category, times?:string[]){
    let selectTime = ''

    if(times?.length === 2){
        selectTime = `&create_at=ge.time.${times[0]} 00:00:00&create_at=le.time.${times[1]} 23:59:59`
    }

    return http.request<ResResult<number>>('get', `/api/${str}/query?select=count${selectTime}`)
}
