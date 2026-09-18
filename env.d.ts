/// <reference types="vite/client" />

interface ImportMetaEnv {
    VITE_API_URL: string
    // 其他环境变量...
}

declare module '*.vue' {
    import { Component, DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, Component>
    export default component
}
