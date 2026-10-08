export type LabelId =
  | "bucket"
  | "saucer"
  | "tire"
  | "discard"
  | "jar"
  | "ant_trap"
  | "shrine"
  | "pet_bowl"
  | "gutter"
  | "drain"
  | "grass";

export type Action = "TIP" | "SCRUB" | "COVER" | "TOSS" | "CHANGE" | "REPORT" | "NONE";

export type VisionHit = {
  id: LabelId;
  score: number;
};

export type PatrolItem = {
  id: string;
  labelId: LabelId;
  water: boolean;
  actions: Action[];
  confirmedAt: number;
  visionMs?: number;
  top3?: VisionHit[];
  source: "camera" | "sample";
  sampleId?: string;
};

export type PatrolSession = {
  id: string;
  startedAt: number;
  finishedAt?: number;
  screenOnMs: number;
  items: PatrolItem[];
  locationLabel: string;
};

export type WeatherSnapshot = {
  fetchedAt: number;
  latitude: number;
  longitude: number;
  place: string;
  rainLast3hMm: number;
  sunsetIso: string;
  minutesToSunset: number | null;
  stale: boolean;
};

export type ReportResult = {
  report: string;
  neighbourNoteEn: string;
  neighbourNoteKm: string;
  source: "gemma4" | "template";
  validated: boolean;
  reason?: string;
};

export type LlmStatus =
  | { state: "idle" }
  | { state: "unsupported"; reason: string }
  | { state: "loading"; progress: string }
  | { state: "ready" }
  | { state: "error"; reason: string };
