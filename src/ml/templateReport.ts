import { labelName } from "../rules/rules";
import type { PatrolItem, ReportResult } from "../types";

function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}m${String(s).padStart(2, "0")}s` : `${s}s`;
}

export function templateReport(
  items: PatrolItem[],
  screenOnMs: number,
): ReportResult {
  const real = items.filter((item) => item.labelId !== "grass");
  const wet = real.filter((item) => item.water);
  const grass = items.some((item) => item.labelId === "grass");

  const lines = [
    `Patrol done. ${real.length} container${real.length === 1 ? "" : "s"}, ${wet.length} with water.`,
    real.length === 0
      ? grass
        ? "Mostly grass. That still counts as touching it."
        : "Didn't clock a nursery this round. The street is watching."
      : real
          .slice(0, 4)
          .map((item) => {
            const name = labelName(item.labelId).en;
            const act = item.actions.filter((a) => a !== "NONE").join("+") || "LOOK";
            return `${act} the ${name}.`;
          })
          .join(" "),
    `Screen-on ${formatDuration(screenOnMs)}. Phone back in the pocket.`,
    "Mosquitoes: evicted. Grass: wet. Not medical advice.",
  ];

  const neighbour = pickNeighbour(items);
  return {
    report: lines.join("\n"),
    neighbourNoteEn: neighbour.en,
    neighbourNoteKm: neighbour.km,
    source: "template",
    validated: true,
    reason: "deterministic template",
  };
}

function pickNeighbour(items: PatrolItem[]): { en: string; km: string } {
  const tire = items.find((item) => item.labelId === "tire");
  if (tire) {
    return {
      en: "Bong, your old tire is running a mosquito daycare. Recycle it, or drill holes so it cannot hold rain.",
      km: "Bong, sambek kang chas. Sohm bos chol reu khuong rong lu.",
    };
  }
  const jar = items.find((item) => item.labelId === "jar");
  if (jar) {
    return {
      en: "Bong, lid on the peang / barrel this week? Aedes treats an open rim like a lease.",
      km: "Bong, sohm kroab peang. Mouh peang trouv mean komrab.",
    };
  }
  const saucer = items.find((item) => item.labelId === "saucer");
  if (saucer) {
    return {
      en: "Bong, the saucer under the pot is a tiny pool. Tip it, or fill it with sand.",
      km: "Bong, chan kraom pheng mean teuk. Chak chol, reu dak khsach.",
    };
  }
  if (items.some((item) => item.labelId === "discard")) {
    return {
      en: "Bong, coconut shells and bottles after rain = free rent for mosquitoes. Bin them.",
      km: "Bong, sambok doung ning dop. Sohm bos chol.",
    };
  }
  return { en: "", km: "" };
}
