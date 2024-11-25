<template>
    <common-panel :rowSplitNumber="1" title-icon="icon-home">
        <template #search>
      
        </template>
        <template #btn>
            <common-btn 
                icon="icon-add" 
                type="success"
                @click="openDialog('add')"
                size="default"
                :plain="false"
                name="新增项目"
            ></common-btn>
        </template>
        <template #default>
            <table-pagination
                :data="tableData"
                :page-obj="pageParams"
                :total="total"
                :loading="loading"
                @size-change="pageSizeChange"
                @current-change="pageNumChange"
            >
                <el-table-column label="项目名称" prop="name" align="center" min-width="120" show-overflow-tooltip />
                <el-table-column label="预测开始时间" prop="startTime" align="center" min-width="140" show-overflow-tooltip />
                <el-table-column label="预测结束时间" prop="endTime" align="center" min-width="140" show-overflow-tooltip />
                <el-table-column label="地理位置" prop="city" min-width="80" align="center" />
                <el-table-column label="纬度" prop="latitude" align="center" min-width="80" show-overflow-tooltip />
                <el-table-column label="经度" prop="longitude" align="center" min-width="80" show-overflow-tooltip />
                <el-table-column label="描述" prop="comment" align="center" min-width="150" show-overflow-tooltip />
                <el-table-column label="项目创建时间" prop="createAt" align="center" min-width="150" show-overflow-tooltip />
                <el-table-column label="Operations" fixed="right" min-width="240">
                    <template #default="scope">
                        <common-btn
                            type="primary"
                            icon="icon-customization"
                            tooltip="编辑"
                            size="small"
                            hide
                            plain
                            @click="openDialog('edit', scope.row)"
                        ></common-btn>
                        
                        <common-btn
                            type="danger"
                            icon="icon-delete"
                            tooltip="删除"
                            size="small"
                            hide
                            plain
                            @click="deleteProject(scope.row.id)"
                        ></common-btn>
                        <common-btn
                            type="warning"
                            icon="icon-order-inspection"
                            tooltip="复制项目"
                            name="复制项目"
                            size="small"
                            hide
                            plain
                            @click="openDialog('copy', scope.row)"
                        ></common-btn>
                    </template>
                </el-table-column>
            </table-pagination>
        </template>
        <template #dialog>
            <addProjectDialog
                :type="dialogInfo.type"
                :data="dialogInfo.data"
                @close="closeDialog"
                v-if="dialogInfo.type"
            ></addProjectDialog>
        </template>
    </common-panel>
</template>

<script setup lang='ts'>
    import { ref, reactive, onMounted } from 'vue'
    import useDialog from '~/composables/useDialog';
    import { message, confirm } from '~/utils/commonFun';
    import { reqGetProjectList, reqDeleteProject } from '~/api/business/project';

    import addProjectDialog from './components/addProjectDialog.vue'


    const {
        dialogInfo,
        openDialog,
        closeDialog,
    } = useDialog(getProjectList)

    const tableData = ref<any[]>([])
    const pageParams = reactive<any>({
        pageNum: 1,
        pageSize: 10
    })
    const total = ref(0)
    const loading = ref(false)

    function pageSizeChange(size: number){
        pageParams.pageSize = size
        getProjectList()
    }

    function pageNumChange(num: number){
        pageParams.pageNum = num
        getProjectList()
    }

    // 获取数据
    async function getProjectList(){
        loading.value = true
        try{
            const res = await reqGetProjectList(pageParams)
            tableData.value = res.content.records
            total.value = res.content.total
        }catch(e){
            message('数据获取失败', 'error')
        }finally{
            loading.value = false
        }
    }

    // 删除某条数据
    async function deleteProject(id:string){
        try{
            await confirm('确定删除该项目吗？')
            await reqDeleteProject(id)
            message('删除成功')
            getProjectList()
        }catch(e){
            if(e === 'cancel') return
            message('删除失败', 'error')
        }
    }

    onMounted(()=>{
        // getProjectList()
    })

</script>

<style lang='scss' scoped>
    
</style>