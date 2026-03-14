# agent.md — RemitAI Architectural Rules
> This file governs how the AI agent (Cursor/Windsurf) must behave when working on this codebase.
> Read this file before making ANY changes.

---

## 🧠 Project Identity

**Name**: RemitAI  
**Type**: Modular Monolith (Next.js 14, App Router)  
**Purpose**: AI-powered remittance comparison and transfer assistant  
**Audience**: General public sending money internationally  
**Deployment**: Vercel  

---

## 🏗️ Architecture Rules

### 1. Modular Monolith — Non-Negotiable
- The app is ONE deployable unit, split into internal modules
- Each module lives in `modules/<module-name>/`
- Modules MUST NOT import from each other directly
- Cross-module communication happens ONLY through the `app/api/` layer
- Think of modules as mini-services that happen to live in the same repo

```
✅ ALLOWED:   modules/rates/fetchers.ts  →  app/api/rates/route.ts  →  components/comparison-table.tsx
❌ FORBIDDEN: modules/ai-assistant/chat-handler.ts  →  modules/rates/fetchers.ts
```

### 2. Module Structure
Every module MUST have this structure:
```
modules/<name>/
├── types.ts        ← All TypeScript interfaces for this module
├── index.ts        ← Public exports only (barrel file)
└── <logic>.ts      ← Implementation files
```

### 3. API Layer is the Contract
- All `app/api/` routes are the ONLY public interface between modules and UI
- API routes must be typed: typed Request body in, typed Response out
- Use Zod for runtime validation on all API routes

```typescript
// Every API route must follow this pattern
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

const RequestSchema = z.object({ ... })
type ResponseType = { ... }

export async function POST(req: NextRequest): Promise<NextResponse<ResponseType>> {
  const body = RequestSchema.parse(await req.json())
  // ...
}
```

---

## 📁 File & Folder Rules

| Location | Purpose | Rule |
|----------|---------|------|
| `app/` | Pages and API routes | Next.js App Router only |
| `modules/` | Business logic | No UI code here |
| `components/` | UI components | No business logic here |
| `lib/` | Shared utilities | Pure functions, no side effects |
| `config/` | Static config | No logic, only constants and maps |

### Naming Conventions
- Files: `kebab-case.ts`
- Components: `PascalCase.tsx`
- Functions: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Types/Interfaces: `PascalCase`
- API routes: RESTful nouns (`/api/rates`, `/api/alerts`)

---

## 🔒 TypeScript Rules

- **No `any` types** — ever. Use `unknown` and narrow it.
- All functions must have explicit return types
- All API responses must have typed interfaces
- Use `interface` for object shapes, `type` for unions/intersections
- Export types from `types.ts` in each module, never inline

```typescript
// ✅ CORRECT
export async function fetchRates(params: FetchRatesParams): Promise<RateResult[]> { }

// ❌ WRONG
export async function fetchRates(params: any): Promise<any> { }
```

---

## 🌐 Data Fetching Rules

### Server-Side (API Routes)
- All external API calls happen in `modules/<name>/fetchers.ts`
- Always implement a timeout (max 5 seconds per provider)
- Always handle provider failures gracefully — if one fails, return others
- Cache rate data for 10 minutes minimum (use in-memory or Upstash Redis)

```typescript
// Rate cache pattern
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes
let cache: { data: RateResult[]; timestamp: number } | null = null

export async function getCachedRates(): Promise<RateResult[]> {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.data
  }
  const data = await fetchAllProviders()
  cache = { data, timestamp: Date.now() }
  return data
}
```

### Client-Side
- Use TanStack Query for all client data fetching
- No raw `fetch` calls in components — always go through custom hooks
- Loading and error states are mandatory on every query

---

## 🤖 AI Assistant Rules

### Claude Integration
- Model: `claude-sonnet-4-20250514` — do not change this
- Always use streaming for chat responses
- Always inject live rate data into the system prompt
- Max tokens: 1024 per response
- Temperature: 0.3 (factual, consistent)

### Prompt Safety
- Never allow the system prompt to be overridden by user input
- Sanitize all user messages before sending to API
- Rate limit: 20 messages per session per user

### Context Window Management
- System prompt + rates JSON must stay under 2000 tokens
- If rates data is too large, summarize to top 5 providers only
- Conversation history: keep last 10 messages only

---

## 🗄️ Database Rules (Supabase)

### Schema Principles
- All tables have: `id uuid DEFAULT gen_random_uuid()`, `created_at timestamptz DEFAULT now()`
- Use Row Level Security (RLS) on all tables
- Never store sensitive financial data
- Rate cache in DB only as fallback — prefer in-memory cache

### Migrations
- All schema changes go in `/supabase/migrations/`
- Never modify the DB schema directly — always use migration files
- Migration files: `YYYYMMDD_description.sql`

---

## 🎨 UI/Component Rules

- All components must be in `components/`
- Use shadcn/ui as the base component library
- Custom components extend shadcn, never replace it
- All forms use React Hook Form + Zod validation
- No inline styles — Tailwind classes only
- Dark mode support is mandatory (use `next-themes`)

### Component Structure
```typescript
// Every component file follows this order:
// 1. Imports
// 2. Types/Interfaces
// 3. Component function
// 4. Export

interface Props {
  // always typed
}

export function ComponentName({ prop }: Props) {
  // hooks first
  // handlers next
  // render last
}
```

---

## 🔐 Security Rules

- All API keys in `.env.local` — never hardcoded
- Never expose provider API keys to the client
- All external API calls are server-side only
- Input sanitization on all user inputs before DB writes
- CORS: only allow same-origin on API routes
- Rate limiting on `/api/chat` — 20 req/session, `/api/rates` — 60 req/min

---

## ⚠️ Error Handling Rules

- Every API route must return structured errors:
```typescript
{ error: string; code: string; details?: unknown }
```
- Use error boundaries on all major UI sections
- Log errors with context (which provider, which endpoint)
- Never expose raw error messages to the UI — user-friendly messages only
- If a rate provider fails, log it but don't block the response

---

## 🚀 Performance Rules

- Rate API responses cached for 10 minutes
- Use `React.Suspense` + streaming for all async page components
- Images: always use `next/image`
- Bundle: no library over 50KB without justification
- Core Web Vitals targets: LCP < 2.5s, CLS < 0.1, FID < 100ms

---

## 📋 Before Every Code Change — Checklist

- [ ] Does this change respect module boundaries?
- [ ] Are all types explicit (no `any`)?
- [ ] Is error handling in place?
- [ ] Is sensitive data server-side only?
- [ ] Are loading and error states handled in UI?
- [ ] Is the change consistent with existing naming conventions?

---

## 🧪 Testing Approach

- Unit tests for: `modules/rates/normalizer.ts`, `modules/ai-assistant/prompt-builder.ts`
- Integration tests for: all `/api/` routes
- E2E tests (Playwright): comparison flow, chat flow, alert creation flow
- Test files co-located: `fetchers.test.ts` next to `fetchers.ts`

---

*Last updated: Project initialization*  
*Owner: RemitAI Engineering*