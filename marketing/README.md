# Expense360 marketing kit

| File | What it is |
|---|---|
| `Expense360-promo.mp4` | 67-second promo, 1920×1080, H.264 with a soft synthesized music bed |
| `Expense360-promo-720p-silent.mp4` | 1280×720 silent cut for autoplay embeds and social feeds |
| `Expense360-promo-v4-ai.mp4` | **AI-focused cut** (latest), 67 s, 1920×1080 with music: insights, anomaly detection, per-diem engine, reallocation, Copilot, forecast, receipt OCR, human-in-the-loop |
| `Expense360-promo-v4-ai-720p-silent.mp4` | 1280×720 silent version of the AI cut |
| `Expense360-promo-v2.mp4`, `-v3.mp4` | Budget Command Center cuts (navy / mid-blue) |
| `assets-ai/*.png` | Screenshots for the AI cut and the deck, from `shoot-ai.mjs`, including a live receipt scan of `receipt.html` |
| `assets/*.png` | Retina screenshots of every app screen (2880×1800), taken from `index.html` with its sample data (signed in as "Finance Team" and "Ankita Bansal"), plus the login screen and a dark-theme overview |

The pitch deck lives as a Claude Slides artifact; it can be downloaded from there as PPTX or PDF.

## Storyboard — v4 AI cut (`video/composition-ai.html`)

| Time | Scene |
|---|---|
| 0:00 | Hook — "Spreadsheets tell you what happened. Expense360 tells you what to do next." |
| 0:05 | AI at every step — reads, explains, recommends |
| 0:10 | Logo reveal — the AI-powered Budget Command Center |
| 0:14 | 01 AI insights (projected overrun + its driver) |
| 0:20 | 02 Anomaly detection (statistical outliers) |
| 0:26 | 03 Per-diem recommendations (confidence + reasons) |
| 0:32 | 04 Reallocation engine |
| 0:38 | 05 Finance Copilot |
| 0:44 | 06 Predictive forecast |
| 0:49 | 07 Receipt OCR (live scan) |
| 0:55 | 08 Human in the loop — "AI recommends. People decide." |
| 1:00 | CTA — Read. Explain. Predict. Recommend. + demo URL |

Claims are kept to what the app does: the Copilot is keyword-matched Q&A over live
data (not a general AI chat), anomalies are z-score outliers, the forecast is a
linear-regression trend, and per-diem / reallocation suggestions are transparent
heuristics that always wait for a Finance decision.

To re-render the AI cut: `node shoot-ai.mjs`, then from `video/`,
`COMP=composition-ai.html node render.mjs video silent-ai.mp4` and mux with
`music-ai.m4a` as below. `shoot-ai.mjs` serves the OCR engine from the npm registry
(cached in `.cache/`), so it works where the jsdelivr CDN is blocked.

## Storyboard — v1 (`video/composition.html`)

| Time | Scene |
|---|---|
| 0:00 | Hook — "Travel costs move every month. Your per-diem policy doesn't." |
| 0:05 | Status quo — stale per-diems, late overrun discovery, hidden outliers |
| 0:10 | Logo reveal — Expense360, intelligent expense & budget optimization |
| 0:14 | 01 Executive overview |
| 0:20 | 02 Action digest |
| 0:26 | 03 Per-diem optimization (recommendation + reasons) |
| 0:32 | 04 Budgets & alerts |
| 0:38 | 05 Forecast & variance |
| 0:43 | 06 Policy assistant |
| 0:49 | 07 Smart receipts (OCR, translation, itemized, duplicates) |
| 0:54 | 08 Audit log / human-in-the-loop |
| 1:00 | CTA — Collect. Analyze. Predict. Recommend. + demo URL |

## Re-rendering

Needs Node with Playwright/Chromium and an ffmpeg that has libx264
(`pip install imageio-ffmpeg` provides one).

```sh
cd marketing
node shoot.mjs                                  # refresh screenshots in assets/
cd video
node render.mjs stills 3,18,25                  # preview frames at given seconds
FFMPEG=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())") \
  node render.mjs video silent.mp4              # render every frame at 30 fps
$FFMPEG -i silent.mp4 -i music.m4a -c:v copy -c:a aac -shortest ../Expense360-promo.mp4
```

Copy and timing live in `video/composition.html` (each scene's `data-s`/`data-e`
seconds, zoom focus and highlight box). Fonts (Fraunces, IBM Plex — SIL OFL) are
bundled in `fonts/` so renders don't depend on network access.
