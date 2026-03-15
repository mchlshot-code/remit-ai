# 🚀 RemitAI — Master Scaffold Prompt
> Drop this into Cursor or Windsurf Agent to scaffold the full project in one shot.

---

## PROMPT 1 — Project Scaffold (Drop this first)

```
You are an expert Next.js fullstack engineer. Scaffold a production-ready web application called "RemitAI" — an AI-Powered Remittance Comparison & Transfer Assistant.

TECH STACK:
- Next.js 14 (App Router, TypeScript)
- Tailwind CSS + shadcn/ui (components)
- Supabase (database + auth)
- Anthropic Claude API (AI assistant)
- Zustand (client state)
- React Query / TanStack Query (server state & caching)
- Resend (email alerts)
- Vercel (deployment target)

PROJECT STRUCTURE (Modular Monolith):
remit-ai/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  ← Landing + comparison UI
│   ├── chat/page.tsx             ← AI Assistant page
│   ├── alerts/page.tsx           ← Rate alert management
│   └── api/
│       ├── rates/route.ts        ← Fetch & aggregate rates
│       ├── compare/route.ts      ← Comparison engine
│       ├── chat/route.ts         ← Claude AI endpoint
│       └── alerts/route.ts       ← Alert CRUD
├── modules/
│   ├── rates/
│   │   ├── fetchers.ts           ← API calls to rate providers
│   │   ├── normalizer.ts         ← Normalize data to common schema
│   │   └── types.ts
│   ├── ai-assistant/
│   │   ├── prompt-builder.ts     ← Build system prompts with live rates
│   │   ├── chat-handler.ts       ← Stream handler
│   │   └── types.ts
│   ├── alerts/
│   │   ├── alert-service.ts      ← Create/check/trigger alerts
│   │   ├── email-sender.ts       ← Resend integration
│   │   └── types.ts
│   └── auth/
│       ├── session.ts
│       └── types.ts
├── components/
│   ├── ui/                       ← shadcn components
│   ├── comparison-table.tsx
│   ├── rate-input-form.tsx
│   ├── ai-chat.tsx
│   ├── best-pick-badge.tsx
│   └── alert-form.tsx
├── lib/
│   ├── supabase.ts
│   ├── anthropic.ts
│   ├── utils.ts
│   └── constants.ts
├── config/
│   └── providers.ts              ← List of supported remittance providers
├── .env.local.example
├── agent.md                      ← Architectural rules
└── README.md

GENERATE:
1. Full folder structure with all files above (stubs are fine for logic, but proper types and exports)
2. .env.local.example with all required keys
3. Supabase schema SQL for: users, alerts, rate_cache tables
4. Install commands for all dependencies
5. shadcn/ui init config

RULES:
- Use TypeScript everywhere, no 'any' types
- All API routes must have proper error handling and typed responses
- All modules must be self-contained with their own types.ts
- Use named exports only
- Never import across modules directly — use the API layer

Start generating now.
```

---

## PROMPT 2 — Rate Comparison Engine (Day 2)

```
Now build the Rate Comparison Engine inside RemitAI.

MODULE: modules/rates/

TASK:
Build fetchers for these 4 providers. Each must return a normalized RateResult object:

interface RateResult {
  provider: string           // e.g. "Wise"
  logo: string               // URL or local path
  sendAmount: number
  receiveAmount: number
  exchangeRate: number
  fee: number
  totalCost: number          // sendAmount + fee
  transferSpeed: string      // e.g. "Within 1 hour"
  isBestRate: boolean        // computed after comparison
  link: string               // CTA link to provider
}

PROVIDERS TO INTEGRATE:
1. Wise — https://wise.com/gb/currency-converter/gbp-to-ngn-rate (scrape or use their public rate API)
2. Remitly — https://api.remitly.io/v2/pricing (public endpoint)
3. WorldRemit — public rate page
4. ExchangeRate-API — https://v6.exchangerate-api.com/v6/{API_KEY}/pair/GBP/NGN (for base rate reference)
5. Your suggestions

COMPARISON LOGIC (modules/rates/normalizer.ts):
- After fetching all providers, sort by receiveAmount DESC
- Mark the highest receiveAmount as isBestRate: true
- Compute savings vs worst rate: "You save £12.50 vs worst rate"

UI (components/comparison-table.tsx):
- Responsive table/card layout
- Best rate highlighted with green badge
- Show: Provider logo, exchange rate, fee, amount received, speed, CTA button
- "Best Value" badge on winner
- Subtle animation on load (stagger cards in)
- Mobile: card stack layout

Also build the rate-input-form.tsx:
- From country (dropdown, default: United Kingdom 🇬🇧)
- To country (dropdown, default: Nigeria 🇳🇬)
- Amount input with currency symbol
- "Compare Rates" button
- On submit: call /api/rates endpoint and render comparison table

Generate all code now.
```

---

## PROMPT 3 — AI Assistant (Day 3)

Now build the AI Assistant module for RemitAI.

MODULE: modules/ai-assistant/

GROQ INTEGRATION:
- SDK: groq-sdk
- Model: llama-3.1-70b-versatile
- Streaming: YES (use ReadableStream)
- Context: Always inject the latest live rates into the system prompt
- Install: npm install groq-sdk

ENVIRONMENT VARIABLE:
GROQ_API_KEY=your_groq_api_key  ← get free at console.groq.com

