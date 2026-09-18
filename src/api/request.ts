import axios, {
    type AxiosRequestConfig,
    type AxiosResponse,
    type CancelTokenSource,
    type InternalAxiosRequestConfig
} from 'axios'
import router from '@/router'
import { useSysGlobalStore } from '@/stores/use-global-store.ts'
import { useAuthStore } from '@/stores/modules/use-auth-store.ts'
import defaultConfig from '@/config'
import { RequestCodeEnum, RequestMessageEnum } from '@/enums/request-enum.ts'
import { nextTick } from 'vue'

// ========================= 重复请求管理 =========================
// 存储正在进行的请求（key: 请求唯一标识, value: 取消函数）
const pendingRequests = new Map<string, CancelTokenSource>()

/**
 * 生成请求唯一标识（method + url + 参数序列化）
 */
function generateRequestKey(config: AxiosRequestConfig): string {
    const { method, url, params, data } = config
    const paramsStr = params ? JSON.stringify(sortObject(params)) : ''
    const dataStr = data ? JSON.stringify(sortObject(data)) : ''
    return `${method?.toUpperCase()}-${url}-${paramsStr}-${dataStr}`
}

/**
 * 对象排序（确保参数顺序不影响唯一标识）
 */
function sortObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj
    const sorted = {} as any
    Object.keys(obj)
        .sort()
        .forEach((key) => {
            sorted[key] = sortObject(obj[key])
        })
    return sorted
}

/**
 * 取消重复请求并添加当前请求到缓存池
 */
function handleDuplicateRequest(config: AxiosRequestConfig): string {
    const key = generateRequestKey(config)
    // 取消前一次重复请求
    if (pendingRequests.has(key)) {
        const source = pendingRequests.get(key)
        source?.cancel('取消重复请求')
        pendingRequests.delete(key)
    }
    // 存储当前请求的取消函数
    const source = axios.CancelToken.source()
    config.cancelToken = source.token
    pendingRequests.set(key, source)
    return key
}

/**
 * 从缓存池移除请求
 */
function removePendingRequest(key: string) {
    if (pendingRequests.has(key)) {
        pendingRequests.delete(key)
    }
}

// ========================= 请求缓存管理 =========================
// 缓存配置（默认5分钟过期）
const CACHE_EXPIRE = 5 * 60 * 1000
// 缓存池（key: 请求标识, value: { data: 数据, expire: 过期时间 }）
const requestCache = new Map<string, { data: any; expire: number }>()

/**
 * 获取缓存数据（未过期则返回）
 */
function getCacheData(key: string) {
    const cache = requestCache.get(key)
    if (!cache) return null
    if (Date.now() > cache.expire) {
        requestCache.delete(key) // 过期清除
        return null
    }
    return cache.data
}

/**
 * 设置缓存数据
 */
function setCacheData(key: string, data: any, expire = CACHE_EXPIRE) {
    requestCache.set(key, { data, expire: Date.now() + expire })
}

/**
 * 清除指定URL的缓存
 */
export function clearCacheByUrl(url: string) {
    requestCache.forEach((_, key) => key.includes(url) && requestCache.delete(key))
}

// ========================= 初始化axios实例 =========================
const request = axios.create({
    baseURL: defaultConfig.API_URL,
    timeout: defaultConfig.TIMEOUT,
    withCredentials: false
})

// 防止拦截器重复注册
let interceptorsRegistered = false

/**
 * 注册拦截器
 */
