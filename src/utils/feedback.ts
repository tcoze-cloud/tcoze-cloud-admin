import { ElMessageBox, type ElMessageBoxOptions } from 'element-plus'
import type { LoadingInstance } from 'element-plus/es/components/loading/src/loading'
import type { MessageBoxData } from 'element-plus/es/components/message-box/src/message-box.type'
import { ElMessage } from 'element-plus'
import { ElLoading } from 'element-plus'

export class Feedback {
    private loadingInstance: LoadingInstance | null = null
    private debugContainer: HTMLElement | null = null // 存储调试容器
    static instance: Feedback | null = null

    static getInstance() {
        return this.instance ?? (this.instance = new Feedback())
    }

    // 基础消息提示
    info(msg: string) {
        this.closeLoading()
        ElMessage.info(msg)
    }

    error(msg: string) {
        this.closeLoading()
        ElMessage.error(msg)
    }

    success(msg: string) {
        this.closeLoading()
        ElMessage.success(msg)
    }

    warning(msg: string) {
        this.closeLoading()
        ElMessage.warning(msg)
    }

    // 全局Loading
    loading(msg: string = '加载中...') {
        this.loadingInstance = ElLoading.service({
            lock: true,
            text: msg,
            background: 'rgba(0, 0, 0, 0.7)'
        })
    }

    closeLoading() {
        this.loadingInstance?.close()
    }

    // 弹出提示
    alert(
        msg: string,
        title: string = '系统提示',
        options?: ElMessageBoxOptions
    ): Promise<MessageBoxData> {
        return ElMessageBox.alert(msg, title, options)
    }

    // 错误提示
    alertError(msg: string, title: string = '系统提示'): Promise<MessageBoxData> {
        return ElMessageBox.alert(msg, title, { type: 'error' })
    }

    // 成功提示
    alertSuccess(msg: string, title: string = '系统提示'): Promise<MessageBoxData> {
        return ElMessageBox.alert(msg, title, { type: 'success' })
    }

    // 警告提示
    alertWarning(msg: string, title: string = '系统提示'): Promise<MessageBoxData> {
        return ElMessageBox.alert(msg, title, { type: 'warning' })
    }

    // 确认窗体
    confirm(msg: string, title: string = '温馨提示', options?: ElMessageBoxOptions) {
        return ElMessageBox.confirm(msg, title, {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            ...options
        })
    }

    // 提交内容
    prompt(content: string, title: string, options?: ElMessageBoxOptions) {
        return ElMessageBox.prompt(content, title, {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            ...options
        })
    }

    async showDebug(html: string) {
        this.closeDebugWindow() // 先关闭已存在的调试页面

        // 创建全屏调试容器
        this.debugContainer = document.createElement('div')
        this.debugContainer.id = 'ban-debug-fullpage'
        // 全屏容器基础样式
        this.debugContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 999999;
            overflow: hidden;
            box-sizing: border-box;
            background: aliceblue;
        `
        document.body.appendChild(this.debugContainer)

        // 构建调试内容（固定头部+滚动内容区）
        this.debugContainer.innerHTML = `
            <style style="background: #f8fafc;">
                /* 头部容器 - 固定定位 */
                .debug-header {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 70px;
                    background: #1e293b;
                    color: #f8fafc;
                    padding: 0 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
                    z-index: 1000000;
                }

                /* 头部标题样式 */
                .debug-header-title {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #fff;
                }

                .debug-header-title::before {
                    content: "🛠️";
                    font-size: 20px;
                }

                /* 关闭按钮样式 */
                .debug-close-btn {
                    padding: 8px 16px;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .debug-close-btn:hover {
                    background: #2563eb;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                }

                .debug-close-btn:active {
                    transform: translateY(0);
                }

                /* 内容容器 - 滚动区域（核心优化） */
                .debug-content-outer {
                    /* 容器定位：顶部与头部保持间距，底部贴边 */
                    position: fixed;
                    top: 90px; /* 与头部高度一致，作为基础间距 */
                    left: 0;
                    right: 0;
                    bottom: 0;
                    overflow: hidden; /* 隐藏自身滚动，由内部容器负责滚动 */
                }

                .debug-content-inner {
                    /* 内部滚动容器：添加padding与头部保持距离 */
                    height: 100%;
                    overflow: auto; /* 仅内部容器滚动 */
                    padding: 0 20px 20px 20px; /* 固定padding，确保与头部间距稳定 */
                    box-sizing: border-box; /* 保证padding不影响整体尺寸 */
                    background: #f8fafc;
                    
                    /* 滚动条设为thin（核心优化） */
                    scrollbar-width: thin; /* Firefox 细滚动条 */
                }

                /* 滚动条样式细化（针对WebKit浏览器） */
                .debug-content-inner::-webkit-scrollbar {
                    width: 1px; /* 垂直滚动条宽度（细） */
                    height: 1px; /* 水平滚动条高度（细） */
                }
                .debug-content-inner::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 2px; /* 细滚动条对应小圆角 */
                }
                .debug-content-inner::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 2px;
                }
                .debug-content-inner::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }

