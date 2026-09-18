<template>
    <el-button link class="forgot-link" @click="onForgotPassword">
        {{ $t('auth.forgotPassword') }}
    </el-button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function onForgotPassword() {
    // 当前项目尚无独立「忘记密码」页面，先留在登录页
    router.push({ path: '/login' })
}
</script>

<style scoped>
.forgot-link {
    height: auto;
    padding: 0;
    font-size: 12px;
    font-weight: 400;
    color: var(--el-text-color-secondary);
}
</style>
