<template>
    <div v-if="sysGlobalStore.sysShowCopyright" class="admin-side-bottom">
        <span class="copyright">{{ $t('common.poweredBy', {year}) }}</span>
    </div>
</template>

<script lang="ts" setup>
import {useSysGlobalStore} from '@/stores/use-global-store.ts'

const sysGlobalStore = useSysGlobalStore()
const year = new Date().getFullYear()
</script>

<style scoped>
.admin-side-bottom {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
}

.admin-side-bottom .website {
    color: var(--el-color-primary);
    text-decoration: none;
}

.admin-side-bottom .icp {
    color: var(--el-text-color-secondary);
    text-decoration: none;
    cursor: pointer;
}

.admin-side-bottom .website:hover {
    text-decoration: underline;
}
</style>
