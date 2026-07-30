# Vigil — Project Overview

## What this is

Vigil is a private accountability app for pornography-addiction recovery. It's built around a simple idea: recovery isn't a solitary willpower exercise, and it isn't a shame spiral either — it's a person, an accountability partner who actually sees what's happening, practical tools for the moment an urge hits, and a faith that says the fall isn't the end of the story.

Most tools in this space fall into one of two camps: clinical habit-trackers with no spiritual dimension, or accountability apps with no real in-the-moment support. Vigil tries to hold both — a streak and a log, yes, but also a breathing exercise and a delay timer *right when they're needed*, a partner who's actually notified (not just theoretically informed), and Scripture that meets the moment instead of generic affirmations.

## Why it exists

The design choices throughout are deliberate, not incidental:

- **A partner who's actually in the loop.** Urge logs, streaks, and journal entries are visible to an actively-linked accountability partner in real time — not a summary they have to ask for.
- **No shame language.** A slip routes to a page that says "we fall, we get back up," not a red X or a broken streak counter. The Type 1/Type 2 framing (the app owner's own formation material) exists specifically to separate a moment from an identity — one slip doesn't make someone "Type 1"; the pattern does.
- **Faith at the center, not bolted on.** Scripture (NABRE), the sacraments, and prayer show up as real next steps, not decoration — this is not a secular habit tracker with a verse pasted on top.
- **Help when it's actually needed.** The Urge Toolkit (HALT check, 10-minute delay timer, guided breathing) exists because the ten minutes *during* an urge matter more than any dashboard reviewed afterward.

## Where it's at right now

**Live and deployed:** [project-vigil-ochre.vercel.app](https://project-vigil-ochre.vercel.app), auto-deploying from `main` on GitHub via Vercel.

**Built and working:**
- Account creation, sign-in, and profile setup (Supabase Auth)
- Streak tracking with an animated candle visualization
- Urge logging (Resisted / Slipped), each routing to its own encouragement page with Scripture and concrete next steps
- The Urge Toolkit (HALT checklist, delay timer, breathing guide)
- Journaling with a multi-emotion picker (mood-meter style), shared with linked partners
- Accountability partner invite/accept flow, with row-level-security-enforced read-only access
- A rotating, themed Scripture verse (NABRE) on the home screen and the Resisted/Slipped pages
- Installable PWA support (Android, iOS, desktop)
- Push notification infrastructure: partner alerts on logged urges, nightly check-in reminders, journaling reminders

**Built but not yet confirmed live / needs follow-up:**
- Migration `004_journal_sharing_and_emotions.sql` — should be applied, last known issue around it was resolved, but never got an explicit "yes, ran clean" confirmation
- The three Supabase Edge Functions (`notify-partners`, `nightly-reminders`, `journal-reminders`) — written and should be deployable as documented in `README.md`, but deployment status from this environment couldn't be verified directly
- VAPID secrets on Supabase (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`) — generated once, not reconfirmed as set
- **Cron jobs are not yet scheduled** — the nightly reminder and journal reminders won't fire until `nightly-reminders`/`journal-reminders` are wired up under Supabase's Cron Jobs (steps are in `README.md`)
- Three files have local fixes not yet committed/pushed: `AuthContext.jsx` (a bug where Settings appeared not to save — it was actually saving, just showing stale cached data), `SettingsPage.jsx` (the fix for the same bug), and `ResistedPage.jsx` (a text-color fix). **The live site does not have these fixes yet.**

**Known open questions:**
- The NABRE Scripture text in `src/data/verses.js` is a best-effort reconstruction, not a verified verbatim copy — needs checking against the official USCCB source, and the app owner has taken on responsibility for confirming licensing terms cover this use before any public release.
- No code license has been chosen yet for the repository itself.

## Future upgrades

**Near-term (finishing what's started):**
- Schedule the two reminder cron jobs
- Confirm all Edge Functions are actually deployed and the VAPID secrets are set
- Verify the NABRE verse text against the official source and settle the licensing question
- Get a real end-to-end walkthrough done on an actual phone (Android + iOS), including the install-to-home-screen and push-notification-permission flow

**Medium-term:**
- Let users set a fully custom nightly reminder time instead of picking from three fixed slots
- Streak milestones/badges beyond the current candle-growth visual (e.g. a distinct look at 30/90/365 days)
- A settings toggle for how much of the journal a partner can see (currently all-or-nothing)
- Basic trend view for the user's own eyes only (e.g. which triggers show up most, time-of-day patterns) — strictly private, never partner-visible

**Longer-term:**
- A native app wrapper (e.g. Capacitor) for more reliable push notifications on iOS, and a real App Store / Play Store presence
- Support for more than one accountability partner with per-partner visibility settings
- A second look at the overall visual design now that the core feature set is stable — the current look was a first full design pass, not a final one
