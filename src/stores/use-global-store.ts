import { defineStore } from 'pinia'
import { SelfStorage } from '@/utils/local-storage.ts'
import { formatLang, normalizeLang } from '@/utils/locale.ts'
import * as localeList from 'element-plus/es/locale/index'
import { setLocale, type Lang } from '@/locale'
import appZhCN from '@/locale/lang/zh-CN.json'
import appEnUS from '@/locale/lang/en-US.json'

// 导入i18n实例
import { getCurrentInstance, type WritableComputedRef } from 'vue'
import type { I18n } from 'vue-i18n'

interface SysGlobalModel {
    sysIsMobile: boolean
    sysLayout: string
    sysLang: string
    sysColor: string
    sysDark: boolean
    sysMenuIsCollapse: boolean
    sysMenuUniqueOpened: boolean
    sysLayoutTags: boolean
    sysAutoExit: number
    sysShowCopyright: boolean
}

const appMessages: Record<string, any> = {
    'zh-cn': appZhCN,
    'en': appEnUS,
    'zh-CN': appZhCN,
    'en-US': appEnUS
}

export const useSysGlobalStore = defineStore('sysGlobal', {
    state(): SysGlobalModel {
        return {
            // 移动端布局
            sysIsMobile: false,
            // 布局 [默认-default | 通栏-header | 经典-menu | 功能坞-dock（将关闭标签和面包屑栏）]
            sysLayout: 'default',
            // 语言，默认中文zh-cn,英文en
            sysLang: 'zh-cn',
            // 主题颜色
            sysColor: '#373dfb',
            // 暗黑模式
            sysDark: false,
            // 菜单是否折叠 toggle
            sysMenuIsCollapse: false,
            // 菜单是否只保持一个子菜单的展开
            sysMenuUniqueOpened: false,
            // 多标签栏
            sysLayoutTags: true,
            // 自动登出时间
            sysAutoExit: 0,
            // 底部版权信息
            sysShowCopyright: true
        }
    },
    getters: {
        // 修复：更稳定地获取i18n实例
        i18nInstance(): I18n {
            // 优先从window获取（全局注入的实例）
            if (window.i18nInstance) {
                return window.i18nInstance
            }
            // 从组件实例获取
            const instance = getCurrentInstance()?.appContext.config.globalProperties.$i18n
            if (instance) {
                return instance as unknown as I18n
            }
            // 避免返回undefined，强制报错提示
            throw new Error('i18n实例未初始化，请检查main.ts中的配置')
        }
    },
    actions: {
        set<T extends keyof SysGlobalModel>(key: T, value: SysGlobalModel[T]) {
            Object.assign(this.$state, {
                [key]: value
            })
        },

        // 切换语言
        setLang(lang: Lang) {
            this.sysLang = lang
            setLocale(lang)
        },

        // 设置语言（不再从后端拉取翻译包，仅切换 element-plus 语言与 i18n 语言）
        async getLang() {
            // 归一化语言，兼容历史持久化值（如 'zh'），并回写为受支持的语言
            const targetLang = normalizeLang(this.sysLang)
            const appLang = targetLang.toLowerCase()

            if (this.sysLang !== targetLang) {
                this.set('sysLang', targetLang)
            }

            // 获取 element-plus 对应语言的消息
            const esLang = formatLang(appLang)
            const elMessages = (localeList as any)[esLang] || {}

            // 应用自身文案
            const appMessage = appMessages[appLang] || (appLang.startsWith('zh') ? appZhCN : appEnUS)

            // 获取i18n实例
            const i18n = this.i18nInstance
            if (!i18n) {
                console.error('i18n instance not found')
                return
            }

            // 注册 element-plus 组件翻译 + 应用文案
            i18n.global.setLocaleMessage(targetLang, {
                ...appMessage,
                ...elMessages
            })

            // 更新 i18n 的当前语言
            ;(i18n.global.locale as WritableComputedRef<string>).value = targetLang

            return targetLang
        }
    },
    persist: {
        key: 'SYS_GLOBAL',
        storage: SelfStorage,
        pick: [
            'sysLayout',
            'sysLang',
            'sysColor',
            'sysDark',
            'sysMenuIsCollapse',
            'sysMenuUniqueOpened',
            'sysLayoutTags',
            'sysAutoExit',
            'sysShowCopyright'
        ]
    }
})
