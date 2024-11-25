<template>
    <div class="prediction-container" v-loading="loading">
        <common-title title="建筑负载预测" smallTitle="Building load prediction" vertical></common-title>
        
        <el-card style="position: relative;">
            <common-btn class="btn" name="模型修改" size="default" :plain="false" :disabled="!currentProjectID" @click="openModelDialog('edit', baseInfo.model || parameterList.ac_model)"></common-btn>
            <line-title :title="`项目选择`" class="m-b-20px m-t-15px"></line-title>
            <el-row :gutter='20'>
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
                    <el-form-item label="预测时间">
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
            <el-form :model="baseInfo" ref="ruleFormRef" :rules="rules" label-position="left" :disabled="!currentProjectID">
                <line-title :title="`基本参数`" class="m-b-20px"></line-title>
                <el-row :gutter="20">
                    
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="建筑面积" prop="buildingArea">
                            <el-input placeholder="请输入参数" type="number" v-model="baseInfo.buildingArea" inputmode="numeric">
                                <template #append>㎡</template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <line-title :title="`空调负荷参数`" class="m-b-20px"></line-title>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="是否使用空调" prop="useAc" required>
                            <el-switch v-model="baseInfo.useAc" style="--el-switch-on-color: #13ce66;"/>
                        </el-form-item>
                    </el-col>
                </el-row>
                <template v-if="baseInfo.useAc">
                    <el-row :gutter="20">
                        <el-col :span="6">
                            <el-form-item label="是否计算过渡季节空调能耗" prop="forceMiddleSeasonCalc" required>
                                <el-switch v-model="baseInfo.forceMiddleSeasonCalc" style="--el-switch-on-color: #13ce66;"/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="10">
                            <el-form-item label="过渡季节室内设定温度" prop="middleSeasonTemperature" v-if="baseInfo.forceMiddleSeasonCalc">
                                <el-input placeholder="请输入参数" type="number" step="0.1" v-model="baseInfo.middleSeasonTemperature">
                                    <template #append>℃</template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="8">
                            <el-form-item label="制冷温度" prop="coolingTemperature">
                                <el-input placeholder="请输入参数" type="number" step="0.1" v-model="baseInfo.coolingTemperature">
                                    <template #append>℃</template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="供暖温度" prop="heatingTemperature">
                                <el-input placeholder="请输入参数" type="number" step="0.1" v-model="baseInfo.heatingTemperature">
                                    <template #append>℃</template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <!-- <el-row :gutter="20">
                        <el-col :span="16">
                            <el-form-item label="制冷区间开始时间" prop="coolingStartTime">
                                <el-date-picker
                                    style="max-width:220px"
                                    type="date"
                                    placeholder="请选择时间"
                                    value-format="YYYY-MM-DD HH:mm:ss"
                                    v-model="baseInfo.coolingStartTime"
                                />
                                <span style="margin:0 10px">-</span>
                                <el-date-picker
                                    style="width:220px"
                                    type="date"
                                    placeholder="制冷区间结束时间(可选)"
                                    value-format="YYYY-MM-DD HH:mm:ss"
                                    v-model="baseInfo.coolingEndTime"
                                />
                            </el-form-item>
                        </el-col>
                    </el-row> -->
                    <el-row :gutter="20">
                        <el-col :span="8">
                            <el-form-item label="制冷区间" prop="coolingTimePeriods">
                                <listDisplay
                                    :list="baseInfo.coolingTimePeriods"
                                    :closable="!!currentProjectID"
                                >
                                <template #default="{ item }">
                                    {{ item.startTime?.replace('-', '月') }}日 - {{ item.endTime?.replace('-', '月')}}日
                                </template>
                                </listDisplay>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-button type="success" plain @click="openAddTimeIntervalDialog(baseInfo.coolingTimePeriods)">添加</el-button>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="8">
                            <el-form-item label="供暖区间" prop="heatingTimePeriods">
                                <listDisplay
                                    :list="baseInfo.heatingTimePeriods"
                                    :closable="!!currentProjectID"
                                >
                                <template #default="{ item }">
                                    {{ item.startTime?.replace('-', '月') }}日 - {{ item.endTime?.replace('-', '月')}}日
                                </template>
                                </listDisplay>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-button type="success" plain @click="openAddTimeIntervalDialog(baseInfo.heatingTimePeriods)">添加</el-button>
                        </el-col>
                    </el-row>
                    <acEnergy 
                        :options="parameterList.acEnergyEfficiencyRating"
                        v-model:info="baseInfo.acInfo"
                        v-model:heat="baseInfo.acHeatingCOP"
                        v-model:cool="baseInfo.acCoolingCOP"
                    ></acEnergy>
                    <selection 
                        v-model="baseInfo.windowFactor"
                        v-model:info="baseInfo.windowInfo"
                        :options="parameterList.windowFactor" 
                        label="外窗材质类型" 
                        prop="windowFactor"
                        fieldNmae="htFactor"
                        append="传热系数"
                    ></selection>
                    <selection 
                        v-model="baseInfo.externalWallFactor"
                        v-model:info="baseInfo.externalWallInfo"
                        :options="parameterList.externalWallFactor" 
                        label="外墙材质类型" 
                        prop="externalWallFactor"
                        fieldNmae="htFactor"
                        append="传热系数"
                    ></selection>
                    <selection 
                        v-model="baseInfo.roofFactor"
                        v-model:info="baseInfo.roofInfo"
                        :options="parameterList.roofFactor" 
                        label="屋顶材质类型" 
                        prop="roofFactor"
                        fieldNmae="htFactor"
                        append="传热系数"
                    ></selection>
                    <el-row :gutter="20">
                        <el-col :span="8">
                            <el-form-item label="窗墙比" prop="windowWallRatio" label-width="100px">
                                <el-tooltip content="数据范围0-1" placement="top">
                                    <el-input 
                                        type="number" 
                                        v-model="baseInfo.windowWallRatio" 
                                        inputmode="numeric"
                                        :min="0"
                                        :max="1"
                                        :step="0.1"
                                    >
                                    </el-input>
                                </el-tooltip>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <excel-upload
                        label="气温数据"
                        prop="outdoorTemperatureDataId"
                        exportName="气温数据"
                        :inputVisible="false"
                        :params="exportParams"
                        :before-export="beforeExport"
                        data-type="TEMPERATURE"
                        v-model="baseInfo.outdoorTemperatureDataId"
                    ></excel-upload>
                    <excel-upload
                        label="室内人数逐时数据"
                        prop="indoorPersonDataId"
                        exportName="室内人数逐时数据"
                        :inputVisible="false"
                        :params="exportParams"
                        :before-export="beforeExport"
                        v-model="baseInfo.indoorPersonDataId"
                        data-type="INDOOR_PERSON"
                    ></excel-upload>
                    
                </template>
                <line-title :title="`照明负荷参数`" class="m-b-20px"></line-title>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="照明灯具类型" prop="lightingType" label-width="110px">
                            <el-select v-model="baseInfo.lightingType" placeholder="请选择照明灯具类型">
                                <el-option
                                    v-for="item in parameterList.lightType"
                                    :key="item.title"
                                    :label="item.title"
                                    :value="item.title"
                                />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="灯具总功率" prop="lightingPowers" label-width="100px">
                            <el-input 
                                type="number" 
                                v-model="baseInfo.lightingPowers" 
                                inputmode="numeric"
                                :step="0.1"
                            >
                            <template #append>W</template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <excel-upload
                    label="照明负荷率逐时数据"
                    prop="lightingLoadsRateDataId"
                    exportName="照明负荷率逐时数据"
                    :inputVisible="false"
                    :params="exportParams"
                    :before-export="beforeExport"
                    v-model="baseInfo.lightingLoadsRateDataId"
                    data-type="LIGHTING_LOADS_RATE"
                ></excel-upload>
                <line-title :title="`家电负荷参数`" class="m-b-20px"></line-title>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="家电总功率" prop="homeAppliancePowers" label-width="100px">
                            <el-input 
                                type="number" 
                                v-model="baseInfo.homeAppliancePowers" 
                                disabled
                            >
                            <template #append>W</template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6"><el-button type="success" plain @click="openDialog('add')">添加家电</el-button></el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="家电列表" label-width="100px">
                            <listDisplay
                                :list="applianceList"
                            >
                                <template #default="{ item }">
                                    {{ item.title }} - {{ item.power }}W - {{ item.count }}/台
                                </template>
                            </listDisplay>
                        </el-form-item>
                    </el-col>
                </el-row>
                <excel-upload
                    label="家电负荷率逐时数据"
                    prop="homeApplianceLoadsRateDataId"
                    exportName="家电负荷率逐时数据"
                    :inputVisible="false"
                    :params="exportParams"
                    :before-export="beforeExport"
                    v-model="baseInfo.homeApplianceLoadsRateDataId"
                    data-type="HOME_APPLIANCE_LOADS_RATE"
                ></excel-upload>
                <excel-upload
                    label="插座临时负荷逐时数据"
                    prop="outletTempLoadsDataId"
                    exportName="插座临时负荷逐时数据"
                    :inputVisible="false"
                    :params="exportParams"
                    :before-export="beforeExport"
                    v-model="baseInfo.outletTempLoadsDataId"
                    data-type="OUTLET_TEMP_LOADS"
                ></excel-upload>
                <line-title :title="`建筑信息可选参数`" class="m-b-20px"></line-title>
                    <el-row :gutter="20">
                        <el-col :span="6">
                            <el-form-item label="建筑高度" prop="buildingHeight" label-width="100px">
                                <el-input 
                                    type="number" 
                                    v-model="baseInfo.buildingHeight" 
                                    inputmode="numeric"
                                    :step="0.1"
                                >
                                <template #append>米</template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="建筑底面周长" prop="buildingBasePerimeter" label-width="100px">
                                <el-input 
                                    type="number" 
                                    v-model="baseInfo.buildingBasePerimeter" 
                                    inputmode="numeric"
                                    :step="0.1"
                                >
                                <template #append>米</template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="建筑底面积" prop="buildingBaseArea" label-width="100px">
                                <el-input 
                                    type="number" 
                                    v-model="baseInfo.buildingBaseArea" 
                                    inputmode="numeric"
                                    :step="0.1"
                                >
                                <template #append>㎡</template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="6">
                            <el-form-item label="建筑层数" prop="buildingStories" label-width="100px">
                                <el-input 
                                    type="number" 
                                    v-model="baseInfo.buildingStories" 
                                    inputmode="numeric"
                                    :step="1"
                                >
                                <template #append>层</template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        
                    </el-row>
            </el-form>
            <el-button type="primary" @click="submitForm" style="width: 100px;" :disabled="!currentProjectID">{{forecastResults?.values.length?'重新预测':'开始预测'}}</el-button>
            <div class="table-title">
                <div class="title">结果</div>
                <el-button v-if="forecastResults?.values.length" @click="confirmResult">导出结果</el-button>
            </div>
            <el-table :data="forecastResults?.values">
                <el-table-column type="index" label="序号" align="center" width="150px"/>
                <el-table-column prop="time" label="时间" align="center"/>
                <el-table-column prop="acLoads" label="空调负荷（kW）" align="center">
                    <template #default="{ row }">
                        {{ formatDecimal(row.acLoads) }}
                    </template>
                </el-table-column>
                <el-table-column prop="homeApplianceLoads" label="家电负荷（kW）" align="center">
                    <template #default="{ row }">
                        {{ formatDecimal(row.homeApplianceLoads) }}
                    </template>
                </el-table-column>
                <el-table-column prop="lightingLoads" label="照明负荷（kW）" align="center">
                    <template #default="{ row }">
                        {{ formatDecimal(row.lightingLoads) }}
                    </template>
                </el-table-column>
                <el-table-column prop="value" label="总负荷（kW）" align="center">
                    <template #default="{ row }">
                        {{ formatDecimal(row.value) }}
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <addApplianceDialog
            :type="dialogInfo.type"
            :data="dialogInfo.data"
            :applianceType="parameterList.applianceType"
            @close="closeDialog"
            @addAppliance ="addAppliance"
            v-if="dialogInfo.type"
            :applianceList="applianceList"
        ></addApplianceDialog>

        <updateModelDialog
            :type="modelDialogInfo.type"
            :data="modelDialogInfo.data"
            @close="closeModelDialog"
            @updateModel="updateModel"
            v-if="modelDialogInfo.type"
        ></updateModelDialog>
        <addTimeIntervalDialog
            :type="timeIntervalDialogInfo.type"
            :data="timeIntervalDialogInfo.data"
            @close="timeIntervalCloseDialog"
            :isRepeatInterval='isRepeatInterval'
            :isTimeInInterval="isTimeInInterval"
            v-if="timeIntervalDialogInfo.type"
            :selectedInterval="selectedInterval"
        ></addTimeIntervalDialog>
    </div>
