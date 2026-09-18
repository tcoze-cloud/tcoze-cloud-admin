<template>
    <el-button link class="privacy-button" @click="onOpen">
        {{ $t('auth.privacyPolicy') }}
    </el-button>
</template>

<script setup lang="ts">
function onOpen() {
    // 参考实现中的占位行为：暂未接入隐私政策页面
    console.warn('[auth] 隐私政策页面尚未接入')
}
</script>

<style scoped>
.privacy-button {
    height: auto;
    padding: 0;
    font-size: 12px;
    font-weight: 400;
    color: var(--el-text-color-secondary);
    text-decoration: underline;
    vertical-align: baseline;
}
</style>
