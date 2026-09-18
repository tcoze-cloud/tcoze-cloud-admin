<template>
    <div class="placeholder-page">
        <el-card shadow="never">
            <template #header>
                <div class="placeholder-header">
                    <el-icon><User /></el-icon>
                    <span>管理员</span>
                </div>
            </template>
            <el-empty description="管理员页面（示例占位）">
                <el-button type="primary" @click="handleTip">查看说明</el-button>
            </el-empty>
        </el-card>
    </div>
</template>

<script setup lang="ts" name="system-admin">
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'

function handleTip() {
    ElMessage.info('这是一个示例占位页面，可在 src/views/system/admin/index.vue 中补充实际业务。')
}
</script>

<style scoped lang="scss">
.placeholder-page {
    padding: 4px;
}

.placeholder-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: bold;
}
</style>
