import type { RouteRecordRaw } from 'vue-router'

// 自动导入全部静态路由

const staticModules: Record<string, any> = import.meta.glob(
    ['@/router/modules/**/*.ts', '!@/router/modules/**/system-router.ts'],
    { eager: true }
)
const staticRoutes = [] as RouteRecordRaw[]
Object.keys(staticModules).forEach((key) => {
    if (staticModules[key].default) {
        staticRoutes.push(staticModules[key].default)
    }
})

export default {
    /**
     * @description 使用递归扁平化菜单，方便添加动态路由
     * @param {Array} menuList 菜单列表
     * @returns {Array}
     */
    getFlatMenuList(menuList: Menu.MenuOptions[]): Menu.MenuOptions[] {
        const newMenuList: Menu.MenuOptions[] = JSON.parse(JSON.stringify(menuList))
        return newMenuList.flatMap((item) => {
            // 检查当前项是否有组件信息，没有则过滤（不加入结果）
            if (!item.component) {
                // 如果当前项没有组件，但有子项，继续递归处理子项
                return item.children ? this.getFlatMenuList(item.children) : []
            }
            // 有组件时，保留当前项并递归处理子项
            return [item, ...(item.children ? this.getFlatMenuList(item.children) : [])]
        })
    },

    /**
     * @description 本地静态路由
     * @returns {Array}
     */
    staticRoutes(): RouteRecordRaw[] {
        return staticRoutes
    },

    /**
     * @description 使用递归扁平化静态路由
     * @param {Array} routes 路由列表
     * @returns {Array}
     */
    getFlatStaticRoutesList(routes: RouteRecordRaw[]): RouteRecordRaw[] {
        return routes.reduce((flattened: RouteRecordRaw[], route) => {
            // 将当前路由直接添加到扁平化数组中
            flattened.push(route)

            // 如果存在子路由，则递归调用 flattenRoutes 函数
            if (route.children && route.children.length > 0) {
                return flattened.concat(this.getFlatStaticRoutesList(route.children))
            }

            // 如果没有子路由，直接返回当前扁平化数组
            return flattened
        }, []) // 初始的扁平化数组为空数组
    },

    // 过滤静态路由权限
    convertAndFilterRoutes(routes: RouteRecordRaw[], userRoles: string[]): Menu.MenuOptions[] {
        return routes
            .map((routeRecord) => {
                const menuOptions: Menu.MenuOptions | null = {
                    path: routeRecord.path,
                    name: routeRecord.name as string,
                    meta: {
                        ...routeRecord.meta
                    } as Menu.MetaProps,
                    children: routeRecord.children
                        ? this.convertAndFilterRoutes(routeRecord.children, userRoles)
                        : undefined
                }

                return menuOptions
            })
            .filter((route) => route !== null) as Menu.MenuOptions[]
    },

    // 查找树
    treeFind(
        tree: Menu.MenuOptions[],
        func: (node: Menu.MenuOptions) => boolean
    ): Menu.MenuOptions | null {
        for (const data of tree) {
            if (func(data)) return data
            if (data.children) {
                const res = this.treeFind(data.children, func)
                if (res) return res
            }
        }

        return null
    },

    // 解析路由路径（处理相对路径，拼接父级 path）
    resolveMenuPath(parentPath: string, path: string) {
        // 判断path是否为外部链接
        const isExternalLink = /^(https?:|mailto:|tel:|ftp:)/.test(path)
        if (isExternalLink) return path

        // 判断 path 是否以 / 开头
        if (path.startsWith('/')) return path

        // 否则拼接父级路径
        const normalizedParentPath = parentPath.endsWith('/')
            ? parentPath.slice(0, -1)
            : parentPath
        const normalizedPath = path.startsWith('/') ? path : `/${path}`
        return `${normalizedParentPath}${normalizedPath}`
    },

    // 递归补全所有菜单项的 path（基于父级 path）
    resolveMenuPaths(menuList: Menu.MenuOptions[], parentPath = ''): Menu.MenuOptions[] {
        return menuList.map((menu) => {
            const fullPath = this.resolveMenuPath(parentPath, menu.path)
            return {
                ...menu,
                path: fullPath,
                children: menu.children
                    ? this.resolveMenuPaths(menu.children, fullPath)
                    : undefined
            }
        })
    },

    // 查找第一个叶子节点路径（用于登录后重定向）
    findFirstLeafPath(menuList: Menu.MenuOptions[], parentPath = ''): string {
        const resolved = this.resolveMenuPaths(menuList, parentPath)
        for (const menu of resolved) {
            if (menu.children && menu.children.length > 0) {
                const childPath = this.findFirstLeafPath(menu.children, menu.path)
                if (childPath) return childPath
            } else if (menu.meta && !menu.meta.isHide && menu.path) {
                return menu.path
            }
        }
        return ''
    },

    // 根据目录路径注入重定向到第一个叶子节点
    injectDirRedirect(menuList: Menu.MenuOptions[]): Menu.MenuOptions[] {
        return menuList.map((menu) => {
            if (menu.children && menu.children.length > 0) {
                const firstLeafPath = this.findFirstLeafPath(menu.children, menu.path)
                return {
                    ...menu,
                    redirect: firstLeafPath || undefined,
                    children: this.injectDirRedirect(menu.children)
                }
            }
            return { ...menu }
        })
    }
}
