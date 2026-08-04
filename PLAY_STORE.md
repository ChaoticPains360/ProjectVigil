# Getting Vigil onto the Google Play Store

Vigil is already a fully spec'd installable PWA (manifest with proper
192/512 + maskable icons, a service worker, HTTPS via Vercel). That's
the hard technical part, and it's done. What's left is packaging it as
an Android app and publishing it — and one step of that (building the
signed Android App Bundle) needs a toolchain this environment doesn't
have: no Java/Android SDK here, so I can't produce the `.aab` file
myself. Here's the path to finish it, no local install required.

## 1. Generate the Android package (free, no coding, no local SDK)

1. Go to **[pwabuilder.com](https://www.pwabuilder.com)**.
2. Enter `https://project-vigil-ochre.vercel.app` and let it analyze the site.
3. It will report the manifest/service worker/icons are good (they are).
4. Choose **Android** → **Google Play**. PWABuilder builds a Trusted Web
   Activity (a real Android app that opens Vigil full-screen, no browser
   chrome) and gives you a signing key automatically if you don't have one.
5. Download the generated package. It includes:
   - A signed `.aab` (what Play Store wants)
   - An `assetlinks.json` file

## 2. Prove domain ownership

Upload the `assetlinks.json` from step 1 to:

```
https://project-vigil-ochre.vercel.app/.well-known/assetlinks.json
```

This is what lets Android trust that the app and the website are the
same thing (so it opens without a browser address bar). Without this
file in place, the app still works but shows as a browser tab instead
of a "real" app.

## 3. Google Play Console (this part is unavoidably yours to do)

This needs your own Google account, a one-time $25 registration fee,
and identity verification — I have no way to do this on your behalf,
and it shouldn't be done by anyone but you:

1. Create a account at [play.google.com/console](https://play.google.com/console).
2. Create a new app, upload the `.aab` from step 1.
3. **Privacy policy URL** (required): a starting draft is already live at
   `https://project-vigil-ochre.vercel.app/privacy.html` — read it, edit
   the placeholder date/contact line, and have it reviewed before you
   rely on it. Given Vigil handles sensitive recovery data, it's worth
   a real look rather than treating it as boilerplate.
4. Fill out the **Data safety** form honestly (it collects: account info,
   journal/mood entries, urge logs, and shares urge/journal data with
   an accountability partner the user explicitly invites — nothing else,
   no ad data, no selling data).
5. Content rating questionnaire — Vigil should land in a low-risk rating
   (no violence/gambling/etc.), but be honest that it deals with
   addiction recovery, which some questionnaires ask about directly.
6. Add a feature graphic (1024x500) and a few screenshots — I can
   generate these from the live app if you want, once the app itself
   is stable and you're ready for that step.
7. Start on the **Internal testing** track first, not Production — lets
   you install it on your own phone via Play and confirm it feels right
   before anyone else can find it.

## What I can still help with from here

- Regenerating icons/screenshots if the design changes
- Reviewing the `assetlinks.json` once PWABuilder generates it
- Drafting Play Store listing copy (short description, full description)
- Iterating on `privacy.html` content

What I can't do: create the Play Console account, pay the fee, or
click "Publish" — that has to be you.
