<script setup lang="ts">
import { ref, reactive, h, watch, computed } from 'vue'
import {
    Sparkles,
    Search,
    Folder,
    Monitor,
    BookOpen,
    Code,
    Sun,
    Globe,
    LogIn,
    Plus,
    MousePointer2,
    Zap,
    ArrowRight,
    RefreshCw,
    Image as ImageIcon,
    Download,
    Settings,
    Palette,
    Grid3X3,
    Trash2
} from 'lucide-vue-next'
import { VueFlow, useVueFlow, Position, MarkerType, Handle } from '@vue-flow/core'
import { Background, BackgroundVariant } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { toPng } from 'html-to-image'

// 导入 VueFlow 样式
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

// API 配置
const API_KEY = import.meta.env.VITE_ZHIPU_AI_API_KEY

// VueFlow 实例
const { addNodes, addEdges, onConnect, setNodes, setEdges, nodes: flowNodes, edges: flowEdges, updateNode, fitView } = useVueFlow()

// 状态管理
const ideaInput = ref('')
const isLoading = ref(false)
const hoveredNodeId = ref<string | null>(null)
const focusedNodeId = ref<string | null>(null)

// 计算当前是否有节点处于“活跃”状态（被聚焦、悬停或正在生成）
const activeNodeId = computed(() => {
    const expandingNode = flowNodes.value.find(n => n.data.isExpanding)
    return expandingNode?.id || focusedNodeId.value || hoveredNodeId.value
})

// 画布配置
const config = reactive({
    edgeColor: '#fed7aa',
    edgeStyle: 'smoothstep',
    backgroundVariant: BackgroundVariant.Lines,
    showControls: true
})

// 监听配置变化更新现有连线
watch(
    () => config.edgeColor,
    newColor => {
        setEdges(
            flowEdges.value.map(edge => ({
                ...edge,
                style: { ...edge.style, stroke: newColor }
            }))
        )
    }
)

/**
 * 导出为图片
 */
const exportImage = async () => {
    const el = document.querySelector('.vue-flow') as HTMLElement
    if (!el) return

    try {
        const dataUrl = await toPng(el, {
            backgroundColor: '#ffffff',
            quality: 1,
            pixelRatio: 2
        })
        const link = document.createElement('a')
        link.download = `thinkflow-${Date.now()}.png`
        link.href = dataUrl
        link.click()
    } catch (err) {
        console.error('Export failed:', err)
    }
}

/**
 * 调用智谱AI生成图片
 */
const generateNodeImage = async (nodeId: string, prompt: string) => {
    const node = flowNodes.value.find(n => n.id === nodeId)
    if (!node || node.data.isImageLoading) return

    updateNode(nodeId, { data: { ...node.data, isImageLoading: true } })

    try {
        const response = await fetch('https://open.bigmodel.cn/api/paas/v4/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'cogview-3-flash',
                prompt: `一张精美的、极简插画风格的图片，表现主题：${prompt}。要求：构图简洁，色彩明快，适合作为思维导图的视觉辅助。`
            })
        })

        if (!response.ok) throw new Error('Image request failed')
        const data = await response.json()
        const imageUrl = data.data[0].url

        updateNode(nodeId, { data: { ...node.data, imageUrl, isImageLoading: false } })
    } catch (error) {
        console.error('Image Generation Error:', error)
        updateNode(nodeId, { data: { ...node.data, isImageLoading: false } })
    }
}

/**
 * 调用智谱AI生成思维发散节点
 */
