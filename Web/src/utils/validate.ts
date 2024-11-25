/**
 * @param {string} value
 * @returns {Boolean}
 */
export const validatorEmail = (rule: any, value: any, callback: any) => {
  if (value === "" || value == null) {
    callback();
  } else if (
    !/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value)
  ) {
    callback(new Error("邮箱格式错误"));
  } else {
    callback();
  }
};

/**
 * @param {string} value
 * @returns {Boolean}
 */
export const validatorPhone = (rule: any, value: any, callback: any) => {
  if (value === "" || value == null) {
    callback();
  } else if (!/^(?:(?:\+|00)86)?1\d{10}$/.test(value)) {
    callback(new Error("手机号格式错误"));
  } else {
    callback();
  }
};

/**
 * 密码限制
 * @param {string} value
 * @returns {Boolean}
 */
export const validatorPassword = (rule: any, value: any, callback: any) => {
  if (value === "" || value == null) {
    callback();
  } else if (
    !/^\S*(?=\S{6,})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[!@#$%^&*?])\S*$/.test(
      value
    )
  ) {
    callback(
      new Error("密码最少6位(包含大、小写字母、数字和特殊字符(!@#$%^&*?))")
    );
  } else {
    callback();
  }
};

/**
 * 用户名限制
 * @param {string} value
 * @returns {Boolean}
 */
export const userName = (rule: any, value: any, callback: any) => {
  const reg = /^[a-zA-Z0-9_]{5,18}$/g;
  if (value === "" || value == null) {
    callback();
  } else if (!reg.test(value)) {
    callback(new Error("包含大写字母、小写字母、数字或下划线,长度5-18位"));
  } else {
    callback();
  }
};

/**
 * 密码强度限制
 * @param {string} value
 * @returns {Boolean}
 */
export const userPassward = (rule: any, value: any, callback: any) => {
  const reg =
    /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z\W_!@#$%^&*`~()-+=]+$)(?![0-9\W_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9\W_!@#$%^&*`~()-+=]{6,18}$/g;
  if (value === "" || value == null) {
    callback();
  } else if (!reg.test(value)) {
    callback(
      new Error(
        "包含大写字母、小写字母、数字和特殊字符(_!@#$%^&*`~()-+=)中的至少三种,长度为6-18位"
      )
    );
  } else {
    callback();
  }
};

/**
 * IP限制
 * @param rule
 * @param value
 * @param callback
 */
export const validatorIP = (rule: any, value: any, callback: any) => {
  if (value === "" || value == null) {
    callback();
  } else if (
    !/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
      value
    )
  ) {
    callback(new Error("请输入正确IP"));
  } else {
    callback();
  }
};

/**
 * 长度限制
 * @param rule
 * @param value
 * @param callback
 */
export const validatorLength = (rule: any, value: any, callback: any) => {
  const length = rule.length || 30;
  if (value === "" || value == null) {
    callback();
  } else if (value.length > length) {
    callback(new Error(`长度不大于${length}个字符`));
  } else {
    callback();
  }
};

/**
 * 正整数
 * @param rule
 * @param value 
 * @param callback 
 */
export const validatorPositiveInteger = (rule: any, value: any, callback: any) => {
  if (value === "" || value == null || value === undefined) {
    callback();
  } else if (!/^\+?[1-9]\d*$/.test(value)) {
    callback(new Error(`请输入正整数`));
  } else {
    const min = rule.min && parseFloat(rule.min);
    const max = rule.max && parseFloat(rule.max);
    if (min && value < min) {
      callback(new Error(`最小值为${min}`));
    } else if (max && value > max) {
      callback(new Error(`最大值为${max}`));
    } else {
      callback();
    }
  }
};

/**
 * 数字
 * @param rule {
 *  minPots: 0,//最小小数位数}
 *  maxPots: 2,//最大小数位数
 *  type: 'positive' | 'negative' //是否为正数、负数
 * }
 * @param value 
 * @param callback 
 */
export const validatorNumber = (rule: any, value: any, callback: any) => {
  const minPots = rule.minPots || 0;//最小小数位数
  const maxPots = rule.maxPots || 2;//最大小数位数
  const isType = rule.type || '';//是否为正数、负数
  const min = rule.min && parseFloat(rule.min);
  const max = rule.max && parseFloat(rule.max);
  const compareMessage = rule.compareMessage;

  const regexStr = `^(\\-)?\\d+${minPots === 0 ? `(\\.\\d{1,${maxPots}})?` : `(\\.\\d{${minPots},${maxPots}})?`}$`
  const regex = new RegExp(regexStr);
  if (value === "" || value == null || value === undefined) {
    callback();
  } else if (!regex.test(value)) {
    callback(new Error(`请输入数字（小数位${minPots === 0 ? `不大于${maxPots}位` : `${minPots}-${maxPots}位`})`));
  } else {

    if (min && value < min) {
      callback(new Error(`${compareMessage || `最小值为${min}`}`));
    } else if (max && value > max) {
      callback(new Error(`${compareMessage || `最大值为${max}`}`));
    } else {
      if (isType) {
        if (isType === 'positive' && value < 0) {
          callback(new Error('请输入正数'))
        } else if (isType === 'negative' && value > 0) {
          callback(new Error('请输入负数'))
        } else {
          callback();
        }
      } else {
        callback();
      }
    }
  }
}