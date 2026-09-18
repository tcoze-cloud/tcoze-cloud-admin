<template>
    <div class="user-bar">
        <!-- 搜索菜单 -->
        <el-tooltip :content="$t('layout.searchMenu')" placement="bottom" class="hidden-sm-and-down">
            <el-button class="panel-item" text @click="searchVisible = true">
                <Icon name="lucide:Search" :stroke-width="2.5" />
            </el-button>
        </el-tooltip>
        <!-- 主题明暗切换 -->
        <el-tooltip
            :content="sysGlobalStore.sysDark ? $t('layout.light') : $t('layout.dark')"
            placement="bottom"
        >
            <el-button class="panel-item" text @click="sysGlobalStore.sysDark = !sysGlobalStore.sysDark">
                <Icon :name="themeIcon" :stroke-width="2.5" />
            </el-button>
        </el-tooltip>
        <!-- 全屏切换-->
        <el-tooltip :content="$t('layout.fullScreen')" placement="bottom" class="hidden-sm-and-down">
            <el-button class="panel-item" text @click="fullScreenClick">
                <Icon name="lucide:Maximize" :stroke-width="2.5" />
            </el-button>
        </el-tooltip>
        <!-- 语言切换 -->
        <el-dropdown class="lang panel-item" trigger="click" @command="handleLangChange">
            <el-button text>
                <Icon name="Languages" :stroke-width="2.5" />
            </el-button>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item :command="LANG.ZH_CN">{{
                        $t('layout.simplifiedChinese')
                    }}</el-dropdown-item>
                    <el-dropdown-item :command="LANG.EN_US">{{
                        $t('layout.english')
                    }}</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
        <el-dropdown class="user panel-item" trigger="click">
            <div class="user-avatar">
                <el-avatar :size="30" :src="authStore.userInfo?.avatar || image.avatar" />
                <label v-if="authStore.userInfo?.nickname">{{ authStore.userInfo.nickname }}</label>
                <el-icon>
                    <el-icon-arrow-down />
                </el-icon>
            </div>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item @click="goUserCenter()">
                        <el-icon> <el-icon-user /> </el-icon>{{ $t('layout.personalCenter') }}
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="clearCache()">
                        <el-icon> <el-icon-refresh /> </el-icon>{{ $t('layout.refreshCache') }}
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="logoutClick()">
                        <el-icon> <el-icon-switch-button /> </el-icon>{{ $t('layout.logout') }}
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
        <!-- 布局设置 -->
        <el-tooltip :content="$t('layout.layoutSetting')" placement="bottom">
            <el-button class="panel-item" text @click="settingClick">
                <Icon name="lucide:Settings" :stroke-width="2.5" />
            </el-button>
        </el-tooltip>
    </div>

    <el-drawer
        :title="$t('layout.layoutSetting')"
        v-model="settingVisible"
        :size="320"
        append-to-body
        destroy-on-close
    >
        <setting></setting>
    </el-drawer>

    <!-- 菜单搜索 -->
    <el-dialog
        v-model="searchVisible"
        :title="$t('layout.searchMenu')"
        width="560px"
        append-to-body
        @open="searchKeyword = ''"
    >
        <el-input
            v-model="searchKeyword"
            :placeholder="$t('layout.searchMenuPlaceholder')"
            clearable
            autofocus
        >
            <template #prefix>
                <Icon name="lucide:Search" />
            </template>
        </el-input>
        <div class="ub-search-tree-wrap">
            <el-tree
                v-show="matchCount !== 0"
                ref="treeRef"
                class="ub-search-tree"
                :data="treeMenus"
                node-key="path"
                :props="treeProps"
                :filter-node-method="filterNode"
                default-expand-all
                @node-click="onNodeClick"
            >
                <template #default="{ data }">
                    <span class="ub-tree-node" :class="{ 'is-dir': data.type === 'dir' }">
                        <Icon :name="data.meta?.icon" />
                        <span class="ub-tree-label">{{ data.meta?.title }}</span>
                    </span>
                </template>
            </el-tree>
            <el-empty v-if="matchCount === 0" :description="$t('layout.noMatchMenu')" />
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import setting from './Setting.vue'
import { useAuthStore } from '@/stores/modules/use-auth-store.ts'
import { useMenuStore } from '@/stores/modules/use-menu-store.ts'
import { useSysGlobalStore } from '@/stores/use-global-store.ts'
import { LANG, type Lang } from '@/locale'
import feedback from '@/utils/feedback.ts'
import image from '@/utils/image.ts'

