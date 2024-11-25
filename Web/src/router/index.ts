// import "@/utils/sso";
import Cookies from "js-cookie";
import NProgress from "~/utils/progress";
import remainingRouter from "./modules/remaining";
import { usePermissionStoreHook } from "~/store/modules/permission";
import {
  isUrl,
  openLink,
  storageLocal,
  isAllEmpty,
  buildHierarchyTree,
} from "@pureadmin/utils";
import { getConfig } from "~/config";

import {
  type Router,
  createRouter,
  type RouteRecordRaw,
  type RouteComponent,
} from "vue-router";
import {
  type DataInfo,
  userKey,
  removeToken,
  multipleTabsKey,
} from "~/utils/auth";
import {
  ascending,
  formatFlatteningRoutes,
  formatTwoStageRoutes,
  getHistoryMode,
  handleAliveRoute,
  isOneOfArray,
} from "~/router/utils";

import { usePubkeyStoreHook } from "~/store/modules/pubkey";
import { useUserStoreHook } from "~/store/modules/user";

/** 自动导入全部静态路由，无需再手动引入！匹配 src/router/modules 目录（任何嵌套级别）中具有 .ts 扩展名的所有文件，除了 remaining.ts 文件
 * 如何匹配所有文件请看：https://github.com/mrmlnc/fast-glob#basic-syntax
 * 如何排除文件请看：https://cn.vitejs.dev/guide/features.html#negative-patterns
 */
const modules: Record<string, any> = import.meta.glob(
  ["./modules/**/*.ts", "!./modules/**/remaining.ts"],
  {
    eager: true,
  }
);

/** 原始静态路由（未做任何处理） */
const routes = [];

Object.keys(modules).forEach((key) => {
  routes.push(modules[key].default);
});

/** 导出处理后的静态路由（三级及以上的路由全部拍成二级） */
export const constantRoutes: Array<RouteRecordRaw> = formatTwoStageRoutes(
  formatFlatteningRoutes(buildHierarchyTree(ascending(routes.flat(Infinity))))
);

/** 用于渲染菜单，保持原始层级 */
export const constantMenus: Array<RouteComponent> = ascending(
  routes.flat(Infinity)
).concat(...remainingRouter);

/** 不参与菜单的路由 */
export const remainingPaths = Object.keys(remainingRouter).map((v) => {
  return remainingRouter[v].path;
});

/** 创建路由实例 */
export const router: Router = createRouter({
  history: getHistoryMode(import.meta.env.VITE_ROUTER_HISTORY),
  routes: constantRoutes.concat(...(remainingRouter as any)),
  strict: true,
  scrollBehavior(to, from, savedPosition) {
    return new Promise((resolve) => {
      if (savedPosition) {
        return savedPosition;
      } else {
        if (from.meta.saveSrollTop) {
          const top: number =
            document.documentElement.scrollTop || document.body.scrollTop;
          resolve({ left: 0, top });
        }
      }
    });
  },
});

/** 重置路由 */
export function resetRouter() {
  router.getRoutes().forEach((route) => {
    const { name, meta } = route;
    if (name && router.hasRoute(name) && meta?.backstage) {
      router.removeRoute(name);
      router.options.routes = formatTwoStageRoutes(
        formatFlatteningRoutes(
          buildHierarchyTree(ascending(routes.flat(Infinity)))
        )
      );
    }
  });
  usePermissionStoreHook().clearAllCachePage();
}

/** 路由白名单 */
const whiteList = ["/login"];

const { VITE_HIDE_HOME } = import.meta.env;

router.beforeEach(async (to: ToRouteType, _from, next) => {
  // 公钥在使用的时候获取
  // const pubkeyStore = usePubkeyStoreHook();
  // const { pubkey, refreshPubkey } = pubkeyStore;
  // if (!pubkey) {
  //   //如果公钥为空,则重新获取
  //   await refreshPubkey();
  // }
  if (to.meta?.keepAlive) {
    handleAliveRoute(to, "add");
    // 页面整体刷新和点击标签页刷新
    if (_from.name === undefined || _from.name === "Redirect") {
      handleAliveRoute(to);
    }
  }

  NProgress.start();
  const externalLink = isUrl(to?.name as string);
  if (!externalLink) {
    to.matched.some((item) => {
      if (!item.meta.title) return "";
      const Title = getConfig().Title;
      if (Title) document.title = `${item.meta.title} | ${Title}`;
      else document.title = item.meta.title as string;
    });
  }
  /** 如果已经登录并存在登录信息后不能跳转到路由白名单，而是继续保持在当前页面 */
  function toCorrectRoute() {
    whiteList.includes(to.fullPath) ? next(_from.fullPath) : next();
  }
  await useUserStoreHook().getAllCommonDict();
  // if (Cookies.get(multipleTabsKey)) {
  // let userInfo = storageLocal().getItem<DataInfo<number>>(userKey);
  // if (!userInfo || !userInfo.username) {
  //   await useUserStoreHook().getUserInfo();
  //   userInfo = storageLocal().getItem<DataInfo<number>>(userKey);
  // }

  // // 无权限跳转403页面
  // if (to.meta?.roles && !isOneOfArray(to.meta?.roles, userInfo?.roles ?? [])) {
  //   next({ path: "/error/403" });
  // }
  // // 开启隐藏首页后在浏览器地址栏手动输入首页home路由则跳转到404页面
  // if (VITE_HIDE_HOME === "true" && to.fullPath === "/home") {
  //   next({ path: "/error/404" });
  // }
  if (_from?.name) {
    // name为超链接
    if (externalLink) {
      openLink(to?.name as string);
      NProgress.done();
    } else {
      toCorrectRoute();
    }
  } else {
    // 刷新
    toCorrectRoute();
  }
  // } else {
  //   if (to.path !== "/login") {
  //     if (whiteList.indexOf(to.path) !== -1) {
  //       next();
  //     } else {
  //       removeToken();
  //       next({ path: "/login" });
  //     }
  //   } else {
  //     next();
  //   }
  // }
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
