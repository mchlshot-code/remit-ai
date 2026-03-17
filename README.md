# RemitAI 💸
### AI-Powered Remittance Comparison & Transfer Assistant

> End the "silent tax" on your money transfers. Compare providers in real-time, see the **true parallel market rate**, and get honest AI-powered advice — all in one place.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-green)

---

## 🌍 The Mission: Ending the "Silent Tax"

Millions of hardworking people send money home every day — but most lose a significant portion to a "silent tax": **hidden fees, bad exchange rates, and confusing choices.**

In corridors like Nigeria, there is a second, deeper layer: the gap between the **official rate** and the **parallel market rate** (the real-world value on the street). This gap can be **10% to 40%**, meaning a person sending £200 might lose ₦10,000+ simply because they couldn't see the full picture.

**RemitAI exists to end that tax.** We provide radical transparency, showing you both the bank rates and the real-world value your family feels.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| ✨ **Dual-Rate Transparency** | Shows both official and parallel market rates for full clarity |
| ⚡ **Live Rate Comparison** | Real-time rates from Wise, Remitly, WorldRemit, LemFi & TapTap Send |
| 🏆 **Best Pick Engine** | Automatically highlights the best provider for your transfer |
| 🤖 **Honest AI Assistant** | Unbiased advice based on live market dynamics, not affiliate deals |
| 📱 **Mobile First** | Fully responsive, works beautifully on any device |
| 🌙 **Dark Mode** | Full dark/light mode support |

---

## 🛠️ Tech Stack

```
Frontend       Next.js 14 (App Router) + TypeScript
Styling        Tailwind CSS + shadcn/ui
AI             Anthropic Claude API (claude-sonnet-4-20250514)
Database       Supabase (PostgreSQL + Auth)
State          Zustand + TanStack Query
Email          Resend
Deployment     Vercel
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase account (free)
- An Anthropic API key
- A Resend account (free)
- An ExchangeRate-API key (free)

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/remit-ai.git
cd remit-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.local.example .env.local
```

Fill in your `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic
GROQ_API_KEY=your_groq_api_key

# ExchangeRate API
EXCHANGE_RATE_API_KEY=your_exchangerate_api_key

# Resend (email alerts)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=alerts@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set up the database
Run the following SQL in your Supabase SQL editor:

```sql
-- Users table (extends Supabase auth)
create table public.profiles (
  id uuid references auth.users primary key,
  email text,
  created_at timestamptz default now()
);

-- Rate alerts table
create table public.rate_alerts (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  from_currency text not null,
  to_currency text not null,
  target_rate decimal(12,4) not null,
  current_rate decimal(12,4),
  is_triggered boolean default false,
  triggered_at timestamptz,
  created_at timestamptz default now()
);

-- Rate cache table (fallback)
create table public.rate_cache (
  id uuid default gen_random_uuid() primary key,
  corridor text not null,        -- e.g. "GBP-NGN"
  provider text not null,
  rate_data jsonb not null,
  fetched_at timestamptz default now()
);

-- Enable RLS
alter table public.rate_alerts enable row level security;
alter table public.rate_cache enable row level security;

-- RLS Policies
create policy "Anyone can create alerts" on public.rate_alerts
  for insert with check (true);

create policy "Users can view their own alerts" on public.rate_alerts
  for select using (email = current_user);
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
remit-ai/
├── app/
│   ├── page.tsx                  # Landing + comparison UI
│   ├── chat/page.tsx             # AI Assistant
│   ├── alerts/page.tsx           # Rate alert management
│   └── api/
│       ├── rates/route.ts        # Rate aggregation endpoint
│       ├── compare/route.ts      # Comparison engine
│       ├── chat/route.ts         # Claude AI streaming endpoint
│       └── alerts/route.ts       # Alert CRUD
├── modules/
│   ├── rates/                    # Rate fetching & normalization
│   ├── ai-assistant/             # Claude prompt building & streaming
│   ├── alerts/                   # Alert logic & email sending
│   └── auth/                     # Session management
├── components/                   # UI components
├── lib/                          # Shared utilities
└── config/                       # Provider config & constants
```

---

## 🔌 Supported Providers

| Provider | Corridors | API Type |
|----------|-----------|----------|
| Wise | GBP/EUR/USD → NGN, KES, GHS | Public rate API |
| Remitly | GBP/USD → NGN, KES, UGX | Public pricing endpoint |
| WorldRemit | GBP/EUR → NGN, GHS | Public rate page |
| LemFi | GBP → NGN | Verified Fetcher |
| TapTap Send | GBP → KES, GHS | Verified Fetcher |
| ExchangeRate-API | All pairs | REST API (base rates) |

---

## 🤖 Honest AI Assistant

Our AI assistant is powered by Claude (Anthropic) and has access to **live market data**, including both official and parallel market rates. It is designed to be a "financial friend" for people like **Ngozi** — hardworking remitters who deserve the truth. It can:

- Recommend the best provider for your specific corridor and amount
- Explain the **official vs. parallel market gap** in plain language
- Warn you when rates are unfavorable
- Advise on timing ("should I send now or wait?")
- Answer general questions about international transfers

**Example questions:**
- *"Which is cheapest to send £500 to Nigeria right now?"*
- *"What's the difference between Wise and Remitly fees?"*
- *"How long does WorldRemit take to deliver to a Nigerian bank account?"*

---

## 🔔 Rate Alerts

Set a target exchange rate and we'll email you the moment any provider hits it:

1. Enter your target rate (e.g. GBP→NGN at 2000+)
2. Enter your email
3. We check rates every 30 minutes via Vercel Cron
4. You get an email with the best provider and a direct link to transfer

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Add your environment variables in the Vercel dashboard.

The `vercel.json` includes a cron job for rate alerts:
```json
{
  "crons": [
    {
      "path": "/api/alerts/check",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

## 🧭 Our Philosophy

> *"Does this help someone send more money home — and do they understand exactly what their money is worth when it gets there?"*

We build for **Ngozi** — the busy nurse or care assistant who doesn't have time to decode FX systems but deserves every kobo of her hard-earned money. We believe in **Radical Transparency**, **Honest AI**, and **Mobile-First** accessibility.

---

## 📊 Roadmap

- [x] Live rate comparison (MVP)
- [x] AI assistant with live context
- [x] Rate alerts via email
- [x] LemFi & TapTap Send Integration
- [x] Algorithmic SEO Permutations (80+ pages)
- [ ] User accounts & alert history
- [ ] More corridors (USD→KES, EUR→GHS, etc.)
- [ ] Browser push notifications for alerts
- [ ] Historical rate charts
- [ ] Transfer tracking integration
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) and follow the architectural rules in [agent.md](./agent.md).

---

## ⚠️ Disclaimer

RemitAI is a **comparison tool only**. We are not a money transfer service. Always verify rates on the provider's official website before making any transfer. Exchange rates fluctuate and the rates shown are for informational purposes only.

---

## 📄 License

MIT License — see [LICENSE](./LICENSE)

---

## 🙏 Built With

- [Next.js](https://nextjs.org)
- [Anthropic Claude](https://anthropic.com)
- [Supabase](https://supabase.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Vercel](https://vercel.com)

---

*Built as part of the 3MTT Knowledge Showcase — solving real problems with AI.*

## Security Notes
# Next.js DoS vulnerabilities (GHSA-9g9p-9gw9-jx7f, GHSA-h25m-26qc-wcjf)
# Not applicable — deployed on Vercel (not self-hosted)
# Upgrade to Next.js 16 post-showcase
