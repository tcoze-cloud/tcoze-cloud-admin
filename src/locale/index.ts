type Lang = 'zh-cn' | 'en'

const LANG = {
    ZH_CN: 'zh-cn',
    EN_US: 'en'
} as const

/**
 * 切换全局语言（作用于已创建的 i18n 实例）
 */
function setLocale(lang: Lang) {
    const instance = (window as any).i18nInstance
    if (instance) {
        instance.global.locale.value = lang
    }
}

export { LANG }
export type { Lang }
export { setLocale }
