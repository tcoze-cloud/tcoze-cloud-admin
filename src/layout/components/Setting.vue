<template>
    <el-alert :title="$t('layout.settingTip')" type="info" :closable="false"></el-alert>
    <el-divider class="divider" content-position="center">
        <el-icon>
            <el-icon-notification />
        </el-icon>
        {{ $t('layout.layoutStyle') }}
    </el-divider>
    <div class="layout-box">
        <div class="layout-cell">
            <div
                :class="[
                    'layout-item layout-columns',
                    { 'is-active': sysGlobalStore.sysLayout == 'default' }
                ]"
                @click="sysGlobalStore.sysLayout = 'default'"
            >
                <div class="layout-dark"></div>
                <div class="layout-light"></div>
                <div class="layout-content"></div>
                <el-icon v-if="sysGlobalStore.sysLayout == 'default'">
                    <el-icon-circle-check-filled />
                </el-icon>
            </div>
            <el-text>{{ $t('layout.layoutDefault') }}</el-text>
        </div>
        <div class="layout-cell">
            <div
                :class="[
                    'layout-item layout-vertical',
                    { 'is-active': sysGlobalStore.sysLayout == 'menu' }
                ]"
                @click="sysGlobalStore.sysLayout = 'menu'"
            >
                <div class="layout-dark"></div>
                <div class="layout-container">
                    <div class="layout-light"></div>
                    <div class="layout-content"></div>
                </div>
                <el-icon v-if="sysGlobalStore.sysLayout == 'menu'">
                    <el-icon-circle-check-filled />
                </el-icon>
            </div>
            <el-text>{{ $t('layout.layoutMenu') }}</el-text>
        </div>
        <div class="layout-cell layout-cell--gap">
            <div
                :class="[
                    'layout-item layout-classic',
                    { 'is-active': sysGlobalStore.sysLayout == 'header' }
                ]"
                @click="sysGlobalStore.sysLayout = 'header'"
            >
                <div class="layout-dark"></div>
                <div class="layout-container">
                    <div class="layout-light"></div>
                    <div class="layout-content"></div>
                </div>
                <el-icon v-if="sysGlobalStore.sysLayout == 'header'">
                    <el-icon-circle-check-filled />
                </el-icon>
            </div>
            <el-text>{{ $t('layout.layoutHeader') }}</el-text>
        </div>
        <div class="layout-cell layout-cell--gap">
            <div
                :class="[
                    'layout-item layout-transverse',
                    { 'is-active': sysGlobalStore.sysLayout == 'dock' }
                ]"
                @click="sysGlobalStore.sysLayout = 'dock'"
            >
                <div class="layout-dark"></div>
                <div class="layout-content"></div>
                <el-icon v-if="sysGlobalStore.sysLayout == 'dock'">
                    <el-icon-circle-check-filled />
                </el-icon>
            </div>
            <el-text>{{ $t('layout.layoutDock') }}</el-text>
        </div>
    </div>
    <el-divider class="divider" content-position="center">
        <el-icon>
            <el-icon-cold-drink />
        </el-icon>
        {{ $t('layout.globalTheme') }}
    </el-divider>
    <div class="theme-item">
        <el-text>{{ $t('layout.themeColor') }}</el-text>
        <el-color-picker
            v-model="color"
            :predefine="colorList"
            @change="colorPickerChange"
        ></el-color-picker>
    </div>
    <div class="theme-item">
        <el-text>{{ $t('layout.darkMode') }}</el-text>
        <el-switch v-model="sysGlobalStore.sysDark"></el-switch>
    </div>
    <div class="theme-item">
        <el-text>{{ $t('layout.collapseMenu') }}</el-text>
        <el-switch v-model="sysGlobalStore.sysMenuIsCollapse"></el-switch>
    </div>
    <div class="theme-item">
        <el-text>{{ $t('layout.tagBar') }}</el-text>
        <el-switch v-model="sysGlobalStore.sysLayoutTags"></el-switch>
    </div>
    <div class="theme-item">
        <el-text>{{ $t('layout.accordionMode') }}</el-text>
        <el-switch v-model="sysGlobalStore.sysMenuUniqueOpened"></el-switch>
    </div>
    <div class="theme-item">
        <el-text>{{ $t('layout.copyrightInfo') }}</el-text>
        <el-switch v-model="sysGlobalStore.sysShowCopyright"></el-switch>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSysGlobalStore } from '@/stores/use-global-store.ts'

const sysGlobalStore = useSysGlobalStore()
const color = ref(sysGlobalStore.sysColor)
// 预设主题色：统一降低饱和度，保证在浅色/深色模式下都有足够的可读性
const defaultColor = '#2563eb'
const colorList = ref(['#2563eb', '#0d9488', '#7c3aed', '#d97706', '#e11d48', '#0ea5e9'])

function colorPickerChange(value: string | null) {
    if (value) {
        sysGlobalStore.sysColor = value
    } else {
        color.value = sysGlobalStore.sysColor = defaultColor
    }
}
</script>

<style scoped lang="scss">
.divider {
    margin-top: 15px;

    :deep(.el-divider__text) {
        display: inline-flex;
        align-items: center;
        white-space: nowrap;
    }

    .el-icon {
        margin-right: 5px;
        font-size: 15px;
    }
}

.theme-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 5px;
    margin: 14px 0;

    span {
        display: flex;
        align-items: center;
        font-size: 14px;

        .el-icon {
            margin-left: 3px;
            font-size: 15px;
            color: var(--el-text-color-regular);
            cursor: pointer;
        }
    }
}

.layout-box {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 15px 7px 0;

    .layout-cell {
        text-align: center;

        &--gap {
            margin-top: 5px;
        }
    }

    .layout-item {
        position: relative;
        box-sizing: border-box;
        width: 100px;
        height: 70px;
        padding: 6px;
        cursor: pointer;
        border-radius: 5px;
        box-shadow: 0 0 5px 1px var(--el-border-color-dark);
        transition: all 0.2s;

        .layout-dark {
            background-color: var(--el-color-primary);
            border-radius: 3px;
        }

        .layout-light {
            background-color: var(--el-color-primary-light-5);
            border-radius: 3px;
        }

        .layout-content {
            background-color: var(--el-color-primary-light-8);
            border: 1px dashed var(--el-color-primary);
            border-radius: 3px;
        }

        .el-icon {
            position: absolute;
            right: 10px;
            bottom: 10px;
            color: var(--el-color-primary);
            transition: all 0.2s;
        }

        &:hover {
            box-shadow: 0 0 5px 1px var(--el-text-color-secondary);
        }
    }

    .is-active {
        box-shadow: 0 0 0 2px var(--el-color-primary) !important;
    }

    .layout-vertical {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;

        .layout-dark {
            width: 20%;
        }

        .layout-container {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            width: 72%;

            .layout-light {
                height: 20%;
            }

            .layout-content {
                height: 67%;
            }
        }
    }

    .layout-classic {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        margin-bottom: 20px;

        .layout-dark {
            height: 22%;
        }

        .layout-container {
            display: flex;
            justify-content: space-between;
            height: 70%;

            .layout-light {
                width: 20%;
            }

            .layout-content {
                width: 70%;
            }
        }
    }

    .layout-transverse {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        margin-bottom: 15px;

        .layout-dark {
            height: 20%;
        }

        .layout-content {
            height: 67%;
        }
    }

    .layout-columns {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;

        .layout-dark {
            width: 14%;
        }

        .layout-light {
            width: 17%;
        }

        .layout-content {
            width: 55%;
        }
    }
}
</style>
