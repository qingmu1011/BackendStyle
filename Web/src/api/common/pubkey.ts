import { http } from "~/utils/http";

/** 获取公钥 */
export const getPubkey = () => {
    return http.request<any>('get', '/api/auth/pubkey', {})
};