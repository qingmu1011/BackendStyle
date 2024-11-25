<template>
    <base-edit-form
        title="模型"
        subTitle="Scene Define"
        labelWidth="110"
        :width="1200"
        :type="props.type"
        :formData="BaseInfo"
        :rules="rules"
        :loading="loading"
        :disabled="props.type === 'details'"
        :cancel="closeClusterDialog"
        :submit="saveCluster"
        top="10px"
    >
        <template #form>
            <div class="dialog-box">
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="模型分界温度" size="default" prop="model_division_point">
                            <el-input 
                                v-model="BaseInfo.model_division_point" 
                                type="number" 
                                class="no-spin"
                                :step="1"
                            ></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="16">
                        <el-form-item label="模型公式" style="margin-left: 70px;">
                            <img src="../../../../assets/formula.png" alt="">
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-collapse v-model="activeNames">
                    <el-collapse-item title="制热工况系数参数" name="1">
                        <el-row :gutter="20">
                            <el-col :span="8">
                                <el-form-item label="截距项" size="default" :validate-status="validateInfo.heating_intercept.status" :error="validateInfo.heating_intercept.error">
                                    <el-input 
                                        v-model="BaseInfo.heating_condition.intercept" 
                                        type="number" :step="0.0000001" class="no-spin"
                                        @blur="checkHeatingIntercept"
                                    ></el-input>
                                </el-form-item>
                            </el-col>
                            
                        </el-row>
                        <el-form-item label="一次项系数" size="default" :validate-status="validateInfo.heating_linear.status" :error="validateInfo.heating_linear.error">
                            <div class="input-box">
                                <template v-for="(item,index) in BaseInfo.heating_condition.linear" >
                                    <el-input v-model="BaseInfo.heating_condition.linear[index]" type="number" :step="0.0000001" class="no-spin" @blur="checkHeatingLinear"></el-input>
                                </template>
                            </div>
                        </el-form-item>
                        <el-form-item label="二次项系数" size="default" :validate-status="validateInfo.heating_quadratic.status" :error="validateInfo.heating_quadratic.error">
                            <div class="input-box">
                                <template v-for="(item, index) in BaseInfo.heating_condition.quadratic" >
                                    <el-input v-model="BaseInfo.heating_condition.quadratic[index]" type="number" :step="0.0000001" class="no-spin" @blur="checkHeatingQuadratic"></el-input>
                                </template>
                            </div>
                        </el-form-item>
                        <el-form-item label="交叉系数" size="default" :validate-status="validateInfo.heating_cross.status" :error="validateInfo.heating_cross.error">
                            <div class="crossing-box">
                                <div class="left">
                                    <div class="row-title-box">
                                        <div class="row-title" v-for="rowItem in 12">Ki{{ rowItem }}</div>
                                    </div>
                                    <template v-for="(item1, index1) in BaseInfo.heating_condition.cross">
                                        <div class="input-box">
                                            <template v-for="(item2, index2) in item1">
                                                <el-input 
                                                    type="number" 
                                                    :step="0.0000001" 
                                                    class="no-spin" 
                                                    v-model="item1[index2]" 
                                                    style="width: 75px;" 
                                                    :disabled="isDisabled(index1, index2)"
                                                    @blur="checkHeatingCross()"
                                                ></el-input>
                                            </template>
                                        </div>
                                    </template>
                                </div>
                                <div class="col-title-box">
                                    <div class="col-title" v-for="colItem in 12">K{{ colItem }}j</div>
                                </div>
                            </div>
                        </el-form-item>
                    </el-collapse-item>
                    <el-collapse-item title="制冷工况系数参数" name="2">
                        <el-row :gutter="20">
                            <el-col :span="8">
                                <el-form-item label="截距项" size="default" :validate-status="validateInfo.cooling_intercept.status" :error="validateInfo.cooling_intercept.error">
                                    <el-input 
                                        v-model="BaseInfo.cooling_condition.intercept" 
                                        type="number" 
                                        :step="0.0000001" class="no-spin"
                                        @blur="checkCoolingIntercept"
                                    ></el-input>
                                </el-form-item>
                            </el-col>
                            
                        </el-row>
                        <el-form-item label="一次项系数" size="default" :validate-status="validateInfo.cooling_linear.status" :error="validateInfo.cooling_linear.error">
                            <div class="input-box">
                                <template v-for="(item,index) in BaseInfo.cooling_condition.linear">
                                    <el-input v-model="BaseInfo.cooling_condition.linear[index]" type="number" :step="0.0000001" class="no-spin" @blur="checkCoolingLinear"></el-input>
                                </template>
                            </div>
                        </el-form-item>
                        <el-form-item label="二次项系数" size="default" :validate-status="validateInfo.cooling_quadratic.status" :error="validateInfo.cooling_quadratic.error">
                            <div class="input-box">
                                <template v-for="(item, index) in BaseInfo.cooling_condition.quadratic">
                                    <el-input v-model="BaseInfo.cooling_condition.quadratic[index]" type="number" :step="0.0000001" class="no-spin" @blur="checkCoolingQuadratic"></el-input>
                                </template>
                            </div>
                        </el-form-item>
                        <el-form-item label="交叉系数" size="default" :validate-status="validateInfo.cooling_cross.status" :error="validateInfo.cooling_cross.error">
                            <div class="crossing-box">
                                <div class="left">
                                    <div class="row-title-box">
                                        <div class="row-title" v-for="rowItem in 12">Ki{{ rowItem }}</div>
                                    </div>
                                    <template v-for="(item1, index1) in BaseInfo.cooling_condition.cross">
                                        <div class="input-box">
                                            <template v-for="(item2, index2) in item1">
                                                <el-input 
                                                    type="number" 
                                                    :step="0.0000001" 
                                                    class="no-spin" 
                                                    v-model="item1[index2]" 
                                                    :disabled="isDisabled(index1, index2)" 
                                                    style="width: 75px;"
                                                    @blur="checkCoolingCross()"
                                                ></el-input>
                                            </template>
                                        </div>
                                    </template>
                                </div>
                                <div class="col-title-box">
                                    <div class="col-title"  v-for="colItem in 12">K{{ colItem }}j</div>
                                </div>
                            </div>
                        </el-form-item>
                    </el-collapse-item>
                    
                </el-collapse>
            </div>
        </template>
    </base-edit-form>
