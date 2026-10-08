import {
  AutoProcessor,
  CLIPVisionModelWithProjection,
  RawImage,
} from "@huggingface/transformers";
import { l2normalize } from "../lib/cosine";
import { CLIP_DTYPE, CLIP_MODEL_ID, rankLabels, type VisionRequest, type VisionResponse } from "./vision";

type Processor = Awaited<ReturnType<typeof AutoProcessor.from_pretrained>>;
type VisionModel = Awaited<ReturnType<typeof CLIPVisionModelWithProjection.from_pretrained>>;

let processor: Processor | null = null;
let model: VisionModel | null = null;

function post(msg: VisionResponse) {
  self.postMessage(msg);
}

async function load() {
  if (processor && model) {
    post({ type: "ready", ms: 0 });
    return;
  }
  const t0 = performance.now();
  post({ type: "progress", message: "Loading CLIP vision tower (q4f16, ~53 MB)…" });
  processor = await AutoProcessor.from_pretrained(CLIP_MODEL_ID);
  model = await CLIPVisionModelWithProjection.from_pretrained(CLIP_MODEL_ID, {
    dtype: CLIP_DTYPE,
    device: "wasm",
  });
  post({ type: "ready", ms: Math.round(performance.now() - t0) });
}

async function classify(image: string) {
  if (!processor || !model) await load();
  if (!processor || !model) throw new Error("vision model missing");
  const t0 = performance.now();
  const raw = await RawImage.read(image);
  const inputs = await processor(raw);
  const out = await model(inputs);
  const embeds = out.image_embeds as { data: ArrayLike<number> };
  const vec = l2normalize(embeds.data);
  const top3 = rankLabels(vec, 3);
  post({ type: "result", top3, ms: Math.round(performance.now() - t0) });
}

self.onmessage = (event: MessageEvent<VisionRequest>) => {
  const msg = event.data;
  void (async () => {
    try {
      if (msg.type === "load") {
        await load();
        return;
      }
      if (msg.type === "classify") {
        await classify(msg.image);
        return;
      }
      const _never: never = msg;
      throw new Error(`unknown vision request ${JSON.stringify(_never)}`);
    } catch (err) {
      post({
        type: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  })();
};
