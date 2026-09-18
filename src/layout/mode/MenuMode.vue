<template>
    <section class="admin-wrapper">
        <div
            v-if="!sysGlobalStore.sysIsMobile"
            class="admin-side"
            :class="{ isCollapse: sysGlobalStore.sysMenuIsCollapse }"
        >
            <div class="admin-side-top">
                <img class="logo" :src="image.logo" :alt="appTitle" :title="appTitle" />
                <span v-if="!sysGlobalStore.sysMenuIsCollapse" class="logo-text">{{
                    appTitle
                }}</span>
            </div>
            <div class="admin-side-scroll">
                <el-scrollbar>
                    <el-menu
                        :default-active="route.path"
                        router
                        :collapse="sysGlobalStore.sysMenuIsCollapse"
                        :unique-opened="sysGlobalStore.sysMenuUniqueOpened"
                        :collapse-transition="false"
                    >
                        <navMenu :navMenus="menuList"></navMenu>
                    </el-menu>
                </el-scrollbar>
            </div>
        </div>
        <Side-m :menu="menuList" v-if="sysGlobalStore.sysIsMobile"></Side-m>
        <div class="admin-body">
            <header class="admin-header">
                <div class="admin-header-left">
                    <div class="top-actions">
                        <el-icon
                            class="action-btn"
                            @click="
                                sysGlobalStore.sysMenuIsCollapse = !sysGlobalStore.sysMenuIsCollapse
                            "
                        >
                            <el-icon-expand v-if="sysGlobalStore.sysMenuIsCollapse" />
                            <el-icon-fold v-else />
                        </el-icon>
                    </div>
                    <Breadcrumb></Breadcrumb>
                </div>
                <div class="admin-header-right">
                    <UserBar></UserBar>
                </div>
            </header>
            <Tags v-if="!sysGlobalStore.sysIsMobile && sysGlobalStore.sysLayoutTags"> </Tags>
            <MainView />
            <Bottom></Bottom>
        </div>
    </section>
</template>

<script setup lang="ts">
import { useLayoutMode } from '../composables/useLayoutMode'
import navMenu from '../components/NavMenu.vue'
import SideM from '../components/SideM.vue'
import Breadcrumb from '../components/Breadcrumb.vue'
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
