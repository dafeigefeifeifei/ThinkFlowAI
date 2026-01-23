<script setup lang="ts">
/**
 * 总结弹窗
 * - show 控制显示
 * - isSummarizing 为 true 时展示 loading
 * - summaryContent 展示 AI 总结结果
 */

import { ref } from 'vue'
// 图标：标题/关闭/加载/复制
import { RefreshCw, Sparkles, X, Copy, Check, FileText } from 'lucide-vue-next'

// Markdown 渲染
import MarkdownIt from 'markdown-it'

/**
 * props：
 * - show：弹窗显示开关
 * - t：i18n 翻译函数
 * - isSummarizing：是否正在生成总结
 * - summaryContent：总结文本内容
 */
const props = defineProps<{
    show: boolean
    t: any
    isSummarizing: boolean
    summaryContent: string
}>()

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
})

/**
 * close：关闭弹窗
 */
const emit = defineEmits<{
    (e: 'close'): void
}>()

const isCopied = ref(false)

const copyToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(props.summaryContent)
        isCopied.value = true
        setTimeout(() => {
            isCopied.value = false
        }, 2000)
    } catch (err) {
        console.error('Failed to copy: ', err)
    }
}
</script>

<template>
    <Transition name="fade">
        <div v-if="props.show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <!-- 背景遮罩：更简约的半透明 -->
            <div class="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] transition-opacity" @click="emit('close')"></div>

            <!-- 弹窗主体：系统窗口风格 -->
            <div
                class="relative bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-200 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 fade-in duration-200"
            >
                <!-- 窗口标题栏：Traffic Lights -->
                <div class="h-10 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-4 select-none">
                    <div class="flex items-center gap-2">
                        <div class="flex gap-1.5">
                            <div class="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
                            <div class="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
                            <div class="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
                        </div>
                        <div class="ml-4 flex items-center gap-2">
                            <Sparkles class="w-4 h-4 text-orange-500" />
                            <span class="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">{{ props.t('common.aiGenerated') }}</span>
                        </div>
                    </div>
                    <div class="text-[12px] font-mono font-bold text-slate-500 tracking-tight">summary_output.md</div>
                    <button @click="emit('close')" class="text-slate-400 hover:text-slate-600 transition-colors">
                        <X class="w-4 h-4" />
                    </button>
                </div>

                <div class="p-6 md:p-8">
                    <!-- 标题区域 -->
                    <div class="mb-8">
                        <h3 class="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <span class="text-orange-500 font-mono">></span>
                            {{ props.t('common.summaryTitle') }}
                        </h3>
                    </div>

                    <!-- 内容区域 -->
                    <div class="relative min-h-[300px] max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar-geek">
                        <div v-if="props.isSummarizing" class="absolute inset-0 flex flex-col items-center justify-center">
                            <div class="font-mono text-sm text-slate-400 flex flex-col items-center gap-4">
                                <RefreshCw class="w-6 h-6 text-orange-500 animate-spin" />
                                <div class="flex gap-1">
                                    <span>$</span>
                                    <span class="animate-pulse">{{ props.t('common.summarizing') }}</span>
                                    <span class="w-2 h-4 bg-orange-500 animate-blink"></span>
                                </div>
                            </div>
                        </div>

                        <div v-else class="summary-content-wrapper">
                            <div class="markdown-body-geek max-w-none" v-html="md.render(props.summaryContent)"></div>
                        </div>
                    </div>

                    <!-- 底部操作栏 -->
                    <div class="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between font-mono">
                        <div class="flex items-center gap-3">
                            <button
                                v-if="!props.isSummarizing && props.summaryContent"
                                @click="copyToClipboard"
                                :class="[
                                    'flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-bold transition-all border active:scale-95',
                                    isCopied
                                        ? 'bg-green-50 text-green-600 border-green-100'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-orange-200 hover:bg-orange-50/30'
                                ]"
                            >
                                <component :is="isCopied ? Check : Copy" class="w-3.5 h-3.5" />
                                {{ isCopied ? 'DONE' : 'COPY_TO_CLIPBOARD' }}
                            </button>
                        </div>

                        <button
                            @click="emit('close')"
                            class="px-6 py-2 bg-[#1E293B] text-white rounded-lg text-[12px] font-bold tracking-widest hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2 border border-slate-800 shadow-sm"
                        >
                            <X class="w-3.5 h-3.5" />
                            EXIT_SESSION
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.custom-scrollbar-geek::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar-geek::-webkit-scrollbar-track {
    background: #f8fafc;
}

.custom-scrollbar-geek::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 4px;
}

.custom-scrollbar-geek::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
}

@keyframes blink {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
}

.animate-blink {
    animation: blink 1s step-end infinite;
}

/* 极客风格 Markdown 样式 */
:deep(.markdown-body-geek) {
    color: #1e293b;
    font-size: 0.95rem;
    line-height: 1.7;
}

:deep(.markdown-body-geek h1),
:deep(.markdown-body-geek h2),
:deep(.markdown-body-geek h3) {
    color: #0f172a;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

:deep(.markdown-body-geek h2::before) {
    content: '##';
    color: #f97316;
    font-family: monospace;
    font-size: 0.8em;
}

:deep(.markdown-body-geek p) {
    margin-bottom: 1rem;
}

:deep(.markdown-body-geek ul) {
    margin-bottom: 1rem;
    padding-left: 1.25rem;
}

:deep(.markdown-body-geek li) {
    margin-bottom: 0.4rem;
    position: relative;
    list-style: none;
}

:deep(.markdown-body-geek li::before) {
    content: '→';
    position: absolute;
    left: -1.25rem;
    color: #f97316;
}

:deep(.markdown-body-geek blockquote) {
    border-left: 2px solid #1e293b;
    background: #f1f5f9;
    padding: 0.75rem 1rem;
    margin: 1.25rem 0;
    font-family: monospace;
    font-size: 0.9em;
    color: #475569;
}

:deep(.markdown-body-geek strong) {
    color: #0f172a;
    background: #fef3c7;
    padding: 0 0.2rem;
    border-radius: 0.2rem;
}

:deep(.markdown-body-geek hr) {
    border: 0;
    height: 1px;
    background: #e2e8f0;
    margin: 2rem 0;
}
</style>
