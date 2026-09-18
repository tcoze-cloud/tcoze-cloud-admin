<template>
    <el-icon
        v-if="resolved"
        class="tcoze-icon"
        :class="`is-${resolved.lib}`"
        :style="rootStyle"
    >
        <component :is="resolved.comp" v-bind="iconProps" />
    </el-icon>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import * as ElementPlusIcons from '@element-plus/icons-vue'
import * as LucideIcons from '@lucide/vue'

type IconLib = 'element' | 'lucide'

interface Props {
    /**
     * 图标名，兼容多种写法：
     * Home / home / el-icon-home / ElIconHome / lucide:Home / lu:home
     */
    name?: string
    /** 尺寸，数字按 px 处理。不传则继承外层 .el-icon / 父级 CSS 的 font-size */
    size?: number | string
    /** 图标颜色 */
    color?: string
    /** 描边粗细，仅 Lucide 生效 */
    strokeWidth?: number | string
    /** 找不到时的兜底图标 */
    fallback?: string
}

const props = withDefaults(defineProps<Props>(), {
    name: '',
    size: '',
    color: '',
    strokeWidth: 2,
    fallback: 'Menu'
})

const NAMESPACE: Record<string, IconLib> = {
    el: 'element',
    ep: 'element',
    element: 'element',
    'element-plus': 'element',
    'el-icon': 'element',
    lu: 'lucide',
    luc: 'lucide',
    lucide: 'lucide'
}

function toPascalCase(name: string): string {
    return name
        .trim()
        .replace(/[^a-zA-Z0-9]+([a-zA-Z0-9]?)/g, (_, c: string) => c.toUpperCase())
        .replace(/^[a-z]/, (c: string) => c.toUpperCase())
}

function pick(lib: IconLib, name: string): Component | undefined {
    const ns = (lib === 'element' ? ElementPlusIcons : LucideIcons) as Record<string, unknown>
    const hit = ns[toPascalCase(name)] ?? ns[name]
    return typeof hit === 'function' || typeof hit === 'object' ? (hit as Component) : undefined
}

const resolved = computed<{ comp: Component; lib: IconLib } | null>(() => {
    const raw = (props.name || '').trim()
    if (!raw) {
        return null
    }

    let forced: IconLib | '' = ''
    let name = raw
    const separator = raw.indexOf(':')
    if (separator > -1) {
        const prefix = raw.slice(0, separator).toLowerCase()
        if (NAMESPACE[prefix]) {
            forced = NAMESPACE[prefix]
            name = raw.slice(separator + 1)
        }
    }

    // 去掉 ElIcon / el-icon- 之类的历史前缀
    const stripped = name.replace(/^el[-_ ]?icon[-_ ]?/i, '')
    const order: IconLib[] = forced ? [forced] : ['element', 'lucide']

    for (const lib of order) {
        const comp = pick(lib, stripped) ?? pick(lib, name)
        if (comp) {
            return { comp, lib }
        }
    }

    if (import.meta.env.DEV) {
        console.warn(`[Icon] 未找到图标「${raw}」，已回退为「${props.fallback}」`)
    }
    for (const lib of ['element', 'lucide'] as IconLib[]) {
        const comp = pick(lib, props.fallback)
        if (comp) {
            return { comp, lib }
        }
    }
    return null
})

const sizeValue = computed(() =>
    typeof props.size === 'number' ? `${props.size}px` : props.size
)

// 两套库的图标都靠所在 .el-icon 的 font-size 决定尺寸；
// 不传 size 时不写 font-size，交给外层的 .el-icon 样式，避免覆盖菜单等已有的字号设定
const rootStyle = computed(() => ({
    ...(props.size ? { fontSize: sizeValue.value } : {}),
    ...(props.color ? { color: props.color } : {})
}))

// 两套库的颜色都走 currentColor，无需额外传参；只有 Lucide 需要 stroke-width
const iconProps = computed(() =>
    resolved.value?.lib === 'lucide' && props.strokeWidth ? { strokeWidth: props.strokeWidth } : {}
)
</script>

<style scoped>
/* 兜底保证尺寸：Element Plus 的 .el-icon svg 规则若未引入，此处依然生效 */
.tcoze-icon :deep(svg) {
    width: 1em;
    height: 1em;
}
</style>
