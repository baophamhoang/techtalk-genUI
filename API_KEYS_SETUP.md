# API Keys Setup Guide

## 📋 Overview

This guide explains API key requirements for each demo. Only **Demo 2** requires actual API keys for full functionality.

## 🔑 Demo 1: JSON Render (Basic)

**No API keys required** ✅

This demo uses `json-render.dev` library which is a client-side JSON schema renderer. It doesn't make any API calls.

**Note:** If you want to integrate with AI for JSON generation, you would need to add your own API key in a separate backend service.

## 🔑 Demo 2: Vercel AI SDK (Medium)

### Required: OpenAI API Key

**Steps to set up:**

1. **Get an OpenAI API key:**
   - Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Create new API key (or use existing one)
   - Copy the key (starts with `sk-`)

2. **Create environment file:**

   ```bash
   cd apps/vercel-ai-demo
   echo "OPENAI_API_KEY=sk-your-key-here" > .env.local
   ```

3. **Alternative models (optional):**
   You can also use other providers with Vercel AI SDK:

   ```bash
   # For Anthropic Claude
   ANTHROPIC_API_KEY=your-claude-key

   # For Google Gemini
   GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key

   # For Groq
   GROQ_API_KEY=your-groq-key
   ```

### Without API Key (Mock Mode)

**The demo will still work** but with simulated responses:

- UI components will be generated from mock data
- AI recommendations will be static examples
- Intent detection will use simulated logic

**To run in mock mode:**

1. Don't create `.env.local` file
2. Run the app normally
3. You'll see "Using mock data" indicators

### Cost Estimation

- **Demo usage:** ~$0.01-0.05 per presentation
- **Model:** gpt-4o-mini recommended ($0.00015/1K tokens)
- **Tokens per generation:** ~500-1000 tokens

## 🔑 Demo 3: Multi-Model Orchestration (Advanced)

**No API keys required** ✅

This is a **simulation demo** that shows:

- Model orchestration logic
- Cost optimization strategies
- Performance monitoring
- Fallback mechanisms

**What's simulated:**

- Model selection decisions
- Cost calculations
- Token usage estimation
- Latency measurements

**For real implementation,** you would need:

```bash
# OpenRouter (recommended for multi-model)
OPENROUTER_API_KEY=your-openrouter-key

# Or individual providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=claude-...
DEEPSEEK_API_KEY=ds-...
```

## 🔒 Security Best Practices

### Never commit API keys!

- `.env.local` is in `.gitignore`
- Use `.env.local.example` for template
- Rotate keys regularly

### Environment Files Structure

```
apps/vercel-ai-demo/
├── .env.local          # Your actual keys (gitignored)
├── .env.local.example  # Template for others
└── .env                # Default environment
```

**.env.local.example:**

```bash
# Copy this to .env.local and add your keys
OPENAI_API_KEY=sk-your-openai-api-key-here
# ANTHROPIC_API_KEY=your-anthropic-key
# GOOGLE_GENERATIVE_AI_API_KEY=your-google-key
```

## 💰 Cost Management Tips

### For Presentation

1. Use **gpt-4o-mini** (cheapest OpenAI model)
2. Set **usage limits** in OpenAI dashboard
3. Monitor **token usage** during demo

### OpenAI Dashboard Settings

1. Go to [platform.openai.com/usage](https://platform.openai.com/usage)
2. Set **soft limit:** $5
3. Set **hard limit:** $10
4. Enable **usage notifications**

### For Production

1. Implement **caching** for repeated requests
2. Use **streaming** for better UX
3. Add **rate limiting** per user
4. Monitor **cost per request**

## 🚨 Troubleshooting

### "API key not found"

```bash
# Check if .env.local exists
cd apps/vercel-ai-demo
ls -la .env.local

# If missing, create it
cp .env.local.example .env.local
# Edit .env.local with your key
```

### "Invalid API key"

1. Verify key starts with `sk-`
2. Check if key has expired
3. Ensure proper permissions
4. Try creating new key

### "Rate limit exceeded"

1. Wait 60 seconds
2. Use mock mode for demo
3. Implement exponential backoff in production

## 📞 Support

**OpenAI Support:** [help.openai.com](https://help.openai.com)

**Vercel AI SDK Issues:** [github.com/vercel/ai](https://github.com/vercel/ai)

**Demo Code Issues:** Open issue in this repository

## ✅ Checklist Before Presentation

- [ ] Demo 1: No setup needed
- [ ] Demo 2: `.env.local` with OpenAI key (optional)
- [ ] Demo 3: No setup needed
- [ ] Test all demos locally
- [ ] Check internet connection
- [ ] Have mock mode backup plan
