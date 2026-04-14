# GenUI Techtalk - 4 Levels of Generative UI

Demo projects for techtalk "Post-Chat UI: Khi giao diện tự 'tiến hóa' theo hành vi người dùng"

## 📋 Overview

4 progressive demos showing evolution from basic to advanced Generative UI:

1. **Basic:** JSON Render - Declarative UI from JSON schema
2. **Medium:** Tool Calling - AI composes UI by calling pre-built components
3. **Advanced:** stream-ui-demo - One-shot UI composition with tool calling
4. **Advanced:** agentic-ui - Multi-turn conversational refinement with memory

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- (Optional) OpenRouter API key for AI features

### Running Demos

```bash
# Demo 1: JSON Render (Basic)
cd apps/json-render-demo
npm run dev
# Open: http://localhost:3001

# Demo 2: Tool Calling (Medium)
cd apps/stream-ui-demo
npm run dev
# Open: http://localhost:3005

# Demo 3 & 4: Agentic UI (Advanced)
cd apps/agentic-ui
npm run dev
# Open: http://localhost:3006
```

## 🔧 API Keys Configuration

Create `.env.local` in each app directory:

```bash
OPENROUTER_API_KEY=sk-your-openrouter-key-here
```

## 📁 Project Structure

```
genUI/
├── apps/
│   ├── json-render-demo/     # Demo 1: Basic - JSON Render
│   ├── stream-ui-demo/       # Demo 2 & 3: Tool Calling / One-shot Agentic
│   └── agentic-ui/           # Demo 4: Multi-turn Agentic UI
├── DEMO_GUIDE_VI.md          # Full demo guide
├── package.json              # Root package (workspaces)
└── README.md
```

## 🎯 Demo Details

### Demo 1: JSON Render (Basic)

**Port:** 3001

**Tech Stack:** React + Vite + json-render.dev

**Key Features:**
- Dynamic form generation from JSON schema
- Real-time schema preview
- Type-safe validation
- No AI API key required

### Demo 2: Tool Calling (Medium)

**Port:** 3005

**Tech Stack:** Next.js 15 + AI SDK + Tailwind CSS

**Key Features:**
- AI composes UI by calling tool functions
- Pre-built component registry
- Consistent design system
- No runtime code execution

### Demo 3: stream-ui-demo (Advanced)

**Port:** 3005

One-shot UI composition with tool calling.

### Demo 4: agentic-ui (Advanced)

**Port:** 3006

Multi-turn conversation with full context memory.

## 🎤 Presentation Notes

**Demo 1:**
- "JSON as UI definition language"
- "Declarative over imperative"
- "No AI prompting needed - just JSON"

**Demo 2:**
- "AI as orchestrator, not code generator"
- "Component registry = design system constraint"
- "Fast, safe, predictable"

**Demo 3 & 4:**
- "Beyond one-shot generation"
- "Conversation as refinement interface"
- "Memory enables context-aware updates"

## 📚 Resources

- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [OpenRouter API](https://openrouter.ai/docs)
- [Demo Guide](./DEMO_GUIDE_VI.md)

## 📄 License

MIT
