import { defined } from "~/utils/commonFun"
export const isNull = (val: any, type = 'like') => {
    if (defined(val)) {
        return `${type}.${val}`
    } else {
        return `${type}.`
    }
}