const router = useRouter()
const sysGlobalStore = useSysGlobalStore()
const { t } = useI18n()

// 语言切换
function handleLangChange(lang: Lang) {
    if (lang && lang !== sysGlobalStore.sysLang) {
        sysGlobalStore.setLang(lang)
    }
}

const authStore = useAuthStore()
const menuStore = useMenuStore()
const settingVisible = ref(false)

// 主题图标：显式指定 Lucide，避免 Moon 命中 Element Plus 的同名图标导致明暗切换样式不一致
const themeIcon = computed(() => (sysGlobalStore.sysDark ? 'lucide:Sun' : 'lucide:Moon'))

// 菜单搜索
const searchVisible = ref(false)
const searchKeyword = ref('')

const treeRef = ref<any>()
const treeProps: any = {
    label: (data: any) => data.meta?.title,
    children: 'children'
}

// 过滤隐藏/按钮/接口类型，保留菜单树层级
const treeMenus = computed(() => filterTree(menuStore.menus))
function filterTree(list: Menu.MenuOptions[]): Menu.MenuOptions[] {
    const res: Menu.MenuOptions[] = []
    for (const item of list) {
        if (item.meta?.isHide) {
            continue
        }
        if (['button'].includes(item.type as string)) {
            continue
        }
        const children = item.children?.length ? filterTree(item.children) : undefined
        res.push({ ...item, children })
    }
    return res
}

// 按层级过滤：匹配节点及其祖先链都保留
const filterNode: any = (value: string, data: any): boolean => {
    const kw = (value || '').trim().toLowerCase()
    if (!kw) {
        return true
    }
    if ((data.meta?.title || '').toLowerCase().includes(kw)) {
        return true
    }
    return hasMatchInChildren(data.children, kw)
}
function hasMatchInChildren(children: Menu.MenuOptions[] | undefined, kw: string): boolean {
    if (!children?.length) {
        return false
    }
    return children.some(
        (c) =>
            (c.meta?.title || '').toLowerCase().includes(kw) || hasMatchInChildren(c.children, kw)
    )
}

// 空状态判断（-1 表示未搜索）
const matchCount = computed(() => {
    const kw = searchKeyword.value.trim().toLowerCase()
    if (!kw) {
        return -1
    }
    let count = 0
    const walk = (list: Menu.MenuOptions[]) => {
        for (const item of list) {
            if ((item.meta?.title || '').toLowerCase().includes(kw)) {
                count++
            }
            if (item.children?.length) {
                walk(item.children)
            }
        }
    }
    walk(treeMenus.value)
    return count
})

watch(searchKeyword, (val) => {
    treeRef.value?.filter(val)
})

// 点击节点：目录(dir)只展开不跳转，菜单项跳转
function onNodeClick(data: Menu.MenuOptions) {
    if (data.type !== 'dir' && data.path) {
        goMenu(data.path)
    }
}

function goMenu(path: string) {
    router.push(path)
    searchVisible.value = false
    searchKeyword.value = ''
}

// 全屏切换
function fullScreenClick() {
    if (document.fullscreenElement) {
        document.exitFullscreen()
    } else {
        document.documentElement.requestFullscreen()
    }
}

// 清除缓存
const clearCache = async () => {
    await feedback.confirm(t('layout.confirmRefreshCache'), t('common.confirm'), {
        type: 'info'
    })
    await menuStore.refreshCache()
    window.location.reload()
}

// 退出登录
const logoutClick = async () => {
    await feedback.confirm(t('layout.confirmLogout'), t('common.confirm'), {
        type: 'info'
    })
    await authStore.logout()
}

