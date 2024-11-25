<template>
  <el-container class="common-layout">
    <el-aside width="240px" class="common-aside">
      <Menu></Menu>
    </el-aside>
    <el-container>
      <el-main class="common-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component"></component>
          </transition>
        </router-view>
        <el-header class="common-header"><Header></Header></el-header>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import "animate.css";
</script>

<style scoped lang="scss">
.common-layout {
  height: 100%;
  background-color: var(--el-bg-color-page);
  padding: 20px;
  .common-aside {
    border-radius: 20px;
    // border-right: 1px solid var(--el-border-color-light);
    // padding: 0 20px;
    background: var(--el-bg-color);
  }
  
  .common-main {
    // background-color: var(--el-bg-color-page);
    overflow-x: hidden;
    position: relative;
    padding: 0;
    margin-left: 25px;
    .common-header {
      padding: 0;
      position: absolute;
      top: 0;
      // border-bottom: 1px solid var(--el-border-color-light);
      // background: var(--el-bg-color);
      width: 100%;
      background-image: radial-gradient(transparent 1px,var(--el-bg-color-page) 1px);
      background-size: 4px 4px;
      backdrop-filter: saturate(50%) blur(4px);
    }
  }
  .el-scrollbar {
    background-color: var(--el-bg-color-page);
  }
}

.fade-enter-from,
.fade-leave-to,
.appear-from {
  opacity: 0;
  transform: translateX(30px);
}
.fade-enter-active,
.fade-leave-active,
.appear-active {
  transition: all 0.3s;
}
</style>
