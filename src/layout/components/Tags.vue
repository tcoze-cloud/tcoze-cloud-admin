<template>
    <div class="admin-tags">
        <div class="tabs-menu">
            <el-tabs v-model="activeName" type="card" @tab-click="tabClick" @tab-remove="tabRemove">
                <el-tab-pane
                    v-for="item in tagList"
                    :key="item.name"
                    :name="item.name"
                    :label="item.meta?.title ? item.meta.title : ''"
                    :closable="false"
                >
                    <template #label>
                        <span
                            class="tab-label"
                            @contextmenu.prevent="openContextMenu($event, item)"
                        >
                            <Icon :name="item.meta?.icon" />
                            <span class="tab-title">{{
                                item.meta?.title ? item.meta.title : ''
                            }}</span>
                            <el-icon v-if="onlyOneTag && !item.meta?.isAffix" class="tab-lock">
                                <el-icon-lock />
                            </el-icon>
                            <el-icon
                                v-else-if="!item.meta?.isAffix"
                                class="tab-close"
                                @click.stop="tabRemove(item.name as string)"
                            >
                                <el-icon-close />
                            </el-icon>
                        </span>
                    </template>
                </el-tab-pane>
            </el-tabs>
            <ul
                v-if="contextMenuVisible"
                id="contextmenu"
                ref="contextmenuRef"
                :style="{ left: left + 'px', top: top + 'px' }"
                class="contextmenu"
            >
                <li @click="handleRefresh(selectTab)">
                    <el-icon> <el-icon-refresh /> </el-icon>{{ $t('layout.refresh') }}
                </li>
                <hr />
                <li
                    :class="selectTab && selectTab.meta.isAffix ? 'disabled' : ''"
                    @click="tabCurrentTab(selectTab)"
                >
                    <el-icon> <el-icon-remove /> </el-icon>{{ $t('layout.closeCurrent') }}
                </li>
                <li @click="tabRemoveOthers(selectTab)">
                    <el-icon> <el-icon-circle-close /> </el-icon>{{ $t('layout.closeOther') }}
                </li>
                <hr />
                <li @click="maximize(selectTab)">
                    <el-icon> <el-icon-full-screen /> </el-icon>{{ $t('layout.maximize') }}
                </li>
                <li @click="openWindow(selectTab)">
                    <el-icon>
                        <el-icon-copy-document />
                    </el-icon>
                    {{ $t('layout.openInNewWindow') }}
                </li>
            </ul>
            <el-dropdown trigger="click" :teleported="false">
                <el-icon class="more-button">
                    <el-icon-arrow-down />
                </el-icon>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item
                            @click="
                                handleRefresh(
                                    sysViewTagsStore.list.find((item) => item.path === route.path)
                                )
                            "
                        >
                            <el-icon class="iconfont">
                                <el-icon-refresh />
                            </el-icon>
                            {{ $t('layout.refresh') }}
                        </el-dropdown-item>
                        <el-dropdown-item
                            @click="
                                tabCurrentTab(
                                    sysViewTagsStore.list.find((item) => item.path === route.path)
                                )
                            "
                            :disabled="route.path == appDashboard"
                        >
                            <el-icon> <el-icon-remove /> </el-icon>{{ $t('layout.closeCurrent') }}
                        </el-dropdown-item>
                        <el-dropdown-item divided @click="tabRemoves('left')">
                            <el-icon> <el-icon-dArrow-left /> </el-icon>{{ $t('layout.closeLeft') }}
                        </el-dropdown-item>
                        <el-dropdown-item @click="tabRemoves('right')">
                            <el-icon> <el-icon-dArrow-right /> </el-icon
                            >{{ $t('layout.closeRight') }}
                        </el-dropdown-item>
                        <el-dropdown-item
                            divided
                            @click="
                                tabRemoveOthers(
                                    sysViewTagsStore.list.find((item) => item.path === route.path)
                                )
                            "
                        >
                            <el-icon> <el-icon-circle-close /> </el-icon
                            >{{ $t('layout.closeOther') }}
                        </el-dropdown-item>
                        <el-dropdown-item @click="tabRemoveAll">
                            <el-icon> <el-icon-folder-delete /> </el-icon
                            >{{ $t('layout.closeAll') }}
                        </el-dropdown-item>
                        <el-dropdown-item
                            divided
                            @click="
                                maximize(
                                    sysViewTagsStore.list.find((item) => item.path === route.path)
                                )
                            "
                        >
                            <el-icon> <el-icon-full-screen /> </el-icon>{{ $t('layout.maximize') }}
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import Sortable from 'sortablejs'
import { useRoute } from 'vue-router'
import router from '@/router'
import type { TabPaneName, TabsPaneContext } from 'element-plus'
import { useSysViewTagsStore } from '@/stores/use-view-tags-store.ts'
import { useSysKeepAliveStore } from '@/stores/use-keep-alive-store.ts'
import { useMenuStore } from '@/stores/modules/use-menu-store.ts'

