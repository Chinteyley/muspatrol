---
title: There's no fall foliage in Phnom Penh, so my AI sends me outside to flip buckets instead
published: false
tags: devchallenge, hf26challenge, gemma, webdev
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 1: Touch Grass](https://dev.to/challenges/hacktoberfest-week1-2026-10-05)*

<!-- Cover: me flipping a bucket, phone in my pocket, wet street. Not taken yet. -->

## What I Built

4:47 pm, Phnom Penh. The sky has just finished dumping a month of rain in twenty minutes. In most of the Touch Grass entries, now is when you'd go look at leaves turning orange. We don't have that. We have two seasons, hot, and hot-with-a-side-of-dengue, and every bucket, saucer and spirit-house offering cup in my street just became a mosquito maternity ward.

So I built **MusPatrol** (មូស Patrol). It's an installable web app that lives in the phone. After a downpour it says: walk ten minutes around your yard, balcony, or soi. Snap a container. CLIP, running in the browser, suggests the top three types. I tap which one it is, tap "water inside?", and a **TypeScript table** — not the model — prints TIP, SCRUB, COVER, TOSS, CHANGE, or REPORT, in English and a short Khmer line. I do the thing. The phone goes back in my pocket.

At the end, an open-weight LLM on-device is *allowed* to write a four-line patrol report and an optional neighbour note. If WebGPU isn't there, or the model invents a tire I didn't log, a template writes the report instead. The model never decides the health action. Code does.

It's for families, kids who like tallies, balcony people, and anyone who has been told "tip, toss, cover" every rainy season and still has a saucer under the pot.

The screen is supposed to be the shortest part. I have not timed a real outdoor patrol yet — see honesty below — but the loop is built so you confirm and pocket it.

## Demo

**Live:** `<!-- LIVE_DEMO_URL -->`

Tap **Try with sample photos**. You do not need a camera. The photos are Wikimedia Commons files (buckets, a tire planter, coconut shells, a Cambodian clay vessel, a dog bowl, grass). Credits are on the About page.

**Video:** `<!-- DEMO_VIDEO_URL -->`

<!-- {% embed DEMO_VIDEO_URL %} -->

## Code

<!-- {% github Chinteyley/muspatrol %} -->

Repo: https://github.com/Chinteyley/muspatrol · MIT for the app. Models and photos keep their own licenses (`NOTICE.md`).

## How I Built It

### 1. The rules are code, the model is the narrator

I started from the usual dengue source-reduction list: tip it, toss it, cover it, scrub the walls because eggs stick. Then I made it a function.

`decideOrder(label, water)` returns an action list and a one-liner. A spirit-house cup is CHANGE, not TOSS. A roadside drain is REPORT (low priority for Aedes), not "please wade in". Grass is "Nice. Touch that grass."

Gemma does not get a vote. If I let a 2 GB chat model decide whether to throw away an offering cup, I would deserve the comments.

### 2. Teaching CLIP what a Cambodian yard looks like

transformers.js 4.3.1, `CLIPVisionModelWithProjection`, `Xenova/clip-vit-base-patch32`, vision-only, `q4f16` — **53,267,374 bytes** on the Hugging Face CDN (`HEAD`). Text embeddings for 11 labels are precomputed at build time (`scripts/embed-labels.ts`) so the phone does not download the text tower.

I averaged every English prompt per label, then L2-normalised. That one change took the Commons sample set from 6/10 top-1 to **8/10 top-1** and **10/10 top-3**. Mean classify time on this VM (Node, CPU, no GPU): **43 ms**.

The two top-1 misses are a washbasin called a pet bowl, and a dog bowl called a bucket. The UI always shows three chips. I tap the right one. Then I tap water, yes or no.

I do **not** have 40 backyard photos. Nobody on this machine can go outside and shoot them. The eval set is the 10 Commons files in judge mode. That's the number I will stand behind.

### 3. Gemma 4 E2B in a browser tab — and the day it didn't load

The plan was MediaPipe LLM Inference + `gemma-4-E2B-it-web.task`. I checked the file: **2,003,697,664 bytes**, Apache-2.0, ungated. The prompt uses Gemma 4's `<|turn>system/user/model<turn|>` tokens, because MediaPipe will not wrap them for you.

This build VM has no WebGPU. I did not pretend to run a 2 GB model on a CPU box and invent tokens/s. The app probes `navigator.gpu`, warns you about the download, and otherwise uses the template. If Gemma *does* load on your laptop, its JSON is parsed and run through `validateReport`: mention a tire that isn't in the log and we throw the text away.

Phone tokens/s: not measured. Say that twice so I don't get cute in the comments.

### 4. Khmer, honestly

Short lines only. Every string is listed in `docs/khmer-review.md` for a native speaker. Neighbour notes in the template are romanized placeholders — I refused to ship confident-sounding wrong Khmer. Tonsai-1B (a Cambodian continued pretrain of Gemma 3 1B) is the "someone already did the work" story; it is not in the runtime.

### 5. Offline for real

vite-plugin-pwa, app shell precached (~1.1 MB). CLIP WASM is 26.9 MB so it is *not* in the precache (8 MB cap); transformers.js caches it after the first classify. Open-Meteo is stale-while-revalidate plus IndexedDB. After one Wi-Fi visit you can patrol without signal. I have not yet screenshot an airplane-mode status bar on a real street. That's a field-test item.

### 6. Render, ElevenLabs, and where I stopped

The site is a static export (`render.yaml`, `vercel.json`). That is the Render claim: host the front end, for free. I did **not** stand up a llama.cpp "second look" box. I did **not** generate ElevenLabs coach lines — no key in this environment, and Khmer isn't on their language list anyway.

Where I stopped: push notifications, maps, accounts, larvae detection, Expo + llama.rn, Tinker (no Gemma on Tinker). Next time I want Gemma to *see*, that's a native build.

### 7. What didn't work

- Shipping only the first CLIP prompt per label. Bottles looked like ant-traps. Averaging prompts fixed the sample set.
- Assuming Gemma 4 would run "in the browser" on whatever machine I had. WebGPU is the gate. The template is the product.
- Wanting 40 original yard photos. I don't have them. Commons or nothing.

## Taking it outside

**Field test: not yet.** I am writing this from a cloud agent VM. I cannot walk my soi from here, and I will not invent a neighbour's reaction or a 1m34s screen-on stat.

What you *can* do today: open the live link, tap **Try with sample photos**, run the ten Commons pictures, watch CLIP miss a basin, tap the right chip, get TIP/SCRUB, finish, read a template report that only mentions what you logged.

When I actually take it out after the afternoon storm, I'll put the numbers in `docs/field-test-log.md` and come back to this section. If this post goes live before that walk, treat the missing walk as a missing walk.

## Why Does Open Innovation Matter?

The photos are of home. A yard, a tire, a spirit house. A closed vision API would want those frames. Open weights in the tab means they never leave.

Storms kill the signal at the exact moment the patrol starts. Offline is the use case, not a badge.

$0 per patrol. A sangkat volunteer can run a street in an outbreak year without an API key, a quota, or a surprise bill.

Gemma 4 is Apache-2.0. I can ship the option, someone can fine-tune it, Cambodians already are (Tonsai on Gemma 3). No closed vendor is losing sleep over 17 million Khmer speakers.

I can swap CLIP for SigLIP in one worker. I can drop Gemma 4 for the template on a cheap phone. I measured the swap that I actually did (prompt averaging). I did not measure the ones I didn't.

Where closed would have won: a big cloud VLM would read a weird wet floor as "not a bucket" more often than CLIP. I still chose open because I do not want my neighbour's tire on someone else's GPU.

## My Agent Session

`<!-- AGENT_SESSION_SLUG -->`

<!-- {% agent_session SLUG %} -->

I used a coding agent for the Vite/PWA shell, the Commons download, and the boring TypeScript. I wrote the rules table, the validator, the "Gemma does not decide" rule, and this draft. If the session embed is empty, that's because I have not published one yet.

## Prize Categories

- **Best Use of Gemma** — Gemma 4 E2B is the on-device narrator (MediaPipe, Apache-2.0). Code still owns the order card.
- **Best Use of Render** — static host for the PWA (`render.yaml`). No llama.cpp sidecar in this version.
- ElevenLabs / Entire: not claimed. I didn't generate voice and I didn't publish an Entire session.

Not medical advice. Follow the Ministry of Health. It is probably raining again. Excuse me — I have buckets to flip, as soon as I am actually home to flip them.
