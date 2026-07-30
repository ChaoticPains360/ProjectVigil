<div align="center">

# Vigil

**A private accountability and recovery companion — urge tracking, journaling, and partner support, built around Scripture and the sacraments.**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth%20%2B%20Edge%20Functions-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)
[![PWA](https://img.shields.io/badge/Installable-PWA-5A0FC8)](#)
[![Status](https://img.shields.io/badge/Status-Private%20project-lightgrey)](#)

</div>

---

> **A note on sensitivity:** this app stores personal recovery, urge-log, and journal data. Treat it like health data. See [Security & Privacy](#security--privacy) before deploying or sharing this repo.

## Table of Contents

- [About The Project](#about-the-project)
- [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Supabase Setup](#supabase-setup)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Security & Privacy](#security--privacy)
- [Roadmap](#roadmap)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## About The Project

Vigil is a personal accountability app for pornography-addiction recovery. It pairs a user with one or more accountability partners who get read-only visibility into their streak, urge log, and journal — with a design language meant to feel supportive rather than clinical or shaming.

**Core features:**

- 🕯️ **Streak tracking** — a hand-built animated "candle" visualization that grows with the streak, rather than a bare scoreboard number
- 📿 **Urge logging** — one tap to log "Resisted" or "Slipped," each routing to a dedicated response page with Scripture, encouragement, and concrete next steps
- 🧭 **In-the-moment toolkit** — a HALT check, a 10-minute delay timer, and a guided breathing exercise for when an urge hits
- ✍️ **Journaling** — a mood-meter-style emotion picker (pick up to 3 feelings) paired with a Markdown journal entry
- 🤝 **Accountability partners** — invite-code pairing with row-level-security-enforced, read-only access to a linked user's data
- 🔔 **Push notifications** — partner alerts on logged urges/slips, plus configurable nightly and journaling reminders
- 📖 **Scripture** — a rotating verse (NABRE) shown contextually, themed to the moment (perseverance on a win, mercy after a slip)
- 📱 **Installable PWA** — works as a home-screen app on Android, iOS, and desktop

## Built With

- [React 18](https://react.dev) + [Vite](https://vitejs.dev)
- [React Router](https://reactrouter.com)
- [Framer Motion](https://www.framer.com/motion/) for animation
- [Supabase](https://supabase.com) — Postgres, Auth, Row Level Security, Edge Functions
- [marked](https://marked.js.org) for Markdown rendering
- [Vercel](https://vercel.com) for hosting

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Vercel](https://vercel.com) account (or any static host) for deployment

### Installation

```bash
git clone https://github.com/ChaoticPains360/ProjectVigil.git
cd ProjectVigil
npm install
cp .env.example .env
# fill in .env with your own values -- see Environment Variables below
```

## Supabase Setup

Run the SQL files in order via the Supabase SQL Editor:

1. `supabase/schema.sql` — core tables (`profiles`, `partner_links`, `urge_logs`, `streaks`) and RLS policies
2. `supabase/migrations/002_notifications.sql` — push subscriptions + reminder settings
3. `supabase/migrations/003_journal.sql` — journaling
4. `supabase/migrations/004_journal_sharing_and_emotions.sql` — multi-emotion journaling + partner-visible journal entries

Then deploy the Edge Functions:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>

npx supabase functions deploy notify-partners
npx supabase functions deploy nightly-reminders --no-verify-jwt
npx supabase functions deploy journal-reminders --no-verify-jwt
```

`--no-verify-jwt` is only for the two cron-invoked functions — they're called by a scheduled job, not a logged-in user.

Set the push notification secrets:

```bash
npx supabase secrets set VAPID_PUBLIC_KEY=<your-public-key>
npx supabase secrets set VAPID_PRIVATE_KEY=<your-private-key>
npx supabase secrets set VAPID_SUBJECT=mailto:you@example.com
```

Finally, schedule the two reminder functions under **Database → Cron Jobs** in the Supabase dashboard (every 15 minutes is sufficient — both functions resolve each user's own local time before deciding whether to send).

## Environment Variables

Defined in `.env` (see `.env.example`), never committed:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key (safe for the client — access is enforced by RLS, not secrecy) |
| `VITE_VAPID_PUBLIC_KEY` | Public half of the Web Push VAPID key pair |

The matching `VAPID_PRIVATE_KEY` and Supabase `service_role` key must **never** appear in client code or this repo — they live only as Supabase Edge Function secrets.

## Usage

```bash
npm run dev       # local dev server
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

## Project Structure

```
src/
  components/   # Reusable UI: Candle, VerseCard, EmotionPicker, scene illustrations, nav
  context/       # AuthContext (session + profile)
  data/          # Curated Scripture verse pool
  lib/           # Shared logic: urge logging, streak math, verse selection, push subscribe
  pages/         # Route-level screens (Home, Journal, Toolkit, Resisted, Slipped, Partners, Settings, Auth)
supabase/
  schema.sql       # Base schema + RLS
  migrations/      # Incremental schema changes, applied in order
  functions/       # Edge Functions (notify-partners, nightly-reminders, journal-reminders)
```

## Deployment

This project deploys to Vercel from the `main` branch. `vercel.json` includes a catch-all rewrite to `index.html`, which is required for any client-side route (e.g. `/invite/:code`) to load correctly on a static host — without it, direct links 404.

```bash
git push origin main   # auto-deploys via the connected Vercel project
```

Environment variables must be set in the Vercel dashboard (**Project → Settings → Environment Variables**) separately from your local `.env` — they are not read from the repo.

## Security & Privacy

- **Row Level Security is the enforcement boundary**, not the client: every table restricts reads/writes to the row's owner, or to an accountability partner with an *active* `partner_links` row.
- Journal entries and urge logs are treated as sensitive personal data — avoid adding analytics, logging, or third-party integrations that would expose their contents in plaintext.
- The `service_role` Supabase key bypasses RLS entirely and must only ever be used server-side (Edge Functions), never in this repo or client bundle.
- Copy/tone throughout the app is intentionally non-clinical and non-shaming — keep that in mind before adding new user-facing text.

## Roadmap

- [ ] Set up production cron schedules for `nightly-reminders` and `journal-reminders`
- [ ] Verify NABRE verse text in `src/data/verses.js` against the official USCCB source, and confirm licensing terms cover this app's distribution
- [ ] Further visual/UX polish pass
- [ ] Evaluate a native app wrapper (e.g. Capacitor) for more reliable push notifications on iOS

## License

Not yet licensed for redistribution. This is currently a private/personal project — in particular, the Scripture text bundled in `src/data/verses.js` is NABRE (© USCCB), used under the app owner's own licensing arrangement, which is a separate consideration from how the *code* itself is licensed. Pick and add a license here once that's settled; until then, treat this repo as "all rights reserved."

## Acknowledgments

- Scripture quotations: New American Bible, Revised Edition (NABRE), © Confraternity of Christian Doctrine / USCCB
- Emotion picker inspired by the "Mood Meter" framework (Yale Center for Emotional Intelligence)
- "Type 1 man / Type 2 man" framework: the app owner's own formation material