const sysViewTagsStore = useSysViewTagsStore()
const sysKeepAliveStore = useSysKeepAliveStore()
const activeName = ref('')
const route = useRoute()
const appDashboard = useMenuStore().firstMenuPath || '/'
const contextmenuRef = ref()
const contextMenuVisible = ref(false)
const left = ref(0)
const top = ref(0)
const selectTab = ref<Menu.MenuOptions>()

// 仅剩一个标签时禁止删除，关闭按钮改为锁定图标
const onlyOneTag = computed(() => sysViewTagsStore.list.length === 1)

const tagList = computed(() => sysViewTagsStore.list)

watch(
    route,
    (newValue) => {
        if (newValue) {
            activeName.value = newValue.name as string
        }
    },
    { immediate: true }
)

onMounted(() => {
    tabsDrop()
})

// 新窗口打开
function openWindow(tab?: Menu.MenuOptions) {
    if (!tab) {
        return
    }

    const url = tab.path || '/'
    if (!tab.meta.isAffix) {
        tabRemove(tab.name as string)
    }

    const route = router.resolve({ path: url })
    window.open(route.href, '_blank')

    contextMenuVisible.value = false
}

// tabs 拖拽排序
const tabsDrop = () => {
    const nav = document.querySelector('.el-tabs__nav') as HTMLElement | null
    if (!nav) {
        return
    }
    Sortable.create(nav, {
        draggable: '.el-tabs__item',
        animation: 300,
        onEnd({ newIndex, oldIndex }) {
            if (oldIndex != null && newIndex != null) {
                const elementToMove = sysViewTagsStore.list.splice(oldIndex, 1)[0]
                sysViewTagsStore.list.splice(newIndex, 0, elementToMove)
            }
        }
    })
}

const tabClick = (tab: TabsPaneContext) => {
    if (activeName.value == tab.props.name) {
        return
    }
    const selectMenu = sysViewTagsStore.list.find((item) => item.name === tab.props.name)

    router.push({ path: selectMenu!.path })
}

const refreshCurrentPage = inject('refresh') as (val: boolean) => void

const handleRefresh = (tab?: Menu.MenuOptions) => {
    if (!tab) {
        return
    }
    contextMenuVisible.value = false
    setTimeout(() => {
        if (tab.meta?.keepAlive) {
            sysKeepAliveStore.list = sysKeepAliveStore.list.filter((item) => item !== tab.name)
        }

        if (tab.path != route.path) {
            router.push({ path: tab.path })
        }

        refreshCurrentPage(false)

        nextTick(() => {
            tab.meta?.keepAlive && sysKeepAliveStore.addKeepAliveName(tab.name as string)
            refreshCurrentPage(true)
        })
    }, 0)
}

const maximize = (tab?: Menu.MenuOptions) => {
    if (!tab) {
        return
    }
    if (tab.path != route.path) {
        router.push({ path: tab.path })
    }
    document.getElementById('app')?.classList.add('adminui', 'main-maximize')
}

