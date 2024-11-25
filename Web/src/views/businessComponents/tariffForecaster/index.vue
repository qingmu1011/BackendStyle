<template>
    <div class="prediction-container" v-loading="loading">
        <common-title title="电价设置" smallTitle="Electricity Price Setting" vertical></common-title>
        <el-card style="margin-top: 20px;">
            <line-title :title="`项目选择`" class="m-b-20px"></line-title>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-form-item label="项目选择" prop="lightingType">
                        <el-select placeholder="请先选择项目" v-model="currentProjectID">
                            <el-option
                                v-for="item in projectOptions"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id"
                            />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="预测时间" prop="dataTime">
                        <el-date-picker
                            type="datetimerange"
                            range-separator="至"
                            start-placeholder="开始时间"
                            end-placeholder="结束时间"
                            :model-value="[currentProject?.startTime || '', currentProject?.endTime || '']"
                            format="YYYY-MM-DD HH:mm"
                            disabled
                        />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="6">
                    <el-form-item label="地理位置">
                        <el-input placeholder="请先选择项目" :model-value="currentProject?.city" disabled></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="地理经度">
                        <el-input placeholder="请先选择项目" :model-value="currentProject?.longitude" disabled></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="地理纬度">
                        <el-input placeholder="请先选择项目" :model-value="currentProject?.latitude" disabled></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form :model="baseInfo" ref="ruleFormRef" :rules="rules" :disabled="!currentProjectID">
                <line-title :title="`电价参数`" class="m-b-20px"></line-title>
                <el-row :gutter="20">
                    
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="尖峰电价" prop="peakestPrice">
                            <el-input placeholder="请输入内容" type="number" inputmode="numeric" :step="0.1" v-model="baseInfo.peakestPrice">
                                <template #append>元</template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="尖峰时段" prop="peakestPeriods">
                            <div class="time-picker">
                                <div class="time-container">
                                    <div class="placeholder" v-if="!baseInfo.peakestPeriods.length">暂无内容</div>
                                    <template v-else>
                                        <el-tag 
                                            v-for="(item, index) in baseInfo.peakestPeriods" 
                                            closable 
                                            @close="deleteTime(baseInfo.peakestPeriods, index)" 
                                            type="info" 
                                            :key="index"
                                            style="margin-right: 10px;"
                                        >
                                            {{ item.startTime.slice(0, 5) }} - {{ item.endTime.slice(0, 5) }}
                                        </el-tag>
                                    </template>
                                </div>
                                <el-button type="success" plain style="margin-left: 15px;" @click="open('peakestPeriods')">添加</el-button>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="高峰电价" prop="peakPrice">
                            <el-input placeholder="请输入内容" type="number" inputmode="numeric" :step="0.1" v-model="baseInfo.peakPrice">
                                <template #append>元</template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="高峰时段" prop="peakPeriods">
                            <div class="time-picker">
                                <div class="time-container">
                                    <div class="placeholder" v-if="!baseInfo.peakPeriods.length">暂无内容</div>
                                    <template v-else>
                                        <el-tag 
                                            v-for="(item, index) in baseInfo.peakPeriods" 
                                            closable 
                                            @close="deleteTime(baseInfo.peakPeriods, index)" 
                                            type="info" 
                                            :key="index"
                                            style="margin-right: 10px;"
                                        >
                                            {{ item.startTime.slice(0, 5) }} - {{ item.endTime.slice(0, 5) }}
                                        </el-tag>
                                    </template>
                                </div>
                                <el-button type="success" plain style="margin-left: 15px;" @click="open('peakPeriods')">添加</el-button>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="平价电价" prop="normalPrice">
                            <el-input placeholder="请输入内容" type="number" inputmode="numeric" :step="0.1" v-model="baseInfo.normalPrice">
                                <template #append>元</template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="平价时段" prop="normalPeriods">
                            <div class="time-picker">
                                <div class="time-container">
                                    <div class="placeholder" v-if="!baseInfo.normalPeriods.length">暂无内容</div>
                                    <template v-else>
                                        <el-tag 
                                            v-for="(item, index) in baseInfo.normalPeriods" 
                                            closable 
                                            @close="deleteTime(baseInfo.normalPeriods, index)" 
                                            type="info" 
                                            :key="index"
                                            style="margin-right: 10px;"
                                        >
                                            {{ item.startTime.slice(0, 5) }} - {{ item.endTime.slice(0, 5) }}
                                        </el-tag>
                                    </template>
                                </div>
                                <el-button type="success" plain style="margin-left: 15px;" @click="open('normalPeriods')">添加</el-button>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="低谷电价" prop="lowPeakPrice">
                            <el-input placeholder="请输入内容" type="number" inputmode="numeric" :step="0.1" v-model="baseInfo.lowPeakPrice">
                                <template #append>元</template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="低谷时段" prop="lowPeakPeriods">
                            <div class="time-picker">
                                <div class="time-container">
                                    <div class="placeholder" v-if="!baseInfo.lowPeakPeriods.length">暂无内容</div>
                                    <template v-else>
                                        <el-tag 
                                            v-for="(item, index) in baseInfo.lowPeakPeriods" 
                                            closable 
                                            @close="deleteTime(baseInfo.lowPeakPeriods, index)" 
                                            type="info" 
                                            :key="index"
                                            style="margin-right: 10px;"
                                        >
                                            {{ item.startTime.slice(0, 5) }} - {{ item.endTime.slice(0, 5) }}
                                        </el-tag>
                                    </template>
                                </div>
                                <el-button type="success" plain style="margin-left: 15px;" @click="open('lowPeakPeriods')">添加</el-button>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="深谷电价" prop="lowestPeakPrice">
                            <el-input placeholder="请输入内容" type="number" inputmode="numeric" :step="0.1" v-model="baseInfo.lowestPeakPrice">
                                <template #append>元</template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="深谷时段" prop="lowestPeakPeriods">
                            <div class="time-picker">
                                <div class="time-container">
                                    <div class="placeholder" v-if="!baseInfo.lowestPeakPeriods.length">暂无内容</div>
                                    <template v-else>
                                        <el-tag 
                                            v-for="(item, index) in baseInfo.lowestPeakPeriods" 
                                            closable 
                                            @close="deleteTime(baseInfo.lowestPeakPeriods, index)" 
                                            type="info" 
                                            :key="index"
                                            style="margin-right: 10px;"
                                        >
                                            {{ item.startTime.slice(0, 5) }} - {{ item.endTime.slice(0, 5) }}
                                        </el-tag>
                                    </template>
                                </div>
                                <el-button type="success" plain style="margin-left: 15px;" @click="open('lowestPeakPeriods')">添加</el-button>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>

            <el-button type="primary" @click="submitForm"  :disabled="!currentProjectID">{{forecastResults?.values.length?'重新生成逐时电价':'生成逐时电价'}}</el-button>

            <div class="table-title">
                <div class="title">结果</div>
                <el-button v-if="forecastResults?.values.length" @click="confirmResult">导出数据</el-button>
            </div>
            <el-table :data="forecastResults?.values">
                <el-table-column type="index" label="序号" align="center" width="150px"/>
                <el-table-column prop="time" label="时间" align="center"/>
                <el-table-column prop="value" label="电价（元/kWh）" align="center">
                    <template #default="{ row }">
                        {{ formatDecimal(row.value) }}
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <electricPredictionDialog
            :type="dialogInfo.type"
            :data="dialogInfo.data"
            :info="baseInfo"
            :timeSet="timeSet"
            @close="closeDialog"
            @saveTime ="saveTime"
            v-if="dialogInfo.type"
        ></electricPredictionDialog>
    </div>