</template>

<script setup lang='ts'>
    import { ref, reactive, computed, onMounted } from 'vue'

    import type { AcModelType } from '~/types/loadsForecaster'
import { message } from '~/utils/commonFun'

    interface Props {
        type: 'add' | 'edit' | 'details' | 'copy',
        data?: AcModelType,
    }
    type ValidateStatus = '' | 'error' | 'validating' | 'success'
    interface ValidateInfo {
        heating_intercept: {error: string, status: ValidateStatus}
        heating_linear: {error: string, status: ValidateStatus}
        heating_quadratic: {error: string, status: ValidateStatus}
        heating_cross: {error: string, status: ValidateStatus}
        cooling_intercept: {error: string, status: ValidateStatus}
        cooling_linear: {error: string, status: ValidateStatus}
        cooling_quadratic: {error: string, status: ValidateStatus}
        cooling_cross: {error: string, status: ValidateStatus}
    }

    const activeNames = ref(['1', '2'])

    const loading = ref(false)

    const emits = defineEmits(["close", 'updateModel']);

    const props = withDefaults(defineProps<Props>(), {})

    function closeClusterDialog(){
        emits("close")
    }

    // 基础数据
    const BaseInfo = ref<AcModelType>({
        model_division_point: 0,
        heating_condition:{
            terms: 12,
            intercept: 0,
            linear: [],
            quadratic: [],
            cross:[[],[],[],[],[],[],[],[],[],[],[],[]]
        },
        cooling_condition:{
            terms: 12,
            intercept: 0,
            linear: [],
            quadratic: [],
            cross:[[],[],[],[],[],[],[],[],[],[],[],[]]
        }
    })
    const rules = {
        model_division_point: [
            { trigger: 'blur', message: '模型分界温度', required: true }
        ]
    }

    // 验证信息
    const validateInfo = reactive<ValidateInfo>({
        heating_intercept: {error: '', status: ''},
        heating_linear: {error: '', status: ''},
        heating_quadratic: {error: '', status: ''},
        heating_cross: {error: '', status: ''},
        cooling_linear: {error: '', status: ''},
        cooling_intercept: {error: '', status: ''},
        cooling_quadratic: {error: '', status: ''},
        cooling_cross: {error: '', status: ''},
    })


    // 计算禁用
    function isDisabled(item1: number, item2: number){
        return item1 >= item2 
    }

    // 验证一个值是否为数字
    function checkNum(num:any){
        return num === '' || isNaN(Number(num))
    }

    function setStatusAndError(obj:{error: string, status: ValidateStatus}, bool: boolean){
        obj.error = bool ? '不能为空或非数字' : ''
        obj.status = bool ? 'error' : ''
    }

    // 验证数组值是否为数字
    function checkArrValueIsNum(arr:number[], callback:(index?:number)=>void){
        for(let i = 0; i < arr.length; i++){
            if(checkNum(arr[i])){
                callback(i)
                return false
            }
        }
        callback()
        return true
    }
    // 设置一维数组状态和错误信息
    function setArrStatusAndError(obj:{error: string, status: ValidateStatus}, index?: number){
        obj.error = index === undefined ? '' : `第${index+1}项不能为空或非数字`
        obj.status = index === undefined ? '' : 'error'
    }

    // 验证二维数组值是否为数字
    function checkTwoArrValueIsNum(arr:any[], callback:(rowIndex?:number, colIndex?:number)=>void){
        for(let i = 0; i < arr.length; i++){
            for(let j = 0; j < arr[i].length; j++){
                if(checkNum(arr[i][j])){
                    callback(i, j)
                    return false
                }
            }
        }
        callback()
        return true
    }

    // 设置二维数组状态和错误信息
    function setTwoArrStatusAndError(obj:{error: string, status: ValidateStatus}, rowIndex?:number, colIndex?:number){
        const statu = rowIndex === undefined && colIndex === undefined
        // @ts-ignore
        obj.error = statu ? '' : `K${rowIndex+1}${colIndex+1}项不能为空或非数字`
        obj.status = statu ? '' : 'error'
    }



    // 验证制冷工况的截距
    function checkCoolingIntercept(){
        const res = checkNum(BaseInfo.value.cooling_condition.intercept)
        setStatusAndError(validateInfo.cooling_intercept, res)
        return !res
    }

    // 验证制冷工况的第一次项系数
    function checkCoolingLinear(){
        return checkArrValueIsNum(BaseInfo.value.cooling_condition.linear, (index?:number)=>{
            setArrStatusAndError(validateInfo.cooling_linear, index)
        })
    }

    // 验证制冷工况的第二次项系数
    function checkCoolingQuadratic(){
        return checkArrValueIsNum(BaseInfo.value.cooling_condition.quadratic, (index?:number)=>{
            setArrStatusAndError(validateInfo.cooling_quadratic, index)
        })
    }

    // 验证制冷交叉项系数
    function checkCoolingCross(){
        return checkTwoArrValueIsNum(BaseInfo.value.cooling_condition.cross, (rowIndex?:number, colIndex?:number)=>{
            setTwoArrStatusAndError(validateInfo.cooling_cross, rowIndex, colIndex)
        })
    }

    // 验证制热工况的截距
    function checkHeatingIntercept(){
        const res = checkNum(BaseInfo.value.heating_condition.intercept)
        setStatusAndError(validateInfo.heating_intercept, res)
        return !res
    }

    // 验证制热工况的第一次项系数
    function checkHeatingLinear(){
        return checkArrValueIsNum(BaseInfo.value.heating_condition.linear, (index?:number)=>{
            setArrStatusAndError(validateInfo.heating_linear, index)
        })
    }

    // 验证制热工况的第二次项系数
    function checkHeatingQuadratic(){
        return checkArrValueIsNum(BaseInfo.value.heating_condition.quadratic, (index?:number)=>{
            setArrStatusAndError(validateInfo.heating_quadratic, index)
        })
    }

    // 验证制热交叉项系数
    function checkHeatingCross(){
        return checkTwoArrValueIsNum(BaseInfo.value.heating_condition.cross, (rowIndex?:number, colIndex?:number)=>{
            setTwoArrStatusAndError(validateInfo.heating_cross, rowIndex, colIndex)
        })
    }


    // 保存按钮
    function saveCluster(callback:()=>void){
        try{
            const valid = [
                checkCoolingIntercept(),
                checkCoolingLinear(), 
                checkCoolingQuadratic(),
                checkCoolingCross(),
                checkHeatingIntercept(),
                checkHeatingLinear(),
                checkHeatingQuadratic(),
                checkHeatingCross()
            ].every(item=>item)
            if(!valid) return message('值错误，请检查输入', 'error')
            emits('updateModel', BaseInfo.value)
            emits("close")
        }catch(e){
            message('值错误，请检查输入', 'error')
        }finally{
            callback()
        }
        
    }

    onMounted(()=>{
        props.data && (BaseInfo.value = props.data)
    })

</script>

<style lang='scss' scoped>
    
    .dialog-box{
        height: 70vh;
        overflow-y: scroll;
        overflow-x: auto;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE 10+ */
        &::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
        }
        img{
            height: 50px;
        }
        .input-box{
            display: flex;
            gap: 5px;
            margin-bottom: 5px;
        }
        .col-title{
            width: 25px;
        }
        .crossing-box{
            display: flex;
            .left{
                .row-title-box{
                    display: flex;
                    width: 100%;
                    .row-title{
                        width: 75px;
                        margin-right: 5px;
                        text-align: center;
                        font-weight: bold;
                        color: var(--el-text-color-regular);
                    }
                }
            }
            .col-title-box {
                width: 35px;
                padding-top: 32px;
                .col-title{
                    width: 38px;
                    height: 32px;
                    margin-bottom: 5px;
                    font-weight: bold;
                    padding-left: 5px;
                    color: var(--el-text-color-regular);
                }
            }
        }
    }

    .no-spin {
        :deep(input) {
            &::-webkit-outer-spin-button,
            &::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            &[type=number] {
                -moz-appearance: textfield;
                appearance: textfield;
            }
        }
    }
</style>