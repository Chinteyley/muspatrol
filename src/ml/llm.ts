import { parseModelJson, reportPrompt } from "./prompts";
import { templateReport } from "./templateReport";
import { validateReport } from "./validateReport";
import type { LlmStatus, PatrolItem, ReportResult } from "../types";

export const GEMMA4_TASK_URL =
  "https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm/resolve/main/gemma-4-E2B-it-web.task";
export const GEMMA4_SIZE_GB = 1.91;
export const MEDIAPIPE_WASM =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@0.10.29/wasm";

type LlmHandle = {
  generateResponse: (
    prompt: string,
    listener?: (partial: string, done: boolean) => void,
  ) => Promise<string>;
  close?: () => void;
};

let handle: LlmHandle | null = null;

export function hasWebGPU(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

export async function probeGemmaSupport(): Promise<LlmStatus> {
  if (typeof navigator === "undefined") {
    return { state: "unsupported", reason: "not a browser" };
  }
  if (!hasWebGPU()) {
    return {
      state: "unsupported",
      reason: "No WebGPU. Gemma 4 E2B web needs a WebGPU browser; using the template.",
    };
  }
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof mem === "number" && mem > 0 && mem < 4) {
    return {
      state: "unsupported",
      reason: `deviceMemory=${mem} GB. Gemma 4 E2B wants ~2 GB weights plus working RAM.`,
    };
  }
  return { state: "idle" };
}

export async function loadGemma4(
  onProgress: (message: string) => void,
): Promise<void> {
  if (handle) return;
  const support = await probeGemmaSupport();
  if (support.state === "unsupported") {
    throw new Error(support.reason);
  }
  onProgress("Loading MediaPipe LLM Inference…");
  const { FilesetResolver, LlmInference } = await import("@mediapipe/tasks-genai");
  onProgress(`Downloading Gemma 4 E2B web (~${GEMMA4_SIZE_GB} GB, once)…`);
  const genai = await FilesetResolver.forGenAiTasks(MEDIAPIPE_WASM);
  const llm = await LlmInference.createFromOptions(genai, {
    baseOptions: { modelAssetPath: GEMMA4_TASK_URL },
    maxTokens: 512,
    topK: 40,
    temperature: 0.7,
    randomSeed: 7,
  });
  handle = llm as unknown as LlmHandle;
}

export function gemmaReady(): boolean {
  return handle !== null;
}

export async function writePatrolReport(
  items: PatrolItem[],
  screenOnMs: number,
  onToken?: (text: string) => void,
): Promise<ReportResult> {
  const fallback = templateReport(items, screenOnMs);
  if (!handle) return fallback;

  try {
    const prompt = reportPrompt(items, screenOnMs);
    let acc = "";
    const raw = await handle.generateResponse(prompt, (partial, done) => {
      acc += partial;
      onToken?.(acc);
      void done;
    });
    const parsed = parseModelJson(raw || acc);
    if (!parsed) {
      return { ...fallback, reason: "model output was not JSON" };
    }
    const check = validateReport(parsed.report, items);
    if (!check.ok) {
      return { ...fallback, reason: check.reason };
    }
    return {
      report: parsed.report,
      neighbourNoteEn: parsed.neighbourNoteEn,
      neighbourNoteKm: parsed.neighbourNoteKm,
      source: "gemma4",
      validated: true,
    };
  } catch (err) {
    return {
      ...fallback,
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}
