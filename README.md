# Palmara — v3 (two-page structure)

## Site structure
- **`/`** — marketing landing page only. Hero, how-it-works, honesty note, one CTA
  button linking to `/get-reading`. No upload form lives here.
- **`/get-reading`** — the actual product: upload palm photo → hand-shape
  detection (in-browser) → birth details form → AI reading (teaser + locked
  full report) → Razorpay paywall (₹599→₹99) → PDF download → Mahadasha
  upsell lead capture.

## Brand identity applied
- Colors: maroon `#7A1220` / `#591019`, gold `#B8860B`, ivory `#FBF1DC`, green
  `#1F3D2B` (reserved for the honesty note only).
- Fonts: Rozha One (headlines/wordmark), Mukta (body) — both loaded from
  Google Fonts, both support Devanagari.
- Icon: three fanning lines in a thin gold ring (`PalmaraIcon.js`) — no Om.
- Hindi wordmark: **पालमारा** (no virama) — the corrected spelling.
- Full English/Hindi toggle (`LangProvider.js` + `lib/i18n.js`) switches every
  string on both pages, not just the AI-generated reading.

## Local setup
```
npm install
cp .env.example .env.local   # fill in your real keys
npm run dev
```
Open http://localhost:3000 for the landing page, http://localhost:3000/get-reading
for the flow directly.

## Where to get each key
- **GEMINI_API_KEY** — aistudio.google.com/app/apikey (free tier, no card)
- **SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY** — your Supabase project → Settings → API
- **RAZORPAY_KEY_ID / SECRET** — Razorpay dashboard → Settings → API Keys (Test Mode first)
- **RAZORPAY_WEBHOOK_SECRET** — set up after deploying, pointing at
  `https://palmara.in/api/payment/webhook` for the `payment.captured` event

## Before this works in production
1. Run `supabase/migration_002_kundli.sql` in Supabase's SQL editor (creates
   `reports` and `leads` tables).
2. Add all five environment variables in Vercel → Project → Settings →
   Environment Variables.
3. Redeploy.

## What's still simplified / worth knowing
- The teaser/full split relies on Gemini following the `===TEASER===` /
  `===FULL===` markers in the prompt. If Gemini ever omits them, the code
  falls back to using the first 300 characters as the teaser — worth
  monitoring in practice.
- No session/login system — a visitor can't currently come back later and
  re-view a past paid report unless you add that (e.g. emailing them a link
  with the report ID).
- PDF styling is functional but basic (jsPDF's built-in fonts, not actual
  Rozha One/Mukta embedded) — upgrading this to use the real fonts is a
  reasonable next step if the PDF's appearance matters a lot to you.
