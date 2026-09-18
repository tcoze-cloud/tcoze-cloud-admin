import { ref, provide, computed, type Ref, type ComputedRef } from 'vue'
import { useRoute, type RouteLocationNormalizedLoaded } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSysGlobalStore } from '@/stores/use-global-store.ts'
import { useSysKeepAliveStore } from '@/stores/use-keep-alive-store.ts'
import image from '@/utils/image.ts'
import { useMenuStore } from '@/stores/modules/use-menu-store.ts'
type SysGlobalStore = ReturnType<typeof useSysGlobalStore>
type SysKeepAliveStore = ReturnType<typeof useSysKeepAliveStore>

export interface UseLayoutModeReturn {
    route: RouteLocationNormalizedLoaded
    sysGlobalStore: SysGlobalStore
    sysKeepAliveStore: SysKeepAliveStore
    isRouterShow: Ref<boolean>
    appTitle: ComputedRef<string>
    appDashboard: string
    image: typeof image
}

/**
 * 布局模式组件（默认 / 通栏 / 经典 / 功能坞）共用的组合式函数
 * 统一提供路由、全局状态、keep-alive 控制、刷新注入及站点基础信息
 */
export function useLayoutMode(): UseLayoutModeReturn {
    const route = useRoute()
    const sysGlobalStore = useSysGlobalStore()
    const sysKeepAliveStore = useSysKeepAliveStore()
    const { t } = useI18n()

    // 路由视图显隐控制（用于刷新当前页）
    const isRouterShow = ref(true)
    const refreshCurrentPage = (val: boolean) => (isRouterShow.value = val)
    provide('refresh', refreshCurrentPage)
    provide('isRouterShow', isRouterShow)

    return {
        route,
        sysGlobalStore,
        sysKeepAliveStore,
        isRouterShow,
        appTitle: computed(() => t('common.appName')),
        appDashboard: useMenuStore().firstMenuPath || '/',
        image
    }
}
