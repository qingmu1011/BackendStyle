<script setup lang="ts">
import { ref, computed, watch, reactive, getCurrentInstance } from "vue";
import { usePermissionStoreHook } from "~/store/modules/permission";
import { storeToRefs } from "pinia";
import { router } from "~/router";
import { useRoute } from "vue-router";

const route = useRoute();

const isCollapse = ref(false);
const config = getCurrentInstance()?.appContext.config.globalProperties.$config;

usePermissionStoreHook().handleWholeMenus([]);
//功能菜单
const { wholeMenus, firstSelected } = storeToRefs(usePermissionStoreHook());
//子菜单
const menus = computed(() => {
  const menu = wholeMenus.value.find((c: any) => c.path == "/");
  menu.children.forEach((c: any) => {
    if (c.path.includes("/:")) {
      c.path = c.path.split("/:")[0];
    }
  });
  return menu?.children || [];
});

const activePath = computed(() => {
  const path = route.path.split(route.name)[0] + route.name;
  return path;
});
</script>
<template>
  <div class="menu-container">
    <div class="logo">
      <div class="logo-icon">
        LOGO
      </div>
    </div>
    <el-scrollbar>
      <el-menu
      class="el-menu-vertical-demo"
      :collapse="isCollapse"
      :router="true"
      :default-active="activePath"
    >
      <template v-for="menu in menus">
        <el-menu-item
          v-if="!menu.children || menu.children.length === 0"
          :index="menu.path"
          :key="menu.path"
        >
          <template #title>
            <i :class="['iconfont', 'meun-icon', menu.meta?.icon]"></i
            >{{ menu.meta?.title }}</template
          >
        </el-menu-item>

        <el-sub-menu v-else :index="menu.path" :key="menu.path">
          <template #title>
            <i :class="['iconfont', 'meun-icon', menu.meta?.icon]"></i
            >{{ menu.meta?.title }}</template
          >

          <el-menu-item
            v-for="item in menu.children"
            :key="item.path"
            :index="item.path"
          >
            <template #title>
              <!-- <i :class="['iconfont', 'meun-icon', item.meta?.icon]"></i> -->
              {{ item.meta?.title }}</template
            >
          </el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>
    </el-scrollbar>
    
    <div class="menu-img">
      <img src="../../assets/menu.png" alt="">
    </div>
  </div>
</template>

<style lang="scss" scoped>
.menu-container{
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 25px 0px 25px 15px;
  
  .menu-img{
    margin-top: 15px;
    padding-right: 15px;
    width: 100%;
    background: var(--el-bg-color);
    // background: var(--el-bg-color-page);
    img{
      width: 100%;
    }
  }
}
.logo {
  height: 80px;
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
  .logo-icon {
    font-style: italic;
    font-weight: bold;
    white-space: nowrap;
    font-size: 20px;
    background: var(--el-color-primary-light-3);
    height: 56px;
    padding: 0 15px;
    border-radius: var(--el-border-radius-base);
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.el-menu-vertical-demo {
  border: none;
  --el-menu-item-height: 48px;
  --el-menu-sub-item-height: 48px;
  --el-menu-text-color: var(--el-text-color-regular);
  --el-menu-item-font-size: 14px;
  --el-menu-active-color: #fff;

  .meun-icon {
    font-size: 20px;
    margin-right: 20px;
  }

  :deep(.el-menu-item) {
    margin: 10px 25px 10px 0;
    padding-right: 15px;
    color: var(--el-text-color-secondary);
    // border-radius: var(--el-border-radius-base);
    border-radius: 10px;
    position: relative;
    &::after{
      content: '';
      position: absolute;
      width: 4px;
      height: 0%;
      background-color: var(--el-color-primary);
      border-radius: 2px;
      right: -25px;
      transform: translateY(50%);
      transition: all 0.3s;
    }

    &.is-active {
      color: var(--el-color-primary);
      background: var(--el-menu-hover-bg-color);
      font-weight: bold;
      &::after{
        height: 100%;
        transform: translateY(0%);
      }
    }
  }

  :deep(.el-sub-menu) {
    .el-sub-menu__title{
      margin: 0px 25px 0px 0;
      padding-right: 59px;
      color: var(--el-text-color-secondary);
      border-radius: 10px;
    }
    &.is-active .el-sub-menu__title{
      color: var(--el-text-color-regular)
    }
    .el-menu-item {
      font-size: 14px;
      padding-left: 60px;
      position: relative;
      --el-menu-text-color: #909399;

      &::before {
        content: "";
        position: absolute;
        width: 6px;
        height: 6px;
        background: var(--el-menu-text-color);
        border-radius: 50%;
        left: 35px;
        top: 50%;
        transform: translateY(-50%);
      }

      &.is-active::before {
        background: var(--el-color-primary);
      }
    }
  }
}
</style>