const expandIdea = async (param?: any, customInput?: string) => {
    // 判断是点击了节点上的按钮还是主输入框
    const parentNode = param && param.id ? param : undefined
    const text = customInput || (parentNode ? parentNode.data.label : ideaInput.value)

    if (!text || (parentNode ? parentNode.data.isExpanding : isLoading.value)) return

    if (parentNode) {
        updateNode(parentNode.id, { data: { ...parentNode.data, isExpanding: true } })
    } else {
        isLoading.value = true
    }

    // 如果是第一次生成，清空画布
    if (!parentNode) {
        setNodes([])
        setEdges([])
    }

    const systemPrompt = `你是一个思维发散助手，帮助用户将想法逐层展开，构建思维树。

工作流程：
1. 用户给出一个初始想法（或选择一个已有节点继续追问）。
2. 你根据当前想法和已有对话历史，生成 3-5 个更深层或相关维度的子想法。
3. 每个子想法包含简短名称和极简描述。
4. 如果用户的问题明显是针对某个已有节点的追问，请结合上下文做针对性发散。

返回格式必须为严格 JSON：
{
  "nodes": [
    { "text": "子想法1名称", "description": "一句话描述" },
    { "text": "子想法2名称", "description": "一句话描述" }
  ]
}

示例：
用户："年夜饭推荐"
你返回：{
  "nodes": [
    { "text": "传统年菜", "description": "饺子、鱼、年糕等经典菜谱" },
    { "text": "创新年菜", "description": "融合中西风格的新式年夜饭" },
    { "text": "素食年夜饭", "description": "适合素食者的丰盛菜单" },
    { "text": "快手年夜饭", "description": "省时省力又显丰盛的方案" }
  ]
}

当用户追问时（例如用户说："详细说说传统年菜"），你结合上下文发散出更细的子节点：
{
  "nodes": [
    { "text": "北方饺子", "description": "多种馅料与蘸料搭配" },
    { "text": "清蒸鱼", "description": "寓意年年有余的做法与选鱼技巧" },
    { "text": "年糕甜品", "description": "不同地区的甜味或咸味年糕" }
  ]
}

注意：只返回 JSON，不附加解释。`

    const userMessage = parentNode && customInput ? `核心想法: ${parentNode.data.label}\n用户追问: ${customInput}` : text

    try {
        const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'glm-4-flash',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.8
            })
        })

        if (!response.ok) throw new Error('AI request failed')
        const data = await response.json()
        const result = JSON.parse(data.choices[0].message.content)

        // 起始坐标
        const startX = parentNode ? parentNode.position.x + 450 : 50
        const startY = parentNode ? parentNode.position.y : 300

        // 创建根节点 (如果是第一次)
        if (!parentNode) {
            const rootId = 'root-' + Date.now()
            addNodes({
                id: rootId,
                type: 'window',
                position: { x: startX, y: startY },
                data: { label: text, description: '核心想法', type: 'root' },
                sourcePosition: Position.Right,
                targetPosition: Position.Left
            })

            // 为后续子节点计算位置
            processSubNodes(result.nodes, rootId, startX, startY)
        } else {
            processSubNodes(result.nodes, parentNode.id, startX, startY)
        }
    } catch (error) {
        console.error('Expansion Error:', error)
    } finally {
        if (parentNode) {
            updateNode(parentNode.id, { data: { ...parentNode.data, isExpanding: false, followUp: '' } })
        } else {
            isLoading.value = false
        }
    }
}

const processSubNodes = (subNodes: any[], parentId: string, baseX: number, baseY: number) => {
    subNodes.forEach((item: any, index: number) => {
        const childId = `node-${Date.now()}-${index}`
        const offsetX = 450
        const offsetY = (index - (subNodes.length - 1) / 2) * 280

        addNodes({
            id: childId,
            type: 'window',
            position: { x: baseX + offsetX, y: baseY + offsetY },
            data: {
                label: item.text,
                description: item.description,
                type: 'child',
                followUp: '',
                isExpanding: false,
                isImageLoading: false
            },
            sourcePosition: Position.Right,
            targetPosition: Position.Left
        })

        addEdges({
            id: `e-${parentId}-${childId}`,
            source: parentId,
            target: childId,
            animated: true,
            style: { stroke: config.edgeColor, strokeWidth: 2 },
            markerEnd: MarkerType.ArrowClosed
        })
    })
}

const startNewSession = () => {
    ideaInput.value = ''
    setNodes([])
    setEdges([])
}
</script>

