import { fileURLToPath, URL } from 'node:url'
import { ConfigEnv, loadEnv, UserConfigExport } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import tailwindcss from '@tailwindcss/vite'

export default ({ mode }: ConfigEnv): UserConfigExport => {
    const env = loadEnv(mode, process.cwd())
    const isProduction = env.VITE_NODE_ENV === 'production'
    const isDevelopment = !isProduction

    return {
        base: env.VITE_BASE_URL,
        // 开发环境显示更详细日志，生产环境只显示警告和错误
        logLevel: isDevelopment ? 'info' : 'warn',
        plugins: [
            vue(),
            vueJsx(),
            isDevelopment && vueDevTools(), // 仅开发环境启用vue-devtools（减少生产环境冗余）
            tailwindcss(),
            AutoImport({
                resolvers: [ElementPlusResolver()],
                include: [/.[tj]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
                imports: [
                    'vue',
                    'vue-router',
                    'vue-i18n',
                    {
                        '@vueuse/core': ['useMouse', ['useFetch', 'useMyFetch']],
                        axios: [['default', 'axios']]
                    }
                ],
                eslintrc: { enabled: true },
                dts: './auto-imports.d.ts',
                dirs: ['src/hooks', 'src/store', 'src/utils'] // 限制扫描目录，提升性能
            }),
            Components({
                resolvers: [ElementPlusResolver()],
                dirs: ['src/components', 'src/views/components'], // 指定组件目录，减少不必要的扫描
                dts: './components.d.ts'
            })
        ].filter(Boolean), // 过滤掉环境不匹配的插件（避免undefined）

        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
                // 新增：常用目录别名，减少路径拼接
                '~': fileURLToPath(new URL('./', import.meta.url))
            },
            // 指定扩展名，减少查找时间
            extensions: ['.ts', '.tsx', '.vue', '.js', '.jsx']
        },

        optimizeDeps: {
            // 强制预构建高频依赖（避免重复构建）
            include: [
                'vue',
                'vue-router',
                'vue-i18n',
                'axios',
                '@vueuse/core',
                'element-plus/es', // ElementPlus核心模块
                'element-plus/es/components/form/style/css', // 常用组件样式
                'element-plus/es/components/button/style/css'
            ],
            // 排除不需要预构建的依赖（如ESM格式的库）
            exclude: ['@vue/repl']
        },

        // 开发服务器配置（解决页面卡死、热更新问题）
        server: {
            open: true, // 自动打开浏览器
            port: 8080, // 固定端口，避免随机端口冲突
            strictPort: true, // 端口被占用时直接退出（避免自动切换端口导致的问题）
            hmr: {
                // 热更新超时时间延长（避免大型项目更新超时）
                timeout: 5000,
                // 开发环境显示热更新错误 overlay
                overlay: true
            },
            watch: {
                // 排除不需要监听的目录（减少文件监听压力）
                ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
                // 调整监听频率（平衡响应速度和性能）
                interval: 300
            }
        },

        // 开发环境优化（减少内存占用）
        ...(isDevelopment && {
            define: {
                'process.env': {} // 避免某些库依赖process.env导致的警告
            },
            css: {
                devSourcemap: false // 开发环境关闭CSS sourcemap（减少内存消耗）
            }
        }),

        publicDir: 'public',

        build: {
            emptyOutDir: true,
            outDir: 'dist',
            minify: false, // 生产环境用terser压缩（比esbuild更彻底）
            chunkSizeWarningLimit: 1500, // 降低警告阈值，提前发现过大chunk
            cssCodeSplit: isProduction, // 生产环境拆分CSS（开发环境不拆分方便调试）
            sourcemap: isProduction ? false : 'inline', // 生产环境关闭sourcemap，开发环境内联
            target: ['es2020', 'edge88', 'firefox78', 'chrome87'], // 更合理的浏览器兼容目标

            rollupOptions: {
                external: [],
                output: {
                    entryFileNames: `assets/[name].[hash].js`,
                    chunkFileNames: `assets/[name].[hash].js`,
                    assetFileNames: `assets/[name].[hash].[ext]`,
                    manualChunks: (id: string) => {
                        // 精细化分包策略
                        if (id.includes('node_modules')) {
                            const moduleName = id.split('node_modules/')[1].split('/')[0]
                            // 超大依赖单独拆包
                            if (
                                ['element-plus', 'vue', 'axios', '@vueuse/core'].includes(
                                    moduleName
                                )
                            ) {
                                return `vendor-${moduleName}`
                            }
                            // 工具类依赖合并
                            if (['lodash', 'date-fns', 'echarts'].includes(moduleName)) {
                                return 'vendor-utils'
                            }
                            // 其他依赖合并
                            return 'vendors'
                        }
                        // 业务代码按目录拆分
                        if (id.includes('src/views/')) {
                            return `page-${id.split('src/views/')[1].split('/')[0]}`
                        }
                    }
                }
            }
        }
    }
}
