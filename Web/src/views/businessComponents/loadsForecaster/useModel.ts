import useDialog from '~/composables/useDialog' 
import type { AcModelType, BaseLoadsForecaster } from '~/types/loadsForecaster'

export default function useModel(baseInfo: BaseLoadsForecaster) {
    // 弹窗数据
    const {
        dialogInfo,
        openDialog,
        closeDialog,
    } = useDialog(()=>{})

    function updateModel(model:AcModelType){
        baseInfo.model = model
    }

    return {
        modelDialogInfo: dialogInfo,
        openModelDialog: openDialog,
        closeModelDialog: closeDialog,
        updateModel
    }
}