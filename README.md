# ThinkFlow AI

中文 | [English](./README.en.md)

**ThinkFlow AI** 是一款基于 Vue 3 和 VueFlow 构建的次世代、本地优先（Local-first）AI 驱动思维导图工具。它不仅仅是一个绘图软件，更是一个能够与你共同思考的“脑力增幅器”。通过将 LLM（大语言模型）的发散性能力与结构化可视化相结合，ThinkFlow AI 能将模糊的想法迅速转化为清晰、深度的知识体系。

本项目通过 Vibe Coding 完成（需求驱动 + AI 协作迭代）。

---

## 🔗 在线预览

立即体验：[https://thinkflow-ai.lz-t.top/](https://thinkflow-ai.lz-t.top/)

---

## 🌟 为什么选择 ThinkFlow AI？

传统的思维导图工具往往需要手动录入每一个分支，这在灵感爆发时往往会成为阻碍。ThinkFlow AI 重新定义了这一过程：

1.  **AI 驱动的自动化发散**：输入一个核心词，AI 会基于逻辑链路自动向外扩展，帮助你打破“白纸焦虑”。
2.  **上下文感知的深度对话**：每一个节点都带有其在思维树中的完整路径上下文，这意味着 AI 能够理解你为什么从 A 想到 B，从而生成更精准的后续建议。
3.  **多维度的感官呈现**：通过深度“回答（Answer）”获取文本知识，通过 AI 生图获取视觉意象，通过“全篇总结”获取宏观洞察。
4.  **极致的隐私与自由**：采用本地优先架构，配置存储在浏览器本地，支持任何 OpenAI 兼容接口，不锁定任何平台。

---

## 🚀 核心功能架构

### 1. 智能扩展系统

- **核心想法激活**：一键生成思维树根基。
- **路径上下文追问**：对节点进行 Follow-up，AI 将结合从根节点到当前节点的完整逻辑路径进行推理。
- **节点折叠与管理**：支持大规模图谱的子树折叠，保持视野清爽。

### 2. 内容深挖与总结

- **深度回答 (Deep Dive)**：针对特定概念生成 300-500 字的专业解析，支持 Markdown 丰富格式。
- **视觉生成 (Image Gen)**：利用 CogView 或 DALL-E 为节点生成写实风格配图，强化视觉记忆。
- **全局摘要 (Summary)**：自动分析全图逻辑，提取核心洞察与结论。

### 3. 画布交互与排版

- **智能树形布局**：内置基于子树高度动态计算的算法，解决节点展开后的重叠问题。
- **联动拖拽**：父节点移动时，子节点保持相对位置同步移动。
- **多样化导出**：完美支持导出为结构化 Markdown，保留所有深度回答内容。

---

## 🛠️ 技术栈

| 维度         | 技术选型                            |
| :----------- | :---------------------------------- |
| **前端框架** | Vue 3 (Composition API)             |
| **构建工具** | Vite 5 + TypeScript                 |
| **画布引擎** | @vue-flow/core (高性能、高度定制化) |
| **UI/样式**  | Tailwind CSS + Lucide Icons         |
| **国际化**   | Vue-I18n (中英双语无缝切换)         |
| **Markdown** | Markdown-it (支持节点内容渲染)      |

---

## 📂 源码结构

```text
src/
├── components/             # UI 组件层
│   ├── WindowNode.vue      # 核心逻辑载体：自定义节点，集成生图/回答/追问能力
│   └── ...
├── services/               # 基础服务层
│   └── config.ts           # 核心配置：API 默认地址、模型名称与全局 API Key
├── composables/            # 领域逻辑层
│   └── useThinkFlow.ts     # 业务心脏：响应式状态管理、API 调度、排版算法实现
├── i18n/                   # 语言资产
│   └── locales/            # zh.json / en.json 翻译文件
├── App.vue                 # 应用骨架：VueFlow 容器配置与组件组装
└── main.ts                 # 入口文件
```

---

## ⚙️ 部署配置说明 (私有化部署必读)

如果您希望私有化部署本项目（例如部署给公司内部或朋友使用），**强烈建议**您修改默认的后端服务配置，以免使用公共演示接口导致额度受限。

### 1. 修改默认配置

打开 `src/services/config.ts` 文件，修改 `DEFAULT_CONFIG` 常量：

```typescript
// src/services/config.ts

/**
 * 默认接口配置
 * 修改此处以指向您的私有 API 服务
 */
export const DEFAULT_CONFIG = {
    chat: {
        // 您的 Chat 接口地址 (OpenAI 兼容格式)
        // 如果遇到跨域问题，可以配合 vite.config.ts 的 proxy 使用，例如填写 '/api/chat'
        baseUrl: 'https://your-private-api.com/v1/chat/completions',
        // 默认使用的模型名称
        model: '',
        // (可选) 如果您的接口需要鉴权，可在此处填写 Key，或者留空让用户在前端设置中填写
        apiKey: ''
    },
    image: {
        // 您的生图接口地址
        baseUrl: 'https://your-private-api.com/v1/images/generations',
        model: '',
        apiKey: ''
    }
}
```

### 2. 解决跨域问题 (CORS)

如果您请求的 API 不支持跨域，可以在 `vite.config.ts` 中配置代理：

```typescript
// vite.config.ts
export default defineConfig({
    // ... 其他配置
    server: {
        proxy: {
            '/api': {
                target: 'https://your-private-api.com/v1',
                changeOrigin: true,
                rewrite: path => path.replace(/^\/api/, '')
            }
        }
    }
})
```

配置代理后，将 `config.ts` 中的 `baseUrl` 修改为相对路径（如 `/api/chat/completions`）即可。

### 3. 构建项目

```bash
npm run build
```

---

## ⚙️ API 服务说明 (公共演示)

为了让用户能够开箱即用，本项目提供了一套默认的演示接口。

### 1. 演示接口说明

- **服务转发**：默认请求通过 **Cloudflare Workers & Pages** 进行转发与控制。
- **模型支持**：目前后端对接了智谱 Bigmodel (glm-4-flash / cogview-3-flash) 的免费额度。
- **限制**：由于是公共演示接口，可能会存在请求频率限制或额度耗尽的情况。

### 2. 进阶使用建议 (自定义接口)

为了获得更稳定、更高质量的生成效果（例如使用 GPT-4o, Claude 3.5 Sonnet 等），强烈建议在 **设置 (Settings)** 中配置您自己的 API 端点：

- **Base URL**: 您的 API 代理地址 (需支持 CORS)。
- **Model**: 目标模型名称。
- **API Key**: 您的私有密钥。

_注：自定义模式下，请求将直接从您的浏览器发往目标端点，不经过任何中转，更加安全高效。_

---

## 📦 快速部署

```bash
# 克隆仓库
git clone https://github.com/your-repo/ThinkFlowAI.git

# 安装依赖
npm install

# 启动开发
npm run dev

# 生产构建
npm run build
```

---

