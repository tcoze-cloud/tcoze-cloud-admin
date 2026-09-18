import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'
import { SelfStorage } from '@/utils/local-storage.ts'
import auth from '@/api/modules/auth.ts'
import menuTool from '@/router/menu.ts'
import { useSysKeepAliveStore } from '@/stores/use-keep-alive-store.ts'
import { useSysViewTagsStore } from '@/stores/use-view-tags-store.ts'

export const useMenuStore = defineStore('menu', {
    state: () => ({
        // 菜单列表
        menus: [] as Menu.MenuOptions[],
        // 权限
        permissions: [] as string[],
        // 侧边栏菜单第一个菜单路径（用于登录后跳转）
        firstMenuPath: '',
        // 面包屑（由 LayoutIndex 根据当前路由更新）
        breadcrumbList: [] as Menu.MenuOptions[]
    }),
    getters: {
        // 获取菜单列表
        getMenu: (state): Menu.MenuOptions[] => state.menus,
        // 获取权限
        getPermissions: (state): string[] => state.permissions
    },
    actions: {
        // 设置菜单和权限
        setMenus(menus: Menu.MenuOptions[], permissions: string[] = []) {
            // 补全菜单路径
            const resolvedMenus = menuTool.resolveMenuPaths(menus)
            this.menus = resolvedMenus
            this.permissions = permissions
            // 登录后默认跳转的第一个菜单
            this.firstMenuPath = menuTool.findFirstLeafPath(resolvedMenus)
        },
        // 刷新菜单
        async refreshCache() {
            const sysViewTagsStore = useSysViewTagsStore()
            const sysKeepAliveStore = useSysKeepAliveStore()
            sysViewTagsStore.$reset()
            sysKeepAliveStore.$reset()

            const res = await auth.getSystemMenu.get()
            this.setMenus(res.menu, res.permissions)
        }
    },
    persist: {
        key: 'MENU',
        storage: SelfStorage,
        pick: ['menus', 'permissions']
    }
})
