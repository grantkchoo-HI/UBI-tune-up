# UBI Tune-Up v5 — Wrench Path + Suspension

A browser-based study game for the United Bicycle Institute Professional Repair & Shop Operation curriculum. Single-page app, no build step, works offline as a PWA.

Open `index.html` in any modern browser, or deploy as static files (GitHub Pages, Netlify, Vercel, plain S3) — there is no server requirement.

---

## What's inside

Four mastery zones plus the classic glossary game, all sharing one XP / streak / badge system with a shared anti-memorization layer.

| Zone | Content | Stages | Boss |
|------|---------|--------|------|
| **🛞 The Wheelhouse** | Wheels & Tires (Chapters 4–5) | 6 | Walk-In Wheel Rebuild |
| **📑 The Spec Vault** | Standards, sizing, conversions (Appendix) | 4 | Customer Spec Sheet Showdown |
| **🛡️ Suspension Systems Mastery Zone** | Forks, shocks, sag, damping (Chapter 14) | 6 | Walk-In Suspension Tune (2019 Suntour Auron) |
| **🛠️ Wrench Path** | Multi-step diagnostic chains | 12 chains | — |
| **📚 Main game** | Full ~1,250-term glossary with SRS | 13 modes | Boss Ride |

---

## Anti-memorization layer

All zones run through the same randomization engine ([randomization_v5.js](randomization_v5.js)):

- **Choice shuffle** with position-bias guard — prevents "the answer is always B" learning
- **Variant prompts** — alternate phrasings rotate on retake so memorizing exact wording fails
- **Distractor freshness** — recent wrong choices are excluded from the next round's distractors
- **Fresh-session reset** — retaking a stage clears the bias buffer and reshuffles question order

---

## File layout

```
index.html              Entry point + all CSS + screen scaffolding
game_v5.js              Core engine — render, state, SRS, badges, zone helpers
randomization_v5.js     Anti-memorization helpers
glossary.js             ~1,250-term glossary (shared across all modes)
scenarios_v5.js         Diagnostic case content + variant prompts
wheels_v5.js            Wheelhouse zone (6 stages + boss)
appendix_v5.js          Spec Vault zone (4 stages + boss)
suspension_v5.js        Suspension Systems Mastery Zone (6 stages + boss)
wrench_path_v5.js       Multi-step diagnostic chains
manifest.webmanifest    PWA install metadata
sw.js                   Service worker — full offline cache
```

Each zone module exports a `window.<ZONE>` global with `{ stages, boss, badges, meta }`. The engine discovers zones at startup and validates them before booting.

---

## State & saves

- All progress is stored in `localStorage` under `ubi_quiz_state_v5` (single JSON blob).
- Saves auto-migrate from v1 → v4 on first load.
- Adding a new zone backfills its state slot — existing saves are not invalidated.
- No external services. No accounts. Nothing leaves the browser.

---

## Running locally

Any static-file server works. Two quick options:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

Then open `http://localhost:8000`.

For a single-file double-click experience, just open `index.html` directly — `localStorage` works on the `file://` protocol in most browsers (iOS Safari is the notable exception; on iOS, install the PWA to your Home Screen for persistent saves).

---

## Deploying to GitHub Pages

1. Push this folder to a new repo (e.g., `ubi-tune-up`).
2. In repo Settings → Pages → Source: choose `main` branch, `/ (root)` folder.
3. After ~1 minute the site is live at `https://<your-username>.github.io/ubi-tune-up/`.

The PWA is fully self-contained — no CDN dependencies, no API calls, no fonts to fetch.

---

## Source material

Content is derived from the United Bicycle Institute Professional Repair and Shop Operation Student Study Guide (©2025 United Bicycle Institute, Inc.). This study tool is for personal/educational use by UBI students; it is not affiliated with or endorsed by UBI.

---

## Browser support

- Chrome / Edge / Firefox / Safari — all modern desktop and mobile versions
- iOS Safari: install to Home Screen for persistent saves and full PWA experience
- Offline: works fully offline after the first page load (service worker caches everything)
