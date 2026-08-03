import { describe, expect, it } from "vitest";
import { convert } from "../src/calculate";

describe("convert", () => {
  it("matches the Step 2 baseline", () => {
    expect(convert("NBME", 240, "STEP_2", 30)).toBe(248);
    expect(convert("UWSA_1", 250, "STEP_2")).toBe(251);
    expect(convert("UWSA_2", 250, "STEP_2")).toBe(253);
    expect(convert("FREE_120", 75, "STEP_2")).toBe(248);
    expect(convert("AMBOSS", 75, "STEP_2")).toBe(243);
  });
});
