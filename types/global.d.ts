// 扩展全局类型
import type { I18n } from 'vue-i18n'

declare global {
    // 全局应用配置接口
    interface AppConfig {
        APP_NAME: string
        DASHBOARD_URL: string
        APP_VER: string
        TIMEOUT: number
        TOKEN_NAME: string
        TOKEN_PREFIX: string
        HEADERS: Record<string, string>
        REQUEST_CACHE: boolean
        BAN_DEBUG: string
        BASE_URL: string
    }

    interface Window {
        __APP_CONFIG__: {
            API_URL?: string
            APP_NAME?: string
        }

        // 在这里显式声明window属性类型
        exception: (message: string, code?: string, data?: any) => never
        feedback: Feedback
        i18nInstance?: I18n
        is401ModalShown: boolean
    }

    /**
     * 全局业务错误抛出函数
     * @param message 错误信息
     * @param code 错误码（可选）
     * @param data 附加数据（可选）
     */
    function exception(message: string, code?: string, data?: any): never

    import type { Feedback } from '@/utils/feedback'
}

export {}
