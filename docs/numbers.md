# Measured numbers

All figures below were measured on this machine, 8 Oct 2026 (agent VM). Nothing here is a phone benchmark, a field tally, or a made-up accuracy claim.

## How / where

| What | How |
|---|---|
| Host | Cursor Cloud Agent VM, Linux 6.12, x86_64, no discrete GPU |
| Node | v22.14.0 |
| Bun | 1.4.2 |
| CLIP | `@huggingface/transformers` 4.3.1, `Xenova/clip-vit-base-patch32`, vision `dtype: q4f16`, Node CPU |
| Sample set | 10 Wikimedia Commons photos in `public/samples/` (see `eval/labels.csv`) |
| Bundle | `bun run build` (Vite 8.3.4) then `du` / `stat` on `dist/` |
| Remote file sizes | HTTP `HEAD` against Hugging Face, `Content-Length` |

**Not measured (and not guessed):** tokens/s on a phone, first-load time on Chrome Android, WebGPU Gemma 4 latency, battery %, outdoor patrol duration, screen-on time in the field.

## File sizes

| Artifact | Bytes | Human | Method |
|---|---:|---|---|
| CLIP first load in headless Chrome | 26–28 s | `scripts/screenshots.mjs` on this VM | UI string “CLIP ready in N ms” |
| CLIP classify one Commons photo (Chrome, after load) | 777 ms | first judge-mode bucket, shown on report tally |
| Gemma 4 E2B `gemma-4-E2B-it-web.task` | 2,003,697,664 | 1.87 GiB / 2.00 GB | `HEAD` Hugging Face |
| Precomputed label embeds `src/ml/label-embeds.json` | 121,287 | 118 KiB | `stat` |
| Judge-mode photos `public/samples/` | 2,153,680 | 2.05 MiB | walk + `stat` |
| Vite `dist/` (includes 26.9 MB ONNX Runtime WASM) | 30,259,182 | 28.9 MiB | walk + `stat` |
| App JS `dist/assets/index-*.js` | 296,001 | 289 KiB | `stat` |
| Vision worker JS | 667,265 | 652 KiB | `stat` |
| ONNX Runtime WASM (shipped) | 26,861,777 | 25.6 MiB | `stat` |
| PWA precache | 1,096.27 KiB / 28 entries | workbox log after `vite build` | workbox skips the 26 MB WASM (`maximumFileSizeToCacheInBytes` = 8 MB) |

CLIP text embeddings are computed at build time (`bun scripts/embed-labels.ts`). The phone downloads the vision tower (~53.3 MB) plus the ONNX Runtime WASM (~25.6 MB) on first classify, then the browser cache keeps them.

## Vision accuracy on the sample set

Script: `bun scripts/eval-vision.ts` → `eval/vision-results.json`.

Prompts: every `promptsA` string per label, embeddings **averaged** then L2-normalised. Cosine vs CLIP vision `q4f16`.

| | top-1 | top-3 | mean latency |
|---|---:|---:|---:|
| 10 / 10 Commons photos | **8 / 10 (80%)** | **10 / 10 (100%)** | **43 ms** (Node CPU) |

Top-1 misses (still in top-3, which is what the UI shows):

- `basin.jpg` (plastic washbasin) → `pet_bowl` first, `bucket` third
- `bowl.jpg` (dog bowl) → `bucket` first, `pet_bowl` second

That is why the picker exists. A judge can still complete the loop: tap the right chip.

## Headless Chrome (this VM)

`google-chrome --headless` + `scripts/screenshots.mjs` against `vite preview` on port 4173. No WebGPU.

| Event | Value | Where I read it |
|---|---|---|
| CLIP worker ready (includes ~53 MB + WASM fetch) | 26,223–28,122 ms | UI: “CLIP ready in N ms” |
| Classify `bucket.jpg` after load | 777 ms | report tally on first run |
| Judge loop (home → sample → TIP+SCRUB → template report) | completed | screenshots in `docs/screenshots/` |

## Gemma 4 E2B in this environment

- File exists and is 2,003,697,664 bytes (HEAD).
- MediaPipe LLM Inference is wired (`@mediapipe/tasks-genai` 0.10.29, Gemma 4 `<|turn>` prompt).
- This VM has **no WebGPU**. `navigator.gpu` is absent in headless Chrome here. We did **not** download or run the 2 GB file.
- The app falls back to the deterministic template and a validator. If Gemma invents a container, the template wins.

## Open-Meteo

Live fetch from `api.open-meteo.com` for 11.5564, 104.9282 (Phnom Penh). Cached in IndexedDB. Last-3h rain is summed from hourly `precipitation` in code (`rainLast3h`); unit-tested. A live millimetre reading depends on the day you open the app — we do not freeze a fake one here.

## Re-run, 9 Oct 2026 (deploy day)

Different agent VM (Linux, x86_64, no GPU, Node v20.19.2, Bun 1.4.2, Google Chrome headless, no WebGPU). Same code, same 10 photos.

| What | Value | Where I read it |
|---|---|---|
| `bun run test` | 11 / 11 tests pass (3 files) | vitest output |
| `bun run build` | precache 28 entries (1,096.50 KiB); same 26,861,777-byte ONNX Runtime WASM | Vite / workbox log |
| Screenshots regenerated (`scripts/screenshots.mjs` vs local `vite preview`) | “CLIP ready in 7,894 ms”; `bucket.jpg` classify 726 ms | UI strings in `docs/screenshots/` |
| Live smoke test against https://muspatrol.vercel.app (headless Chrome, judge mode, first sample) | “CLIP ready in 8,092 ms”; top-3 = bucket 0.31 / water jar 0.30 / pet bowl 0.27 → TIP + SCRUB; 0 console errors | puppeteer script, UI strings |

CLIP load time depends heavily on network and CPU (the 8 Oct VM took 26–28 s; this one took ~8 s). None of this is a phone number.
