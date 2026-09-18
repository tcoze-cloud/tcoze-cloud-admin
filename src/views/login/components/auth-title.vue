<template>
    <h1 class="auth-title">
        <img class="auth-title-logo" :src="image.logo" :alt="appName" />
        <span>{{ appName }}</span>
    </h1>
</template>

<script setup lang="ts">
import config from '@/config'
import image from '@/utils/image'

const appName = config.APP_NAME
</script>

<style scoped>
.auth-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
    color: var(--el-text-color-primary);
}

.auth-title-logo {
    height: 24px;
    width: auto;
    object-fit: contain;
}
</style>

<!-- 非 scoped：html.dark 由外层 <html> 控制，不在组件根节点上 -->
<style>
html.dark .auth-title-logo {
    filter: brightness(0) invert(1);
}
</style>
