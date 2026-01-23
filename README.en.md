# 🧠 ThinkFlow AI

<p align="center">
  <img src="./public/logo.png" alt="ThinkFlow AI Logo" width="120" />
</p>

<p align="center">
  <strong>Give Flow to Thought, Shape to Inspiration: An AI-Driven, Local-First Thinking Space</strong>
</p>

<p align="center">
  <a href="https://github.com/vuejs/core"><img src="https://img.shields.io/badge/vue-3.x-brightgreen.svg" alt="vue"></a>
  <a href="https://github.com/vitejs/vite"><img src="https://img.shields.io/badge/vite-5.x-646cff.svg" alt="vite"></a>
  <a href="https://github.com/microsoft/TypeScript"><img src="https://img.shields.io/badge/typescript-5.x-blue.svg" alt="typescript"></a>
  <a href="https://github.com/tailwindlabs/tailwindcss"><img src="https://img.shields.io/badge/tailwind-3.x-38bdf8.svg" alt="tailwind"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-orange.svg" alt="license"></a>
</p>

<p align="center">
  English | <a href="./README.md">中文</a>
</p>

---

## 💡 Vision & Philosophy

**ThinkFlow AI** is dedicated to creating a high-efficiency workbench that transforms "ideas" into "structured graphs."

In traditional creation, inspiration is often fragmented and fuzzy. ThinkFlow AI redefines this process: simply input a core idea, and the application leverages the divergent power of AI to expand it into a hierarchical, interactive **Knowledge Graph**.

- **Modular Expansion**: Starting from core concepts, it automatically deduces and generates sub-modules, building a logically rigorous thinking network.
- **Infinite Depth Exploration**: Every node is just a beginning. You can continue to **follow-up and expand** any branch or dive deep into professional details through the "**Deep Answer**" feature.
- **Multidimensional Sensory Fusion**: Supports one-click **image generation** for nodes, weaving abstract logic with concrete visual imagery to achieve full-sensory knowledge internalization.

This is more than just a tool; it is a local-first thinking space that grows with you.

---

## ✨ Key Features

### 🚀 Intelligent Divergence System (AI-Driven Divergence)

- **Zero-Pressure Cold Start**: Enter a core concept, and the AI automatically builds the initial logical skeleton, ending "blank page anxiety."
- **Full-Chain Context Awareness**: The AI understands the complete logical path from the root node to the current node. This means every "follow-up" is based on deep context rather than isolated keywords.
- **Multi-style AI Generation**: Switch between "Creative" and "Precise" modes to control the breadth and depth of AI expansions.
- **Dynamic Tree Layout**: Built-in adaptive layout algorithm automatically handles collisions and overlaps when nodes expand, ensuring the graph remains clear and organized.

### 🔍 Deep Content Exploration (Deep Dive & Insights)

- **Professional-Grade Deep Analysis**: Generate 300-500 words of deep answers with one click, supporting Markdown rendering, covering concept explanations, case studies, and logical deductions.
- **Visual Imagery Generation**: Integrated CogView/DALL-E interfaces generate concrete images for abstract concepts, reinforcing sensory memory and multi-dimensional cognition.
- **Global Macro Insights**: Automatically scans the entire graph topology to extract key points and generate a global summary.

### 🛠️ Premium Interaction Experience

- **Immersive Presentation Mode**: One-click full-screen presentation with keyboard navigation (Arrow keys) to guide your audience through the map.
- **Global Search & Focus**: Real-time search for nodes by label or description with automatic viewport focusing.
- **Linked Dragging System**: Parent and child nodes move together, maintaining the relative stability of logical clusters.
- **Subtree State Management**: Supports subtree collapsing for large-scale graphs, allowing you to switch freely between macro vision and micro details.
- **Local-First Architecture**: All configurations and data are stored in the browser's IndexedDB/LocalStorage. Supports any OpenAI-compatible interface with no platform lock-in.

---

## 🔗 Live Demo

Start your thinking journey now: [https://thinkflow-ai.lz-t.top/](https://thinkflow-ai.lz-t.top/)

---

## 🛠️ Tech Stack Revealed

| Domain             | Tech Choice                 | Core Advantages                                                             |
| :----------------- | :-------------------------- | :-------------------------------------------------------------------------- |
| **Core Framework** | **Vue 3 (Composition API)** | Ultimate reactive experience and component-based development efficiency.    |
| **Build Tool**     | **Vite 5 + TypeScript**     | Second-level startup speed and rigorous type safety.                        |
| **Canvas Engine**  | **@vue-flow/core**          | High-performance node rendering and extremely high customization potential. |
| **Visual Styling** | **Tailwind CSS**            | Atomic style management, ensuring a refined and unified UI.                 |
| **i18n**           | **Vue-I18n**                | Comprehensive localized support for English and Chinese.                    |
| **Parsing Engine** | **Markdown-it**             | High-quality rendering of node content with code highlighting.              |

---

## 📂 Architecture Overview

```text
src/
├── components/          # Refined UI Component Library
│   ├── WindowNode.vue   # Core Hub: Custom node integrating AI scheduling and interaction logic
│   ├── TopNav.vue       # Global Control Center
│   └── ...
├── services/            # Data & Configuration Layer
│   └── config.ts        # Strategy Config: API gateways, model parameters, and default settings
├── composables/         # Business Logic Brain
│   └── useThinkFlow.ts  # Core Logic: Graph state management, AI request stream processing, auto-layout algorithm
├── i18n/                # Internationalization Assets (Locales)
├── App.vue              # Container Skeleton
└── main.ts              # Application Entry Point
```

---

## 🚀 Quick Start

### 1. Prerequisites

Ensure your development environment has [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 2. Clone and Install

```bash
git clone https://github.com/your-repo/ThinkFlowAI.git
cd ThinkFlowAI
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

---

## ⚙️ Deployment & Private Configuration

### 1. Default Demo Endpoint Description

The project defaults to proxying requests via **Cloudflare Workers** to Zhipu Bigmodel (glm-4-flash/cogview-3-flash). Public interfaces have rate limits; developers are encouraged to configure private endpoints.

### 2. Custom API Configuration

Modify `DEFAULT_CONFIG` in [src/services/config.ts](file:///d:/lztcode/ThinkFlowAI/src/services/config.ts):

```typescript
export const DEFAULT_CONFIG = {
    chat: {
        baseUrl: 'https://api.your-provider.com/v1/chat/completions',
        model: 'gpt-4o',
        apiKey: 'sk-...' // Recommended to configure via environment variables or UI settings to avoid hardcoding
    },
    image: {
        baseUrl: 'https://api.your-provider.com/v1/images/generations',
        model: 'dall-e-3',
        apiKey: 'sk-...'
    }
}
```

### 3. Build for Production

```bash
npm run build
```

---

<p align="center">
  If you find this project helpful, please give it a ⭐️ to show your support!
</p>

