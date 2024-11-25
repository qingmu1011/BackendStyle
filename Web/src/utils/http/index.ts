import Axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type CustomParamsSerializer
} from "axios";
import type {
  PureHttpError,
  RequestMethods,
  PureHttpResponse,
  PureHttpRequestConfig
} from "./types.d";
import { stringify } from "qs";
import NProgress from "../progress";
import { getToken, formatToken } from "~/utils/auth";
import { useUserStoreHook } from "~/store/modules/user";

import { message as messageBox } from "~/utils/commonFun";
// 下载相关
const downloadWords = ['export', 'download', 'template'];
// 长时间请求api
const longTimeApi=[]
// 相关配置请参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
const defaultConfig: AxiosRequestConfig = {
  baseURL: import.meta.env.VITE_APP_BASE_API,
  // 请求超时时间
  timeout: 10000,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  },
  // 数组格式参数序列化（https://github.com/axios/axios/issues/5142）
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer
  }
};

class PureHttp {
  constructor() {
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  /** token过期后，暂存待执行的请求 */
  private static requests = [];

  /** 防止重复刷新token */
  private static isRefreshing = false;

  /** 初始化配置对象 */
  private static initConfig: PureHttpRequestConfig = {};

  /** 保存当前Axios实例对象 */
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

  /** 重连原始请求 */
  private static retryOriginalRequest(config: PureHttpRequestConfig) {
    return new Promise(resolve => {
      PureHttp.requests.push((token: string) => {
        config.headers["Authorization"] = formatToken(token);
        resolve(config);
      });
    });
  }

  /** 请求拦截 */
  private httpInterceptorsRequest(): void {
    PureHttp.axiosInstance.interceptors.request.use(
      async (config: PureHttpRequestConfig): Promise<any> => {
        // 开启进度条动画
        NProgress.start();
        if (downloadWords.findIndex((word: string) => config.url.includes(word)) !== -1) {
          config.responseType = 'blob'
          delete config.timeout
        }
        if (longTimeApi.findIndex((word: string) => config.url.includes(word)) !== -1){
          delete config.timeout
        }
        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof config.beforeRequestCallback === "function") {
          config.beforeRequestCallback(config);
          return config;
        }
        if (PureHttp.initConfig.beforeRequestCallback) {
          PureHttp.initConfig.beforeRequestCallback(config);
          return config;
        }
        /** 请求白名单，放置一些不需要token的接口（通过设置请求白名单，防止token过期后再请求造成的死循环问题） */
        const whiteList = ["/refresh-token", "/api/auth/login", '/api/auth/pubkey'];
        return whiteList.find(url => url === config.url)
          ? config
          : new Promise(resolve => {
            const data = getToken();
            if (data) {
              const now = new Date().getTime();
              //const expired = parseInt(data.expires) <= 0;
              const expired = false;
              if (expired) {
                // if (!PureHttp.isRefreshing) {
                //   PureHttp.isRefreshing = true;
                //   // token过期刷新
                //   useUserStoreHook()
                //     .handRefreshToken({ refreshToken: data.refreshToken })
                //     .then(res => {
                //       const token = res.data.tokenValue;
                //       config.headers["Authorization"] = formatToken(token);
                //       PureHttp.requests.forEach(cb => cb(token));
                //       PureHttp.requests = [];
                //     })
                //     .finally(() => {
                //       PureHttp.isRefreshing = false;
                //     });
                // }
                resolve(PureHttp.retryOriginalRequest(config));
              } else {
                config.headers["Authorization"] = formatToken(
                  data.tokenValue
                );
                resolve(config);
              }
            } else {
              resolve(config);
            }
          });
      },
      error => {
        return Promise.reject(error);
      }
    );
  }

  /** 响应拦截 */
  private httpInterceptorsResponse(): void {
    const instance = PureHttp.axiosInstance;
    instance.interceptors.response.use(
      (response: PureHttpResponse) => {
        const $config = response.config;
        // 关闭进度条动画
        NProgress.done();
        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof $config.beforeResponseCallback === "function") {
          $config.beforeResponseCallback(response);
          return response.data;
        }
        if (PureHttp.initConfig.beforeResponseCallback) {
          PureHttp.initConfig.beforeResponseCallback(response);
          return response.data;
        }


        if (downloadWords.findIndex((word: string) => $config.url.includes(word)) !== -1 && response.status === 200) {
          return response;
        }

        const { code, content, message, status } = response.data;

        if (code === 1) {
          //请求成功
          return response.data;
        } else if (code === 104 || code === 107) {
          //重新登录
          useUserStoreHook().logOut();
          location.reload();
          return Promise.reject(response.data);
        } else if (code === 106) {
          messageBox('无操作权限', "error");
          return Promise.reject(response.data);
        } else {
          return Promise.reject(response.data);
        }

      },
      (error: PureHttpError) => {
        const $error = error;
        $error.isCancelRequest = Axios.isCancel($error);
        // 关闭进度条动画
        NProgress.done();
        // 所有的响应异常 区分来源为取消请求/非取消请求
        const { status } = error.response?.data;
        if (status === 104 || status === 107) {
          //重新登录
          useUserStoreHook().logOut();
        }
        return Promise.reject($error);
      }
    );
  }

  /** 通用请求工具函数 */
  public request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: PureHttpRequestConfig
  ): Promise<T> {
    const config = {
      method,
      url,
      ...param,
      ...axiosConfig
    } as PureHttpRequestConfig;

    // 单独处理自定义请求/响应回调
    return new Promise((resolve, reject) => {
      PureHttp.axiosInstance
        .request(config)
        .then((response: undefined) => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /** 单独抽离的post工具函数 */
  public post<T, P>(
    url: string,
    params?: AxiosRequestConfig<T>,
    config?: PureHttpRequestConfig
  ): Promise<P> {
    return this.request<P>("post", url, params, config);
  }

  /** 单独抽离的get工具函数 */
  public get<T, P>(
    url: string,
    params?: AxiosRequestConfig<T>,
    config?: PureHttpRequestConfig
  ): Promise<P> {
    return this.request<P>("get", url, params, config);
  }
}

export const http = new PureHttp();