const tabCurrentTab = (tab?: Menu.MenuOptions) => {
    if (!tab || tab.meta.isAffix) {
        return
    }
    tabRemove(tab.name as string)
}

const tabRemove = (targetName: TabPaneName): any => {
    contextMenuVisible.value = false
    if (sysViewTagsStore.list.length == 1) {
        return true
    }

    sysViewTagsStore.list.forEach((tab, index) => {
        if (tab.name === targetName) {
            if (targetName == activeName.value) {
                const nextTab = sysViewTagsStore.list[index + 1] || sysViewTagsStore.list[index - 1]
                if (nextTab) {
                    router.push({ path: nextTab.path })
                }
            }
        }
    })
    sysViewTagsStore.list = sysViewTagsStore.list.filter((item) => item.name !== targetName)
    sysKeepAliveStore.removeKeepAliveName(targetName)

    return true
}

const tabRemoves = (type: 'left' | 'right') => {
    sysViewTagsStore.closeTabsOnSide(route.path, type)
    sysKeepAliveStore.removeKeepAliveNames(sysViewTagsStore.list)
}

const tabRemoveOthers = (tab?: Menu.MenuOptions) => {
    if (!tab) {
        return
    }
    contextMenuVisible.value = false
    sysViewTagsStore.closeTabs(tab.path)
    sysKeepAliveStore.removeKeepAliveNames(sysViewTagsStore.list)
    if (tab.path != route.path) {
        router.push({ path: tab.path })
    }
}

const tabRemoveAll = () => {
    sysViewTagsStore.closeTabs()
    sysKeepAliveStore.removeKeepAliveNames(sysViewTagsStore.list)
    router.push({ path: appDashboard })
}

const openContextMenu = (e: MouseEvent, tab: Menu.MenuOptions) => {
    contextMenuVisible.value = false
    if (!tab) {
        return
    }
    selectTab.value = tab
    left.value = e.clientX + 1
    top.value = e.clientY + 1
    contextMenuVisible.value = true
    // FIX 右键菜单边缘化位置处理
    nextTick(() => {
        const sp = document.getElementById('contextmenu') as HTMLElement
        if (document.body.offsetWidth - e.clientX < sp.offsetWidth) {
            left.value = document.body.offsetWidth - sp.offsetWidth + 1
            top.value = e.clientY + 1
        }
    })
}

onClickOutside(
    contextmenuRef,
    () => {
        contextMenuVisible.value = false
    },
    {
        detectIframe: true
    }
)
</script>

<style scoped>
.admin-tags {
    height: 44px;
    padding: 0 12px;
    background: var(--el-bg-color);
    border-bottom: 1px solid var(--app-border);
    display: flex;
    align-items: center;
}

.admin-tags .tabs-menu {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
}

.admin-tags .tabs-menu .el-tabs {
    flex: 1;
    height: 100%;
}

/* 右侧更多按钮（文档流，占据真实宽度，避免与滚动箭头重叠） */
.admin-tags .tabs-menu .el-dropdown {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    padding-left: 10px;
    margin-left: 6px;
    border-left: 1px solid var(--app-border);
}

.admin-tags .tabs-menu .el-dropdown .more-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    cursor: pointer;
    color: var(--el-text-color-regular);
}

.admin-tags .tabs-menu .el-dropdown .more-button:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
}

/* tabs 头部 */
.admin-tags .tabs-menu :deep(.el-tabs) {
    height: 100%;
    min-width: 0;
}

.admin-tags .tabs-menu :deep(.el-tabs) .el-tabs__header {
    box-sizing: border-box;
    margin: 0;
    height: 44px;
    border: none;
}

.admin-tags .tabs-menu :deep(.el-tabs) .el-tabs__header .el-tabs__nav-wrap {
    height: 44px;
}

