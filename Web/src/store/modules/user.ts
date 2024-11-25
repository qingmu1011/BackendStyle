import { defineStore } from "pinia";
import { store } from "~/store";
import type { userType } from "./types";
import { router, resetRouter } from "~/router";
import { storageLocal } from "@pureadmin/utils";
import { getLogin, refreshTokenApi, userDetails } from "~/api/user";
import type { UserResult, RefreshTokenResult } from "~/api/user";
import { type DataInfo, setToken, removeToken, userKey, Des_encrypt, setInfo } from "~/utils/auth";
import { getLoginId } from "~/utils/auth";
import { getRoles, getPermissions } from "~/api/common/dict";
import { message } from "~/utils/commonFun";

export const useUserStore = defineStore({
    id: "imcreator-user",
    state: (): userType => ({
        //用户Id
        userId: storageLocal().getItem<DataInfo<number>>(userKey)?.userId ?? "",
        // 用户名
        username: storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "",
        // 页面级别权限
        roles: storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [],
        //权限
        permissions: storageLocal().getItem<DataInfo<number>>(userKey)?.permissions ?? [],
        // 是否勾选了登录页的免登录
        isRemembered: false,
        // 登录页的免登录存储几天，默认7天
        loginDay: 7,
        userInfo: storageLocal().getItem<DataInfo<number>>(userKey)?.userInfo ?? {},
        allDict: storageLocal().getItem('all_Dict') ?? {}
    }),
    actions: {
        /** 存储用户Id */
        SET_USERID(userId: string) {
            this.userId = userId;
        },
        /** 存储用户名 */
        SET_USERNAME(username: string) {
            this.username = username;
        },
        /** 存储角色 */
        SET_ROLES(roles: Array<string>) {
            this.roles = roles;
        },
        /** 存储权限 */
        SET_PERMISSIONS(permissions: Array<string>) {
            this.permissions = permissions;
        },
        /** 存储是否勾选了登录页的免登录 */
        SET_ISREMEMBERED(bool: boolean) {
            this.isRemembered = bool;
        },
        /** 设置登录页的免登录存储几天 */
        SET_LOGINDAY(value: number) {
            this.loginDay = Number(value);
        },
        /** 存储用户信息 */
        SET_USERINFO(userInfo: any) {
            this.userInfo = userInfo;
        },
        /** 存储所有字典 */
        SET_ALLDICT(dicts: any) {
            this.allDict = dicts;
            storageLocal().setItem('all_Dict', dicts)
        },
        /** 登入 */
        async loginByUsername({
            username,
            password,
            method = "PASSWORD",
        }) {
            const params = {
                username,
                method,
                password: await Des_encrypt(password)
            }
            return new Promise<UserResult>((resolve, reject) => {
                getLogin(params)
                    .then(async (data) => {
                        if (data) {
                            //await this.getUserInfo(data.content.loginId);
                            setToken({ ...data.content, expires: data.content?.tokenTimeout });
                            resolve(data);
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },
        /** 前端登出（不调用接口） */
        logOut() {
            this.username = "";
            this.roles = [];
            removeToken();
            resetRouter();
            router.push("/login");
        },
        /** 刷新`token` */
        async handRefreshToken(data: any) {
            return new Promise<RefreshTokenResult>((resolve, reject) => {
                refreshTokenApi(data)
                    .then((res) => {
                        if (res) {
                            setToken(res.data);
                            resolve(res);
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },
        /** 获取用户信息 */
        async getUserInfo() {
            const data = getLoginId();
            return new Promise((resolve, reject) => {

                userDetails(data.loginId)
                    .then((res) => {
                        if (res) {
                            setInfo(res.content);
                            const { roles } = res.content;
                            const roleMap = roles.map((item: any) => item.role);
                            this.getAllCommonDict(roleMap.includes('ROLE::ADMIN')).then(() => {
                                resolve(res);
                            });
                        }
                    })
                    .catch(() => {
                        reject();
                    });
            });
        },
        /** 获取所有通用字典 */
        async getAllCommonDict(flag: Boolean = false) {
            return new Promise((resolve, reject) => {
                let reqList = new Array<{ name: string, func: Promise<any> | Array<Record<string, any>> }>();
                if (flag) {
                    //admin角色才获取所有字典
                    reqList.push({
                        name: "roles",
                        func: getRoles()
                    });
                    reqList.push({
                        name: "permissions",
                        func: getPermissions()
                    });
                }

                reqList.push({
                    name: "programmaticType",
                    func: [
                        { label: "电网供电+受电", value: "SUPPLY_AND_RECEIVE" },
                        { label: "电网仅供电", value: "ONLY_SUPPLY" },
                    ]
                }, {
                    name: "dataType",
                    func: [
                        { label: "天气数据", value: "WEATHER", hasDefault: true },
                        { label: "气温数据", value: "TEMPERATURE", hasDefault: true },
                        { label: "遮挡面积比例", value: "SHADED_AREA_RATIO", hasDefault: false },
                        { label: "室内人员数据", value: "INDOOR_PERSON", hasDefault: true },
                        { label: "家电负载率", value: "HOME_APPLIANCE_LOADS_RATE", hasDefault: true },
                        { label: "照明负载率", value: "LIGHTING_LOADS_RATE", hasDefault: true },
                        { label: "插座临时负载", value: "OUTLET_TEMP_LOADS", hasDefault: false },
                        { label: "电价", value: "TARIFF", hasDefault: false },
                        { label: "光伏发电功率", value: "PV", hasDefault: false },
                        { label: "大楼负载功率", value: "LOADS", hasDefault: false },
                    ]
                });

                let dicts: { [key: string]: any } = {};
                Promise.all(reqList.map(item => item.func))
                    .then((res) => {
                        res.forEach((item, index) => {
                            const name = reqList[index].name;
                            if (item.hasOwnProperty('code')) {
                                if (item.code === 1) {
                                    dicts[name] = item.content;
                                } else {
                                    dicts[name] = [];
                                }
                            } else {
                                dicts[name] = item;
                            }
                        })
                        this.SET_ALLDICT(dicts);
                        resolve(res)
                    }).catch((err) => {
                        message("获取字典数据失败", "error");
                        reject(err)
                    })
                //TODO: 获取所有通用字典
            })
        }
    },
});

export function useUserStoreHook() {
    return useUserStore(store);
}
