import { ref, computed, watch } from 'vue'
import { reqGetProjectAll } from '~/api/business/project'
import { message } from '~/utils/commonFun'
import { reqGetPredictionRecord } from '~/api/business/forecasting'
import { formatDuration } from '~/utils/businessFun'

import type { GetProject } from '~/types/project'
import type { Ref } from 'vue'

type IdField = 'tariffForecastId' | 'loadsForecastId' | 'pvForecastId' | 'pcsOptimizeId'

/**
 * 获取项目选项及预测记录
 * @param id 预测记录的id字段
 * @param loading 页面 loading
 * @param callback 获取预测详情的回调函数
 * @returns 
 */
export default function useProject(id: IdField, loading: Ref<boolean>, callback: (data?: any)=>void) {
    // 项目选项
    const projectOptions = ref<GetProject[]>([])
    // 当前选择的项目ID
    const currentProjectID = ref('')
    // 当前选择的项目
    const currentProject = computed(()=>{
        return projectOptions.value.find(item=>item.id === currentProjectID.value)
    })
    // 是否提示用户退出页面，防止用户在未保存的情况下离开页面
    const isUpdate = ref(true)
    // 导出Excel模版所需要的数据
    const exportParams = computed(()=>{
        return {
            startTime: currentProject.value?.startTime || '',
            endTime: currentProject.value?.endTime || '',
            duration: formatDuration(currentProject.value?.duration || 0),
            projectId: currentProject.value?.id || ''
        }
    })

    // 监听当前选择的项目ID
    watch(currentProjectID, ()=>{
        isUpdate.value = false
        getPredictionRecord()
    })

    // 获取项目列表
    async function getProjectAll() {
        loading.value = true
        try{
            const res = await reqGetProjectAll()
            projectOptions.value = res.content.records
        }catch(e){
            message('获取项目选项失败', 'error')
        }finally{
            loading.value = false
        }
    }

    // 获取预测详情
    async function getPredictionRecord(){
        try{
            loading.value = true
            if(currentProject.value && currentProject.value[id]){
                const res = await reqGetPredictionRecord(currentProject.value[id] as string)
                callback(res.content)
            }else{
                callback()
            }
            message('项目已切换')
        }catch(e){
            message('获取预测详情失败', 'error')
        }finally{
            loading.value = false
        }
    }

    return { projectOptions, currentProjectID, currentProject, exportParams, isUpdate, getProjectAll }
}