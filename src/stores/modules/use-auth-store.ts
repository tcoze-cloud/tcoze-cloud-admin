import { defineStore } from 'pinia'
import { SelfStorage } from '@/utils/local-storage.ts'
import router from '@/router'
import passport from '@/api/modules/auth.ts'

export const useAuthStore = defineStore('authStore', {
    state: () => ({
        accessToken: '',
        refreshToken: '',
        userInfo: {
            avatar: '',
            userId: 0,
            nickname: '',
            userRole: []
        } as UserInfoModel
    }),
    actions: {
        // 解析Token
        decodeToken(token: string) {
            try {
                const parts = token.split('.')
                if (!parts[1]) return null

                return JSON.parse(atob(parts[1]))
            } catch (e) {
                console.error(e)

                return null
            }
        },

        // 检查Token是否需要刷新（剩余时间少于2分钟）
        needRefresh(token: string) {
            if (!token) return true

            const decoded = this.decodeToken(token)

            if (!decoded || !decoded.exp) return true

            return decoded.exp - Date.now() / 1000 < 120
        },

        // 移除Tokens
        removeTokens() {
            this.$reset()
        },

        // 刷新Token
        async handleRefreshToken() {
            try {
                if (!this.refreshToken) exception('refreshToken 不存在')

                const response = await passport.refreshToken.post(
                    { refreshToken: this.refreshToken },
                    { skipRequestInterceptors: true }
                )

                const { accessToken, refreshToken } = response
                this.accessToken = accessToken
                this.refreshToken = refreshToken

                return this.accessToken
            } catch (error) {
                console.error(error)

                this.removeTokens()
                await router.replace({ path: '/login', replace: true })

                return null
            }
        },
        async logout() {
            await passport.logout.post({ userId: this.userInfo.userId })
            this.removeTokens()
            await router.replace({ path: '/login', replace: true })
        }
    },
    persist: {
        key: 'AUTH',
        storage: SelfStorage
    }
})
