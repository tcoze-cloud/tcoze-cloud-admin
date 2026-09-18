<template>
    <section class="admin-wrapper">
        <div v-if="!sysGlobalStore.sysIsMobile" class="admin-side-split">
            <div class="admin-side-split-top">
                <router-link :to="appDashboard">
                    <img class="logo" :title="appTitle" :alt="appTitle" :src="image.logo" />
                </router-link>
            </div>
            <div class="admin-side-split-scroll">
                <el-scrollbar>
                    <ul>
                        <li
                            v-for="item in menuList"
                            :key="item.name"
                            :class="parentMenu?.path == item.path ? 'active' : ''"
                            @click="showMenu(item)"
                            v-show="!item.meta.isHide"
                        >
                            <Icon :name="item.meta?.icon" />
                            <p>{{ item.meta?.title ? item.meta.title : '' }}</p>
                        </li>
                    </ul>
                </el-scrollbar>
            </div>
        </div>
        <div
            v-if="!sysGlobalStore.sysIsMobile"
            class="admin-side"
            :class="{
                'not-aside': nextMenu.length == 0,
                isCollapse: sysGlobalStore.sysMenuIsCollapse
            }"
        >
            <div v-if="!sysGlobalStore.sysMenuIsCollapse && parentMenu" class="admin-side-top">
                <h2>{{ parentMenu.meta?.title ? parentMenu.meta.title : '' }}</h2>
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
                        <navMenu :navMenus="nextMenu"></navMenu>
                    </el-menu>
                </el-scrollbar>
            </div>
        </div>
        <Side-m :menu="menuList" v-if="sysGlobalStore.sysIsMobile"></Side-m>
        <div class="admin-body">
            <TopBar>
                <UserBar></UserBar>
            </TopBar>
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
import TopBar from '../components/TopBar.vue'
import UserBar from '../components/UserBar.vue'
import Tags from '../components/Tags.vue'
import Bottom from '@/layout/components/Bottom.vue'
import MainView from '../components/MainView.vue'

const { route, sysGlobalStore, appTitle, appDashboard, image } = useLayoutMode()

defineProps<{
    menuList: Menu.MenuOptions[]
    parentMenu: Menu.MenuOptions
    nextMenu: Menu.MenuOptions[]
}>()
const emit = defineEmits(['selectOneMenu'])

const showMenu = (item: Menu.MenuOptions) => {
    emit('selectOneMenu', item)
}
</script>
