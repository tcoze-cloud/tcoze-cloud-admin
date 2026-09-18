<template>
    <el-button link class="tos-button" @click="onOpen">
        {{ $t('auth.termsOfService') }}
    </el-button>
</template>

<script setup lang="ts">
function onOpen() {
    // 参考实现中的占位行为：暂未接入服务条款页面
    console.warn('[auth] 服务条款页面尚未接入')
}
</script>

<style scoped>
.tos-button {
    height: auto;
    padding: 0;
    font-size: 12px;
    font-weight: 400;
    color: var(--el-text-color-secondary);
    text-decoration: underline;
    vertical-align: baseline;
}
</style>
