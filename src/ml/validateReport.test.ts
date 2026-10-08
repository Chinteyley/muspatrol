import { describe, expect, it } from "vitest";
import { validateReport } from "./validateReport";
import type { PatrolItem } from "../types";

function item(partial: Partial<PatrolItem>): PatrolItem {
  return {
    id: "1",
    labelId: "bucket",
    water: true,
    actions: ["TIP", "SCRUB"],
    confirmedAt: 0,
    source: "sample",
    ...partial,
  };
}

describe("validateReport", () => {
  it("accepts a report that only mentions logged containers", () => {
    const check = validateReport(
      "Tipped one plastic bucket. Screen-on 40s.",
      [item({})],
    );
    expect(check.ok).toBe(true);
  });

  it("rejects an invented tire", () => {
    const check = validateReport("Also flipped a tire behind the shop.", [
      item({}),
    ]);
    expect(check.ok).toBe(false);
    expect(check.reason).toMatch(/tire/);
  });

  it("rejects empty model output", () => {
    expect(validateReport("   ", [item({})]).ok).toBe(false);
  });
});
