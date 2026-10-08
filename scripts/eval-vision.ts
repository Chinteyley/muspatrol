import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AutoProcessor,
  CLIPVisionModelWithProjection,
  RawImage,
} from "@huggingface/transformers";
import { SAMPLES } from "../src/lib/samples.ts";
import { l2normalize } from "../src/lib/cosine.ts";
import { CLIP_DTYPE, CLIP_MODEL_ID, rankLabels } from "../src/ml/vision.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function main() {
  const processor = await AutoProcessor.from_pretrained(CLIP_MODEL_ID);
  const model = await CLIPVisionModelWithProjection.from_pretrained(CLIP_MODEL_ID, {
    dtype: CLIP_DTYPE,
  });

  const rows = [];
  let top1 = 0;
  let top3 = 0;
  const times: number[] = [];

  for (const sample of SAMPLES) {
    const path = resolve(ROOT, "public", sample.file.replace(/^\//, ""));
    const t0 = Date.now();
    const image = await RawImage.read(path);
    const inputs = await processor(image);
    const out = await model(inputs);
    const vec = l2normalize(out.image_embeds.data as ArrayLike<number>);
    const hits = rankLabels(vec, 3);
    const ms = Date.now() - t0;
    times.push(ms);
    const ids = hits.map((h) => h.id);
    if (ids[0] === sample.expected) top1 += 1;
    if (ids.includes(sample.expected)) top3 += 1;
    rows.push({
      id: sample.id,
      expected: sample.expected,
      top1: ids[0],
      top3: ids,
      scores: hits.map((h) => Number(h.score.toFixed(3))),
      ms,
    });
    console.log(sample.id, "expected", sample.expected, "got", ids, `${ms}ms`);
  }

  const summary = {
    n: SAMPLES.length,
    top1,
    top3,
    top1Acc: SAMPLES.length ? top1 / SAMPLES.length : 0,
    top3Acc: SAMPLES.length ? top3 / SAMPLES.length : 0,
    meanMs: times.length
      ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      : 0,
    device: "node cpu, CLIP q4f16",
    rows,
  };
  writeFileSync(
    resolve(ROOT, "eval/vision-results.json"),
    JSON.stringify(summary, null, 2),
  );
  console.log(summary);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
