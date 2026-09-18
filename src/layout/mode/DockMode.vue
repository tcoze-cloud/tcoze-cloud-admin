<template>
    <header class="admin-header">
        <div class="admin-header-left">
            <div class="logo-bar">
                <img class="logo" :src="image.logo" alt="" />
                <span>{{ appTitle }}</span>
            </div>
            <div v-if="!sysGlobalStore.sysIsMobile" class="admin-header-menu">
                <el-menu
                    mode="horizontal"
                    :default-active="route.path"
                    router
                    background-color="var(--app-dock-bg)"
                    text-color="var(--app-side-text)"
                    active-text-color="var(--app-side-text-hover)"
                >
                    <NavMenu :navMenus="menuList"></NavMenu>
                </el-menu>
            </div>
        </div>
        <div class="admin-header-right">
            <Side-m :menu="menuList" v-if="sysGlobalStore.sysIsMobile"></Side-m>
            <UserBar></UserBar>
        </div>
    </header>
    <section class="admin-wrapper">
        <div class="admin-body">
            <Tags v-if="!sysGlobalStore.sysIsMobile && sysGlobalStore.sysLayoutTags"> </Tags>
            <MainView />
            <Bottom></Bottom>
        </div>
    </section>
</template>

<script setup lang="ts">
import { useLayoutMode } from '../composables/useLayoutMode'
import NavMenu from '../components/NavMenu.vue'
import SideM from '../components/SideM.vue'
import UserBar from '../components/UserBar.vue'
import Tags from '../components/Tags.vue'
import Bottom from '@/layout/components/Bottom.vue'
import MainView from '../components/MainView.vue'

const { route, sysGlobalStore, appTitle, image } = useLayoutMode()

defineProps<{
    menuList: Menu.MenuOptions[]
    parentMenu: Menu.MenuOptions
    nextMenu: Menu.MenuOptions[]
}>()

defineEmits(['selectOneMenu'])
</script>
