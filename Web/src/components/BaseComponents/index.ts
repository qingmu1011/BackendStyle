import { defineAsyncComponent, AsyncComponentLoader } from 'vue'

const components = import.meta.glob('./*.vue');

export default function install(app: any) {
    // 遍历对象并注册异步组件
    for (const [key, value] of Object.entries(components)) {
        // ./HelloWorld.vue 截取中间部分做名字
        const name = key.slice(key.lastIndexOf('/') + 1, key.lastIndexOf('.'));
        app.component(name, defineAsyncComponent(value as AsyncComponentLoader));
    }
}