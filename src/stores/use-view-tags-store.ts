import { defineStore } from 'pinia'
import { SelfStorage } from '@/utils/local-storage.ts'

export const useSysViewTagsStore = defineStore('sys-view-tags', {
    state: () => ({
        list: [] as any[],
        keepAliveList: [] as string[]
    }),
    getters: {
        // 获取可缓存标签列表
        getKeepAliveList(): string[] {
            return this.keepAliveList
        },
        // 获取标签列表
        getViewTags: (state): any[] => {
            return state.list
        }
    },
    actions: {
        // 添加可缓存列表
        addKeepAliveList(name: string) {
            !this.keepAliveList.includes(name) && this.keepAliveList.push(name)
        },
        // 删除可缓存列表
        removeKeepAliveList(name: string) {
            const index = this.keepAliveList.indexOf(name)
            index !== -1 && this.keepAliveList.splice(index, 1)
        },
        // 添加标签
        pushViewTags(route: any) {
            const index = this.list.findIndex((item) => item.path === route.path)
            index === -1 && this.list.push(route)
        },
        // 删除标签
        removeViewTags(route: any) {
            const index = this.list.findIndex((item) => item.path === route.path)
            index !== -1 && this.list.splice(index, 1)
        },
        // 清空所有标签
        clearViewTags() {
            this.list = []
        },
        // 清空所有缓存标签
        clearKeepAlive() {
            this.keepAliveList = []
        },
        // 关闭其他标签
        removeOtherViewTags(route: any) {
            const index = this.list.findIndex((item) => item.path === route.path)
            this.list = index !== -1 ? [this.list[index]] : []
        },
        // 关闭左侧标签
        removeLeftViewTags(route: any) {
            const index = this.list.findIndex((item) => item.path === route.path)
            this.list = index !== -1 ? this.list.slice(index) : this.list
        },
        // 关闭右侧标签
        removeRightViewTags(route: any) {
            const index = this.list.findIndex((item) => item.path === route.path)
            this.list = index !== -1 ? this.list.slice(0, index + 1) : this.list
        },
        // 更新标签
        updateViewTags(route: any, index: number) {
            Object.assign(this.list[index], route)
        },
        // 关闭单侧标签
        closeTabsOnSide(path: any, type: 'left' | 'right') {
            const currentIndex = this.list.findIndex((item) => item.path === path)
            if (currentIndex !== -1) {
                const range =
                    type === 'left'
                        ? [0, currentIndex]
                        : [currentIndex + 1, this.list.length]
                this.list = this.list.filter((item, index) => {
                    return index < range[0] || index >= range[1] || item.meta?.isAffix
                })
            }
        },
        // 关闭指定标签（path 为空关闭全部非固定）
        closeTabs(path?: any) {
            this.list = this.list.filter((item) => {
                return item.path === path || item.meta?.isAffix
            })
        }
    },
    persist: {
        key: 'SYS_VIEW_TAGS',
        storage: SelfStorage,
        pick: ['list']
    }
})
