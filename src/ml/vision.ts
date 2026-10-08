import type { LabelId, VisionHit } from "../types";
import { isLabelId } from "./labels";
import { cosine } from "../lib/cosine";
import embeds from "./label-embeds.json";

export const CLIP_MODEL_ID = "Xenova/clip-vit-base-patch32";
export const CLIP_DTYPE = "q4f16";
export const CLIP_VISION_MB = 53.3;

export type EmbedFile = {
  model: string;
  dim: number;
  template: string;
  labels: { id: string; prompt: string; embedding: number[] }[];
};

const store = embeds as EmbedFile;

export function rankLabels(imageEmbedding: ArrayLike<number>, topK = 3): VisionHit[] {
  const scored = store.labels
    .filter((row) => isLabelId(row.id))
    .map((row) => ({
      id: row.id as LabelId,
      score: cosine(imageEmbedding, row.embedding),
    }))
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

export type VisionRequest =
  | { type: "load" }
  | { type: "classify"; image: string };

export type VisionResponse =
  | { type: "ready"; ms: number }
  | { type: "progress"; message: string }
  | { type: "result"; top3: VisionHit[]; ms: number }
  | { type: "error"; message: string };

export function createVisionWorker(): Worker {
  return new Worker(new URL("./vision.worker.ts", import.meta.url), {
    type: "module",
  });
}