function registerInterceptors() {
    if (interceptorsRegistered) return
    interceptorsRegistered = true

    // 请求拦截器
    request.interceptors.request.use(
        async (config: InternalAxiosRequestConfig) => {
            // 过滤预检请求
            if (config.method?.toLowerCase() === 'options') return config

            // 处理重复请求
            config.requestKey = handleDuplicateRequest(config) // 挂载标识

            // 跳过拦截器的请求（如刷新Token）
            if (config.skipRequestInterceptors) return config

            // 多语言header
            const sysGlobalStore = useSysGlobalStore()
            if (sysGlobalStore.sysLang) {
                config.headers.set('cb-lang', sysGlobalStore.sysLang)
            }

            // Token处理
            const authStore = useAuthStore()
            let accessToken: string | null = authStore.accessToken
            if (accessToken && authStore.needRefresh(accessToken)) {
                accessToken = await authStore.handleRefreshToken()
            }
            if (accessToken) {
                config.headers.set(
                    defaultConfig.TOKEN_NAME,
                    `${defaultConfig.TOKEN_PREFIX}${accessToken}`
                )
            }

            // GET请求防缓存（加时间戳，与缓存机制兼容）
            if (!defaultConfig.REQUEST_CACHE && config.method?.toLowerCase() === 'get') {
                config.params = { ...config.params, _t: Date.now() }
            }

            // 合并默认headers（使用set方法逐个添加）
            if (defaultConfig.HEADERS) {
                Object.entries(defaultConfig.HEADERS).forEach(([key, value]) => {
                    config.headers.set(key, value)
                })
            }

            return config
        },
        (error) => {
            // 错误时移除缓存
            if (error.config?.requestKey) removePendingRequest(error.config.requestKey)
            feedback.closeLoading()
            return Promise.reject(error)
        }
    )

    // 响应拦截器
    request.interceptors.response.use(
        (response: AxiosResponse) => {
            // 移除重复请求缓存
            if (response.config.requestKey) {
                removePendingRequest(response.config.requestKey)
            }

            // 过滤预检请求
            if (response.config.method?.toLowerCase() === 'options') return response

            // 业务响应类型
            type BusinessResponse = {
                status: string | number
                data: any
                message: string
            }

            const responseData = response.data as BusinessResponse

            // 校验业务响应格式
            const isValid = (data: any): data is BusinessResponse => {
                return 'status' in data && 'data' in data && 'message' in data
            }

            if (isValid(responseData)) {
                switch (responseData.status) {
                    case RequestCodeEnum.OK:
                        // POST请求自动提示
                        if (
                            response.config.method?.toLowerCase() === 'post' &&
                            responseData.message !== RequestMessageEnum.DISABLE_FEEDBACK
                        ) {
                            feedback.success(responseData.message)
                        }
                        return decryptResponse(responseData.data)

                    case RequestCodeEnum.FAIL:
                        feedback.error(responseData.message)
                        feedback.closeLoading()
                        return (response.config as any).await
                            ? false
                            : Promise.reject(responseData.message)

                    default:
                        return decryptResponse(responseData.data)
                }
            } else {
                console.warn('响应格式异常', responseData)
                feedback.error('服务端响应格式错误')
                return Promise.reject(new Error('响应格式异常'))
            }
        },
        async (error) => {
            // 处理取消请求的错误（不提示用户）
            if (axios.isCancel(error)) {
                console.log('已取消重复请求:', error.message)
                return Promise.reject(new Error('请求已取消'))
            }

            // 移除重复请求缓存
            if (error.config?.requestKey) {
                removePendingRequest(error.config.requestKey)
            }

            feedback.closeLoading()

            // 错误重试（针对502/503/504等临时错误）
            const { config, response } = error
            const retryStatus = [502, 503, 504] // 可重试的状态码
            if (
                config?.method?.toLowerCase() !== 'options' &&
                retryStatus.includes(response?.status) &&
                (config.retryCount || 0) < (config.maxRetry || 1)
            ) {
                config.retryCount = (config.retryCount || 0) + 1
                await new Promise((resolve) => setTimeout(resolve, 1000 * config.retryCount)) // 延迟重试
                console.log(`请求重试 ${config.retryCount} 次: ${config.url}`)
                return request(config)
            }

            // 常规错误处理
            if (response) {
                await handleErrorStatus(error)
            } else {
                console.error('网络错误:', error)
                feedback.error('网络连接失败，请检查网络')
            }

            return Promise.reject(error)
        }
    )
}

