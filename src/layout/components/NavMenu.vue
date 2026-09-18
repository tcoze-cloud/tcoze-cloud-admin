<template>
    <div v-if="!navMenus || navMenus.length <= 0" style="padding: 20px">
        <el-alert :title="$t('layout.noSubmenu')" center type="info" :closable="false"></el-alert>
    </div>
    <template v-for="navMenu in navMenus" :key="navMenu.name">
        <a
            v-if="isExternalLink(navMenu)"
            class="el-menu-item link-menu-item"
            :href="externalUrl(navMenu.path)"
            target="_blank"
            rel="noopener noreferrer"
        >
            <Icon :name="navMenu.meta?.icon" />
            <span>{{ navMenu.meta?.title }}</span>
            <span v-if="navMenu.meta?.tag && !sysGlobalStore.sysMenuIsCollapse" class="menu-tag">{{
                navMenu.meta.tag
            }}</span>
        </a>
        <el-menu-item
            v-else-if="!hasChildren(navMenu)"
            :index="navMenu.path"
            @click="handleRefresh(navMenu)"
        >
            <Icon :name="navMenu.meta?.icon" />
            <template #title>
                <span>{{ navMenu.meta?.title }}</span>
                <span
                    v-if="navMenu.meta?.tag && !sysGlobalStore.sysMenuIsCollapse"
                    class="menu-tag"
                    >{{ navMenu.meta.tag }}</span
                >
            </template>
        </el-menu-item>
        <el-sub-menu v-else :index="navMenu.path">
            <template #title>
                <Icon :name="navMenu.meta?.icon" />
                <span>{{ navMenu.meta?.title }}</span>
                <span
                    v-if="navMenu.meta?.tag && !sysGlobalStore.sysMenuIsCollapse"
                    class="menu-tag"
                    >{{ navMenu.meta.tag }}</span
                >
            </template>
            <navMenu :navMenus="navMenu.children || []"></navMenu>
        </el-sub-menu>
    </template>
</template>

<script setup lang="ts">
import { inject, nextTick } from 'vue'
import { useSysGlobalStore } from '@/stores/use-global-store.ts'
import { useSysKeepAliveStore } from '@/stores/use-keep-alive-store.ts'
import { useRoute } from 'vue-router'
import router from '@/router'

const route = useRoute()
const sysKeepAliveStore = useSysKeepAliveStore()
const sysGlobalStore = useSysGlobalStore()

defineProps<{
    navMenus: Menu.MenuOptions[]
}>()

// 判断是否有可见子菜单
function hasChildren(item: Menu.MenuOptions) {
    return item.children?.length && !item.children.every((child) => child.meta.isHide)
}

// 是否为外链：type=link，或 path 以 http(s):// 开头（兼容后端漏标 type 的情况）
function isExternalLink(item: Menu.MenuOptions): boolean {
    return item.type === 'link' || /^https?:\/\//i.test(item.path)
}

// 外链地址补全协议（默认 https），避免相对地址被当作站内路由
function externalUrl(url: string): string {
    return /^[a-z]+:\/\//i.test(url) ? url : `https://${url}`
}

// 刷新页面
const refreshCurrentPage = inject('refresh') as (val: boolean) => void
function handleRefresh(tab?: Menu.MenuOptions) {
    if (!tab) {
        return
    }
    setTimeout(() => {
        if (tab.meta?.keepAlive) {
            sysKeepAliveStore.list = sysKeepAliveStore.list.filter((item) => item !== tab.name)
        }
        if (tab.path !== route.path) {
            router.push({ path: tab.path })
        }
        refreshCurrentPage(false)
        nextTick(() => {
            if (tab.meta?.keepAlive) {
                sysKeepAliveStore.addKeepAliveName(tab.name as string)
            }
            refreshCurrentPage(true)
        })
    }, 0)
}
</script>

<style scoped lang="scss">
.link-menu-item {
    position: relative;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: var(--el-menu-item-height, 46px);
    padding: 0 var(--el-menu-base-level-padding, 20px);
    text-decoration: none;
    color: var(--el-menu-text-color, var(--el-text-color-primary));
    cursor: pointer;

    .el-icon {
        flex-shrink: 0;
        width: 18px;
        height: 18px;
        margin-right: 5px;
        font-size: 18px;
        vertical-align: middle;
    }

    &:hover {
        color: var(
            --el-menu-hover-text-color,
            var(--el-menu-text-color, var(--el-text-color-primary))
        );
        background-color: var(--el-menu-hover-bg-color, transparent);
    }

    &.is-active {
        color: var(--el-menu-active-color);
        background-color: var(--el-menu-active-bg-color, transparent);
    }
}
</style>
