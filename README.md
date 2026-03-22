# RemitAI

> AI-powered remittance rate comparison for the African diaspora. See the real rate. Send more home.

Live at **[remitaiapp.com](https://remitaiapp.com)**

---

## The Problem

Sending money to Nigeria, Ghana, or Kenya means navigating hidden fees, misleading exchange rates, and a gap between the official rate and what your family actually receives. Most people stick with one provider because comparing is too painful.

RemitAI does the comparison for you — and shows both the bank rate and the parallel market rate, so you see the full picture before you send.

---

## Features

- **Live rate comparison** across Wise, Remitly, WorldRemit, LemFi, and TapTap Send
- **Dual-rate display** — official CBN rate alongside the parallel market estimate
- **Best pick engine** — highlights the highest-receive-amount provider automatically
- **AI assistant** — answers questions about fees, speed, and timing using live rate data
- **Rate alerts** — email notification when any provider hits your target rate
- **Programmatic SEO** — dynamic landing pages and automated XML sitemap for 200+ global remittance corridors
- **Affiliate Routing Engine** — secure, server-side redirect system (`/go/[provider]`) to protect tracking IDs, bypass ad-blockers, and log conversion clicks

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
| Testing | Vitest |
| Deployment | Vercel |
| Rates | fawazahmed0 currency API + parallel market estimate |

---

## Project Structure

```text
remit-ai/
├── app/
│   ├── page.tsx                  # Landing + comparison UI
│   ├── send-money/               # SEO Hub & 240+ Dynamic Corridor Pages
│   ├── go/[provider]/            # Affiliate redirect & tracking engine
│   ├── chat/page.tsx             # AI Assistant
│   ├── alerts/page.tsx           # Rate alert management
│   ├── sitemap.ts                # Automated XML generation
│   ├── robots.ts                 # Crawler budget optimization
│   └── api/                      # rates, compare, chat, alerts
├── modules/
│   ├── rates/                    # Fetchers, normalizer, types
│   ├── ai-assistant/             # Prompt builder, streaming handler
│   └── alerts/                   # Alert logic, email sender
├── components/                   # UI components (Grid, Flags, Cards)
├── lib/                          # Supabase client, utils
├── config/                       # Provider config, constants
└── vitest.config.ts              # Unit testing configuration

Architectural rules → [`Agent.md`](./Agent.md)  
Product philosophy → [`Philosophy.md`](./Philosophy.md)

---

## Deployment

Frontend and serverless functions are hosted on Vercel. Environment variables (including secure Affiliate URLs) are documented in `.env.local.example`. 

**Data Pipeline:** Rate updates and parallel market scrapes are decoupled from the frontend. A GitHub Actions workflow runs a cron job on a strict interval to fetch fresh data, normalize it, and push it to Supabase, triggering frontend cache invalidation only when necessary.

---

## Disclaimer

RemitAI is a comparison tool only. We are not a money transfer service. Always verify rates on the provider's official website before transferring. Rates shown are indicative and update every 30 minutes.

---

*Built for the 3MTT NextGen Knowledge Showcase — Financial Inclusion pillar.*