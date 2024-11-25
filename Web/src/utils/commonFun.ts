import { ElMessageBox } from "element-plus";
import { type MessageHandler, ElMessage } from "element-plus";
const confirm = (message: string, type: any = "warning") => {
    return ElMessageBox.confirm(message, {
        type,
        title: "提示",
        showCancelButton: true,
    });
};

const message = (message: string, type: any = "success", duration: number = 3000) => {
    return ElMessage({
        message,
        type,
        duration,
        showClose: duration !== 3000,
    });
};

/** 数据是否存在 */
export const defined = (target: any) => {
    return target !== undefined && target !== null && target !== '';
}

/** 设置默认值 */
export const defaultValue = (target: any, value: any) => {
    return defined(target) ? target : value
}

/** 获取两个数组交集 */
export const intersect = (arr1: Array<any>, arr2: Array<any>) => {
    const set1 = new Set(arr1), set2 = new Set(arr2);
    const mixed = Array.from(set1).filter(c => set2.has(c))
    return {
        isIntersect: mixed.length > 0,
        intersection: mixed
    }
}

/**
 * 深度拷贝
 * @param obj 待拷贝数据
 * @returns 
 */
const deepCopy = (obj: any): any => {
    if (
        obj &&
        typeof obj === "object" &&
        Object.prototype.toString.call(obj) === "[object Array]"
    ) {
        //数组
        const result = [];
        for (let i = 0; i < obj.length; i++) {
            result.push(deepCopy(obj[i]));
        }
        return result;
    } else if (obj && typeof obj === "object") {
        //对象
        const result: any = {};
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            result[keys[i]] = deepCopy(obj[keys[i]]);
        }
        return result;
    } else {
        //基本类型
        return obj;
    }
};

/**
 * 字典翻译
 * @param val 待翻译值
 * @param strList 字典数据
 * @param params 参数
 * @returns 
 */
const dzDict = (
    val: any,
    strList: Array<any>,
    params: {
        key?: "value";
        label?: "desc";
        flag?: false;
    }
) => {
    if (!defined(val)) return "";
    const key = defaultValue(params.key, 'value');
    const label = defaultValue(params.label, 'label');
    const flag = defaultValue(params.flag, false);
    if (!flag) {
        let arr = [];
        arr = strList.filter((item) => {
            return item[key] == val;
        });
        if (arr.length) {
            return arr[0][label];
        } else {
            return "";
        }
    } else {
        const list = val;
        let arr = [];
        arr = strList.filter((item) => list.includes(item[key].toString()));
        if (arr.length > 0) {
            return arr
                .map((item) => {
                    return item[label];
                })
                .join("、");
        } else {
            return "";
        }
    }
};

/**
 * 防抖
 * @param {Function} fun 绑定函数
 * @param {Number} delay 间隔时间
 * @returns
 */
const debounce = (fun: Function, delay: number = 200) => {
    let timer: any = null;
    return function () {
        timer && clearTimeout(timer);
        timer = setTimeout(() => {
            fun.apply(this, arguments);
        }, delay);
    };
};

/**
 * 节流
 * @param {Function} fun 绑定函数
 * @param {Number} delay 间隔时间
 * @returns
 */
const throttle = (fun: Function, delay: number = 200) => {
    let timer: any = null;
    return function () {
        if (!timer) {
            timer = setTimeout(() => {
                fun.apply(this, arguments);
                timer = null;
            }, delay);
        }
    };
};


/**
 * 时间转化
 * @param {Number,Date,String} time 输入时间
 * @param {String} formatter 转化格式
 * @param {Boolean} isPad 是否补0
 * @description formatter由yyyy、MM、dd、HH、mm、ss、ii、week组成
 * @returns
 */
const formatTime = (time: number | string | Date, formatter: string = "yyyy-MM-dd", isPad = true): string | null => {
    //时间参数为空
    if (!time) {
        return null;
    }
    const _pad = (value: number | string, length = 2) => {
        if (isPad) {
            return value.toString().padStart(length, "0");
        } else {
            return value.toString();
        }
    };
    const date = new Date(time);
    const formatterObj = {
        yyyy: date.getFullYear().toString(),
        MM: _pad(date.getMonth() + 1),
        dd: _pad(date.getDate()),
        HH: _pad(date.getHours()),
        mm: _pad(date.getMinutes()),
        ss: _pad(date.getSeconds()),
        ii: _pad(date.getMilliseconds()),
        week: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][
            date.getDay()
        ],
    };

    return formatter
        .replace(/yyyy/g, formatterObj.yyyy)
        .replace(/MM/g, formatterObj.MM)
        .replace(/dd/g, formatterObj.dd)
        .replace(/HH/g, formatterObj.HH)
        .replace(/mm/g, formatterObj.mm)
        .replace(/ss/g, formatterObj.ss)
        .replace(/ii/g, formatterObj.ii)
        .replace(/week/g, formatterObj.week);
};

/**
 * 格式化小数
 * @param num 
 * @param decimal 
 * @returns 
 */
export const formatDecimal = (num: number | string, decimal: number = 2) => {
    if (!defined(num) || isNaN(Number(num))) {
        return "";
    }
    const numStr = num.toString();
    const dotIndex = numStr.indexOf(".");
    if (dotIndex === -1) {
        return numStr;
    } else {
        const decimalStr = numStr.slice(dotIndex + 1);
        if (decimalStr.length > decimal) {
            return parseFloat(numStr).toFixed(decimal);
        } else {
            return numStr;
        }
    }
};

/**
 * 保留小数点位数
 * @param num 数字
 * @param point 需要保留的小数位数，默认2位
 * @returns 
 */
function pointFun(num: any, point = 2) {
    return parseFloat(num.toFixed(point)) || 0;
}


export { confirm, message, deepCopy, dzDict, debounce, throttle, formatTime, pointFun };
