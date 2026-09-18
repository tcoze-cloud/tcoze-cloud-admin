import 'axios'

// 扩展 Axios 的请求配置类型，添加自定义属性
declare module 'axios' {
    interface AxiosRequestConfig {
        // 声明自定义属性，用于标记是否跳过请求拦截器
        skipRequestInterceptors?: boolean
        forceRefresh?: boolean // 强制刷新Token
        skipDuplicateCheck?: boolean // 跳过重复请求检查
        requestKey?: string // 重复请求挂载标识
    }
}
