<template>
    <div class="common-title-container">
        <span :class="[vertical?'vertical':'']">{{ title }}<i class="iconfont" :class="icon"></i></span>
        <span v-show="smallTitle">{{ smallTitle }}</span>
    </div>
</template>

<script setup lang='ts'>
    import { defineProps } from 'vue'
    
    const props = defineProps({
        title: {
            type: String,
            default: ''
        },
        smallTitle: {
            type: String,
            default: ''
        },
        icon: {
            type: String,
            default: ''
        },
        vertical: {
            type: Boolean,
            default: false
        },
        fs:{
            type: String,
            default: '20px'
        }
    })
</script>

<style lang='scss' scoped>
    .common-title-container {
        display: flex;
        flex-direction: column;
        
        margin-bottom: 20px;
        & span:nth-child(1){
            font-size: v-bind(fs);
            font-weight: bold;
            .iconfont{
                font-size: v-bind(fs);
                margin-left: 10px;
                font-weight: normal;
            }

            &.vertical::before{
                content: '';
                display: inline-block;
                width: 4px;
                height: 20px;
                background-color: var(--el-color-primary);
                margin-right: 10px;
                transform: translate(2px, 3px);
            }
        }
        
        & span:nth-child(2){
            font-size: 12px;
            margin-top: 4px;
            color: var(--el-text-color-secondary);
        }
    }
</style>