CLIENT SETUP (lib/groq.ts):
import Groq from 'groq-sdk'

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

SYSTEM PROMPT TEMPLATE (modules/ai-assistant/prompt-builder.ts):

You are RemitAI Assistant, a friendly and knowledgeable financial guide
specializing in international money transfers and remittances.

You have access to LIVE rate data as of {timestamp}:
{ratesJSON}

Your role:
- Help users understand which provider is best for their specific situation
- Explain fees, exchange rates, and transfer speeds in plain simple language
- Answer questions about sending money internationally
- Give honest, unbiased recommendations based on the live data
- Warn about hidden fees or unfavorable conditions
- Be conversational, warm, and culturally aware

Rules:
- Never fabricate rates — only use the data provided above
- Always recommend users verify on the provider's website before transferring
- If asked about a corridor not in your data, say so honestly
- Keep responses concise (max 3 paragraphs unless asked for detail)

API ROUTE (app/api/chat/route.ts):
- Accept: { messages: Message[], currentRates: RateResult[] }
- Build system prompt with injected live rates
- Use groq.chat.completions.create() with stream: true
- Stream response back using ReadableStream + TextEncoder
- Rate limit: 20 requests per session (store in Supabase)

Use this exact streaming pattern:

import { groq } from '@/lib/groq'
import { buildSystemPrompt } from '@/modules/ai-assistant/prompt-builder'

export async function POST(req: Request) {
  const { messages, currentRates } = await req.json()

  const systemPrompt = buildSystemPrompt(currentRates)

  const stream = await groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
    max_tokens: 1024,
    temperature: 0.3,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ]
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || ''
        if (text) controller.enqueue(encoder.encode(text))
      }
      controller.close()
    }
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked'
    }
  })
}

UI (components/ai-chat.tsx):
- Full chat interface with message bubbles
- Streaming text display (typewriter effect)
- Read stream chunks using ReadableStreamDefaultReader
- Suggested starter questions:
  * "Which is cheapest to send £500 to Nigeria?"
  * "What are the hidden fees on Remitly?"
  * "Should I send now or wait?"
  * "How long does WorldRemit take?"
- Auto-scroll to latest message
- Loading skeleton while streaming
- Clear chat button

Use this client-side streaming read pattern in ai-chat.tsx:

const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages, currentRates })
})

const reader = response.body?.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  const chunk = decoder.decode(value)
  setStreamingMessage(prev => prev + chunk)
}

Generate all code now.
---

## PROMPT 4 — Rate Alerts (Day 4)

```
Now build the Rate Alerts feature for RemitAI.

MODULE: modules/alerts/

DATABASE (Supabase):
Table: rate_alerts
- id: uuid
- email: text
- from_currency: text
- to_currency: text  
- target_rate: decimal
- current_rate: decimal
- is_triggered: boolean
- created_at: timestamp

LOGIC (alert-service.ts):
- createAlert(email, fromCurrency, toCurrency, targetRate)
- checkAlerts() → runs every 30 mins via cron, checks all untriggered alerts
- triggerAlert(alertId) → sends email via Resend, marks as triggered

EMAIL (email-sender.ts via Resend):
Subject: "🎯 Your rate alert triggered! GBP→NGN hit your target"
Body: Clean HTML email showing:
- Current rate vs target rate
- Best provider right now
- Direct CTA link to transfer

API ROUTE (app/api/alerts/route.ts):
- POST /api/alerts → create alert
- GET /api/alerts?email=x → list user's alerts
- DELETE /api/alerts/:id → remove alert

UI (components/alert-form.tsx):
- Email input
- Target rate input with current rate shown as reference
- "Notify me when rate hits X" submit
- List of active alerts below form
- Delete alert button

Also add a Vercel cron job config (vercel.json) to run checkAlerts every 30 minutes.

Generate all code now.
```

---

## PROMPT 5 — Polish, Deploy & Demo (Day 5)

```
Now polish RemitAI for showcase deployment.

TASKS:

1. LANDING PAGE (app/page.tsx):
- Hero section: "Send Money Smarter. Compare. Save. Transfer."
- Live rate ticker showing top 3 corridors (GBP→NGN, USD→NGN, EUR→NGN)
- Feature highlights: Compare, AI Chat, Rate Alerts
- Comparison form embedded in hero
- Trust signals: "Comparing X providers | Updated every 30 mins"

2. DESIGN POLISH:
- Dark mode support (next-themes)
- Consistent color system (emerald green as brand color)
- Skeleton loaders on all async components
- Empty states with helpful copy
- Error boundaries on all major sections
- Toast notifications (sonner) for alert creation, errors

3. SEO & META:
- og:image meta tags
- Page titles and descriptions
- robots.txt and sitemap.xml

4. PERFORMANCE:
- Rate data cached for 10 minutes (Redis via Upstash or in-memory)
- Images optimized with next/image
- Loading states on all buttons

5. VERCEL DEPLOYMENT:
- vercel.json with cron job for alerts
- Environment variables list
- Build and deploy commands

6. DEMO SCRIPT:
Generate a 2-minute demo walkthrough script covering:
- Problem statement
- Live rate comparison
- AI assistant demo query
- Rate alert setup
- Impact summary

Generate all code and the demo script now.
```