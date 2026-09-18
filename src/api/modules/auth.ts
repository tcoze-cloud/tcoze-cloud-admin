import config from '@/config'
import { http } from '@/api/request'

export default {
    getClickCaptcha: {
        url: `${config.API_URL}/auth/get-click-captcha`,
        name: '获取点击验证码',
        get: async function (data = {}, config = {}) {
            return http.get(this.url, data, config)
        }
    },
    getCaptcha: {
        url: `${config.API_URL}/auth/get-captcha`,
        name: '获取验证码',
        get: async function (data = {}, config = {}) {
            return http.get(this.url, data, config)
        }
    },
    getToken: {
        url: `${config.API_URL}/auth/get-token`,
        name: '登录获取TOKEN',
        post: async function (data = {}, config = {}) {
            return http.post(this.url, data, config)
        }
    },
    refreshToken: {
        url: `${config.API_URL}/auth/refresh-token`,
        name: '刷新TOKEN',
        post: async function (data = {}, config = {}) {
            return http.post(this.url, data, config)
        }
    },
    logout: {
        url: `${config.API_URL}/auth/logout`,
        name: '退出登录',
        post: async function (data = {}, config = {}) {
            return http.post(this.url, data, config)
        }
    },
    forceLogout: {
        url: `${config.API_URL}/auth/force-logout`,
        name: '强制注销',
        post: async function (data = {}, config = {}) {
            return http.post(this.url, data, config)
        }
    },
    applySystemAdmin: {
        url: `${config.API_URL}/auth/apply-system-admin`,
        name: '申请管理员',
        post: async function (data = {}, config = {}) {
            return http.post(this.url, data, config)
        }
    },
    getSystemMenu: {
        url: `${config.API_URL}/auth/get-system-menu`,
        name: '登录获取菜单',
        get: async function (data = {}, config = {}) {
            return http.get(this.url, data, config)
        }
    }
}
