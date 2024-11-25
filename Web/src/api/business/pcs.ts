import { http } from "~/utils/http";
import { isNull } from "./fun";

/** 
 * 分页获取历史记录
 */
export const pcsList = (params: any) => {
    return http.request<any>("get", "/api/pcs", { params });
};

/** 获取单个记录 */
export const pcsDetails = (id: string) => {
    return http.request<any>("get", `/api/pcs/${id}`);
};

/** 删除记录 */
export const pcsDel = (id: string) => {
    return http.request<any>("delete", `/api/pcs/${id}`);
};

/** 开始寻优 */
export const pcsOptimize = (params: any, data: any) => {
    return http.request<any>("post", "/api/pcs/optimize", { params, data });
};

/** 保存结果 */
export const pcsSaveResult = (data: any) => {
    return http.request<any>("post", "/api/pcs", { data });
};

/** 获取寻优结果 */
export const pcsGetResult = (params: any) => {
    return http.request<any>("get", "/api/pcs/getResult", { params });
};