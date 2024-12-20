import { defineStore } from "pinia";
import { store } from "~/store";
import type { cacheType } from "./types";
import { constantMenus } from "~/router";
import { debounce, getKeyList } from "@pureadmin/utils";
import { ascending, filterTree, filterNoPermissionTree } from "~/router/utils";
import { selectedKey } from '~/utils/commonKeys';
import { storageLocal } from "@pureadmin/utils";
export const usePermissionStore = defineStore({
    id: "imcreator-permission",
    state: () => ({
        // 静态路由生成的菜单
        constantMenus,
        // 整体路由生成的菜单（静态、动态）
        wholeMenus: [],
        // 缓存页面keepAlive
        cachePageList: [],
        //选中第一级菜单
        firstSelected: storageLocal().getItem<string>(selectedKey) || ''
    }),
    actions: {
        /** 组装整体路由生成的菜单 */
        handleWholeMenus(routes: any[]) {
            this.wholeMenus = filterNoPermissionTree(
                filterTree(ascending(this.constantMenus.concat(routes)))
            );
        },
        cacheOperate({ mode, name }: cacheType) {
            const delIndex = this.cachePageList.findIndex(v => v === name);
            switch (mode) {
                case "refresh":
                    this.cachePageList = this.cachePageList.filter(v => v !== name);
                    break;
                case "add":
                    this.cachePageList.push(name);
                    break;
                case "delete":
                    delIndex !== -1 && this.cachePageList.splice(delIndex, 1);
                    break;
            }
            /** 监听缓存页面是否存在于标签页，不存在则删除 */
            debounce(() => {
                let cacheLength = this.cachePageList.length;
                const nameList = getKeyList(useMultiTagsStoreHook().multiTags, "name");
                while (cacheLength > 0) {
                    nameList.findIndex(v => v === this.cachePageList[cacheLength - 1]) ===
                        -1 &&
                        this.cachePageList.splice(
                            this.cachePageList.indexOf(this.cachePageList[cacheLength - 1]),
                            1
                        );
                    cacheLength--;
                }
            })();
        },
        /** 清空缓存页面 */
        clearAllCachePage() {
            this.wholeMenus = [];
            this.cachePageList = [];
        },
        setSelectKey(key: string) {
            this.firstSelected = key
            storageLocal().setItem<string>(selectedKey, key)
        }
    },
});

export function usePermissionStoreHook() {
    return usePermissionStore(store);
}
