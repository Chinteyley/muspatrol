import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AutoTokenizer,
  CLIPTextModelWithProjection,
} from "@huggingface/transformers";
import { LABELS } from "../src/ml/labels.ts";
import { l2normalize } from "../src/lib/cosine.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MODEL = "Xenova/clip-vit-base-patch32";

async function main() {
  const tokenizer = await AutoTokenizer.from_pretrained(MODEL);
  const textModel = await CLIPTextModelWithProjection.from_pretrained(MODEL, {
    dtype: "fp32",
  });

  const rows = [];
  for (const label of LABELS) {
    const prompts = label.promptsA;
    if (prompts.length === 0) throw new Error(`no prompt for ${label.id}`);
    const acc: number[] = [];
    for (const prompt of prompts) {
      const inputs = tokenizer(prompt, { padding: true, truncation: true });
      const out = await textModel(inputs);
      const data = out.text_embeds.data as ArrayLike<number>;
      const vec = l2normalize(data);
      if (acc.length === 0) acc.push(...vec);
      else for (let i = 0; i < acc.length; i++) acc[i] += vec[i] ?? 0;
    }
    for (let i = 0; i < acc.length; i++) acc[i] /= prompts.length;
    rows.push({
      id: label.id,
      prompt: prompts.join(" | "),
      embedding: l2normalize(acc),
    });
    console.log("embedded", label.id, prompts.length, "prompts");
  }

  const payload = {
    model: MODEL,
    dim: rows[0]?.embedding.length ?? 512,
    template: "A",
    labels: rows,
  };
  const dest = resolve(ROOT, "src/ml/label-embeds.json");
  writeFileSync(dest, JSON.stringify(payload));
  console.log("wrote", dest, "dim", payload.dim, "n", rows.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
