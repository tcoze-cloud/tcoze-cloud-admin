<template>
    <el-breadcrumb separator="/" class="admin-breadcrumb hidden-sm-and-down">
        <template v-for="item in validBreadcrumbList" :key="item.name">
            <el-breadcrumb-item v-if="item.path != '/'">
                {{ itemTitle(item) }}
            </el-breadcrumb-item>
        </template>
    </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMenuStore } from '@/stores/modules/use-menu-store.ts'

const menuStore = useMenuStore()

const validBreadcrumbList = computed(() =>
    menuStore.breadcrumbList.filter(
        (item: Menu.MenuOptions) => item && item.path && itemTitle(item)
    )
)

function itemTitle(item: Menu.MenuOptions) {
    const title = item.meta?.title
    if (title && title !== 'undefined') {
        return title
    }
    return item.name || ''
}
</script>

<style scoped>
.admin-breadcrumb {
    margin-left: 4px;
}
</style>
