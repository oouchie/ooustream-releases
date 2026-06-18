# AdSense "Low value content" Remediation Plan

**Status:** AWAITING APPROVAL — do not implement until owner confirms.
**Flag (confirmed in dashboard):** "Low value content" on AdSense (pub `ca-pub-0330206908249817`).
**Root cause:** publicly-crawlable content is thin — homepage (marketing), `/best-iptv-service` (1 SEO page), and only **3 short blog posts** (~300–500 readable words each). Everything substantial is behind login and `Disallow`-ed in `robots.ts`, so Google never sees it. AdSense judged there isn't enough original, valuable content to justify ads.

**Goal:** turn the public site into a genuine content destination — enough in-depth, original articles + standard trust pages that a reviewer sees a real publisher, then reapply.

---

## Part A — Blog build-out (the main lever)

Go from 3 → ~13 posts. Each new post: **original, 1,000–1,500 words**, genuinely useful (not AI-spun/templated — the same "replicated content / little added value" rule rejects thin filler). Follow existing conventions exactly:
- One file per post in `src/content/blog/<slug>.tsx` exporting `meta: BlogPostMeta` + default component (see `iptv-vs-cable-tv.tsx` as the template — plain `<h2>/<p>/<ul>`, internal `<Link>`s, no per-file styling; `.blog-content` in `globals.css` handles type).
- Register each in `src/lib/blog.ts` (add import + `POSTS` entry).
- Sitemap (`sitemap.ts`) and canonical/OG/Article-JSON-LD auto-generate via the registry — no per-post SEO wiring needed.

### Batch 1 — Device setup guides (highest search value, clearly useful) ✅ DONE
- [x] `how-to-set-up-iptv-on-smart-tv` — Samsung (Tizen) & LG (webOS) — ~1,390 words
- [x] `how-to-set-up-iptv-on-apple-tv` — Apple TV 4K, player apps — ~1,180 words
- [x] `how-to-set-up-iptv-on-android-phone-tablet` — phone APK link `aftv.news/4006995` — ~1,190 words
- [x] `how-to-set-up-iptv-on-iphone-ipad` — iOS player options — ~1,175 words
- [x] `how-to-set-up-iptv-on-windows-mac` — VLC + desktop players — ~1,180 words
- [x] (existing) Fire Stick guide — left as-is, cross-linked

### Batch 2 — Troubleshooting (original, high retention) ✅ DONE
- [x] `why-is-my-iptv-buffering` — 9 concrete fixes — ~1,479 words
- [x] `iptv-app-wont-load-troubleshooting` — checklist — ~1,180 words
- [x] `fix-iptv-epg-tv-guide-not-loading` — EPG/timezone — ~1,180 words

> All 8 registered in `src/lib/blog.ts`; `npm run build` generates 11 blog routes; sitemap auto-includes them.

### Batch 3 — Educational / informational
- [ ] `what-is-iptv-how-does-it-work` — beginner's guide (2026)
- [ ] `iptv-vs-streaming-apps` — vs Netflix/Hulu/YouTube TV (distinct from the existing IPTV-vs-cable post)
- [ ] `best-iptv-player-apps-compared` — how to choose a player
- [ ] `internet-speed-for-iptv` — how much bandwidth you really need

> **Recommended first push for resubmission: Batch 1 + 2 (8 posts).** That ~doubles+ the content depth and covers the highest-intent searches. Batch 3 can follow.

Each post must internal-link to 2–3 others + a relevant product page (`/best-iptv-service`, `/help`, `/trial`) — builds topical depth, which is what "added value" means to the reviewer.

## Part B — Standard trust pages (AdSense explicitly wants these) ✅ DONE
- [x] `/about` — `src/app/about/page.tsx` (server component, own canonical, OG/Twitter) — service overview, devices, pricing, support, who-we-are.
- [x] `/contact` — `src/app/contact/page.tsx` (server component, own canonical) — support email, ticket link, response times, help-guide links.
- [x] Added **About** + **Contact** to homepage footer Quick Links (replaced the old scroll-to-form "Contact" button with real `/contact` link).
- [x] Added both to `sitemap.ts`. Build prerenders both as static.

## Part C — AdSense hygiene
- [ ] Add `public/ads.txt` → `google.com, pub-0330206908249817, DIRECT, <token>`. **VERIFY the exact line in AdSense → Account → "Get your ads.txt" before committing — do not assume the token.**
- [ ] Confirm Auto Ads won't render on thin utility pages (`/login`, `/privacy`, `/terms`) once approved — "more ads than content" is its own violation.

## Part D — Intellectual-property-abuse risk (SEPARATE flag) — ✅ DONE (channel names)
- [x] Replaced the **70 real brand channel names** in the homepage Channel Wall (`WALL_ROWS`) + Channel Marquee (`CHANNEL_ROW_1/2`) with generic genre/region/quality labels (Live Sports, World News, Latino TV, 4K Ultra HD, etc.). Lowers the intellectual-property-abuse signal.
- [ ] (Optional, not done) Further soften hero copy ("10,000 Live Channels") if desired — left as-is for now.

---

## Sequencing
1. Owner approves this plan (and decides on Part D).
2. Write Batch 1 + 2 posts (8) + About/Contact + footer links + sitemap + ads.txt.
3. Typecheck + build, commit, push (auto-deploys from `main`).
4. Wait ~1–2 weeks for indexing; verify pages crawlable (`site:ooustream.com` + Search Console).
5. Request AdSense review again.

## Open question for owner
- Part D: reframe the homepage now, or leave it and risk an IP-abuse flag after the content fix? (Recommend: at least soften the named-channel wall.)

---

## Review
**Done 2026-06-18:** Batch 1 + 2 (8 new original posts, 1,175–1,479 words each) written, registered in `src/lib/blog.ts`, build-verified (11 blog routes generate, sitemap auto-includes). Homepage channel wall + marquee de-branded to generic category labels. `npx tsc --noEmit` + `npm run build` both pass. Docs updated (CLAUDE.md landing-page + AdSense sections, this file).

**Update 2026-06-18 (part 2):** Part B done — `/about` + `/contact` shipped (server components, own canonical, footer links, sitemap; build prerenders both static).

**Still TODO before requesting AdSense re-review:**
- [ ] Part C — `public/ads.txt` (verify exact token in AdSense → Account → "Get your ads.txt" first)
- [ ] (Optional) Batch 3 educational posts
- [ ] Wait ~1–2 weeks for indexing (check Search Console), then request review in AdSense
