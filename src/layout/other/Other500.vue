<template>
    <div class="not-container">
        <div class="not-detail">
            <h2>500</h2>
            <h4>网络异常或服务器错误</h4>
            <el-button type="primary" @click="router.back"> 返回上一页 </el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import router from '@/router'
</script>

<style scoped lang="scss">
.not-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    .not-detail {
        display: flex;
        flex-direction: column;

        h2,
        h4 {
            padding: 0;
            margin: 0;
        }

        h2 {
            font-size: 60px;
            color: var(--el-text-color-primary);
        }

        h4 {
            margin: 30px 0 20px;
            font-size: 19px;
            font-weight: normal;
            color: var(--el-text-color-regular);
        }

        .el-button {
            width: 100px;
        }
    }
}
</style>
