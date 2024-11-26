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
            <div style="width: 200px; height: 200px;" v-for="item in 50">这是一条信息{{ item }}</div>
        </div>
    </div>
</template>

<script setup lang='ts'>
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
        .body{
            display: flex;
            flex-wrap: wrap;
            div{
                background-color: antiquewhite;
                display: flex;
                justify-content: center;
                align-items: center;
            }
        }
    }
</style>