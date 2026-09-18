<template>
    <!-- 参考实现：w-full h-screen lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px] -->
    <div class="login-split">
        <!-- 左侧：占位大图（relative hidden bg-muted lg:block） -->
        <div class="login-split-aside">
            <img
                class="login-split-img"
                :src="image.loginPlaceholder"
                :alt="$t('auth.image')"
                width="1920"
                height="1080"
            />
            <AuthTitle class="login-split-brand" />
        </div>

        <!-- 右侧：表单（flex items-center justify-center py-12） -->
        <div class="login-split-main">
            <!-- mx-auto grid w-[350px] gap-6 -->
            <div class="login-split-form">
                <LoginForm plain />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import image from '@/utils/image'
import AuthTitle from './components/auth-title.vue'
import LoginForm from './components/login-form.vue'
</script>

<style scoped>
.login-split {
    width: 100%;
    height: 100vh; /* h-screen */
}

@media (min-width: 1024px) {
    .login-split {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr)); /* lg:grid-cols-2 */
        min-height: 600px; /* lg:min-h-[600px] */
    }
}

@media (min-width: 1280px) {
    .login-split {
        min-height: 800px; /* xl:min-h-[800px] */
    }
}

.login-split-aside {
    position: relative;
    display: none; /* hidden */
    background: var(--el-fill-color-light); /* bg-muted */
}

@media (min-width: 1024px) {
    .login-split-aside {
        display: block; /* lg:block */
    }
}

.login-split-img {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.login-split-brand {
    position: absolute;
    left: 32px; /* left-8 */
    top: 32px; /* top-8 */
    z-index: 10;
}

.login-split-main {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 48px; /* py-12 */
    padding-bottom: 48px;
}

.login-split-form {
    width: 350px;
    max-width: 100%;
    margin: 0 auto;
    display: grid;
    gap: 24px; /* gap-6 */
}
</style>

<!-- 非 scoped：html.dark 由外层 <html> 控制，不在组件根节点上 -->
<style>
html.dark .login-split-img {
    filter: brightness(0.3) grayscale(100%);
}
</style>
