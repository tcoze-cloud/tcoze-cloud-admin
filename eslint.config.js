import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

// 静态导入 JSON 文件
import autoImportConfig from './.eslintrc-auto-import.json' assert { type: 'json' }

export default [
    {
        name: 'app/files-to-lint',
        files: ['**/*.{ts,mts,tsx,vue}']
    },
    {
        name: 'app/files-to-ignore',
        ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**']
    },
    ...pluginVue.configs['flat/essential'],
    ...vueTsEslintConfig(),
    skipFormatting,
    {
        rules: {
            // 允许使用 any，不报错
            '@typescript-eslint/no-explicit-any': 'off',
            // 允许 Vue 文件名称使用单个单词
            'vue/multi-word-component-names': 'off',
            // 允许表达式
            '@typescript-eslint/no-unused-expressions': 'off'
        }
    },
    // 新增配置：加载自动生成的全局变量声明
    {
        files: ['**/*.{ts,mts,tsx,vue}'],
        // 直接导入 JSON 内容（需 ESLint 7.0+）
        settings: autoImportConfig
    }
]