</template>

<script setup lang='ts'>
    import { ref, onMounted, reactive } from 'vue'
    import { message, formatDecimal } from '~/utils/commonFun'
    import { reqLoadsForecaster } from '~/api/business/forecasting'
    import useDatas from './datas'
    import useApplianceHandle from './applianceHandle'
    import selection from './components/selection.vue'
    import listDisplay from './components/listDisplay.vue'
    import addApplianceDialog from './components/addApplianceDialog.vue'
    import updateModelDialog from './components/updateModelDialog.vue'
    import addTimeIntervalDialog from './components/addTimeIntervalDialog.vue'
    import useAddTimeIntervalDialog from './addTimeIntervalDialog'
    import useModel from './useModel'
    import acEnergy from './components/acEnergy.vue'
    import { ElMessageBox } from 'element-plus'
    import { onBeforeRouteLeave } from 'vue-router'
    import { exportExcel } from '~/utils/exportExcel'

    import type { FormInstance } from 'element-plus'


    const ruleFormRef = ref<FormInstance>()

    // 建筑预测基本数据
    const { loading, baseInfo, rules, parameterList, forecastResults, exportParams, projectOptions, currentProjectID, currentProject,applianceList, isUpdate,getProjectAll, getData } = useDatas(ruleFormRef)
    // 家电处理
    const { dialogInfo, openDialog, closeDialog, addAppliance } = useApplianceHandle(baseInfo, applianceList)
    // 模型处理
    const { modelDialogInfo, openModelDialog, closeModelDialog, updateModel} = useModel(baseInfo)
    // 制冷制热时间区间处理
    const { timeIntervalDialogInfo, timeIntervalCloseDialog, selectedInterval, isRepeatInterval, isTimeInInterval, openAddTimeIntervalDialog } = useAddTimeIntervalDialog(baseInfo)
    
    
    // 导出模板前的处理
    async function beforeExport() {
        return new Promise((resolve) => {
            if(currentProject.value?.startTime && currentProject.value?.endTime){
                resolve(true)
            }else{
                message("请选择正确的预测时间", "warning");
                resolve(false);
            }
        });
    }


    
    // 提交表单
    async function submitForm(){
        try{
            const valid = await ruleFormRef.value?.validate()
            if(!valid) return
            loading.value = true
            const data = {...baseInfo}
            data.model || (data.model = parameterList.value.ac_model)
            // return
            const res = await reqLoadsForecaster(data, currentProjectID.value)
            forecastResults.value = res.content
            isUpdate.value = true
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

    // 确认结果
    function confirmResult(){
        if(!forecastResults.value) return message('请先进行预测', 'error')
        // const header = ['时段', "空调负荷（kW）", "家电负荷（kW）", "照明负荷（kW）", "总负荷（kW）"]
        const {name, startTime, endTime, city, longitude, latitude, createAt} = currentProject.value || {}
        const projectInfo = [
            {name: '项目名称', value: name || ''},
            {name: '预测时间', value: `${startTime || ''} - ${endTime || ''}`},
            {name: '地理位置', value: `${city || ''}  ${longitude||''},${latitude || ''}`},
            {name: '项目创建时间', value: createAt || ''}
        ]
        const header = [
            {name: '时段', key: 'time'}, 
            {name: '空调负荷（kW）', key: 'acLoads'}, 
            {name: '家电负荷（kW）', key: 'homeApplianceLoads'}, 
            {name: '照明负荷（kW）', key: 'lightingLoads'},
            {name: '总负荷（kW）', key: 'value'}
        ]
        exportExcel(projectInfo ,header, forecastResults.value.values, (name || '') + '建筑负载预测结果')
    }

    onMounted(()=>{
        getData()
    })

    // 切换页面时的判断
    onBeforeRouteLeave(async ()=>{
        try{
            if(isUpdate.value) return
            await ElMessageBox.confirm(
                '尚未预测数据，是否离开？',
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
            position: absolute;
            top: 20px;
            right: 20px;
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