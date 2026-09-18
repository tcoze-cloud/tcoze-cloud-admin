<template>
    <div class="router-err">
        <div class="router-err__icon">
            <img :src="image.notFound" alt="" />
        </div>
        <div class="router-err__content">
            <h2>页面无权限或不存在</h2>
            <p>您访问的页面无权限或不存在，请检查地址是否正确，或返回上一页</p>
            <div class="router-err-btn">
                <el-button type="primary" plain round @click="goHome">返回首页</el-button>
                <el-button type="primary" round @click="goBack">返回上一页</el-button>
                <el-button type="primary" round @click="goLogin">清除缓存并登录</el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import router from '@/router'
import image from '@/utils/image.ts'
import { useAuthStore } from '@/stores/modules/use-auth-store.ts'

const goHome = () => {
    router.push('/')
}

const goBack = () => {
    router.go(-1)
}

const goLogin = () => {
    // 清除认证状态（例如token、用户信息等）
    const authStore = useAuthStore()
    authStore.$reset()

    // 检查当前路由是否已经是/login
    if (router.currentRoute.value.path === '/login') {
        return
    }

    // 执行跳转
    router
        .replace('/login')
        .then(() => {
            // console.log('成功跳转到登录页')
        })
        .catch((err) => {
            console.error('路由跳转错误:', err)
            // 跳转失败时，强制刷新页面
            location.href = '/login'
        })
}
</script>

<style scoped>
.router-err {
    display: flex;
    width: 900px;
    margin: 50px auto;
    align-items: center;
}

.router-err__icon {
    width: 400px;
}

.router-err__icon img {
    width: 100%;
}

.router-err__content {
    flex: 1;
    padding: 40px;
}

.router-err__content h2 {
    font-size: 26px;
}

.router-err__content p {
    font-size: 14px;
    color: #999;
    margin: 15px 0 30px 0;
    line-height: 1.5;
}

.router-err-btn {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

@media (max-width: 992px) {
    .router-err {
        display: block;
        width: 100%;
        margin-top: 10px;
        text-align: center;
    }

    .router-err__icon {
        width: 280px;
        margin: 0 auto;
    }

    .router-err-btn {
        justify-content: center;
    }
}
</style>
