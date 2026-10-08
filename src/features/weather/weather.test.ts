import { describe, expect, it } from "vitest";
import { formatHorizon, parseIct, rainLast3h } from "./usePatrolWindow";

describe("rainLast3h", () => {
  it("sums only the last three hours", () => {
    const now = Date.parse("2026-10-09T17:00:00.000Z");
    const sum = rainLast3h(
      {
        time: [
          "2026-10-09T13:00:00.000Z",
          "2026-10-09T15:00:00.000Z",
          "2026-10-09T16:00:00.000Z",
          "2026-10-09T17:00:00.000Z",
        ],
        precipitation: [9, 1.2, 0.4, 0],
      },
      now,
    );
    expect(sum).toBe(1.6);
  });

  it("treats Open-Meteo local stamps as ICT", () => {
    expect(parseIct("2026-10-09T17:45") - parseIct("2026-10-09T17:45+07:00")).toBe(0);
  });

  it("formats long horizons as hours", () => {
    expect(formatHorizon(1014)).toBe("16h 54m");
  });
});
