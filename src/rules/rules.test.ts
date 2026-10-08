import { describe, expect, it } from "vitest";
import { decideOrder } from "./rules";

describe("decideOrder", () => {
  it("tips and scrubs a wet bucket", () => {
    expect(decideOrder("bucket", true).actions).toEqual(["TIP", "SCRUB"]);
  });

  it("does not let a dry jar skip the lid", () => {
    expect(decideOrder("jar", false).actions).toEqual(["COVER"]);
  });

  it("never tosses a spirit-house offering", () => {
    expect(decideOrder("shrine", true).actions).toEqual(["CHANGE"]);
  });

  it("treats grass as a look, not a health action", () => {
    expect(decideOrder("grass", false).actions).toEqual(["NONE"]);
  });

  it("reports public drains instead of asking you to wade in", () => {
    expect(decideOrder("drain", true).actions).toEqual(["REPORT"]);
  });
});
