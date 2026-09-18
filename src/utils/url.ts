/**
 * 补齐缺少协议的 URL（默认补 https）
 */
export function withProtocol(url?: string, protocol = 'https://'): string {
    if (!url) return ''
    return /^(https?:)?\/\//.test(url) ? url : protocol + url
}

/**
 * 移除 URL 上指定查询参数
 */
export function removeUrlParam(url: string, key: string): string {
    const [path, query] = url.split('?')
    if (!query) return url
    const params = new URLSearchParams(query)
    params.delete(key)
    const q = params.toString()
    return q ? `${path}?${q}` : path
}
