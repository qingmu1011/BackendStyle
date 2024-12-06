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
            path: "/myMenu",
            name: "myMenu",
            component: () => import("~/views/businessComponents/myMenu/index.vue"),
            meta: {
                title: "我是菜单",
                icon: 'icon-shiligongchang',
                enTitle: "Building load prediction"
            },
            children:[
                {
                    path: "/myMenu/child",
                    name: "myMenuChild",
                    component: () => import("~/views/businessComponents/home/index.vue"),
                    meta: {
                        title: "我是子菜单",
                    }
                }
            ]
        }

    ]
} satisfies RouteConfigsTable;
