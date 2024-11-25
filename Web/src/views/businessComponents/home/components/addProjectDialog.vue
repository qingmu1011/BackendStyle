<template>
    <base-edit-form
        title="项目"
        subTitle="Project"
        labelWidth="110"
        :width="550"
        :type="props.type"
        :formData="baseInfo"
        :rules="rules"
        :loading="loading"
        :disabled="props.type === 'details'"
        :cancel="closeClusterDialog"
        :submit="saveCluster"
    >
        <template #form>
            <el-form-item label="项目名称" prop="name">
                <el-input v-model="baseInfo.name" placeholder="请输入项目名称"/>
            </el-form-item>
            <el-form-item label="描述">
                <el-input v-model="baseInfo.comment" type="textarea" :rows="3" placeholder="请输入描述"/>
            </el-form-item>
            <el-form-item label="预测时间" prop="date">
                <template #label>
                    <span>预测时间</span>
                    <el-tooltip
                        content="最大预测时间范围不大于7天,预测时间间隔为1小时"
                        placement="top-end"
                        effect="light"
                    >
                        <span class="ml-5px"
                            ><el-icon><Warning /></el-icon
                        ></span>
                    </el-tooltip>
                </template>

                <el-date-picker
                    v-model="baseInfo.date"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    format="YYYY-MM-DD HH:mm"
                    date-format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    time-format="HH:mm"
                    :disabled-date="pickerOptions"
                    @calendar-change="dateChange"
                    @visible-change="visibleChange"
                    popper-class="gray-bg-timer"
                    :disabled="props.type ==='details' || props.type ==='edit'"
                />
            </el-form-item>
            <el-form-item label="地区" prop="city">
                <el-select
                    v-model="baseInfo.city"
                    filterable
                    default-first-option
                    :reserve-keyword="false"
                    placeholder="请选择地区"
                    @change="addressChange"
                    :disabled="props.type === 'copy'"
                >
                    <el-option
                        v-for="item in geographicOptions"
                        :label="item.title"
                        :value="item.title"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="地理纬度" prop="latitude">
                <el-input placeholder="请输入纬度" disabled v-model="baseInfo.latitude"></el-input>
            </el-form-item>
            <el-form-item label="地理经度" prop="longitude">
                <el-input placeholder="请输入经度" disabled v-model="baseInfo.longitude"></el-input>
            </el-form-item>
        </template>
    </base-edit-form>
</template>

<script setup lang='ts'>
    import { ref, reactive, onMounted, computed } from 'vue'
    import { message } from "~/utils/commonFun";
    import { reqGetGeographic } from '~/api/business/forecasting'
    import { Warning } from "@element-plus/icons-vue";
    import { reqCreateProject, reqUpdateProject, reqCopyProject} from '~/api/business/project'

    import type { FormRules } from 'element-plus';


    interface Props {
        type: 'add' | 'edit' | 'details' | 'copy',
        data?: any,
    }

    const loading = ref(false)

    const emits = defineEmits(["close"]);

    const props = withDefaults(defineProps<Props>(), {})

    // 地区数据
    const geographicOptions = ref<any[]>([])

    function closeClusterDialog(){
        emits("close")
    }

    // 基础数据
    const baseInfo = reactive<any>({
        name: '',
        comment: '',
        startTime: '',
        endTime: '',
        duration: 'PT1H',
        city: '',
        latitude: 0,
        longitude: 0,
        date: ['', '']
    })
    
    // 表单校验规则
    const rules = reactive<FormRules<typeof baseInfo>>({
        name: [{ trigger: 'blur', message: '请填写项目名称', required: true }],
        city: [{ trigger: 'blur', message: '请选择地区', required: true }],
        latitude: [{ trigger: 'blur', message: '请填写纬度', required: true }],
        longitude: [{ trigger: 'blur', message: '请填写经度', required: true }],
        date: [
            { trigger: 'blur', message: '请选择日期范围', required: true },
            { validator: dateValidator, trigger: 'change' }
        ]
    })
    // 日期校验
    function dateValidator(rule: any, value: any, callback: any) {
        if (value[0] && value[1]) {
            callback();
        } else {
            callback(new Error('请选择日期范围'));
        }
    }



    /** 日期选择器禁用选项*/
    const firstDate = ref(0);
    const pickerOptions = (time: Date) => {
        if (firstDate.value) {
            const minTime = (firstDate.value) - 24 * 60 * 60 * 1000 * 8;
            const maxTime = firstDate.value + 24 * 60 * 60 * 1000 * 7;
            return time.getTime() <= minTime || time.getTime() > maxTime;
        }
        return false;
    };

    /**
     * 日期选择器变化
     */
    const dateChange = (val: any) => {
        firstDate.value = val[0].getTime();
        if (val[1]) firstDate.value = 0;
    };

    /**
     * 时间选择器展开/收起需要重置firstDate
     */
    function visibleChange() {
        firstDate.value = 0;
    }

    // 获取地理位置信息
    async function getGeographicOptions() {
        try{
            loading.value = true
            const res = await reqGetGeographic()
            geographicOptions.value = res.content.location
        }catch(e){
            message('获取地理位置信息失败', 'error')
        }finally {
            loading.value = false
        }
    }

    // 选择地区后，设置经纬度
    function addressChange(val:string){
        const geographic = geographicOptions.value.find(item=> item.title === val)
        baseInfo.latitude = geographic?.latitude || 0
        baseInfo.longitude = geographic?.longitude || 0
    }


    // 保存按钮
    async function saveCluster(callback:()=>void){
        if(props.type === 'details') return
        try{
            const data = {...baseInfo}
            delete data.date
            // 新增/修改/复制
            
            if(props.type === 'add'){
                data.startTime = baseInfo.date![0]
                data.endTime = baseInfo.date![1]
                await reqCreateProject(data)
            }else if(props.type === 'edit'){
                // @ts-ignore
                delete data.duration
                // @ts-ignore
                delete data.startTime
                // @ts-ignore
                delete data.endTime
                await reqUpdateProject(data, props.data!.id)
            }else {
                data.duration = 'PT1H'
                data.startTime = baseInfo.date![0]
                data.endTime = baseInfo.date![1]
                await reqCopyProject(data, props.data!.id)
            }
            message('保存成功')
            emits("close", true)
        }catch(e:any){
            message('保存失败', 'error')
        }finally{
            callback()
        }
    }



    onMounted(()=>{
        // if(props.type !== 'add' && props.data){
        //     Object.keys(baseInfo).forEach((key)=>{
        //         // @ts-ignore
        //         baseInfo[key] = props.data[key]
        //     })
        //     baseInfo.date = [props.data.startTime, props.data.endTime]
        // }
        // if(props.type !== 'copy'){
        //     getGeographicOptions()
        // }
    })
</script>

<style lang='scss' scoped>
    
</style>