</template>

<script setup lang='ts'>
    import { ref, onMounted } from 'vue'
    import electricPredictionDialog from './components/electricPredictionDialog.vue';
    import { message, formatDecimal, deepCopy } from '~/utils/commonFun'
    import { reqElectricPrediction } from '~/api/business/forecasting'
    import useDatas from './datas'
    import useTiemProcessing from './tiemProcessing'
    import { ElMessageBox } from 'element-plus'
    import { onBeforeRouteLeave } from 'vue-router'
    import { exportExcel } from '~/utils/exportExcel'

    import type { FormInstance } from 'element-plus'

    const ruleFormRef = ref<FormInstance>()

    // 基础数据、表达校验规则、预测结果
    const {forecastResults, baseInfo, rules, timeSet, loading, projectOptions, currentProjectID, currentProject, isUpdate, getProjectAll,changeEndTime} = useDatas(ruleFormRef)

    // 时段添加、删除、保存、校验
    const { dialogInfo, closeDialog, open, saveTime, deleteTime, isFullDayCovered } = useTiemProcessing(baseInfo, timeSet)


    // 提交表单
    async function submitForm(){
        try{
            const valid = await ruleFormRef.value?.validate()
            if (!valid) return
            loading.value = true
            if(!isFullDayCovered()) return message('时段未覆盖全天', 'error')
            const data = deepCopy(baseInfo)
            // return
            changeEndTime(data)
            const res = await reqElectricPrediction(data, currentProjectID.value)
            isUpdate.value = true
            forecastResults.value = res.content
            getProjectAll()
        }catch(e:any){
            if(e.code){
                message(e.code + ': ' + e.message, 'error')
            }else{
                message('请先完成数据填写', 'error')
            }
        }finally{
            loading.value = false
        }
    }

    // 导出excel
    function confirmResult(){
        if(!forecastResults.value) return message('请先进行预测', 'error')
        const {name, startTime, endTime, city, longitude, latitude, createAt} = currentProject.value || {}
        const projectInfo = [
            {name: '项目名称', value: name || ''},
            {name: '预测时间', value: `${startTime || ''} - ${endTime || ''}`},
            {name: '地理位置', value: `${city || ''}  ${longitude||''},${latitude || ''}`},
            {name: '项目创建时间', value: createAt || ''}
        ]
        const header = [{name:'时间', key:'time'}, {name:'电价（元/kWh）', key:'value'}]
        exportExcel(projectInfo,header, forecastResults.value.values, (name||'')+'电价预测结果')
    }


    onMounted(()=>{
        getProjectAll()
    })

    // 切换页面时的判断
    onBeforeRouteLeave(async ()=>{
        try{
            if(isUpdate.value) return
            await ElMessageBox.confirm(
                '尚未生成数据，是否离开？',
                '警告',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }
            )
        }catch(e){
            return false
        }
    })
    
</script>

<style lang='scss' scoped>
    .prediction-container{
        .btn{
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .time-picker{
            width: 100%;
            display: flex;
            align-items: center;
            .time-container{
                width: 100%;
                height: 32px;
                display: flex;
                align-items: center;
                border-radius: var(--el-border-radius-base);
                padding: 1px 11px;
                border: var(--el-border);
                &:hover{
                    border-color: var(--el-border-color-hover);
                }
                .placeholder{
                    color: var(--el-text-color-placeholder);
                    font-size: 14px;
                }
            }
        }
        .table-title{
            margin-top: 25px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            .title{
                font-size: 16px;
                font-weight: bold;
            }
        }
    }
</style>