// 初始化拦截器
registerInterceptors()

// ========================= 核心功能函数 =========================
/**
 * 通用请求发送函数
 */
async function sendRequest(
    method: 'get' | 'post',
    url: string,
    payload: object = {},
    config: AxiosRequestConfig = {}
): Promise<any> {
    // 生成缓存key
    const cacheKey = generateRequestKey({
        ...config,
        method,
        url,
        params: method === 'get' ? payload : undefined,
        data: method === 'post' ? payload : undefined
    })

    // GET请求优先读缓存
    if (method === 'get' && !config.forceRefresh) {
        const cacheData = getCacheData(cacheKey)
        if (cacheData) {
            console.log(`[缓存命中] ${url}`)
            return cacheData
        }
    }

    try {
        const response = await request({
            method,
            url,
            params: method === 'get' ? encryptData(payload) : undefined,
            data: method === 'post' ? encryptData(payload) : undefined,
            ...config
        })

        // GET请求写入缓存
        if (method === 'get' && !config.forceRefresh) {
            setCacheData(cacheKey, response)
        }

        return response
    } catch (error) {
        return Promise.reject(error)
    }
}

/**
 * 请求参数加密
 */
function encryptData(data: object = {}): object {
    return data
}

/**
 * 响应数据解密
 */
function decryptResponse(data: { data: any }): any {
    return data
}

/**
 * 错误状态处理（401/404/500等）
 */
async function handleErrorStatus(error: any) {
    const { status, data } = error.response
    const authStore = useAuthStore()
    let is401ModalShown = false // 防止401重复弹窗

    switch (status) {
        case 404:
            feedback.error('请求的资源不存在（404）')
            break

        case 500:
            const contentType = error.response.headers['content-type'] || ''
            if (contentType.includes('text/html') && data.includes('sf-dump')) {
                await nextTick(() => feedback.showDebug(data))
                return { status: 'debug', message: '调试信息已显示' }
            }
            feedback.error('服务器内部错误（500）')
            break

        case 401:
            if (is401ModalShown) return
            is401ModalShown = true

            const originalRequest = error.config

            if (!originalRequest._retry && !originalRequest.skipRequestInterceptors) {
                originalRequest._retry = true
                const newToken = await authStore.handleRefreshToken()
                if (newToken) {
                    originalRequest.headers[defaultConfig.TOKEN_NAME] =
                        `${defaultConfig.TOKEN_PREFIX}${newToken}`
                    is401ModalShown = false
                    return request(originalRequest)
                }
            }

            authStore.$reset()

            // Token刷新失败，强制登录
            await feedback.confirm('登录已过期，请重新登录', '会话过期', {
                type: 'error',
                closeOnClickModal: false,
                showCancelButton: false,
                confirmButtonText: '重新登录',
                beforeClose: (_, __, done) => {
                    is401ModalShown = false
                    done()
                }
            })

            await router.replace('/login')
            break

        default:
            feedback.error(`请求失败（${status}）：${data.message || '未知错误'}`)
    }
}

// ========================= 对外暴露的API =========================
/**
 * 请求方法集合
 * - 支持常规请求、强制刷新（跳过缓存）、跳过重复检查
 */
export const http = {
    get: (url: string, params: object = {}, config: AxiosRequestConfig = {}) =>
        sendRequest('get', url, params, { forceRefresh: true, ...config }),
    post: (url: string, data: object = {}, config: AxiosRequestConfig = {}) =>
        sendRequest('post', url, data, {
            skipDuplicateCheck: false,
            skipRequestInterceptors: false,
            ...config
        })
}

/**
 * 组件卸载时取消未完成请求（避免内存泄漏）
 * 使用示例：onUnmounted(() => cancelComponentRequests('/api/user'))
 */
export function cancelComponentRequests(url: string) {
    pendingRequests.forEach((source, key) => {
        if (key.includes(url)) {
            source.cancel('组件卸载，取消请求')
            pendingRequests.delete(key)
        }
    })
}

export default request
