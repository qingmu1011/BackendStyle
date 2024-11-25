import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { getPlatformConfig } from "./config";

import ElementPlus from "element-plus";

import zhCn from 'element-plus/es/locale/lang/zh-cn';

import '~/styles/index.scss';
// import 'element-plus/theme-chalk/dark/css-vars.css'
import '~/styles/element/dark.scss'
import 'uno.css'

// If you want to use ElMessage, import it.
import "element-plus/theme-chalk/src/message.scss";
import "element-plus/theme-chalk/src/message-box.scss";

const app = createApp(App);

// 全局注册@iconify/vue图标库
import {
    IconifyIconOffline,
    IconifyIconOnline,
    FontIcon
} from "./components/ReIcon";
app.component("IconifyIconOffline", IconifyIconOffline);
app.component("IconifyIconOnline", IconifyIconOnline);
app.component("FontIcon", FontIcon);

// 全局注册按钮级别权限组件
import { Auth } from "~/components/ReAuth";
app.component("Auth", Auth);

//全局注册组件
import BusinessComponents from "~/components/BusinessComponents/index";//业务组件
import BaseComponents from "~/components/BaseComponents/index";//基础组件
app.use(BusinessComponents);
app.use(BaseComponents);

import { MotionPlugin } from "@vueuse/motion";
import { setupStore } from "~/store";
app.use(MotionPlugin)

import myPlugin from "~/directives"
app.use(myPlugin)

getPlatformConfig(app).then(async config => {
    setupStore(app);
    app.use(router);
    await router.isReady();
    app.use(MotionPlugin).use(ElementPlus, {
        locale: zhCn
    });
    // .use(PureDescriptions)
    // .use(useEcharts);
    app.mount("#app");
});