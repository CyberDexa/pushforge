# PushForge — Project Tracker

> **Last Updated**: 2026-02-23

## Status: Phases 1–6 Complete ✅ — LIVE at pushforge.vercel.app

---

### Sprint Board

#### DONE — Phase 1 (Foundation)
- [x] Project naming & branding (PushForge)
- [x] Domain research (pushforge.io available)
- [x] Logo design (SVG — icon + favicon)
- [x] Next.js 16 project setup (TypeScript, Tailwind v4, App Router)
- [x] Global styling (dark theme, forge palette, animations)
- [x] State management (React Context + localStorage persistence)
- [x] Sidebar navigation (sectioned: Create / Manage groups)
- [x] Dashboard (stats, quick actions, recent content, empty state)
- [x] Products CRUD (add, edit, delete with modal form)
- [x] Content generation engine (OpenAI + Anthropic dual support)
- [x] Multi-platform content generation (Twitter, LinkedIn, Email, WhatsApp, Instagram, Video Script)
- [x] Tone selection (Professional, Casual, Urgent, Witty, Storytelling)
- [x] Angle/focus presets (8 suggestions + custom)
- [x] Copy-to-clipboard functionality
- [x] Content history with search & filtering
- [x] Settings (API key management, provider selection)
- [x] TASKS.md (task breakdown)

#### DONE — Phase 2 (Scheduling & Distribution)
- [x] Content Calendar (month-view, status dots, day detail panel)
- [x] Scheduling engine (datetime picker on Generate, status tracking)
- [x] Analytics dashboard (stat cards, 30-day chart, platform/product/status breakdown)
- [x] Social media API routes (Twitter/X posting, LinkedIn posting)
- [x] Email sending API route (Resend integration)
- [x] Direct share buttons (WhatsApp, Twitter, LinkedIn) on generated content

#### DONE — Phase 3 (Advanced Features)
- [x] Template library (8 built-in templates + custom CRUD, category filtering)
- [x] A/B testing (generate 1–3 variations per run with distinct hooks)
- [x] Brand voice training (personality, writing samples, do-not / always-include rules)
- [x] Multi-product campaign builder (batch generation with progress tracking)
- [x] Template → Generate auto-fill via sessionStorage bridge

#### DONE — Phase 4 (Commercialize)
- [x] Landing page (hero, features, how-it-works, 3-tier pricing, CTA, footer)
- [x] Stripe billing (checkout session API route)
- [x] Updated page.tsx router (10 views)
- [x] Production build passes with zero errors

#### DONE — Phase 5 (Production Infrastructure)
- [x] Neon serverless PostgreSQL (replaces Supabase)
- [x] Drizzle ORM schema (users + user_data tables)
- [x] NextAuth v5 (credentials provider, JWT sessions)
- [x] User registration API route (bcryptjs hashing)
- [x] Data sync API (JSONB full-state upsert with auth gating)
- [x] Dual persistence (localStorage + Neon DB, debounced sync)
- [x] Stripe webhook handler (checkout.completed, subscription.updated/deleted)
- [x] AuthGate rewrite for NextAuth (SessionProvider)
- [x] Env template (.env.example) + Drizzle config
- [x] Build verified — zero errors, all 10 routes

#### DONE — Phase 6 (Deploy)
- [x] Git commit (37 files, 6529 insertions)
- [x] Vercel CLI deployment (pushforge.vercel.app)
- [x] Production env vars (DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_AUTH_ENABLED)
- [x] Live registration + data sync verified against Neon

#### NEXT UP
- [ ] AI video generation (D-ID / ElevenLabs)
- [ ] Team management & collaboration
- [ ] Documentation & help center
- [ ] Stripe monetization (when ready — products, prices, webhook keys)

---

## Architecture

```
pushforge/
├── public/
│   ├── logo.svg            # Main logo (512x512)
│   └── favicon.svg         # Favicon (32x32)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/route.ts  # NextAuth handler
│   │   │   │   └── register/route.ts       # User registration
│   │   │   ├── data/
│   │   │   │   └── route.ts          # State sync (GET/PUT)
│   │   │   ├── share/
│   │   │   │   ├── twitter/route.ts   # Twitter posting API
│   │   │   │   ├── linkedin/route.ts  # LinkedIn posting API
│   │   │   │   └── email/route.ts     # Resend email API
│   │   │   └── billing/
│   │   │       ├── checkout/route.ts  # Stripe checkout session
│   │   │       └── webhook/route.ts   # Stripe webhook handler
│   │   ├── globals.css     # Dark theme, forge palette, animations
│   │   ├── layout.tsx      # Root layout (Geist fonts, metadata)
│   │   └── page.tsx        # Entry (SessionProvider + StoreProvider + router)
│   ├── components/
│   │   ├── Sidebar.tsx     # Sectioned navigation sidebar
│   │   ├── Dashboard.tsx   # Stats, quick actions, recent content
│   │   ├── Products.tsx    # Product CRUD with modal
│   │   ├── Generate.tsx    # Content generation + A/B + scheduling
│   │   ├── History.tsx     # Content history with filters
│   │   ├── Settings.tsx    # API keys, provider, brand voice
│   │   ├── Calendar.tsx    # Month-view content calendar
│   │   ├── Templates.tsx   # Template library (built-in + custom)
│   │   ├── Campaigns.tsx   # Multi-product batch generation
│   │   ├── Analytics.tsx   # Analytics dashboard
│   │   ├── Landing.tsx     # Public marketing landing page
│   │   └── AuthGate.tsx    # Auth wrapper (NextAuth, skips when unconfigured)
│   └── lib/
│       ├── types.ts        # TypeScript types (Product, Content, Template, Campaign, BrandVoice)
│       ├── store.tsx       # React Context state (dual persistence: localStorage + Neon)
│       ├── ai.ts           # AI engine (OpenAI + Anthropic + brand voice)
│       ├── auth.tsx        # Re-exports from next-auth/react
│       └── db/
│           ├── schema.ts   # Drizzle schema (users, user_data)
│           └── index.ts    # Neon connection factory
├── drizzle.config.ts       # Drizzle Kit config
├── .env.example            # Environment variable template
├── TASKS.md
├── TRACKER.md
└── package.json
```

## Tech Stack
- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Lucide React** (icons)
- **OpenAI / Anthropic APIs** (content generation)
- **Neon Serverless PostgreSQL** (database)
- **Drizzle ORM** (schema + migrations)
- **NextAuth v5** (authentication — credentials + JWT)
- **bcryptjs** (password hashing)
- **Stripe** (billing — checkout + webhooks)
- **localStorage** (offline cache + fallback)

## Design System
- **Primary**: Forge Orange (#F97316 → #FF4500)
- **Accent**: Spark Gold (#FFD700)
- **Background**: Deep Navy (#0B0E14)
- **Surface**: Glass cards with backdrop blur
- **Font**: Geist Sans + Geist Mono
