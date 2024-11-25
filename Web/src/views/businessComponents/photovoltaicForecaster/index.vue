<template>
    <div class="prediction-container" v-loading="loading">
        <common-title title="光伏发电预测" smallTitle="Photovoltaic power generation prediction" vertical></common-title>
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
            <el-form :model="baseInfo" ref="ruleFormRef" :rules="rules" :disabled="!currentProjectID">
                
                <line-title :title="`天气参数`" class="m-b-20px"></line-title>
                <excel-upload
                    label="天气预置数据"
                    prop="weatherDataId"
                    exportName="天气预置数据"
                    :inputVisible="false"
                    :params="exportParams"
                    :before-export="beforeExport"
                    v-model="baseInfo.weatherDataId"
                    :dicts="weatherMap"
                    data-type="WEATHER"
                ></excel-upload>

                <excel-upload
                    label="气温预置数据"
                    prop="temperatureDataId"
                    exportName="气温预置数据"
                    :inputVisible="false"
                    :params="exportParams"
                    :before-export="beforeExport"
                    v-model="baseInfo.temperatureDataId"
                    data-type="TEMPERATURE"
                ></excel-upload>
                <line-title :title="`建筑与遮挡`" class="m-b-20px"></line-title>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="光伏组件所在建筑表面反射比" prop="reflectance">
                            <el-tooltip content="取值范围：最小值：0，最大值：<1" placement="top">
                                <el-input placeholder="请输入参数" type="number" :step="0.1" v-model="baseInfo.reflectance"></el-input>
                            </el-tooltip>
                            </el-form-item>
                    </el-col>
                </el-row>
                <excel-upload
                    label="遮挡面积比例预置数据"
                    prop="shadedAreaDataId"
                    exportName="遮挡面积比例预置数据"
                    :inputVisible="false"
                    :params="exportParams"
                    :before-export="beforeExport"
                    v-model="baseInfo.shadedAreaDataId"
                    data-type="SHADED_AREA_RATIO"
                ></excel-upload>
                <line-title :title="`光伏系统参数`" class="m-b-20px"></line-title>
                <div style="display: flex;">
                    <el-form-item label="光伏组件类型" prop="pvModuleType">
                        <el-radio-group v-model="baseInfo.pvModuleType">
                            <el-radio v-for="item in pvModuleTypeOptions" :value="item.value">{{ item.label }}</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="" prop="pvModuleType" label-width="20px" v-show="baseInfo.pvModuleType == 'OTHER'">
                        <el-input placeholder="请输入光伏组件类型" v-model="baseInfo.pvModuleName"></el-input>
                    </el-form-item>
                </div>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="光伏组件安装面积" prop="effectiveArea"  label-width="210px" label-position="left">
                            <el-input placeholder="请输入参数" type="number" inputmode="numeric" :step="0.1" v-model="baseInfo.effectiveArea">
                                <template #append>㎡</template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    
                    <el-col :span="8">
                        <el-form-item label="光伏系统建成时间" prop="systemBuildTime"  label-width="210px" label-position="left">
                            <el-date-picker
                                v-model="baseInfo.systemBuildTime"
                                type="month"
                                placeholder="请选择光伏系统建成时间"
                                value-format="YYYY-MM-DD HH:mm:ss"
                            />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="光伏组件安装倾角" prop="pvAngle"  label-width="210px" label-position="left">
                            <el-tooltip content="取值范围：最小值：0°，最大值：90°" placement="top">
                                <el-input placeholder="请输入参数" type="number" :step="1" v-model="baseInfo.pvAngle">
                                    <template #append>°</template>
                                </el-input>
                            </el-tooltip>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="光伏组件安装方位角" prop="pvAzimuth"  label-width="210px" label-position="left">
                            <el-tooltip content="取值范围：最小值：-90°，最大值：90°" placement="top">
                                <el-input placeholder="请输入参数" type="number" :step="1" v-model="baseInfo.pvAzimuth">
                                    <template #append>°</template>
                                </el-input>
                            </el-tooltip>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="光伏组件光电转换效率" prop="conversionEfficiency"  label-width="210px" label-position="left">
                            <el-tooltip content="取值范围：最小值：0%，最大值：<30%" placement="top">
                                <el-input placeholder="请输入参数" type="number" :step="0.01" v-model="baseInfo.conversionEfficiency">
                                    <template #append>%</template>
                                </el-input>
                            </el-tooltip>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="光伏组件额定运行温度" prop="operatingTemperature"  label-width="210px" label-position="left">
                            <el-tooltip content="取值范围：最小值：40℃，最大值：50℃" placement="top">
                                <el-input placeholder="请输入参数" type="number" :step="0.1" v-model="baseInfo.operatingTemperature">
                                    <template #append>℃</template>
                                </el-input>
                            </el-tooltip>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="光伏组件温度系数" prop="temperatureCoefficient"  label-width="210px" label-position="left">
                            <el-tooltip content="取值范围：最小值：0，最大值：<0.01" placement="top">
                                <el-input placeholder="请输入参数" type="number" :step="0.001" v-model="baseInfo.temperatureCoefficient">
                                    
                                </el-input>
                            </el-tooltip>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="太阳能电池功率衰减率" prop="attenuationRate"  label-width="210px" label-position="left">
                            <el-tooltip content="取值范围：最小值：0%，最大值：<100%" placement="top">
                                <el-input placeholder="请输入参数" type="number" :step="0.1" v-model="baseInfo.attenuationRate">
                                    <template #append>%</template>
                                </el-input>
                            </el-tooltip>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="直流回路线路损失修正系数K1" prop="dcCorrectionFactor"  label-width="210px" label-position="left">
                            <el-tooltip content="取值范围：最小值：0.8，最大值：<1" placement="top">
                                <el-input placeholder="请输入参数" type="number" :step="0.01" v-model="baseInfo.dcCorrectionFactor"></el-input>
                            </el-tooltip>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="交流回路线路损失修正系数K2" prop="acCorrectionFactor"  label-width="210px" label-position="left">
                            <el-tooltip content="取值范围：最小值：0.8，最大值：<1" placement="top">
                                <el-input placeholder="请输入参数" type="number" :step="0.01" v-model="baseInfo.acCorrectionFactor"></el-input>
                            </el-tooltip>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="光伏阵列失配损失修正系数K3" prop="pvArrayCorrectionFactor"  label-width="210px" label-position="left">
                            <el-tooltip content="取值范围：最小值：0.8，最大值：<1" placement="top">
                                <el-input placeholder="请输入参数" type="number" :step="0.01" v-model="baseInfo.pvArrayCorrectionFactor"></el-input>
                            </el-tooltip>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="尘埃遮挡损失修正系数K4" prop="dustMaskingCorrectionFactor"  label-width="210px" label-position="left">
                            <el-tooltip content="取值范围：最小值：0.8，最大值：<1" placement="top">
                                <el-input placeholder="请输入参数" type="number" :step="0.01" v-model="baseInfo.dustMaskingCorrectionFactor"></el-input>
                            </el-tooltip>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="逆变器转换效率" prop="inverterConversionEfficiency"  label-width="210px" label-position="left">
                            <el-tooltip content="取值范围：最小值：80%，最大值：<100%" placement="top">
                                <el-input placeholder="请输入参数" type="number" :step="0.01" v-model="baseInfo.inverterConversionEfficiency">
                                    <template #append>%</template>
                                </el-input>
                            </el-tooltip>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>

            <el-button type="primary" @click="submitForm" style="width: 100px;" :disabled="!currentProjectID">{{forecastResults?.values.length?'重新预测':'开始预测'}}</el-button>

            <div class="table-title">
                <div class="title">结果</div>
                <el-button v-if="forecastResults?.values.length" @click="confirmResult">导出数据</el-button>
            </div>
            <el-table :data="forecastResults?.values">
                <el-table-column type="index" label="序号" align="center" width="150px"/>
                <el-table-column prop="time" label="时间" align="center"/>
                <el-table-column prop="dcPower" label="逐时直流发电量（kWh）" align="center">
                    <template #default="{ row }">
                        {{ formatDecimal(row.dcPower) }}
                    </template>
                </el-table-column>
                <el-table-column prop="value" label="逐时交流发电量（kWh）" align="center">
                    <template #default="{ row }">
                        {{ formatDecimal(row.value) }}
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script setup lang='ts'>
    import { ref, onMounted, reactive } from 'vue'
    import { message ,formatDecimal } from '~/utils/commonFun'
    import { reqPhotovoltaicPrediction } from '~/api/business/forecasting'
    import useDatas from './datas'
    import { ElMessageBox } from 'element-plus'
    import { onBeforeRouteLeave } from 'vue-router'
    import { exportExcel } from '~/utils/exportExcel'

    import type { FormInstance } from 'element-plus'

    const ruleFormRef = ref<FormInstance>()
    
    // 表单数据、表单验证规则、等
    const { forecastResults, pvModuleTypeOptions, baseInfo, rules, loading, weatherMap, projectOptions, currentProjectID, currentProject, exportParams, isUpdate,getDate, getProjectAll } = useDatas(ruleFormRef)


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
            data.attenuationRate = data.attenuationRate / 100;
            data.conversionEfficiency = data.conversionEfficiency / 100;
            data.inverterConversionEfficiency = data.inverterConversionEfficiency / 100;
            // return
            const res = await reqPhotovoltaicPrediction(data, currentProjectID.value)
            forecastResults.value = res.content
            isUpdate.value = true
            getProjectAll()
        }catch(e:any){
            if(e.code){
                message(e.code + ': ' + e.message, 'error')
            }else{
                message('请先完成数据填写', 'error')
                console.log(e)
            }
        }finally{
            loading.value = false
        }
    }

    // 确认结果
    function confirmResult(){
        if(!forecastResults.value) return message('请先进行预测', 'error')
        // const header = ['时段', '逐时直流发电量（kW）', "逐时交流发电量（kW）"]
        const {name, startTime, endTime, city, longitude, latitude, createAt} = currentProject.value || {}
        const projectInfo = [
            {name: '项目名称', value: name || ''},
            {name: '预测时间', value: `${startTime || ''} - ${endTime || ''}`},
            {name: '地理位置', value: `${city || ''}  ${longitude||''},${latitude || ''}`},
            {name: '项目创建时间', value: createAt || ''}
        ]
        const header = [
            {name: '时段', key: 'time'},
            {name: '逐时直流发电量（kWh）', key: 'dcPower'},
            {name: '逐时交流发电量（kWh）', key: 'value'},
        ]
        exportExcel(projectInfo,header, forecastResults.value.values, (name||'')+'光伏发电预测结果')
    }

    onMounted(()=>{
        getDate()
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
            display: flex;
            justify-content: space-between;
            align-items: center;
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