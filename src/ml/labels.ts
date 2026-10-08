import type { LabelId } from "../types";
import copy from "../i18n/copy.json";

export type LabelDef = {
  id: LabelId;
  en: string;
  km: string;
  promptsA: string[];
  promptsB: string[];
  mention: string[];
};

export const LABELS: LabelDef[] = [
  {
    id: "bucket",
    en: copy.labels.bucket.en,
    km: copy.labels.bucket.km,
    promptsA: [
      "a photo of a plastic bucket or wash basin",
      "a photo of a colorful plastic pail",
    ],
    promptsB: [
      "a close-up photo of a plastic bucket or wash basin in a yard after rain",
    ],
    mention: ["bucket", "basin", "pail", copy.labels.bucket.km],
  },
  {
    id: "saucer",
    en: copy.labels.saucer.en,
    km: copy.labels.saucer.km,
    promptsA: [
      "a photo of a flower pot saucer",
      "a photo of a plant pot drip tray",
      "a photo of a terracotta flower pot",
      "a photo of a potted plant in a recycled container",
    ],
    promptsB: ["a close-up photo of a flower-pot saucer holding rainwater"],
    mention: ["saucer", "flower pot", "flower-pot", "pot"],
  },
  {
    id: "tire",
    en: copy.labels.tire.en,
    km: copy.labels.tire.km,
    promptsA: [
      "a photo of an old car tire",
      "a photo of a discarded motorcycle tire",
      "a photo of plants growing in a used tyre",
    ],
    promptsB: ["a close-up photo of an old car or moto tire holding rainwater"],
    mention: ["tire", "tyre"],
  },
  {
    id: "discard",
    en: copy.labels.discard.en,
    km: copy.labels.discard.km,
    promptsA: [
      "a photo of a discarded coconut shell",
      "a photo of empty coconut husks",
      "a photo of an empty plastic bottle",
      "a photo of a disposable cup",
      "a photo of a leftover food box",
    ],
    promptsB: [
      "a close-up photo of a coconut shell, cup, or plastic bottle that can hold rainwater",
    ],
    mention: ["coconut", "shell", "bottle", "cup", "food box"],
  },
  {
    id: "jar",
    en: copy.labels.jar.en,
    km: copy.labels.jar.km,
    promptsA: [
      "a photo of a large clay water jar",
      "a photo of a Cambodian water storage jar",
      "a photo of a rain barrel",
      "a photo of a green plastic rain barrel",
      "a photo of a household water barrel",
    ],
    promptsB: ["a close-up photo of a household water jar or rain barrel"],
    mention: ["jar", "barrel", "cistern"],
  },
  {
    id: "ant_trap",
    en: copy.labels.ant_trap.en,
    km: copy.labels.ant_trap.km,
    promptsA: [
      "a photo of a small water bowl under a furniture leg",
      "a photo of an ant trap water dish",
    ],
    promptsB: [
      "a close-up photo of a Cambodian kitchen ant-trap water bowl under a cabinet leg",
    ],
    mention: ["ant-trap", "ant trap"],
  },
  {
    id: "shrine",
    en: copy.labels.shrine.en,
    km: copy.labels.shrine.km,
    promptsA: [
      "a photo of a spirit house with offering bowls",
      "a photo of shrine offering cups with water",
      "a photo of flowers in a vase on a small shrine",
    ],
    promptsB: ["a close-up photo of water offerings at a Cambodian spirit house"],
    mention: ["spirit", "shrine", "offering", "vase"],
  },
  {
    id: "pet_bowl",
    en: copy.labels.pet_bowl.en,
    km: copy.labels.pet_bowl.km,
    promptsA: [
      "a photo of a dog water bowl",
      "a photo of a pet drinking bowl",
    ],
    promptsB: ["a close-up photo of a pet water bowl outdoors"],
    mention: ["pet bowl", "dog bowl", "cat bowl"],
  },
  {
    id: "gutter",
    en: copy.labels.gutter.en,
    km: copy.labels.gutter.km,
    promptsA: [
      "a photo of a blocked roof gutter",
      "a photo of a rain puddle on a tarp",
      "a photo of standing water on a plastic sheet",
    ],
    promptsB: ["a close-up photo of a roof gutter or tarp holding rainwater"],
    mention: ["gutter", "tarp"],
  },
  {
    id: "drain",
    en: copy.labels.drain.en,
    km: copy.labels.drain.km,
    promptsA: [
      "a photo of a roadside storm drain",
      "a photo of a public street puddle",
    ],
    promptsB: ["a close-up photo of a roadside drain or public puddle"],
    mention: ["drain", "gutter grate"],
  },
  {
    id: "grass",
    en: copy.labels.grass.en,
    km: copy.labels.grass.km,
    promptsA: [
      "a photo of green grass",
      "a photo of a dry lawn",
      "a photo of bare dry ground",
    ],
    promptsB: ["a close-up photo of grass or dry ground with no container"],
    mention: ["grass", "lawn", "ground"],
  },
];

export const LABEL_BY_ID: Record<LabelId, LabelDef> = Object.fromEntries(
  LABELS.map((l) => [l.id, l]),
) as Record<LabelId, LabelDef>;

export function isLabelId(value: string): value is LabelId {
  return value in LABEL_BY_ID;
}
