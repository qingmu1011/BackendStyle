import { http } from "~/utils/http";

/** 获取角色 */
export const getRoles = () => {
    return http.request<any>("get", "/api/role", {});
};

/** 获取权限 */
export const getPermissions = () => {
    return http.request<any>("get", "/api/permission", {});
};
