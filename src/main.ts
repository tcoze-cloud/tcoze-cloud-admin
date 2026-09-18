import { createApp } from 'vue'
import App from './App.vue'
import pinia from '@/stores/pinia.ts'
import i18n from '@/utils/locale.ts'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import Icon from '@/components/Icon/index.vue'
import directives from '@/directives'

import '@/assets/style/element.scss'
import '@/assets/style/style.scss'
import '@/assets/style/tailwind.css'

import { exception } from '@/utils/errors.ts'
import feedback from '@/utils/feedback.ts'

// 挂载到 window 全局对象
window.exception = exception
window.feedback = feedback

const app = createApp(App)

app.use(directives)
app.use(pinia)
app.use(i18n(pinia))
app.use(router)

// 统一注册el-icon图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(`ElIcon${key}`, component)
}

// 统一图标组件（同时支持 Element Plus 与 Lucide，按名称渲染）
app.component('Icon', Icon)

// 捕捉全局错误
app.config.errorHandler = (err, instance, info) => {
    console.error('捕获到全局错误：', err)
    console.error('出错的组件实例：', instance)
    console.error('错误信息：', info)
}

// 路由准备就绪后再挂载应用
router.isReady().then(() => {
    app.mount('#app')
    console.log('应用已成功挂载到 #app')
})
