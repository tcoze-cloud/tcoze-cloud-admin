import type { ElMessageBoxOptions } from 'element-plus'
import type { MessageBoxData } from 'element-plus/es/components/message-box/src/message-box.type'

export interface MessageType {
    info(msg: string): void
    error(msg: string): void
    success(msg: string): void
    warning(msg: string): void
    alert(msg: ElMessageBoxOptions['message'], title: ElMessageBoxOptions['title'], options?: ElMessageBoxOptions): Promise<MessageBoxData>
    alertError(msg: ElMessageBoxOptions['message'], title: ElMessageBoxOptions['title'], options?: ElMessageBoxOptions): Promise<MessageBoxData>
    alertSuccess(msg: ElMessageBoxOptions['message'], title: ElMessageBoxOptions['title'], options?: ElMessageBoxOptions): Promise<MessageBoxData>
    alertWarning(msg: ElMessageBoxOptions['message'], title: ElMessageBoxOptions['title'], options?: ElMessageBoxOptions): Promise<MessageBoxData>
    confirm(msg: ElMessageBoxOptions['message'], title: ElMessageBoxOptions['title'], options?: ElMessageBoxOptions): Promise<MessageBoxData>
    prompt(msg: ElMessageBoxOptions['message'], title: ElMessageBoxOptions['title'], options?: ElMessageBoxOptions): Promise<MessageBoxData>
    loading(msg: string): void
    closeLoading(): void
}
