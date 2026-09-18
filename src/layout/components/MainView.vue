<template>
    <div class="admin-main" id="admin-main">
        <router-view v-slot="{ Component }">
            <transition appear name="fade-transform" mode="out-in">
                <div style="display: contents">
                    <keep-alive :include="sysKeepAliveStore.list">
                        <component :is="Component" :key="route.fullPath" v-if="isRouterShow" />
                    </keep-alive>
                </div>
            </transition>
        </router-view>
    </div>
</template>

<script setup lang="ts">
import { inject, ref, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { useSysKeepAliveStore } from '@/stores/use-keep-alive-store.ts'
const isRouterShow = inject<Ref<boolean>>('isRouterShow', ref(true))

const route = useRoute()
const sysKeepAliveStore = useSysKeepAliveStore()
</script>
