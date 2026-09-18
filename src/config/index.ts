const defaultConfig: AppConfig = {
    APP_VER: import.meta.env.VITE_VUE_VERSION,
    APP_NAME: import.meta.env.VITE_VUE_TITLE,
    TIMEOUT: 10000,
    DASHBOARD_URL: '/dashboard',
    TOKEN_NAME: 'Authorization',
    TOKEN_PREFIX: 'Bearer ',
    HEADERS: {},
    REQUEST_CACHE: false,
    BAN_DEBUG: import.meta.env.VITE_VUE_BAN_DEBUG,
    BASE_URL: import.meta.env.VITE_BASE_URL,
}

export default defaultConfig
