<template>
    <div class="body-container">
        <div class="header">
            <div class="left">
                <div class="title-box">
                    <div class="back">
                        <i class="iconfont icon-return"></i>返回
                    </div>
                    <div class="title">首页</div>
                </div>
            </div>
            <div class="right">
                <el-button type="primary">添加任务</el-button>
            </div>
        </div>
        <div class="body">
            <!-- <div style="width: 200px; height: 200px;" v-for="item in 50">这是一条信息{{ item }}</div> -->
            <div class="flex-box">
                <div class="base-card">
                    <div style="height: 150px; display: flex; align-items: center;">
                        <el-button>Button</el-button>
                        <el-button type="primary">Button</el-button>
                        <el-button type="success">Button</el-button>
                        <el-button type="info">Button</el-button>
                        <el-button type="warning">Button</el-button>
                        <el-button type="danger">Button</el-button>
                    </div>
                </div>
                <div class="flex-box">
                    <div class="base-card">
                        <el-dropdown trigger="click">
                            <span class="el-dropdown-link">
                                <el-button>Dropdown</el-button>
                            </span>
                            <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item>Action 1</el-dropdown-item>
                                <el-dropdown-item>Action 2</el-dropdown-item>
                                <el-dropdown-item>Action</el-dropdown-item>
                                <el-dropdown-item disabled>Action 4</el-dropdown-item>
                                <el-dropdown-item divided>Action 5</el-dropdown-item>
                            </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                    <div class="base-card">
                        <el-button @click="()=>{show = !show}">我要弹窗</el-button>
                    </div>
                </div>
            </div>
        </div>
        <el-dialog
            v-model="show"
        ></el-dialog>
    </div>
</template>

<script setup lang='ts'>
    import { ref } from 'vue'
    const show = ref(false)

</script>

<style lang='scss' scoped>
    .body-container{
        display: flex;
        flex-direction: column;
        .header{
            display: flex;
            justify-content: space-between;
            align-items: end;
            margin-bottom: 20px;
            .left {
                display: flex;
                .title-box {
                    display: flex;
                    flex-direction: column;
                    .back {
                        font-size: 14px;
                        cursor: pointer;
                        color: var(--el-color-primary);
                        transition: all 0.3s;
                        .iconfont {
                            margin-right: 5px;
                        }
                        &:hover{
                            color: var(--el-color-primary-light-5);
                        }
                    }
                    .title{
                        margin-top: 5px;
                        font-size: 24px;
                    }
                }
            }
        }

        .flex-box{
            flex: 1;
            display: flex;
            justify-content: space-between;
            gap: 20px;
        }

        .base-card{
            flex: 1;
            background: var(--el-bg-color);
            padding: 35px 20px;
            border-radius: var(--el-border-radius-round);
            display: flex;
            justify-content: center;
            align-items: center;
        }
        // .body{

        // }
    }
</style>