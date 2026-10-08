import copy from "../i18n/copy.json";
import { LABEL_BY_ID } from "../ml/labels";
import type { Action, LabelId } from "../types";

export type OrderCard = {
  actions: Action[];
  en: string;
  km: string;
};

const ORDER_KEY: Record<LabelId, { wet: keyof typeof copy.orders; dry: keyof typeof copy.orders }> =
  {
    bucket: { wet: "bucket_wet", dry: "bucket_dry" },
    saucer: { wet: "saucer_wet", dry: "saucer_dry" },
    tire: { wet: "tire", dry: "tire" },
    discard: { wet: "discard", dry: "discard" },
    jar: { wet: "jar_wet", dry: "jar_dry" },
    ant_trap: { wet: "ant_trap", dry: "ant_trap" },
    shrine: { wet: "shrine", dry: "shrine" },
    pet_bowl: { wet: "pet_bowl", dry: "pet_bowl" },
    gutter: { wet: "gutter", dry: "gutter" },
    drain: { wet: "drain", dry: "drain" },
    grass: { wet: "grass", dry: "grass" },
  };

const ACTIONS: Record<LabelId, { wet: Action[]; dry: Action[] }> = {
  bucket: { wet: ["TIP", "SCRUB"], dry: ["SCRUB"] },
  saucer: { wet: ["TIP"], dry: ["TIP"] },
  tire: { wet: ["TOSS"], dry: ["TOSS"] },
  discard: { wet: ["TOSS"], dry: ["TOSS"] },
  jar: { wet: ["COVER", "SCRUB"], dry: ["COVER"] },
  ant_trap: { wet: ["CHANGE"], dry: ["CHANGE"] },
  shrine: { wet: ["CHANGE"], dry: ["CHANGE"] },
  pet_bowl: { wet: ["CHANGE"], dry: ["CHANGE"] },
  gutter: { wet: ["TIP"], dry: ["TIP"] },
  drain: { wet: ["REPORT"], dry: ["REPORT"] },
  grass: { wet: ["NONE"], dry: ["NONE"] },
};

/**
 * Deterministic health-action table.
 * The model never writes this. Label + "water inside?" in, order out.
 */
export function decideOrder(labelId: LabelId, water: boolean): OrderCard {
  const keys = ORDER_KEY[labelId];
  const acts = ACTIONS[labelId];
  const key = water ? keys.wet : keys.dry;
  const line = copy.orders[key];
  return {
    actions: water ? acts.wet : acts.dry,
    en: line.en,
    km: line.km,
  };
}

export function actionLabel(action: Action): { en: string; km: string } {
  return copy.actions[action];
}

export function labelName(id: LabelId): { en: string; km: string } {
  const row = LABEL_BY_ID[id];
  return { en: row.en, km: row.km };
}
