<template>
    <div class="admin-topbar">
        <div class="left-panel">
            <Icon
                class="collapse-btn"
                :name="collapseIcon"
                :stroke-width="2.5"
                @click="sysGlobalStore.sysMenuIsCollapse = !sysGlobalStore.sysMenuIsCollapse"
            />
            <Breadcrumb></Breadcrumb>
        </div>
        <div class="center-panel"></div>
        <div class="right-panel">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSysGlobalStore } from '@/stores/use-global-store.ts'
import Breadcrumb from './Breadcrumb.vue'

const sysGlobalStore = useSysGlobalStore()

// 菜单已折叠时展示「展开」，未折叠时展示「收起」
const collapseIcon = computed(() =>
    sysGlobalStore.sysMenuIsCollapse ? 'lucide:PanelLeftOpen' : 'lucide:PanelLeftClose'
)
</script>

<style scoped>
.admin-topbar {
    display: flex;
    align-items: center;
    height: 50px;
    padding: 0 16px;
    background: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-light);
}

.left-panel {
    display: flex;
    align-items: center;
    min-width: 0;
}

.collapse-btn {
    margin-right: 12px;
    font-size: 18px;
    cursor: pointer;
    color: var(--el-text-color-regular);
    transition: color 0.2s;
}

.collapse-btn:hover {
    color: var(--el-color-primary);
}

.center-panel {
    flex: 1;
}

.right-panel {
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

.el-breadcrumb {
    margin-left: 4px;
}
</style>
