import { http } from "~/utils/http";
import { isNull } from "./business/fun"
export type UserResult = {
  code: number;
  status: string;
  message: string;
  content: {
    // /** 用户名 */
    // username: string;
    // /** 当前登陆用户的角色 */
    // roles: Array<string>;
    // /** `token` */
    // tokenValue: string;
    /**登录Id-获取登录用户信息 */
    loginId: string;
    /** `token` */
    tokenValue: string;
    /** `tokenValue`的过期时间 */
    tokenTimeout: number,
    /** 用于调用刷新`tokenValue`的接口时所需的`token` */
    refreshToken: string;
    /** `tokenValue`的过期时间时间戳 */
    expires: number;
  };
};

export type RefreshTokenResult = {
  success: boolean;
  data: {
    /** `token` */
    tokenValue: string;
    /** 用于调用刷新`tokenValue`的接口时所需的`token` */
    refreshToken: string;
    /** `tokenValue`的过期时间 */
    expires: number;
  };
};

/** 登录 */
export const getLogin = (data: object) => {
  return http.request<UserResult>("post", "/api/auth/login", { data });
};

/** 修改密码 */
export const changePassword = (id: string, data: object) => {
  return http.request<UserResult>("put", "/api/auth/changePassword/" + id, { data });
};

/** 重置密码 */
export const resetPassword = (id: string, data: object) => {
  return http.request<UserResult>("put", "/api/auth/resetPassword/" + id, { data });
};

/** 用户详情 */
export const userDetails = (id: string) => {
  return http.request<any>("get", "/api/user/" + id, {});
};

/** 新增用户 */
export const userAdd = (data: any) => {
  return http.request<any>("post", "/api/user", { data });
};

/** 编辑用户 */
export const userUpdate = (id: string, data: any) => {
  return http.request<any>("put", "/api/user/" + id, { data });
};

/** 用户列表 */
export const userList = (params?: any) => {
  return http.request<any>("get", "/api/user", { params });
};

/** 用户删除 */
export const userDelete = (id: string) => {
  return http.request<any>("delete", "/api/user/" + id, {});
};

//用户列表通用接口
export const userQuery = (query: any): Promise<any> => {
  let params: any = Object.assign({}, query, { select: "*" });
  params.name = isNull(params.name);
  params.username = isNull(params.username);
  return http.request<any>("get", "/api/user/query", { params });
};

/** 刷新token */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>("post", "/refresh-token", { data });
};

