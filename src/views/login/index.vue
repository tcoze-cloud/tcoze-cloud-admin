<template>
    <div class="login-page">
        <main class="login-page-main">
            <AuthTitle />
            <LoginForm />
        </main>
    </div>
</template>

<script setup lang="ts">
import AuthTitle from './components/auth-title.vue'
import LoginForm from './components/login-form.vue'
</script>

<style scoped>
.login-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    min-width: 100vw;
    padding: 16px;
    background: var(--el-bg-color-page);
}

.login-page-main {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
</style>