<template>
    <div class="h-screen w-screen bg-white font-mono text-slate-800 relative overflow-hidden flex flex-col selection:bg-orange-100">
        <!-- 顶部导航栏 (工具栏) -->
        <nav class="flex-none bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm z-50">
            <div class="flex items-center gap-6">
                <div class="flex items-center gap-2 mr-4">
                    <div class="w-3 h-3 bg-orange-500 rounded-sm rotate-45"></div>
                    <span class="font-black text-slate-900 tracking-tighter text-lg">ThinkFlow</span>
                </div>

                <div class="h-6 w-[1px] bg-slate-200 mx-2"></div>

                <!-- 工具按钮组 -->
                <div class="flex items-center gap-2">
                    <!-- 重置画布 -->
                    <button @click="startNewSession" class="toolbar-btn text-red-500 hover:bg-red-50 border-red-100" title="Reset Canvas">
                        <Trash2 class="w-4 h-4" />
                        <span>RESET</span>
                    </button>

                    <div class="h-4 w-[1px] bg-slate-100 mx-1"></div>

                    <!-- 连线颜色 -->
                    <div class="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <Palette class="w-3.5 h-3.5 text-slate-400" />
                        <input type="color" v-model="config.edgeColor" class="w-4 h-4 rounded cursor-pointer bg-transparent border-none" />
                        <span class="text-[10px] font-bold text-slate-500 uppercase">Edge</span>
                    </div>

                    <!-- 背景样式 -->
                    <select v-model="config.backgroundVariant" class="toolbar-select">
                        <option :value="BackgroundVariant.Lines">LINES</option>
                        <option :value="BackgroundVariant.Dots">DOTS</option>
                    </select>

                    <div class="h-4 w-[1px] bg-slate-100 mx-1"></div>

                    <!-- 导出图片 -->
                    <button @click="exportImage" class="toolbar-btn text-emerald-600 hover:bg-emerald-50 border-emerald-100">
                        <Download class="w-4 h-4" />
                        <span>EXPORT</span>
                    </button>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <button class="p-2 hover:bg-slate-100 rounded-md transition-colors text-slate-400 font-bold text-xs flex items-center gap-1">
                    <Globe class="w-3.5 h-3.5" /> ZH
                </button>
                <button
                    class="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                    SIGN IN <LogIn class="w-3.5 h-3.5 ml-1" />
                </button>
            </div>
        </nav>

        <!-- 主内容区：VueFlow 画布 -->
        <div class="flex-grow relative">
            <VueFlow :default-edge-options="{ type: 'smoothstep' }" :fit-view-on-init="true" class="bg-white">
                <Background :variant="config.backgroundVariant" pattern-color="#f2f2f2" :gap="24" :size="0.5" />
                <Controls v-if="config.showControls" />

                <!-- 自定义节点插槽 -->
                <template #node-window="{ id, data }">
                    <div
                        class="window-node group transition-all duration-500"
                        :class="{
                            'opacity-20 grayscale-[0.5] blur-[0.5px] scale-[0.98]': activeNodeId && activeNodeId !== id,
                            'opacity-100 grayscale-0 blur-0 scale-105 z-50': activeNodeId === id
                        }"
                        :style="{
                            borderColor: activeNodeId === id ? config.edgeColor : config.edgeColor + '40',
                            boxShadow: activeNodeId === id ? `0 20px 50px -12px ${config.edgeColor}40` : ''
                        }"
                        @mouseenter="hoveredNodeId = id"
                        @mouseleave="hoveredNodeId = null"
                    >
                        <!-- 增加连接锚点 -->
                        <Handle type="target" :position="Position.Left" class="!bg-transparent !border-none" />
                        <Handle type="source" :position="Position.Right" class="!bg-transparent !border-none" />

                        <!-- Window Header -->
                        <div class="window-header" :style="{ backgroundColor: activeNodeId === id ? config.edgeColor + '15' : config.edgeColor + '05' }">
                            <div class="flex gap-1.5">
                                <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: config.edgeColor }"></div>
                                <div class="w-2 h-2 rounded-full bg-slate-200"></div>
                                <div class="w-2 h-2 rounded-full bg-slate-200"></div>
                            </div>
                            <span class="window-title" :style="{ color: config.edgeColor }">
                                {{ data.type === 'root' ? 'main.ts' : 'module.tsx' }}
                            </span>
                        </div>

                        <!-- Window Content -->
                        <div class="window-content">
                            <!-- Image Display -->
                            <div
                                v-if="data.imageUrl || data.isImageLoading"
                                class="mb-4 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 aspect-video flex items-center justify-center relative group/img"
                            >
                                <img v-if="data.imageUrl" :src="data.imageUrl" class="w-full h-full object-cover" />
                                <div v-if="data.isImageLoading" class="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                                    <RefreshCw class="w-6 h-6 text-orange-500 animate-spin mb-2" />
                                    <span class="text-[8px] font-bold text-slate-400 uppercase">Generating...</span>
                                </div>
                                <div
                                    v-if="data.imageUrl"
                                    class="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                    <button @click="generateNodeImage(id, data.label)" class="p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-md transition-all">
                                        <RefreshCw class="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            </div>

                            <div class="flex items-center gap-2 mb-2">
                                <span class="font-bold" :style="{ color: config.edgeColor }">></span>
                                <h3 class="font-black text-slate-900 tracking-tight truncate">{{ data.label }}</h3>
                            </div>
                            <p class="text-[10px] text-slate-500 leading-relaxed font-medium line-clamp-3">
                                {{ data.description }}
                            </p>

                            <!-- Node Actions -->
                            <div class="pt-3 mt-3 border-t border-slate-50">
                                <div class="flex items-center justify-between mb-3">
                                    <div class="flex items-center gap-1.5 shrink-0">
                                        <div class="w-1.5 h-1.5 rounded-full animate-pulse" :style="{ backgroundColor: data.isExpanding ? config.edgeColor : '#34d399' }"></div>
                                        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{{ data.isExpanding ? 'Expanding' : 'active' }}</span>
                                    </div>

                                    <div class="flex items-center gap-2">
                                        <button
                                            v-if="!data.imageUrl && !data.isImageLoading"
                                            @click.stop="generateNodeImage(id, data.label)"
                                            class="action-btn text-blue-500 hover:bg-blue-50"
                                        >
                                            <ImageIcon class="w-2.5 h-2.5" />
                                            <span>IMG</span>
                                        </button>
                                    </div>
                                </div>

                                <!-- Follow-up Input -->
                                <div class="relative group/input">
                                    <div
                                        class="flex items-center gap-2 bg-slate-50 rounded-lg px-2.5 py-2 border border-slate-100 focus-within:bg-white transition-all"
                                        :style="{ borderColor: data.followUp || focusedNodeId === id ? config.edgeColor : '' }"
                                    >
                                        <span class="font-black text-[10px] select-none" :style="{ color: config.edgeColor }">$</span>
                                        <input
                                            v-model="data.followUp"
                                            @focus="focusedNodeId = id"
                                            @blur="focusedNodeId = null"
                                            @keyup.enter="expandIdea({ id, data, position: flowNodes.find(n => n.id === id)?.position }, data.followUp)"
                                            placeholder="Ask a follow-up..."
                                            class="bg-transparent border-none outline-none text-[10px] font-bold text-slate-700 flex-grow placeholder:text-slate-300"
                                            :disabled="data.isExpanding"
                                        />
                                        <button
                                            @click.stop="expandIdea({ id, data, position: flowNodes.find(n => n.id === id)?.position }, data.followUp)"
                                            :disabled="!data.followUp?.trim() || data.isExpanding"
                                            class="transition-all transform active:scale-90"
                                            :style="{ color: data.followUp?.trim() ? config.edgeColor : '#cbd5e1' }"
                                        >
                                            <RefreshCw v-if="data.isExpanding" class="w-3.5 h-3.5 animate-spin" />
                                            <ArrowRight v-else class="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </VueFlow>

            <!-- 浮动 UI 层 -->
            <div class="absolute inset-0 pointer-events-none z-10 p-12"></div>

            <!-- 加载状态遮罩 -->
            <div v-if="isLoading" class="absolute inset-0 z-[100] flex items-center justify-center bg-white/5 backdrop-blur-[1px] pointer-events-none">
                <div class="bg-white/90 p-4 rounded-full shadow-2xl border border-orange-100 animate-bounce">
                    <Zap class="w-8 h-8 text-orange-500" />
                </div>
            </div>
        </div>

        <!-- 底部全局操作栏 -->
        <div class="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">
            <!-- 路径提示 (参考图片风格) -->
            <div
                class="flex items-center gap-2 px-4 py-1.5 bg-white/90 backdrop-blur-md border border-slate-200 rounded-lg shadow-sm self-start ml-2 mb-[-8px] z-10 scale-90 origin-bottom-left"
            >
                <span class="text-emerald-500 font-bold">$</span>
                <span class="text-slate-400 text-xs font-bold">pwd:</span>
                <span class="text-slate-300 text-xs">~ /</span>
                <span class="text-slate-600 text-xs font-bold">think-flow</span>
            </div>

            <div class="flex items-center gap-3">
                <!-- 核心输入框容器 -->
                <div
                    class="bg-white rounded-2xl p-1.5 flex items-center gap-3 shadow-2xl shadow-slate-200 border border-slate-200 w-[640px] group transition-all focus-within:ring-4 focus-within:ring-orange-500/5 focus-within:border-orange-200"
                >
                    <div class="flex items-center gap-3 pl-4 flex-grow">
                        <span class="text-orange-500 font-black text-lg select-none">$</span>
                        <input
                            v-model="ideaInput"
                            @keyup.enter="expandIdea"
                            placeholder="Type your idea and press Enter..."
                            class="bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-300 flex-grow font-bold tracking-tight text-sm"
                        />
                    </div>

                    <div class="flex items-center gap-1 pr-1">
                        <button
                            @click="expandIdea"
                            :disabled="isLoading || !ideaInput.trim()"
                            class="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all active:scale-95 disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed group/btn"
                        >
                            <span class="text-[10px] font-black tracking-widest uppercase mr-1">Execute</span>
                            <Zap v-if="!isLoading" class="w-4 h-4 text-orange-400 group-hover/btn:scale-110 transition-transform" />
                            <RefreshCw v-else class="w-4 h-4 animate-spin" />
                        </button>
                    </div>
                </div>

                <!-- 底部按钮组 (仅保留核心功能) -->
                <div class="flex items-center gap-2">
                    <!-- 这里可以根据需要放一些其他快捷按钮 -->
                </div>
            </div>
        </div>
    </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap');