function settingClick() {
    settingVisible.value = true
}

// 跳转个人中心
function goUserCenter() {
    router.push('/user/center')
}
</script>

<style scoped>
.user-bar {
    display: flex;
    align-items: center;
    height: 100%;
}

/* 工具栏每一项统一 10px 水平内边距，保证相邻图标间距一致 */
.user-bar .panel-item {
    padding: 0 10px;
    cursor: pointer;
    height: 100%;
    display: flex;
    align-items: center;
}

/* el-button 形态的工具栏按钮：撑满高度、去默认内边距与边框 */
.user-bar .el-button.panel-item {
    height: 100%;
    padding: 0 10px;
    margin: 0;
    border: none;
    font-size: 16px;
}

/* 下拉触发按钮不再叠加内边距，否则与 .panel-item 的 10px 相加会把间距撑宽 */
.user-bar .el-dropdown.panel-item > .el-button {
    height: 100%;
    padding: 0;
    margin: 0;
    border: none;
    font-size: 16px;
}

/* 所有工具栏图标统一 16px，兼容 Element Plus 与 Lucide */
.user-bar .panel-item .el-icon {
    font-size: 16px;
}

/* hover 高亮整个可点击区域：下拉项高亮容器，保证与按钮项宽度一致（36px） */
.user-bar .el-button.panel-item:hover,
.user-bar .el-dropdown.panel-item:hover {
    background: rgba(0, 0, 0, 0.1);
}

/* 覆盖 el-dropdown 默认的主题文字色，避免经典布局深色头部下颜色不一致 */
.user-bar :deep(.el-dropdown) {
    color: inherit;
}

.ub-search-tree-wrap {
    margin-top: 12px;
    padding: 4px;
    max-height: 340px;
    overflow: auto;
}

.ub-search-tree {
    background: transparent;
}

/* 每个节点行像列表项：圆角、hover 高亮 */
.ub-search-tree :deep(.el-tree-node__content) {
    height: 40px;
    border-radius: 4px;
    cursor: pointer;
    transition:
        background-color 0.2s,
        color 0.2s;
}

.ub-search-tree :deep(.el-tree-node__content:hover) {
    background: var(--el-fill-color-light);
}

.ub-tree-node {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    font-size: 14px;
    color: var(--el-text-color-regular);
    transition: color 0.2s;
}

.ub-tree-node :deep(.el-icon) {
    font-size: 16px;
    color: var(--el-text-color-secondary);
    transition: color 0.2s;
}

/* hover 时文字与图标变主色 */
.ub-search-tree :deep(.el-tree-node__content:hover) .ub-tree-node {
    color: var(--el-color-primary);
}

.ub-search-tree :deep(.el-tree-node__content:hover) .ub-tree-node :deep(.el-icon) {
    color: var(--el-color-primary);
}

/* 目录(dir)：灰色加粗、无 hover 高亮 */
.ub-tree-node.is-dir {
    color: var(--el-text-color-secondary);
    font-weight: 500;
}

.ub-search-tree :deep(.el-tree-node__content:has(.ub-tree-node.is-dir)) {
    cursor: default;
}

.ub-search-tree :deep(.el-tree-node__content:has(.ub-tree-node.is-dir):hover) {
    background: transparent;
}

.ub-search-tree :deep(.el-tree-node__content:has(.ub-tree-node.is-dir):hover) .ub-tree-node {
    color: var(--el-text-color-secondary);
}

.ub-search-tree
    :deep(.el-tree-node__content:has(.ub-tree-node.is-dir):hover)
    .ub-tree-node
    :deep(.el-icon) {
    color: var(--el-text-color-secondary);
}

.user-bar .user-avatar {
    height: 100%;
    display: flex;
    align-items: center;
    gap: 6px;
}

.user-bar .user-avatar label {
    font-size: 13px;
    line-height: 1;
    cursor: pointer;
}

/* 下拉箭头略小，视觉上更像指示符；提高权重避免被上面的 16px 规则覆盖 */
.user-bar .panel-item .user-avatar .el-icon {
    font-size: 14px;
}
</style>
