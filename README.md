# RemitAI

> AI-powered remittance rate comparison for the African diaspora. See the real rate. Send more home.

Live at **[remitaiapp.com](https://remitaiapp.com)**

---

## The Problem

Sending money to Nigeria, Ghana, or Kenya means navigating hidden fees, misleading exchange rates, and a gap between the official rate and what your family actually receives. Most people stick with one provider because comparing is too painful.

RemitAI does the comparison for you — and shows you both the bank rate and the parallel market rate, so you see the full picture before you send.

---

## Features

- **Live rate comparison** across Wise, Remitly, WorldRemit, LemFi, and TapTap Send
- **Dual-rate display** — official CBN rate alongside the parallel market estimate
- **Best pick engine** — highlights the highest-receive-amount provider automatically
- **AI assistant** — answers questions about fees, speed, and timing using live rate data
- **Rate alerts** — email notification when any provider hits your target rate
- **Programmatic SEO** — dynamic pages for 80+ corridors and provider pairs

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| AI | Groq (Llama 3.1 70B) |
| Database | Supabase (PostgreSQL + RLS) |
| State | Zustand + TanStack Query |
| Email | Resend |
| Deployment | Vercel |
| Rates | fawazahmed0 currency API + parallel market estimate |

---

## Getting Started

**Prerequisites:** Node.js 18+, Supabase account, Groq API key, Resend account

```bash
git clone https://github.com/mchlshot-code/remit-ai.git
cd remit-ai
npm install
cp .env.local.example .env.local
npm run dev
```

Fill in `.env.local` — see `.env.local.example` for all required keys.

**Database setup:** Run the SQL in `/supabase/migrations/` in your Supabase SQL editor.

---

## Project Structure

```
remit-ai/
├── app/
│   ├── page.tsx                  # Landing + comparison UI
│   ├── chat/page.tsx             # AI Assistant
│   ├── alerts/page.tsx           # Rate alert management
│   └── api/                      # rates, compare, chat, alerts
├── modules/
│   ├── rates/                    # Fetchers, normalizer, types
│   ├── ai-assistant/             # Prompt builder, streaming handler
│   └── alerts/                   # Alert logic, email sender
├── components/                   # UI components
├── lib/                          # Supabase client, utils
└── config/                       # Provider config, constants
```

Architectural rules are documented in [`Agent.md`](./Agent.md).  
Product philosophy is in [`Philosophy.md`](./Philosophy.md).

---

## Deployment

```bash
vercel
```

Set environment variables in the Vercel dashboard. The included `vercel.json` schedules a cron job every 30 minutes to check rate alerts.

---

## Disclaimer

RemitAI is a comparison tool only. We are not a money transfer service. Always verify rates on the provider's official website before transferring. Rates shown are indicative and update every 30 minutes.

---
