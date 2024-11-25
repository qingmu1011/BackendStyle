<script setup lang="ts">
import { computed, ref, reactive, onMounted, getCurrentInstance } from "vue";
import { toggleDark, isDark } from "~/composables/dark";
import type { FormInstance, FormRules } from "element-plus";
import { Sunny, Moon } from "@element-plus/icons-vue";
import { useUserStoreHook } from "~/store/modules/user";
import defaultAvatar from "~/assets/user.jpg";
import LogoutCircleRLine from "@iconify-icons/ri/logout-circle-r-line";
import EditCircleLine from "@iconify-icons/ri/edit-circle-line";

const switchValue = ref(isDark);

function changeTheme(val: string | number | boolean) {
  toggleDark(val as boolean);
}

const username = ref<string>(useUserStoreHook().username);
const userInfo = ref<string>(useUserStoreHook().userInfo);

onMounted(() => {});

const avatarsStyle = computed(() => {
  return username.value ? { marginRight: "10px" } : "";
});

const name = computed(() => {
  return (userInfo.value && userInfo.value.name) ?? "";
});

const userAvatar = computed(() => {
  if (userInfo.value.avatar) {
    return import.meta.env.VITE_APP_BASE_API + userInfo.value.avatar;
  } else {
    return defaultAvatar;
  }
});

const passwordVisible = ref<boolean>(false);

const logout = function () {
  useUserStoreHook().logOut();
};

const changePassword = () => {
  passwordVisible.value = true;
};

const closePassword = () => {
  passwordVisible.value = false;
};
</script>

<template>
  <div class="header-container">
    <div class="header-left">
      <el-input size="large" placeholder="搜索" style="width: 280px;">
        <template #prefix>
          <i class="iconfont icon-search"></i>
        </template>
      </el-input>
    </div>
    <div class="header-right">
      <el-switch
        v-model="switchValue"
        :active-action-icon="Moon"
        :inactive-action-icon="Sunny"
        @change="changeTheme"
      />
      <div>
        <!-- 退出登录 -->
        <el-dropdown trigger="click">
          <div class="avatar">
            <img :src="userAvatar" :style="avatarsStyle" />
            <p v-if="name" class="dark:text-white">{{ name }}</p>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="changePassword">
                <IconifyIconOffline
                  :icon="EditCircleLine"
                  style="margin: 5px"
                />
                修改密码
              </el-dropdown-item>
              <el-dropdown-item @click="logout">
                <IconifyIconOffline
                  :icon="LogoutCircleRLine"
                  style="margin: 5px"
                />
                退出系统
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
:deep(.el-input__wrapper){
  box-shadow: none;
}
.header-container {
  height: inherit;
  display: flex;
  align-items: start;
  justify-content: space-between;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none; 
  -ms-user-select: none;
  .iconfont{
    font-size: 25px;
    color: var(--el-text-color-primary)
  }

  .header-left {
    
  }

  .header-right {
    display: flex;
    align-items: center;
    .avatar {
      margin-left: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      img {
        width: 38px;
        height: 38px;
        border-radius: 50%;
      }
    }
    .iconfont {
      cursor: pointer;
    }
  }

  .el-switch {
    --el-switch-on-color: var(--el-fill-color);
    :deep(.el-switch__action) {
      background: var(--el-bg-color);
      color: #dcdfe6;
    }
  }
}
</style>
