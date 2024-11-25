import { ref } from 'vue'


/**
 * 弹窗打开关闭
 * @param getData 获取数据方法
 */
export default function useDialog(getData:()=>void) {

    /** 弹窗数据 */
    const dialogInfo = ref<{
        type: 'add' | 'edit' | 'details' | '' | 'copy',
        data?: any
    }>({
        type: ''
    })

    /** 打开弹窗 */
    function openDialog(type: 'add' | 'edit' | 'details' | 'copy', data?:any){
        dialogInfo.value.type = type
        dialogInfo.value.data = data
    }

    /** 关闭弹窗 */
    function closeDialog(flag:boolean=false){
        dialogInfo.value.type = '',
        dialogInfo.value.data = void 0
        // 获取新的数据
        if(!flag) return
        getData()
    }

    return {
        dialogInfo,
        openDialog,
        closeDialog
    }
}