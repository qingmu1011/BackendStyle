/**
 * 响应体结构主体
 */
export interface ResResult<T> {
    code: number;
    status: string;
    message: string;
    content: T;
}

/**
 * 分页响应体结构主体
 */
export interface ResPageResult<T> {
    code: number;
    status: string;
    message: string;
    content: {
        records: T[];
        total: number;
        size: number;
        current: number;
        pages: number;
    }
}