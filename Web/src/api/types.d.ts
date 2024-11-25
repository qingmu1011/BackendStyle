/**
 * 响应体结构主体
 */
export interface ResResult<T> {
    code: number;
    status: string;
    message: string;
    content: T;
}