# Expense360 marketing kit

| File | What it is |
|---|---|
| `Expense360-promo.mp4` | 56-second promo, 1920×1080, H.264 with a soft synthesized music bed |
| `Expense360-promo-720p-silent.mp4` | 1280×720 silent cut for autoplay embeds and social feeds |
| `assets/*.png` | Retina screenshots of every app screen (2880×1800), taken from `index.html` with its sample data |

The pitch deck lives as a Claude Slides artifact; it can be downloaded from there as PPTX or PDF.

## Storyboard (video)

| Time | Scene |
|---|---|
| 0:00 | Hook — "Travel costs move every month. Your per-diem policy doesn't." |
| 0:05 | Status quo — stale per-diems, late overrun discovery, hidden outliers |
| 0:10 | Logo reveal — Expense360, intelligent expense & budget optimization |
| 0:14 | 01 Executive overview |
| 0:20 | 02 Per-diem optimization (recommendation + reasons) |
| 0:27 | 03 Budgets & alerts |
| 0:33 | 04 Forecast & variance |
| 0:38 | 05 Receipt scanning |
| 0:44 | 06 Audit log / human-in-the-loop |
| 0:49 | CTA — Collect. Analyze. Predict. Recommend. + demo URL |

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
