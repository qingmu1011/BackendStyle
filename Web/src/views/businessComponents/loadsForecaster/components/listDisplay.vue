<template>
    <div class="applianceList-container">
        <div class="placeholder" v-if="props.list.length === 0">暂无内容</div>
        <template v-else>
            <el-tag
                v-for="(item, index) in props.list"
                type='primary'
                style="margin-left: 8px;"
                :closable="props.closable"
                @close="deleteItem(index)"
                
            ><slot :item="item"></slot></el-tag>
        </template>
    </div>
</template>

<script setup lang='ts'>

    interface Props {
        list: any[],
        closable?: boolean
    }

    const props = withDefaults(defineProps<Props>(), {
        closable: true
    })

    function deleteItem(index: number) {
        props.list.splice(index, 1);
    }
    
</script>

<style lang='scss' scoped>
    .applianceList-container{
        width: 100%;
        border-radius: var(--el-border-radius-base);
        border: var(--el-border);
        min-height: 32px;
        &:hover{
            border-color: var(--el-border-color-hover);
        }
        .placeholder{
            color: var(--el-text-color-placeholder);
            font-size: 14px;
            margin-left: 10px;
        }
    }
</style>