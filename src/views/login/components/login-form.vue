<template>
    <el-card class="login-form" :class="{ 'is-plain': plain }" :shadow="plain ? 'never' : 'always'">
        <div class="login-form-head">
            <h2 class="login-form-title">{{ $t('auth.loginTitle') }}</h2>
            <p class="login-form-desc">
                {{ $t('auth.loginDesc') }}
                <el-button link type="primary" class="login-form-signup" @click="onSignUp">
                    {{ $t('auth.signUp') }}
                </el-button>
            </p>
        </div>

        <div class="login-form-body">
            <el-form ref="formRef" :model="form" :rules="rules" @keyup.enter="onSubmit">
                <div class="login-field">
                    <label class="login-label" for="email">{{ $t('auth.email') }}</label>
                    <el-form-item prop="email">
                        <el-input
                            id="email"
                            v-model="form.email"
                            type="email"
                            placeholder="m@example.com"
                        />
                    </el-form-item>
                </div>

                <div class="login-field">
                    <div class="login-label-row">
                        <label class="login-label" for="password">{{ $t('auth.password') }}</label>
                        <ToForgotPasswordLink />
                    </div>
                    <el-form-item prop="password">
                        <el-input
                            id="password"
                            v-model="form.password"
                            type="password"
                            show-password
                            placeholder="*********"
                        />
                    </el-form-item>
                </div>

                <el-button type="primary" class="login-submit" :loading="loading" @click="onSubmit">
                    {{ $t('auth.signIn') }}
                </el-button>
            </el-form>

            <el-divider class="login-divider">{{ $t('auth.orContinueWith') }}</el-divider>

            <div class="login-oauth">
                <GitHubButton />
                <GoogleButton />
            </div>

            <p class="login-agree">
                {{ $t('auth.agreeLogin') }}
                <TermsOfServiceButton />
                {{ $t('auth.and') }}
                <PrivacyPolicyButton />
            </p>
        </div>
    </el-card>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import config from '@/config'
import passport from '@/api/modules/auth'
import { useAuthStore } from '@/stores/modules/use-auth-store'
import { useMenuStore } from '@/stores/modules/use-menu-store'

import GitHubButton from './github-button.vue'
import GoogleButton from './google-button.vue'
import PrivacyPolicyButton from './privacy-policy-button.vue'
import TermsOfServiceButton from './terms-of-service-button.vue'
import ToForgotPasswordLink from './to-forgot-password-link.vue'

interface Props {
    /** 双栏布局下去掉卡片边框与阴影（对应参考实现的 border-0 shadow-none） */
    plain?: boolean
}

withDefaults(defineProps<Props>(), {
    plain: false
})

const router = useRouter()
const authStore = useAuthStore()
const menuStore = useMenuStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
    email: '',
    password: ''
})

// 注：参考实现用 type="email" 强制邮箱格式，但后端以 username 接收账号
// （mock 账号为 admin），这里只做必填校验，避免非邮箱账号被拦下
const rules: FormRules = {
    email: [{ required: true, message: '请输入账号', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

function onSignUp() {
    // 当前项目无注册页，保持在登录页
    console.warn('[auth] 注册页面尚未接入')
}

async function onSubmit() {
    if (!formRef.value) return

    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    loading.value = true
    try {
        // 后端仍以 username 接收账号，这里把邮箱作为账号提交
        const res: any = await passport.getToken.post({
            username: form.email,
            password: form.password
        })
        authStore.accessToken = res.accessToken
        authStore.refreshToken = res.refreshToken

        const menuRes: any = await passport.getSystemMenu.get()
        menuStore.setMenus(menuRes.menu || [], menuRes.permissions || [])

        await router.push(config.DASHBOARD_URL)
    } catch (error) {
        console.error(error)
        ElMessage.error('登录失败，请检查用户名/密码或服务')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.login-form {
    width: 100%;
    max-width: 384px; /* 对应参考实现 max-w-sm */
    border-radius: 8px;
}

.login-form.is-plain {
    border: none;
    background: transparent;
}

.login-form :deep(.el-card__body) {
    padding: 24px;
}

.login-form.is-plain :deep(.el-card__body) {
    padding: 0;
}

/* 头部：标题 + 描述 */
.login-form-head {
    margin-bottom: 24px;
}

.login-form-title {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    line-height: 1.2;
    color: var(--el-text-color-primary);
}

.login-form-desc {
    margin: 8px 0 0;
    font-size: 14px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
}

.login-form-signup {
    height: auto;
    padding: 0;
    font-size: 14px;
    vertical-align: baseline;
}

/* 主体：字段间距 16px */
.login-form-body {
    display: grid;
    gap: 16px;
}

.login-field :deep(.el-form-item) {
    margin-bottom: 0;
}

.login-label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    line-height: 1;
    color: var(--el-text-color-primary);
}

.login-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
}

.login-label-row .login-label {
    margin-bottom: 0;
}

.login-submit {
    width: 100%;
}

.login-divider {
    margin: 0;
}

.login-divider :deep(.el-divider__text) {
    font-size: 12px;
    color: var(--el-text-color-secondary);
}

.login-oauth {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.login-agree {
    margin: 0;
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
}
</style>
