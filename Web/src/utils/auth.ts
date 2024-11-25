import Cookies from "js-cookie";
import { storageLocal } from "@pureadmin/utils";
import { useUserStoreHook } from "~/store/modules/user";
import JSEncrypt from "jsencrypt";
import { usePubkeyStoreHook } from "~/store/modules/pubkey"
import { intersect, deepCopy } from "~/utils/commonFun";

export interface DataInfo<T> {
  /** 用户Id */
  userId?: string,
  /** token */
  tokenValue: string;
  /** `tokenValue`的过期时间（时间戳） */
  expires: T;
  /** 用于调用刷新tokenValue的接口时所需的token */
  refreshToken: string;
  /** 用户名 */
  username?: string;
  /** 当前登陆用户的角色 */
  roles?: Array<string>;
  permissions?: Array<string>;
  loginId: string,
  userInfo: object
}

export const userKey = "user-info";
export const TokenKey = "authorized-token";
export const LoginIdKey = "authorized-user-loginId";
/**
 * 通过`multiple-tabs`是否在`cookie`中，判断用户是否已经登录系统，
 * 从而支持多标签页打开已经登录的系统后无需再登录。
 * 浏览器完全关闭后`multiple-tabs`将自动从`cookie`中销毁，
 * 再次打开浏览器需要重新登录系统
 * */
export const multipleTabsKey = "multiple-tabs";

/** 获取`token` */
export function getToken(): DataInfo<number> {
  // 此处与`TokenKey`相同，此写法解决初始化时`Cookies`中不存在`TokenKey`报错
  return Cookies.get(TokenKey)
    ? JSON.parse(Cookies.get(TokenKey))
    : storageLocal().getItem(userKey);
}

/** 获取`loginId` */
export function getLoginId(): DataInfo<number> {
  // 此处与`TokenKey`相同，此写法解决初始化时`Cookies`中不存在`TokenKey`报错
  return Cookies.get(LoginIdKey)
    ? JSON.parse(Cookies.get(LoginIdKey))
    : storageLocal().getItem(userKey);
}


/**
 * @description 设置`token`以及一些必要信息并采用无感刷新`token`方案
 * 无感刷新：后端返回`tokenValue`（访问接口使用的`token`）、`refreshToken`（用于调用刷新`tokenValue`的接口时所需的`token`，`refreshToken`的过期时间（比如30天）应大于`tokenValue`的过期时间（比如2小时））、`expires`（`tokenValue`的过期时间）
 * 将`tokenValue`、`expires`这两条信息放在key值为authorized-token的cookie里（过期自动销毁）
 * 将`username`、`roles`、`refreshToken`、`expires`这四条信息放在key值为`user-info`的localStorage里（利用`multipleTabsKey`当浏览器完全关闭后自动销毁）
 */
export function setToken(data: DataInfo<any>) {
  let expires = 0;
  const { tokenValue, refreshToken, loginId } = data;
  const { isRemembered, loginDay } = useUserStoreHook();
  expires = data.expires;//new Date(data.expires).getTime(); // 如果后端直接设置时间戳，将此处代码改为expires = data.expires，然后把上面的DataInfo<Date>改成DataInfo<number>即可
  const cookieString = JSON.stringify({ tokenValue, expires });
  const loginIdString = JSON.stringify({ loginId, expires });

  expires > 0
    ? Cookies.set(TokenKey, cookieString, {
      expires: expires
    })
    : Cookies.set(TokenKey, cookieString);

  expires > 0
    ? Cookies.set(LoginIdKey, loginIdString, {
      expires: expires
    })
    : Cookies.set(LoginIdKey, cookieString);

  Cookies.set(
    multipleTabsKey,
    "true",
    isRemembered
      ? {
        expires: loginDay
      }
      : {}
  );
}

/** 删除`token`以及key值为`user-info`的localStorage信息 */
export function removeToken() {
  Cookies.remove(TokenKey);
  Cookies.remove(multipleTabsKey);
  Cookies.remove(LoginIdKey);
  storageLocal().removeItem(userKey);
}

/** 格式化token（jwt格式） */
export const formatToken = (token: string): string => {
  return "Bearer " + token;
};

/** 密码加密 */
export const Des_encrypt = async function (word: string) {
  let encryptor = new JSEncrypt(); // 新建JSEncrypt对象
  const pubkeyStore = usePubkeyStoreHook();
  const { pubkey } = pubkeyStore;
  encryptor.setPublicKey(pubkey); // 设置公钥
  // 对需要加密的数据进行加密
  return encryptor.encrypt(word);
};

/** 写入登录用户信息 */
export const setInfo = (data: any) => {
  function setUserKey(userId: string, username: string, roles: Array<string>, permissions: Array<string>, info: object) {
    useUserStoreHook().SET_USERID(userId);
    useUserStoreHook().SET_USERNAME(username);
    useUserStoreHook().SET_ROLES(roles);
    useUserStoreHook().SET_PERMISSIONS(permissions);

    storageLocal().setItem(userKey, {
      // refreshToken,
      // expires,
      userId,
      username,
      roles,
      permissions,
      userInfo: info
    });
  }

  const info = data ?? storageLocal().getItem<DataInfo<number>>(userKey)?.userInfo ?? {};
  useUserStoreHook().SET_USERINFO(info);
  if (data.id && data.username && data.roles && data.permissions) {
    const { id, username, roles, permissions } = data;
    setUserKey(id, username, roles.map((c: any) => {
      return c.role
    }), permissions.map((c: any) => {
      return c.permission
    }), info);
  } else {
    const id = storageLocal().getItem<DataInfo<number>>(userKey)?.userId ?? "";
    const username =
      storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "";
    const roles =
      storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [];
    const permissions =
      storageLocal().getItem<DataInfo<number>>(userKey)?.permissions ?? [];
    setUserKey(id, username, roles, permissions, info);
  }
}

/** 
 * 权限判断
 */
export const hasRole = (role: string | Array<string>, type: string = 'role', roles?: Array<string>) => {
  let _roles = [];
  let cRoles = [];

  if (Array.isArray(role)) {
    cRoles = deepCopy(role)
  } else {
    cRoles = [role]
  }

  //如果roles存在，则取roles
  if (roles && roles.length > 0) {
    _roles = deepCopy(roles)
  } else {
    const userInfo = storageLocal().getItem<DataInfo<number>>(userKey)
    if (type == 'role') {
      _roles = userInfo?.roles ?? [];
    } else if (type == 'permission') {
      _roles = userInfo?.permissions ?? [];
    } else {
      if (userInfo && userInfo[type]) {
        _roles = userInfo[type];
      }
    }
  }

  if (_roles && _roles.length > 0) {
    if (cRoles && intersect(cRoles, _roles).isIntersect) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}