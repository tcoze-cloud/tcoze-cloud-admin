import { createI18n, type I18nOptions } from 'vue-i18n'
import { useSysGlobalStore } from '@/stores/use-global-store.ts'
import type { Pinia } from 'pinia'
import appZhCN from '@/locale/lang/zh-CN.json'
import appEnUS from '@/locale/lang/en-US.json'

// 支持的语言
export const supportedLangs = ['zh-cn', 'zh-tw', 'en'] as const

// 语言别名 -> 标准语言（兼容历史持久化数据，如 'zh' / 'en-US'）
const langAliases: Record<string, (typeof supportedLangs)[number]> = {
    'zh': 'zh-cn',
    'cn': 'zh-cn',
    'zh-hans': 'zh-cn',
    'zh-hans-cn': 'zh-cn',
    'zh-cn': 'zh-cn',
    'zh-tw': 'zh-tw',
    'zh-hk': 'zh-tw',
    'zh-hant': 'zh-tw',
    'en': 'en',
    'en-us': 'en',
    'en-gb': 'en'
}

// 归一化语言标识，保证拿到的一定是受支持的语言
export const normalizeLang = (lang?: string) => {
    if (!lang) return 'zh-cn'
    return langAliases[lang.toLowerCase()] || 'zh-cn'
}

// 同步注入应用文案，避免首屏渲染（早于 getLang 注册）时出现 key 缺失告警
const messages = {
    'zh-cn': appZhCN,
    'zh-tw': appZhCN,
    'zh': appZhCN,
    'en': appEnUS,
    'en-us': appEnUS
}

export const createI18nInstance = (pinia: Pinia) => {
    const sysGlobalStore = useSysGlobalStore(pinia)

    const i18nOptions: I18nOptions = {
        legacy: false,
        locale: normalizeLang(sysGlobalStore.sysLang),
        fallbackLocale: 'zh-cn',
        globalInjection: true,
        messages
    }

    const i18nInstance = createI18n(i18nOptions)

    // 暴露实例供全局使用
    window.i18nInstance = i18nInstance
    return i18nInstance
}

export default createI18nInstance

// el语言格式转化
export const formatLang = (locale: string) => {
    if (!locale) return 'zhCn' // 默认值

    const lowerLocale = locale.toLowerCase()
    // 特殊语言处理
    const specialLang = ['zh-cn', 'nb-no', 'zh-tw', 'pt-br', 'ug-cn', 'hy-am']

    if (specialLang.includes(lowerLocale)) {
        // 手动实现 camelCase 转换
        return lowerLocale.replace(/-(\w)/g, (_, char) => char.toUpperCase())
    } else {
        // 非特殊语言取前两位（如 'en-us' → 'en'）
        return lowerLocale.slice(0, 2)
    }
}

// 语言选项配置
export const langOptions = [
    {
        name: '简体中文',
        value: 'zh-cn'
    },
    {
        name: '中文繁体',
        value: 'zh-tw'
    }
]

// 类型定义（可选，用于TypeScript类型提示）
export interface LangOption {
    name: string
    value: string
}
