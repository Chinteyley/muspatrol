import { labelName } from "../rules/rules";
import type { PatrolItem } from "../types";

/** Gemma 4 turn tokens. MediaPipe does not wrap these for you. */
export function wrapGemma4(system: string, user: string): string {
  return `<|turn>system\n${system}<turn|>\n<|turn>user\n${user}<turn|>\n<|turn>model\n`;
}

export function patrolLogForModel(items: PatrolItem[], screenOnMs: number): string {
  return JSON.stringify(
    {
      screenOnSeconds: Math.round(screenOnMs / 1000),
      containers: items.map((item) => ({
        type: labelName(item.labelId).en,
        water: item.water,
        order: item.actions,
      })),
    },
    null,
    2,
  );
}

export function reportPrompt(items: PatrolItem[], screenOnMs: number): string {
  const system = [
    "You write short cheeky after-rain patrol reports for Phnom Penh.",
    "Never invent containers, counts, or actions.",
    "Only mention items listed in the JSON log.",
    "The health action is already decided by code. Do not change it.",
    "Output JSON only, no markdown.",
    'Shape: {"report":"4 short lines","neighbourNoteEn":"optional","neighbourNoteKm":"optional"}',
    "If there is no neighbour-relevant item, use empty strings for the notes.",
    "English for the report. Keep Khmer in the neighbour note short and simple.",
    "Avoid war, genocide, or 'extermination' jokes. Use evict / daycare / landlord.",
  ].join(" ");

  const user = `Patrol log:\n${patrolLogForModel(items, screenOnMs)}\n\nWrite the JSON now.`;
  return wrapGemma4(system, user);
}

export function parseModelJson(raw: string): {
  report: string;
  neighbourNoteEn: string;
  neighbourNoteKm: string;
} | null {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const obj = JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
    if (typeof obj.report !== "string" || !obj.report.trim()) return null;
    return {
      report: obj.report.trim(),
      neighbourNoteEn: typeof obj.neighbourNoteEn === "string" ? obj.neighbourNoteEn.trim() : "",
      neighbourNoteKm: typeof obj.neighbourNoteKm === "string" ? obj.neighbourNoteKm.trim() : "",
    };
  } catch {
    return null;
  }
}
