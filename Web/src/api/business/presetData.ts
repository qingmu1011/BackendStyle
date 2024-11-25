import { http } from "~/utils/http";
import { isNull } from "./fun";

/** 
 * 下载数据模版
 */
export const presetDataTemplate = (params: any) => {
    return http.request<any>("get", "/api/preset_data/template", { params });
};

/** 
 * 获取上传的数据
 */
export const presetDataDetails = (id: string) => {
    return http.request<any>("get", "/api/preset_data/" + id, {});
};

/** 
 * 上传/保存后更新数据
 */
export const presetDataUpdate = (id: string, data: any) => {
    return http.request<any>("put", "/api/preset_data/" + id, { data });
};

/** 获取空白数据 */
export const pcsEmptyData = (params: any) => {
    return http.request<any>("post", "/api/preset_data/empty_data", { params });
};