                /* 调试内容样式 */
                .sf-dump { 
                    font-family: 'Fira Code', monospace;
                    font-size: 14px; 
                    line-height: 1.6; 
                    white-space: pre-wrap !important;
                    word-wrap: break-word !important;
                    word-break: break-all !important;
                    max-width: 100% !important;
                    margin: 0 !important;
                    padding: 20px;
                    background: #ffffff;
                    border-radius: 6px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .sf-dump * { 
                    white-space: inherit !important;
                    word-wrap: inherit !important;
                    word-break: inherit !important;
                    max-width: 100% !important;
                }

                /* 调试信息颜色样式 */
                .sf-dump-str { color: #10b981; }
                .sf-dump-int { color: #3b82f6; }
                .sf-dump-null { color: #64748b; }
                .sf-dump-array { color: #f59e0b; }
                .sf-dump-object { color: #8b5cf6; }
                .sf-dump-closure { color: #ef4444; }

                /* 表格样式 */
                .sf-dump table {
                    width: 100% !important;
                    border-collapse: collapse;
                    margin: 10px 0;
                }
                .sf-dump td, .sf-dump th {
                    padding: 8px 12px;
                    border: 1px solid #e2e8f0;
                    text-align: left;
                }
                .sf-dump th {
                    background: #f1f5f9;
                    font-weight: 600;
                }
            </style>

            <!-- 固定头部 -->
            <header class="debug-header">
                <h1 class="debug-header-title">Admin 调试信息</h1>
                <button class="debug-close-btn" onclick="document.getElementById('ban-debug-fullpage').remove()">
                    <span>关闭调试页</span>
                    <span>✕</span>
                </button>
            </header>

            <!-- 滚动内容区（双层容器确保padding稳定） -->
            <div class="debug-content-outer">
                <div class="debug-content-inner">
                    <!-- 调试内容 -->
                    ${html}
                </div>
            </div>
        `

        // 执行调试脚本
        this.executeDebugScripts()
    }

    /**
     * 执行调试HTML中的脚本
     */
    private executeDebugScripts() {
        if (!this.debugContainer) return
        const scripts = this.debugContainer.querySelectorAll('script')
        scripts.forEach((oldScript) => {
            const newScript = document.createElement('script')
            Array.from(oldScript.attributes).forEach((attr) => {
                newScript.setAttribute(attr.name, attr.value)
            })
            newScript.textContent = oldScript.textContent || ''
            oldScript.parentNode?.replaceChild(newScript, oldScript)
        })
    }

    /**
     * 关闭调试页面
     */
    closeDebugWindow() {
        if (this.debugContainer) {
            // 检查元素是否存在于DOM中且父节点正确
            if (document.body.contains(this.debugContainer)) {
                // 获取实际的父节点并从中移除
                const parent = this.debugContainer.parentNode
                if (parent) {
                    parent.removeChild(this.debugContainer)
                }
            }
            this.debugContainer = null
        }
    }
}

// 单例导出
export default Feedback.getInstance()
