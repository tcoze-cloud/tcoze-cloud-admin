declare module 'vue' {
    interface ComponentCustomProperties {
        $t: (key: string, values?: object) => string
        // 如果还有其他全局属性/方法需要添加
    }
}

export {} // 保持模块化
