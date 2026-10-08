import { LABELS } from "./labels";
import type { LabelId, PatrolItem } from "../types";

export type Validation = {
  ok: boolean;
  reason?: string;
};

const NUMBER = /\b(\d{1,3})\b/g;

function mentionedLabels(text: string): LabelId[] {
  const lower = text.toLowerCase();
  const hits: LabelId[] = [];
  for (const label of LABELS) {
    if (label.id === "grass") continue;
    if (label.mention.some((word) => lower.includes(word.toLowerCase()))) {
      hits.push(label.id);
    }
  }
  return hits;
}

/**
 * The model is a narrator, not a witness. If it invents a container or
 * a count that is not in the patrol log, we throw the text away.
 */
export function validateReport(text: string, items: PatrolItem[]): Validation {
  if (!text.trim()) {
    return { ok: false, reason: "empty report" };
  }

  const present = new Set(
    items.filter((item) => item.labelId !== "grass").map((item) => item.labelId),
  );
  const invented = mentionedLabels(text).filter((id) => !present.has(id));
  if (invented.length > 0) {
    return {
      ok: false,
      reason: `invented containers: ${invented.join(", ")}`,
    };
  }

  const containerCount = items.filter((item) => item.labelId !== "grass").length;
  const numbers = [...text.matchAll(NUMBER)].map((m) => Number(m[1]));
  const wild = numbers.filter(
    (n) => n > 1 && n !== containerCount && n !== items.length && n !== items.filter((i) => i.water).length,
  );
  if (wild.length > 0 && containerCount > 0) {
    const claimsContainers = /container|bucket|pot|jar|tire|found|tipped|flipped/i.test(
      text,
    );
    if (claimsContainers && wild.some((n) => n > containerCount + 2)) {
      return { ok: false, reason: `count ${wild.join(",")} vs log ${containerCount}` };
    }
  }

  return { ok: true };
}
