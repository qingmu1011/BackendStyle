import { http } from "~/utils/http";
import type { PageRequest } from '../types/requestType'
import type { ResResult, ResPageResult } from '../types/responseType'
import type { GetProject, BaseProject, UpdateProject } from '~/types/project'



/**
 * 获取项目分页列表
 * @returns 
 */
export function reqGetProjectList(params: PageRequest){
    return http.request<ResPageResult<GetProject>>("get", '/api/project', { params });
}

/**
 * 获取所有项目
 * @returns 
 */
export function reqGetProjectAll(){
    return http.request<ResPageResult<GetProject>>("get", '/api/project');
}

/**
 * 获取项目详情
 * @param id
 * @returns
 */
export function reqGetProjectDetail(id: string){
    return http.request<ResResult<GetProject>>("get", `/api/project/${id}`);
}

/**
 * 新增项目
 * @param data 
 * @returns 
 */
export function reqCreateProject(data: BaseProject){
    return http.request<ResResult<GetProject>>("post", '/api/project', { data });
}

/**
 * 更新项目
 * @param data 
 * @returns 
 */
export function reqUpdateProject(data: UpdateProject, id: string){
    return http.request<ResResult<GetProject>>("put", `/api/project/${id}`, { data });
}

/**
 * 删除项目
 */
export function reqDeleteProject(id: string){
    return http.request<ResResult<string>>("delete", `/api/project/${id}`);
}

/**
 * 复制项目
 * @param data 
 * @param id 被复制项目的ID
 * @returns 
 */
export function reqCopyProject(data: BaseProject, id: string){
    return http.request<ResResult<GetProject>>("post", `/api/project/${id}/duplicate`, { data });
}