# Vedic Verse — v2 (web)

A premium way to speak with the Bhagavad Gita — and with the voices inside it.
Liquid glass over true OLED black, one terracotta ember, serif for scripture, sans for software.

## Run it

Double-click **`index.html`** — that's it. No install, no server, no build step.

- **First launch needs internet** — the app downloads the full Gita corpus (18 chapters, 700 verses: Devanagari + IAST + English) from the open [gita-data](https://github.com/ravisiyer/gita-data) JSON API (Unlicense) and caches it in your browser. After that it works offline.
- Best experienced in Chrome/Edge/Safari. On a phone-sized window it fills the screen; on desktop it renders as a phone column.

## Conversation engines

| Mode | How | Cost |
|---|---|---|
| **Offline voice** | Default. Grounded, cited answers composed from retrieved verses — no key, no network. | Free |
| **Claude (Anthropic)** | Profile → Intelligence → paste an `sk-ant-…` key. Streams direct from your browser. | Your key |
| **Gemini (Google)** | Same flow; free-tier keys from [aistudio.google.com](https://aistudio.google.com/apikey) work. | Your key |

Keys are stored **only** in this browser's localStorage and are sent only to the provider's own API.

## The wider canon (v3)

The Library is no longer Gita-only. Seven texts are now conversational:

- **Bhagavad Gītā** — the full 700-verse dataset, loaded live (as before).
- **Rāmāyaṇa**, **Mahābhārata**, **the four Vedas**, **the Upanishads**, **the Purāṇas**, and **Yoga Sūtras & Dharma** — each seeded with a substantial, curated selection of its most canonical verses (authentic references + public-domain translations: Griffith for the Vedas, Müller for the Upanishads, Ganguli for the Mahabharata, and public-domain renderings elsewhere).

Because the Mahabharata alone runs to ~100,000 verses — far beyond what a browser cache can hold — the wider texts are **representative, not complete**. The corpus lives in `js/corpora.js` in one uniform shape (`{ ch, v, dev, iast, trans, cite, book, themes }`), so more passages can be appended to the same structure at any time, and a future build can swap curated selections for full remote datasets exactly the way the Gita already loads.

**Ask across everything.** The Converse tab now has a text-scope selector. Pick a single text to speak with its own reverent voice, or choose **All Texts** to ask a question of the whole canon at once — the answer names the text it draws from and cites the verse. Every scope stays grounded: quotes render only from the corpus (via `>>VERSE` markers resolved against `js/data.js`), so scripture can be pointed at but never invented, in any text.

## What's in v2

Everything from Phase 1 (Home / Library / Reader / Converse / Journal / Profile), plus:

- **Onboarding** — four illustrated, swipeable screens on first launch (replayable from Profile), with a language choice built in.
- **Aniconic art system** — every text has a unique symbolic cover (the Gita's paused chariot wheel, the Ramayana's bow under a bridge of stars, the Mahabharata's wheel fractured by dice, the Vedas' fire altar), and Darshan replies carry scene imagery. No figures, no faces, no deities — by design and by principle.
- **A real offline voice** — questions are theme-detected (duty, fear, grief, death, the restless mind, meditation, desire, anger, peace, devotion, purpose, failure, knowledge, surrender, hard passages, happiness) and answered with substantive teachings written for this app, anchored in canonical verses. It explains first, quotes second.
- **Darshan imagery** — with a Gemini key, scene beats are generated live (aniconic prompt rules enforced); otherwise curated SVG scene art renders instantly. Anthropic users get curated art (no image API).
- **Chat sessions** — conversations persist: History sheet to resume any past exchange, New chat, per-session persona, swipe-style delete. Modern chatbot paradigm.
- **Floating liquid-glass tab bar** — detached pill per iOS 26, hides on scroll down, springs back on scroll up.
- **हिन्दी** — full Hindi mode: UI chrome, verse translations (Swami Ramsukhdas from the dataset), Hindi offline teachings, Hindi-instructed cloud replies, Hindi retrieval.

**Grounding guarantee:** verse quotes in chat are rendered *from the corpus* via `>>VERSE c.v` markers — the model can point at scripture but can never write it. Missing citations render nothing rather than something invented.

## Security

Audited sinks and posture (v2):

- **XSS**: every dynamic string that reaches `innerHTML` — user messages, model output, corpus data, session titles, notes — passes through an HTML-escaper or is inserted via `textContent`. Model output is rendered word-by-word as text nodes; markers (`>>VERSE`, `>>SCENE`, `[BG x.y]`) are parsed structurally, never executed.
- **Content-Security-Policy** (meta): `default-src 'none'`; scripts/styles only local (+ Google Fonts CSS); network restricted to the two AI providers, the corpus mirrors, and font hosts. No other destination can receive data, which also bounds key-exfiltration risk.
- **API keys**: stored in `localStorage` only, sent only to `api.anthropic.com` / `generativelanguage.googleapis.com` over TLS, never logged or rendered (password field). On a shared computer, clear them via Profile → engine → Offline voice. For production, the build plan's Cloudflare Worker gateway moves keys server-side — this BYOK setup is the interim.
- **No eval, no third-party JS**, no analytics, no cookies. External data (corpus JSON) is treated as untrusted and escaped at render.
- **Scripture integrity**: quotes render only from the local corpus; a fabricated citation renders nothing.

## Notes for the road to the App Store (per the build plan)

- **Translation licensing:** the bundled English rendering (Swami Sivananda, from the open dataset) is fine for prototyping; before shipping, swap in a verified public-domain translation (Telang 1882 / Besant 1905 / Arnold 1885) — the data layer (`js/data.js`) isolates this in one place.
- **Port path:** tokens (`css/tokens.css`) map 1:1 to the NativeWind theme in the build plan; screens/components were structured to mirror the planned Expo architecture (data / store / motion / ai / ui).
- Next per roadmap: Supabase auth + sync, Cloudflare Worker gateway (keys server-side), RevenueCat, on-device Whisper tier, audio, more texts.

## Files

```
index.html        shell
css/tokens.css    the design system tokens, verbatim from the style reference
css/app.css       components, screens, motion
js/data.js        text registry, corpus load/cache, namespaced refs, per-text + combined retrieval
js/corpora.js     bundled curated corpora for the wider canon (Ramayana … Yoga Sūtras)
js/store.js       settings, streak, journal, recents (localStorage)
js/motion.js      embers, tilt, sheet physics, toast, haptics
js/ai.js          personas, grounding, Anthropic/Gemini streaming, offline voice
js/ui.js          all screens, navigation, chat choreography
js/main.js        boot
```
