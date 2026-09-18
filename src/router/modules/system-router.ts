import type { RouteRecordRaw } from 'vue-router'
import config from '@/config'
// 系统静态路由
export const systemRoutes: RouteRecordRaw[] = [
    {
        name: 'layout',
        path: '/',
        component: () => import('@/layout/LayoutIndex.vue'),
        redirect: config.DASHBOARD_URL,
        children: [
            {
                path: config.DASHBOARD_URL,
                name: 'dashboard',
                component: () => import('@/views/home/index.vue'),
                meta: {
                    title: '工作台',
                    affix: true
                }
            }
        ]
    },
    {
        path: '/404',
        name: '404',
        component: () => import('@/layout/other/Other404.vue')
    },
    {
        path: '/:pathMatch(.*)*',
        component: () => import('@/layout/other/Other404.vue')
    }
]

// auth静态路由
export const systemAuthRoutes: RouteRecordRaw[] = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/login/index.vue'),
        meta: {
            title: '登录'
        }
    },
    // 风格二：双栏（左侧品牌大图 + 右侧表单）
    {
        path: '/login-2',
        name: 'Login2',
        component: () => import('@/views/login/index2.vue'),
        meta: {
            title: '登录（双栏）'
        }
    }
]
