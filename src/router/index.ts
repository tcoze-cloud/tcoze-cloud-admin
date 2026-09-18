import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/modules/use-auth-store.ts'
import { useMenuStore } from '@/stores/modules/use-menu-store.ts'
import NProgress from 'nprogress'
import { systemAuthRoutes, systemRoutes } from './modules/system-router.ts'
import menuTool from './menu.ts'
import config from '@/config'

// 扁平化本地静态路由
export const staticRoutes = menuTool.getFlatStaticRoutesList(menuTool.staticRoutes())

// 引入 views 文件夹下所有 vue 文件，排除components文件夹
const modules = import.meta.glob(['@/views/**/*.vue', '!@/views/**/components'])

const router = createRouter({
    history: createWebHashHistory(),
    routes: [...systemRoutes, ...systemAuthRoutes],
    strict: false,
    scrollBehavior: () => ({ left: 0, top: 0 })
})

// 判断是否已加载过动态/静态路由
let isGetRouter = false

// 路由拦截 beforeEach
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    // NProgress
    NProgress.start()

    // 动态设置标题
    document.title = to.meta.title ? `${to.meta.title} - ${config.APP_NAME}` : `${config.APP_NAME}`

    // 判断访问的是静态auth路由
    const isAuthRoute = systemAuthRoutes.some(
        (authRoute) => authRoute.path.toLocaleLowerCase() === to.path.toLocaleLowerCase()
    )

    if (isAuthRoute) {
        if (authStore.accessToken) {
            NProgress.done()
            return next(from.fullPath)
        } else {
            resetRouter()
            isGetRouter = false
            NProgress.done()
            return next()
        }
    }

    // 判断是否有 Token
    if (!authStore.accessToken) {
        NProgress.done()
        return next({ path: '/login', replace: true })
    }

    // 添加静态/动态路由
    if (!isGetRouter) {
        // 添加静态路由
        staticRoutes.forEach((item) => {
            if (item.meta?.isFull) {
                router.addRoute(item as unknown as RouteRecordRaw)
            } else {
                router.addRoute('layout', item as unknown as RouteRecordRaw)
            }
        })

        // 添加动态路由
        const menuStore = useMenuStore()
        const apiMenu = menuTool.getFlatMenuList(menuStore.menus)

        apiMenu.forEach((item) => {
            // 移除children避免嵌套问题
            if (item.children) {
                delete item.children
            }

            // 处理组件加载
            if (item.component && typeof item.component === 'string') {
                const componentPath = `/src/views/${item.component}.vue`

                if (modules[componentPath]) {
                    item.component = modules[componentPath]
                }
            }

            // 添加路由
            if (item.meta?.fullpage) {
                router.addRoute(item as unknown as RouteRecordRaw)
            } else {
                router.addRoute('layout', item as unknown as RouteRecordRaw)
            }
        })

        isGetRouter = true

        return next({ ...to, replace: true })
    }

    // 正常访问页面
    next()
})

// 重置路由
export const resetRouter = () => {
    const menuStore = useMenuStore()
    const apiMenu = menuTool.getFlatMenuList(menuStore.menus)

    apiMenu.forEach((route) => {
        const { name } = route
        if (name) {
            if (router.hasRoute(name)) {
                router.removeRoute(name)
            }
        }
    })
}

// 路由跳转错误
router.onError((error) => {
    NProgress.done()

    const fetchResourcesErrors = [
        'Failed to fetch dynamically imported module',
        'Importing a module script failed'
    ]

    if (error?.message && fetchResourcesErrors.some((item) => error.message.includes(item))) {
        window.location.reload()
        return
    }
})

// 路由跳转结束
router.afterEach((to, from) => {
    console.log(`导航完成 | 页面: ${to.path} | 从 ${from.path || '初始页面'} 跳转`)

    NProgress.done()
})

export default router
