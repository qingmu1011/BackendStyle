const { VITE_HIDE_HOME } = import.meta.env;
const Layout = () => import("~/layout/index.vue");
const parentLayout = () => import("~/layout/parent.vue");

export default {
    path: "/",
    name: "Home",
    component: Layout,
    redirect: "/home",
    meta: {
        icon: "ep:home-filled",
        title: "首页",
        rank: 0
    },
    children: [
        {
            path: "/home",
            name: "home",
            component: () => import("~/views/businessComponents/home/index.vue"),
            meta: {
                title: "首页",
                icon: 'icon-home',
                enTitle: "Project Management"
            }
        },
        {
            path: "/loadsForecaster",
            name: "loadsForecaster",
            component: () => import("~/views/businessComponents/loadsForecaster/index.vue"),
            meta: {
                title: "建筑负载预测",
                icon: 'icon-shiligongchang',
                enTitle: "Building load prediction"
            }
        },
        {
            path: "/photovoltaicForecaster",
            name: "photovoltaicForecaster",
            component: () => import("~/views/businessComponents/photovoltaicForecaster/index.vue"),
            meta: {
                title: "光伏发电预测",
                icon: 'icon-daytime-mode',
                enTitle: "Photovoltaic power generation prediction"
            }
        },
        {
            path: "/tariffForecaster",
            name: "tariffForecaster",
            component: () => import("~/views/businessComponents/tariffForecaster/index.vue"),
            meta: {
                title: "电价设置",
                icon: 'icon-flashlight',
                enTitle: "Electricity Price Setting"
            }
        },
        
        {
            path: "/optimiz",
            name: "optimiz",
            component: parentLayout,
            meta: {
                title: "电费寻优",
                icon: 'icon-favorites',
                enTitle: "Optimizing electricity prices"
            },
            children: [
                {
                    path: "/scsacascs",
                    name: "scsacascs",
                    component: parentLayout,
                    meta: {
                        title: "电费寻优",
                        // icon: 'icon-favorites',
                        enTitle: "Optimizing electricity prices"
                    },
                }
            ]
        },

    ]
} satisfies RouteConfigsTable;
