---
title: "There's no fall foliage in Phnom Penh, so I built an offline AI that sends me out to flip buckets"
published: false
description: "MusPatrol (មូស Patrol): a 10-minute after-the-rain dengue patrol. CLIP names the container in your browser, a rules table decides what to do, and Gemma 4 is only allowed to narrate."
tags: devchallenge, hf26challenge, ai, webdev
cover_image: https://raw.githubusercontent.com/Chinteyley/muspatrol/main/docs/screenshots/cover.png
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 1: Touch Grass](https://dev.to/challenges/hacktoberfest-week1-2026-10-05)*

## What I Built

Pick any October afternoon in Phnom Penh. Around four or five o'clock the sky dumps what feels like a month of rain in twenty minutes, then stops like nothing happened. In a lot of Touch Grass entries this is where you'd go outside and look at leaves turning orange.

We don't have that. I'm a student in Phnom Penh and we have two seasons: hot, and hot with a side of dengue. After every one of those downpours, every bucket, flower-pot saucer, old tire and coconut shell on my street turns into a mosquito daycare with free rent. *Aedes* mosquitoes lay their eggs in exactly that kind of small, still, clean-ish water, and the eggs glue themselves to the container walls.

The official advice is boring and correct: after it rains, **tip it, scrub it, cover it, toss it**. Everyone in Cambodia has heard it. Almost nobody actually walks around the house doing it.

So I built **MusPatrol** (មូស Patrol; *mus* is Khmer for mosquito). It's an installable web app for a **10-minute walk after the rain**:

1. The home screen checks Open-Meteo: did it rain in the last 3 hours, and how long until sunset? That's your patrol window.
2. You walk your yard, balcony, or soi and snap a water-holding thing.
3. **CLIP, running inside your browser**, suggests the top three container types. You tap the right one, then tap **"Water inside?"** yes or no.
4. A **TypeScript rules table** (not the AI) prints the order: **TIP / SCRUB / COVER / TOSS / CHANGE / REPORT**, in English plus a short Khmer line.
5. You do the thing. Phone back in the pocket. Next container.
6. At the end you get a tally and a cheeky four-line patrol report. An open-weight LLM (Gemma 4 E2B, on-device) is *allowed* to write that report if your browser can run it. Otherwise a template writes it. Either way, the model never decides the health action.

It's for families, kids who like tallies, balcony people, and anyone who has nodded at "tip, toss, cover" for ten rainy seasons and still has a saucer of green water under the chilli plant.

The whole point is that **the screen is the shortest part**: snap, confirm, read one big word, pocket it. A screen-on timer runs during the patrol so the app keeps itself honest about that.

And here's the honest part up front, because judges will ask: **I have not done the outdoor field test yet.** Everything below was built and measured on a cloud VM, not on a wet street. So the demo uses ten openly licensed photos from Wikimedia Commons, and you can run the full loop with them in under a minute.

## Demo

**Live app: https://muspatrol.vercel.app**

No video this time, so here's the fastest way in: open the link, tap **Try with sample photos**, and pick a picture. No camera, no account, no API key. It works on desktop too.

What happens on your first tap: your browser downloads the CLIP vision tower (about **53.3 MB**) plus the ONNX Runtime WASM (about **25.6 MiB**), then classifies the photo locally. After that, the browser cache keeps them.

The loop: home with the patrol window → CLIP's top three guesses → the order card.

![Three MusPatrol screens side by side: the home screen with the Phnom Penh patrol window, the "Which one is it?" picker showing plastic bucket, water jar and pet bowl, and the TIP + SCRUB order card in English and Khmer](https://raw.githubusercontent.com/Chinteyley/muspatrol/main/docs/screenshots/demo-loop.png)

Judge mode and the report: ten Commons photos, then a report that only mentions what you actually logged.

![Two MusPatrol screens: a grid of Wikimedia Commons sample photos (a hand-washing bucket, a washbasin, a recycled pot, tires used as planters), and the patrol report with tally and the optional Gemma 4 E2B card](https://raw.githubusercontent.com/Chinteyley/muspatrol/main/docs/screenshots/demo-judge.png)

Things to try:

- **`basin.jpg` and `bowl.jpg`** are the two photos CLIP gets wrong on its first guess. The right answer is still in the top three, so tap it and watch the rules table take over.
- **`grass.jpg`** gets the only order the challenge really wants: *"Nice. Touch that grass."*
- The **About** page lists every photo's author and license.

## Code

{% github Chinteyley/muspatrol %}

App code is MIT. Models, fonts, weather data and photos keep their own licenses (see `NOTICE.md`). Measured numbers live in [`docs/numbers.md`](https://github.com/Chinteyley/muspatrol/blob/main/docs/numbers.md), and the empty field-test log lives in [`docs/field-test-log.md`](https://github.com/Chinteyley/muspatrol/blob/main/docs/field-test-log.md). I'll fill that in after a real walk, not before.

Stack: Vite + React + TypeScript, Bun, `vite-plugin-pwa`, transformers.js, MediaPipe LLM Inference, Open-Meteo, IndexedDB. It's a static site with no backend.

## How I Built It

Full disclosure: I built this with a lot of help from a coding agent (the challenge allows AI use, and I'd rather say so than have you guess). The design rule I cared most about is the first one below.

### 1. The rules are code. The model is the narrator.

Dengue advice is a health action, and I don't want a chat model improvising one. So the decision is a plain function:

```ts
// src/rules/rules.ts
export function decideOrder(labelId: LabelId, water: boolean): OrderCard
```

Label plus "water inside?" goes in, and an order card comes out:

| Container | Order |
|---|---|
| plastic bucket / basin | TIP + SCRUB (just SCRUB if it's dry, because eggs stick to walls) |
| flower-pot saucer | TIP (or fill it with sand) |
| old tire | TOSS (recycle it, or drill drain holes) |
| coconut shell / cup / bottle | TOSS |
| water jar (ពាង) / barrel | COVER + SCRUB |
| ant-trap bowl, pet bowl | CHANGE the water |
| spirit-house offering water | CHANGE, respectfully. Never toss the offering. |
| gutter / tarp puddle | TIP / clear it |
| roadside drain | REPORT to the sangkat (low priority for *Aedes*) |
| grass / dry ground | "Nice. Touch that grass." |

The spirit-house row matters to me. An AI that tells you to dump an offering is how you get uninvited from your grandma's house. The table is unit-tested, and the model never touches it.

### 2. Teaching CLIP what a Cambodian yard looks like

Vision is [`Xenova/clip-vit-base-patch32`](https://huggingface.co/Xenova/clip-vit-base-patch32) via **transformers.js 4.3.1**, vision tower only, `q4f16`: **53.3 MB**. The trick that keeps it phone-sized is that the **text side is precomputed at build time**. `scripts/embed-labels.ts` embeds a few English prompts for each of 11 labels, averages them, L2-normalises the result, and writes a **118 KiB** JSON file. The browser never downloads the text tower. Classifying is one image embedding and eleven cosine similarities.

On the 10 Commons sample photos (Node, CPU, no GPU):

| | top-1 | top-3 | mean latency |
|---|---:|---:|---:|
| 10 Commons photos | **8 / 10** | **10 / 10** | **43 ms** |

The two misses are honestly kind of fair. A plastic washbasin came out as "pet bowl" first, and a dog bowl came out as "bucket" first. That's exactly why the UI never auto-picks. It always shows three chips, and you're the one standing next to the thing.

In headless Chrome on the build VM, the first load (fetching the model plus WASM) took 26–28 s, and one classify after that took 777 ms. A later re-run on a different VM loaded in about 8 s, so first-load time depends a lot on network and CPU. **I haven't measured any of this on a phone yet.**

Ten photos is a tiny eval set and I know it. I planned to shoot my own yard photos for a proper eval. That's part of the field test that hasn't happened yet, so 8/10 on Commons is the only accuracy number I'll put my name on.

### 3. Gemma 4 E2B in a browser tab (wired up, not benchmarked)

The narrator is **Gemma 4 E2B**, Apache-2.0, using the ungated web build [`gemma-4-E2B-it-web.task`](https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm) through **MediaPipe LLM Inference** (`@mediapipe/tasks-genai` 0.10.29) on WebGPU. The file is **2,003,697,664 bytes** (about 2.0 GB), downloaded only if you tap **Load Gemma & rewrite** on the report screen.

The prompt uses Gemma 4's own turn tokens, because MediaPipe won't wrap them for you:

```ts
`<|turn>system\n${system}<turn|>\n<|turn>user\n${user}<turn|>\n<|turn>model\n`
```

The system prompt says: only mention items in the JSON log, don't change the actions, output JSON, and keep the jokes friendly (evict / daycare / landlord). I don't trust a prompt on its own, so every reply also goes through `validateReport()`. If the model mentions a container that isn't in your log ("great job with that tire!" when you logged no tire), or a count that doesn't match, the text gets thrown away and the template report wins. The model is a narrator, not a witness.

Now the honest bit: **the build environment had no WebGPU** (`navigator.gpu` doesn't exist in headless Chrome on a GPU-less VM). So I have **not** run Gemma 4 here, and I have no tokens-per-second figure for a phone or a laptop. I didn't want to make one up. The code path is there, the app checks `navigator.gpu` and device memory before offering the download, and the default report is the deterministic template. If you have a WebGPU laptop, you're the benchmark. Please tell me in the comments how it went.

### 4. Khmer, honestly

Order cards carry short Khmer lines next to the English ones. I'm not shipping long, confident-sounding Khmer that nobody has checked, so every string is listed in [`docs/khmer-review.md`](https://github.com/Chinteyley/muspatrol/blob/main/docs/khmer-review.md) and marked *needs review*. The neighbour notes ("Bong, your old tire is running a mosquito daycare…") are English, with romanized placeholders where the Khmer will go after a native-speaker pass.

Shout-out to [Tonsai-1B](https://huggingface.co/mengsay/Gemma-3-Tonsai-1B-v0.1), a Cambodian developer's Khmer continued-pretrain of Gemma 3 1B. It isn't in this app, but it's the reason I believe "open weights + Khmer" has a future.

### 5. Offline by design

- `vite-plugin-pwa` precaches the app shell: **28 entries, about 1,096 KiB**.
- The ONNX Runtime WASM is **26,861,777 bytes**, which is over Workbox's 8 MB precache cap. So it isn't precached, and the browser caches it after the first classify instead.
- Open-Meteo responses use stale-while-revalidate and also get stored in IndexedDB, so the patrol-window card is designed to fall back to the last forecast when there's no signal.
- Photos stay on the device. Nothing gets uploaded. There's no server to upload to.

Storms knock out 4G right when the patrol should start, so offline was the plan from day one. I haven't screenshotted an airplane-mode patrol on a real phone yet, though. That's on the field-test list.

### 6. Hosting

The site is a static `dist/` (28.9 MiB, mostly that WASM) served from Vercel and built from `main`. There's no backend, no keys, and no database.

### 7. What didn't work, and where I stopped

- **CLIP's first guess isn't good enough to act on.** It misses top-1 on 2 of the 10 sample photos, so the app never auto-picks. The three-chip picker plus one "water inside?" tap is the fix.
- **"Gemma in the browser" really means "Gemma on a WebGPU browser."** WebGPU is the gate, so the template *is* the product, and Gemma is the bonus.
- **No original yard photos yet.** It's Commons or nothing until I actually walk outside.
- **Not built:** push notifications, maps, accounts, larvae detection, ElevenLabs voice lines, and a server-side "second look" model. Next time I want Gemma to *see* the photo too, and that's probably a native build.

## Taking it outside

**Field test: not done yet.** No patrol has happened on a real street, so I have no screen-on time from the field, no tally of containers found, and no neighbour reactions. I won't invent any.

What you *can* do right now: open https://muspatrol.vercel.app, tap **Try with sample photos**, run the ten Commons pictures, watch CLIP fumble the washbasin, tap the right chip, get **TIP + SCRUB**, finish, and read a report that only mentions what you logged.

When I do the real walk after an afternoon storm, the numbers go into `docs/field-test-log.md`. Anything committed after the deadline will be listed in the README, as the rules require.

## Why Does Open Innovation Matter?

**The photos are of home.** My yard, my neighbour's tire, the spirit house by the gate. A closed vision API would need every one of those frames sent to someone else's server. With open weights running in the browser tab, they never leave the phone. That's privacy by architecture, not by a policy page.

**Storms knock out the signal right when the patrol starts.** A cloud API is useless at exactly the moment this app matters. Open models I can cache on the device make offline the default, not a feature.

**$0 per patrol.** A sangkat health volunteer or a school teacher could run this for a whole street in a bad dengue year with no API key, no quota, and no bill. The only cost is one download on Wi-Fi.

**Apache-2.0 means I can ship it and you can change it.** Gemma 4's license lets me wire the weights into a public PWA. CLIP plus transformers.js let me precompute the text side and ship only the vision half. People in Cambodia are already fine-tuning open models for Khmer (Tonsai on Gemma 3), and that only happens because the weights are open. I don't expect a closed vendor to put Khmer near the top of their roadmap anytime soon.

**Swappable parts.** CLIP could become SigLIP inside a single worker file. Gemma could be dropped for the template on a cheap phone, and the app still works, because the part that matters (the rules) isn't the model.

**Where closed would have won:** a big cloud vision model would probably recognise weird containers better than a 53 MB CLIP tower. I still chose open, because I don't want my neighbour's tire on someone else's GPU, and because a dengue tool that needs a credit card and 4G isn't one that a soi in Phnom Penh will actually use.

## Prize Categories

- **Best Use of Gemma:** Gemma 4 E2B (Apache-2.0) is the on-device narrator via MediaPipe LLM Inference on WebGPU, fenced in by a validator and a deterministic fallback. Honest caveat: it's integrated but not benchmarked, because my build environment had no WebGPU.

---

It's probably raining again somewhere in Phnom Penh while you read this. Somewhere a saucer is filling up. Go tip it.

*Not medical advice. Follow the Cambodian Ministry of Health and WHO guidance on dengue.*
