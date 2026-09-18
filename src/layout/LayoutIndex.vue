<template>
    <component
        :is="LayoutComponents[sysGlobalStore.sysLayout]"
        :menuList="menuList"
        :parentMenu="parentMenu"
        :nextMenu="nextMenu"
        @selectOneMenu="selectOneMenu"
    />

    <!-- 退出最大化 -->
    <div class="main-maximize-exit" @click="exitMaximize">
        <el-icon> <el-icon-close /></el-icon>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, type Component } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'
import colorTool from '@/utils/color'
import { useSysGlobalStore } from '@/stores/use-global-store.ts'
import { useSysViewTagsStore } from '@/stores/use-view-tags-store.ts'
import { useSysKeepAliveStore } from '@/stores/use-keep-alive-store.ts'
import { useMenuStore } from '@/stores/modules/use-menu-store.ts'
import { useAuthStore } from '@/stores/modules/use-auth-store.ts'
import LayoutDefault from './mode/DefaultMode.vue'
import LayoutHeader from './mode/HeaderMode.vue'
import LayoutMenu from './mode/MenuMode.vue'
import LayoutDock from './mode/DockMode.vue'
import menuTool from '@/router/menu.ts'

const route = useRoute()
const menuStore = useMenuStore()
const authStore = useAuthStore()
const sysGlobalStore = useSysGlobalStore()
const sysViewTagsStore = useSysViewTagsStore()
const sysKeepAliveStore = useSysKeepAliveStore()
const menuList = ref<Menu.MenuOptions[]>([])
const parentMenu = ref<Menu.MenuOptions>()
const nextMenu = ref<Menu.MenuOptions[]>([])
const viewTag = ref<Menu.MenuOptions>()

const LayoutComponents: Record<string, Component> = {
    // 默认布局
    default: LayoutDefault,
    // 通栏布局
    header: LayoutHeader,
    // 经典布局
    menu: LayoutMenu,
    // 功能坞布局
    dock: LayoutDock
}

watch(route, (val) => {
    // 添加keepAlive
    if (val.meta.keepAlive) {
        sysKeepAliveStore.addKeepAliveName(val.name as string)
    }
    showThis()
})

onMounted(() => {
    onLayoutResize()
    window.addEventListener('resize', onLayoutResize)
    const staticMenus = menuTool.convertAndFilterRoutes(
        menuTool.staticRoutes(),
        authStore.userInfo.userRole
    )
    menuList.value = [...menuStore.menus, ...staticMenus]
    showThis()
})

function showThis() {
    const matched = route.matched[route.matched.length - 1]
    const activePath = matched?.path

    const temp = activePath ? findOutermostByPath(menuList.value, activePath) : null

    if (temp) {
        parentMenu.value = temp
    } else {
        parentMenu.value = menuList.value[0]
    }
    if (parentMenu.value?.children && parentMenu.value.children.length > 0) {
        nextMenu.value = filterUrl(parentMenu.value.children)
    } else {
        nextMenu.value = []
    }

    // 添加面包屑
    menuStore.breadcrumbList = parentMenu.value
        ? findActivePath(parentMenu.value, activePath)
        : []

    // 添加标签tags
    // 优先取菜单树中的节点；菜单树中不存在（如 system-router 内的静态路由）时，回退到路由 matched 的 meta
    const tagItem =
        viewTag.value ||
        (matched
            ? ({ name: matched.name, path: matched.path, meta: matched.meta } as Menu.MenuOptions)
            : null)
    if (tagItem && !sysViewTagsStore.list.some((t) => t.path === tagItem.path)) {
        sysViewTagsStore.list.push({
            name: tagItem.name,
            path: tagItem.path,
            meta: tagItem.meta
        } as Menu.MenuOptions)
    }
}

// 监听视图大小
function onLayoutResize() {
    sysGlobalStore.sysIsMobile = document.body.clientWidth < 992
}

// 退出最大化
function exitMaximize() {
    document.getElementById('app')?.classList.remove('main-maximize')
}

// 判断是否为外链（type=link 或 path 以 http(s):// 开头）
function isExternalLink(item: Menu.MenuOptions): boolean {
    return item.type === 'link' || /^https?:\/\//i.test(item.path)
}

// 外链以新窗口打开，普通菜单走站内路由
function jump(menu: Menu.MenuOptions) {
    if (isExternalLink(menu)) {
        window.open(menu.path, '_blank', 'noopener,noreferrer')
        return
    }
    router.push({ path: menu.path })
}

// 选择一级菜单
function selectOneMenu(item: Menu.MenuOptions) {
    parentMenu.value = item
    if (parentMenu.value.children && parentMenu.value.children.length > 0) {
        nextMenu.value = filterUrl(parentMenu.value.children)

        searchRoutePath(item)
    } else {
        nextMenu.value = []
        jump(item)
    }
}

function searchRoutePath(menu: Menu.MenuOptions) {
    if (menu.children?.length) {
        searchRoutePath(menu.children[0])
    } else {
        jump(menu)
    }
}

// 转换外部链接的路由
function filterUrl(map: Menu.MenuOptions[]): Menu.MenuOptions[] {
    const result: Menu.MenuOptions[] = []
    map.forEach((item) => {
        // 过滤隐藏菜单与按钮/接口类型
        if (item.meta.isHide || ['button'].includes(item.type as string)) {
            return
        }
        // 递归过滤子菜单
        if (item.children?.length) {
            item.children = filterUrl(item.children)
        }
        result.push(item)
    })
    return result
}

// 根据页面路径查找最外层菜单
function findOutermostByPath(
    menuOptions: Menu.MenuOptions[],
    activePath: string
): Menu.MenuOptions | null {
    for (const menu of menuOptions) {
        // 路径精确匹配，记录当前页签并返回该节点
        if (menu.path === activePath) {
            viewTag.value = menu
            return menu
        }
        // 存在子菜单时递归查找，命中则返回其最外层父级
        if (menu.children?.length) {
            const matchedChild = findOutermostByPath(menu.children, activePath)
            if (matchedChild) {
                return menu
            }
        }
    }
    return null
}

// 根据页面路径查找面包屑
function findActivePath(
    menu: Menu.MenuOptions,
    activePath: string,
    result: Menu.MenuOptions[] = []
): Menu.MenuOptions[] {
    if (menu.path === activePath) {
        result.unshift(menu)
        return result
    }
    // 如果存在子菜单，递归查找
    if (menu.children) {
        for (const child of menu.children) {
            const found = findActivePath(child, activePath, result)
            if (found.length > 0) {
                result.unshift(menu)
                return found
            }
        }
    }
    return result
}

// 应用主题色（主色 + 明暗变体）
function applyThemeColor(color: string) {
    document.documentElement.style.setProperty('--el-color-primary', color)
    for (let i = 1; i <= 9; i++) {
        document.documentElement.style.setProperty(
            `--el-color-primary-light-${i}`,
            colorTool.lighten(color, i / 10)
        )
        document.documentElement.style.setProperty(
            `--el-color-primary-dark-${i}`,
            colorTool.darken(color, i / 10)
        )
    }
}

// 监听全局配置，同步至 DOM / i18n
watch(
    () => sysGlobalStore.sysLayout,
    (val) => document.body.setAttribute('data-layout', val),
    { immediate: true }
)
watch(
    () => sysGlobalStore.sysDark,
    (val) => document.documentElement.classList[val ? 'add' : 'remove']('dark'),
    { immediate: true }
)
watch(() => sysGlobalStore.sysColor, applyThemeColor, { immediate: true })
</script>
