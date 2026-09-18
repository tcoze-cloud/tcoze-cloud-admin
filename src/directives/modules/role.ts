import type { Directive, DirectiveBinding } from 'vue'
import { useAuthStore } from '@/stores/modules/use-auth-store.ts'

/**
 * 角色权限指令
 * @directive 角色权限验证，满足一个则显示（v-role="['xxx','xxx']"）
 */
const role: Directive = {
    mounted(el: HTMLElement, binding: DirectiveBinding<string[]>) {
        const roles = useAuthStore().userInfo.userRole
        if (roles.includes('ALL')) {
            return
        }
        const requiredPermissions: string[] = binding.value
        const hasPermission = requiredPermissions.some((permission) => roles.includes(permission))

        if (!hasPermission) {
            el.parentNode?.removeChild(el)
        }
    }
}

export default role