/* 左右滚动箭头垂直居中 */
.admin-tags .tabs-menu :deep(.el-tabs) .el-tabs__header .el-tabs__nav-prev,
.admin-tags .tabs-menu :deep(.el-tabs) .el-tabs__header .el-tabs__nav-next {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 44px;
}

.admin-tags .tabs-menu :deep(.el-tabs) .el-tabs__header .el-tabs__nav-wrap::after {
    display: none;
}

.admin-tags .tabs-menu :deep(.el-tabs) .el-tabs__header .el-tabs__nav-wrap .el-tabs__nav {
    display: flex;
    align-items: center;
    height: 44px;
    border: none;
}

/* 单个标签 */
.admin-tags
    .tabs-menu
    :deep(.el-tabs)
    .el-tabs__header
    .el-tabs__nav-wrap
    .el-tabs__nav
    .el-tabs__item {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0; /* 标签项不压缩，溢出时由 nav-wrap 滚动处理 */
    height: 30px;
    margin: 0 3px;
    padding: 0 10px;
    border: none;
    border-radius: var(--app-radius-sm);
    font-size: 13px;
    color: var(--el-text-color-secondary);
    background: transparent;
    transition:
        background-color 0.2s,
        color 0.2s;
}

.admin-tags
    .tabs-menu
    :deep(.el-tabs)
    .el-tabs__header
    .el-tabs__nav-wrap
    .el-tabs__nav
    .el-tabs__item
    .tab-close {
    margin-left: 6px;
    cursor: pointer;
    color: var(--el-text-color-secondary);
    border-radius: 50%;
    transition:
        color 0.2s,
        background 0.2s;
}

.admin-tags
    .tabs-menu
    :deep(.el-tabs)
    .el-tabs__header
    .el-tabs__nav-wrap
    .el-tabs__nav
    .el-tabs__item
    .tab-close:hover {
    color: #fff;
    background: var(--el-color-danger);
}

.admin-tags
    .tabs-menu
    :deep(.el-tabs)
    .el-tabs__header
    .el-tabs__nav-wrap
    .el-tabs__nav
    .el-tabs__item
    .tab-lock {
    margin-left: 6px;
    color: var(--el-text-color-disabled);
    cursor: not-allowed;
}

.admin-tags
    .tabs-menu
    :deep(.el-tabs)
    .el-tabs__header
    .el-tabs__nav-wrap
    .el-tabs__nav
    .el-tabs__item:hover {
    color: var(--el-text-color-primary);
    background: var(--app-bg-muted);
}

.admin-tags
    .tabs-menu
    :deep(.el-tabs)
    .el-tabs__header
    .el-tabs__nav-wrap
    .el-tabs__nav
    .el-tabs__item.is-active {
    color: var(--el-color-primary);
    font-weight: 500;
    background: var(--el-color-primary-light-9);
    box-shadow: none;
}

/* 标签内文字与图标 */
.tab-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 160px;
}

.tab-label .el-icon {
    font-size: 14px;
}

.tab-title {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

/* 右键菜单 */
.contextmenu {
    position: fixed;
    margin: 0;
    padding: 6px;
    border-radius: var(--app-radius-md);
    background: var(--el-bg-color-overlay);
    border: 1px solid var(--app-border);
    box-shadow: var(--app-shadow-md);
    z-index: 3000;
    list-style-type: none;
}

.contextmenu hr {
    border: none;
    height: 1px;
    margin: 6px 4px;
    background-color: var(--app-border);
}

.contextmenu li {
    display: flex;
    align-items: center;
    cursor: pointer;
    height: 34px;
    padding: 0 14px;
    border-radius: 6px;
    font-size: 13px;
    color: var(--el-text-color-regular);
}

.contextmenu li .el-icon {
    font-size: 15px;
    margin-right: 10px;
}

.contextmenu li:hover {
    background-color: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
}

.contextmenu li.disabled {
    cursor: not-allowed;
    color: var(--el-text-color-disabled);
    background: transparent;
}

.contextmenu li.disabled:hover {
    background: transparent;
    color: var(--el-text-color-disabled);
}
</style>
