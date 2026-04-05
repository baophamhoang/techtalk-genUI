# GenUI Techtalk - 3 Levels of Generative UI

Demo projects for techtalk "Post-Chat UI: Khi giao diện tự 'tiến hóa' theo hành vi người dùng"

## 📋 Overview

3 progressive demos showing evolution from basic to advanced Generative UI:

1. **Basic:** JSON Render - Declarative UI from JSON schema
2. **Medium:** Vercel AI SDK - Intent-based UI generation
3. **Advanced:** Multi-Model Orchestration - Cost-optimized, enterprise-ready

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- (Optional) OpenAI API key for Vercel AI SDK demo

### Installation

```bash
# Clone and install dependencies
git clone [your-repo-url]
cd genUI-techtalk

# Install root dependencies
npm install

# Install dependencies for each app
cd apps/json-render-demo && npm install
cd ../vercel-ai-demo && npm install
cd ../multi-model-demo && npm install
```

### Running Demos

**Option 1: Run all demos (recommended for presentation)**

```bash
# From root directory
npm run dev:all
```

**Option 2: Run individually**

```bash
# Demo 1: JSON Render (Basic)
cd apps/json-render-demo
npm run dev
# Open: http://localhost:3101

# Demo 2: Vercel AI SDK (Medium)
cd apps/vercel-ai-demo
npm run dev
# Open: http://localhost:3000

# Demo 3: Multi-Model (Advanced)
cd apps/multi-model-demo
npm run dev
# Open: http://localhost:3003
```

## 🔧 API Keys Configuration

### Demo 2: Vercel AI SDK

This demo uses OpenAI API. Create `.env.local` in `apps/vercel-ai-demo`:

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Without API key:** The demo will use mock data and show the UI flow without actual AI generation.

### Demo 3: Multi-Model Orchestration

This is a **simulation** - no actual API keys needed. It demonstrates the orchestration logic and cost optimization strategies.

## 📁 Project Structure

```
genUI-techtalk/
├── apps/
│   ├── json-render-demo/     # Demo 1: Basic - JSON Render
│   │   ├── src/
│   │   ├── package.json
│   │   └── ...
│   ├── vercel-ai-demo/       # Demo 2: Medium - Vercel AI SDK
│   │   ├── app/
│   │   ├── package.json
│   │   └── ...
│   └── multi-model-demo/     # Demo 3: Advanced - Multi-Model
│       ├── app/
│       ├── package.json
│       └── ...
├── package.json              # Root package (workspaces)
├── turbo.json               # Turborepo config
├── SLIDE_DECK.md            # Presentation slides
└── README.md               # This file
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

**Use Case:** Form builders, CRUD interfaces, internal tools

### Demo 2: Vercel AI SDK (Medium)

**Port:** 3000
**Tech Stack:** Next.js 15 + Vercel AI SDK + Tailwind CSS
**Key Features:**

- Role-based dashboard (Admin/Manager/User)
- Intent detection from context
- Real-time UI generation
- AI recommendations

**Use Case:** Adaptive dashboards, smart forms, personalized interfaces

### Demo 3: Multi-Model Orchestration (Advanced)

**Port:** 3003
**Tech Stack:** Next.js 15 + Simulation Logic
**Key Features:**

- Intelligent model routing (DeepSeek, GPT-4o, Claude, etc.)
- Cost optimization (50-60% savings simulation)
- Performance monitoring
- Fallback strategies

**Use Case:** Enterprise SaaS, budget-sensitive projects, vendor redundancy

## 🎤 Presentation Notes

### Talking Points for Each Demo

**Demo 1 (Basic):**

- "JSON as UI definition language"
- "Declarative over imperative"
- "Perfect for form-heavy applications"
- "No AI prompting needed - just JSON"

**Demo 2 (Medium):**

- "Beyond prompting: context-aware UI"
- "AI understands user role and task"
- "Real-time adaptation without explicit commands"
- "Vercel ecosystem integration"

**Demo 3 (Advanced):**

- "Enterprise-grade cost optimization"
- "Multi-vendor strategy for reliability"
- "Intelligent task-to-model routing"
- "Scalable for high-volume applications"

### Q&A Preparation

**Common Questions:**

1. "What about brand consistency with AI-generated UI?"
   - Answer: Design system constraints, brand tokens, human approval workflow

2. "Is this production-ready?"
   - Demo 1: Yes, for specific use cases
   - Demo 2: With proper API setup, yes
   - Demo 3: Strategy is production-ready, implementation varies

3. "Cost comparison?"
   - Demo 3 shows 50-60% savings vs single-model approach

## 🔧 Development

### Adding New Demos

```bash
# Create new app in apps/ directory
mkdir apps/new-demo
cd apps/new-demo
npm init -y
# Add to workspaces in root package.json
```

### Building for Production

```bash
# Build all apps
npm run build

# Build specific app
cd apps/vercel-ai-demo
npm run build
```

## 📚 Resources

- [JSON Render Documentation](https://json-render.dev)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [OpenRouter API](https://openrouter.ai/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## 📄 License

MIT

## 👥 Contributors

- Your Name - [@yourhandle](https://twitter.com/yourhandle)

## 🙏 Acknowledgements

- Vercel team for AI SDK
- JSON Render team
- OpenRouter for multi-model access
- Layerproof team for real-world use cases
