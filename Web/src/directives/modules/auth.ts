import { hasRole } from "~/utils/auth";
import { defined, deepCopy } from "~/utils/commonFun"
export default {
  name: 'auth',
  mounted: function (el: HTMLElement, binding: any) {
    const value = binding?.value;
    const _type = binding?.arg;
    let _roles = [];

    if (defined(value)) {
      if (typeof value == 'object' && Array.isArray(value)) {
        _roles = deepCopy(value)
      } else if (typeof value == 'object') {
        _roles = Object.values(value)
      } else {
        _roles = [value]
      }
    }

    if (!hasRole(_roles, _type)) {
      el.parentNode?.removeChild(el);
    }
  },
};
