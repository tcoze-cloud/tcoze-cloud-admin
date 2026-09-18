<template>
    <el-config-provider
        :locale="messages[locale] as any"
        :size="config.size"
        :zIndex="config.zIndex"
        :button="config.button"
    >
        <router-view></router-view>
    </el-config-provider>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeMount, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import DisableDevtool from 'disable-devtool'
import colorTool from '@/utils/color'
import { useSysGlobalStore } from '@/stores/use-global-store.ts'
import appConfig from '@/config'
import { useAuthStore } from '@/stores/modules/use-auth-store.ts'

const { locale, messages } = useI18n()
const sysGlobalStore = useSysGlobalStore()
const authStore = useAuthStore()

const isAllowDebug = appConfig.BAN_DEBUG

// 响应式数据
const config = ref({
    size: 'default' as 'large' | 'default' | 'small',
    zIndex: 2000,
    button: {
        autoInsertSpace: false
    }
})

// 设置主题颜色
const setTheme = () => {
    const app_color = sysGlobalStore.sysColor
    if (app_color) {
        document.documentElement.style.setProperty('--el-color-primary', app_color)
        for (let i = 1; i <= 9; i++) {
            document.documentElement.style.setProperty(
                `--el-color-primary-light-${i}`,
                colorTool.lighten(app_color, i / 10)
            )
        }
        for (let i = 1; i <= 9; i++) {
            document.documentElement.style.setProperty(
                `--el-color-primary-dark-${i}`,
                colorTool.darken(app_color, i / 10)
            )
        }
    }
    // 设置暗黑模式
    document.documentElement.classList[sysGlobalStore.sysDark ? 'add' : 'remove']('dark')
}

// 禁止调试
const banDevtool = () => {
    if (isAllowDebug === 'true') {
        DisableDevtool({
            url: 'about:blank',
            timeOutUrl: 'about:blank',
            disableMenu: false
        })
    }
}

// 用 $subscribe 监听 store 所有状态变化（更优雅的Pinia原生方式）
sysGlobalStore.$subscribe((_, state) => {
    // 同步语言
    if (locale.value !== state.sysLang) {
        locale.value = state.sysLang
    }
})

// 组件创建时执行
onMounted(async () => {
    setTheme()
    banDevtool()
    await sysGlobalStore.getLang()

    // 等待 authStore 初始化完成后启动监控
    await nextTick()
    startTokenMonitor()

    console.log('[App.vue] onMounted：组件已挂载')
})

// 组件挂载前执行
onBeforeMount(() => {
    console.log('[App.vue] onBeforeMount：组件即将挂载')
})

// 组件卸载前执行
onUnmounted(() => {
    console.log('[App.vue] onUnmounted：组件即将卸载')

    // 清理定时器
    // if (checkTokenTimer.value) {
    //     clearInterval(checkTokenTimer.value)
    //     console.log(`${getLogPrefix()} 监控已停止`)
    // }
})

// Token监控相关
const checkTokenTimer = ref<number | null>(null)

// 日志前缀（带时间戳，便于追踪）
const getLogPrefix = () => `[${new Date()}][Token监控]`

// 检查 Token 并输出日志
const checkTokenAndLog = async () => {
    const token = authStore.accessToken

    // 1. 检查 Token 是否存在
    if (!token) {
        console.log(`${getLogPrefix()} 未检测到 Token（可能未登录）`)
        return
    }

    // 2. 复用 authStore 的 needRefresh 检查是否需要刷新
    const needRefresh = authStore.needRefresh(token)

    // 3. 解码 Token 获取过期时间（复用 authStore 的 decodeToken）
    const decoded = authStore.decodeToken(token)
    const expTime = decoded?.exp ? new Date(decoded.exp * 1000).toLocaleTimeString() : '未知'
    const remainingTime = decoded?.exp ? Math.ceil(decoded.exp - Date.now() / 1000) : 0

    // 4. 输出状态日志
    if (needRefresh) {
        console.warn(
            `${getLogPrefix()} Token 即将过期 | 过期时间: ${expTime} | 剩余: ${remainingTime}秒（<2分钟）`
        )

        // 5. 触发刷新（复用 authStore 的刷新方法）
        try {
            console.log(`${getLogPrefix()} 开始自动刷新 Token...`)
            const newToken = await authStore.handleRefreshToken()
            if (newToken) {
                console.log(`${getLogPrefix()} Token 刷新成功 | 新 Token 已生效`)
            } else {
                console.error(`${getLogPrefix()} Token 刷新失败（可能 RefreshToken 过期）`)
            }
        } catch (err) {
            console.error(`${getLogPrefix()} 刷新过程出错:`, err)
        }
    } else {
        console.log(
            `${getLogPrefix()} Token 状态正常 | 过期时间: ${expTime} | 剩余: ${remainingTime}秒（≥120s）`
        )
    }
}

// 启动定时检查
const startTokenMonitor = () => {
    // 立即执行一次（避免等待）
    checkTokenAndLog()

    checkTokenTimer.value = window.setInterval(checkTokenAndLog, 10 * 1000)

    console.log(`${getLogPrefix()} 监控已启动（每3秒检查一次）`)
}
</script>
