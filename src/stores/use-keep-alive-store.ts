import { defineStore } from 'pinia'
import { SelfStorage } from '@/utils/local-storage.ts'

export const useSysKeepAliveStore = defineStore('sys-keep-alive', {
    state: () => ({
        // 需要缓存的页面 name
        list: [] as string[]
    }),
    getters: {
        // 获取需要缓存的页面 name
        getKeepAliveList(): string[] {
            return this.list
        }
    },
    actions: {
        // 添加需要缓存的页面 name
        addKeepAliveName(name: string) {
            !this.list.includes(name) && this.list.push(name)
        },
        // 删除需要缓存的页面 name
        removeKeepAliveName(name: any) {
            const index = this.list.indexOf(name)
            index !== -1 && this.list.splice(index, 1)
        },
        // 按标签列表同步需要缓存的页面 name
        removeKeepAliveNames(tags: Menu.MenuOptions[]) {
            const tagNames = new Set(tags.map((item) => item.name))
            this.list = this.list.filter((item) => tagNames.has(item))
        },
        // 清空需要缓存的页面 name
        clearKeepAliveList() {
            this.list = []
        }
    },
    persist: {
        key: 'SYS_KEEP_ALIVE',
        storage: SelfStorage,
        pick: ['list']
    }
})