body {
    margin: 0;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
}

.font-mono {
    font-family: 'JetBrains Mono', monospace;
}

.toolbar-btn {
    @apply flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black tracking-widest transition-all active:scale-95 uppercase;
}

.toolbar-btn:hover {
    @apply border-current shadow-sm;
}

.toolbar-select {
    @apply px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black tracking-widest text-slate-500 outline-none cursor-pointer hover:border-slate-200 transition-all uppercase;
}

.nav-btn {
    @apply flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-600 hover:border-slate-300 hover:shadow-sm transition-all;
}

/* VueFlow Custom Node Styles */
.window-node {
    @apply w-[280px] bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden transition-all duration-300;
}

.window-node:hover {
    @apply shadow-2xl shadow-orange-100 -translate-y-1 border-orange-200;
}

.window-header {
    @apply bg-slate-50/80 px-3 py-1.5 border-b border-slate-100 flex items-center justify-between;
}

.window-title {
    @apply text-[9px] font-bold text-slate-300 tracking-widest uppercase;
}

.window-content {
    @apply p-4;
}

.action-btn {
    @apply flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold transition-all active:scale-95 uppercase tracking-tighter whitespace-nowrap border border-transparent;
}

.action-btn:hover {
    @apply border-current bg-opacity-10;
}

/* VueFlow Overrides */
.vue-flow__node-window {
    @apply p-0 border-none bg-transparent !important;
}

.vue-flow__controls {
    @apply !bg-white !border-slate-200 !shadow-xl !rounded-lg !left-6 !bottom-6;
}

.vue-flow__controls-button {
    @apply !border-slate-100 !fill-slate-400 hover:!bg-slate-50 !transition-colors;
}

.vue-flow__background {
    @apply !bg-white;
}

/* Animation */
@keyframes spin-slow {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

input::placeholder {
    @apply opacity-30;
}

input:focus::placeholder {
    @apply opacity-10;
}

.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
