export const ALGORITHM_VERSION = "v1.1";

export type Source = "NBME" | "UWSA_1" | "UWSA_2" | "FREE_120" | "AMBOSS" | "CMS";
export type Step = "STEP_1" | "STEP_2" | "STEP_3";

const anchors: Record<Step, ReadonlyArray<readonly [number, number]>> = {
  STEP_1: [[200,198],[220,215],[240,232],[260,245],[280,256],[300,264]],
  STEP_2: [[200,218],[220,232],[240,248],[260,260],[280,270],[300,277]],
  STEP_3: [[200,200],[220,213],[240,226],[260,240],[280,252],[300,260]],
};

const formBias: Record<number, number> = { 28: -3, 29: -1, 30: 0, 31: 0, 32: 1 };

export function convert(source: Source, score: number, step: Step, form?: number): number {
  if (!Number.isFinite(score)) throw new Error("score must be finite");
  const points = anchors[step];
  switch (source) {
    case "NBME": return interpolate(points, score + (form === undefined ? 0 : (formBias[form] ?? 0)));
    case "UWSA_1": return interpolate(points, score - 5);
    case "UWSA_2": return interpolate(points, score - 2);
    case "FREE_120": return percent(score, step, false);
    case "AMBOSS": return percent(score, step, true);
    case "CMS": return score >= 150 ? interpolate(points, score) : percent(score, step, false);
  }
}

function percent(value: number, step: Step, amboss: boolean): number {
  const base: Record<Step, number> = { STEP_1: 232, STEP_2: 248, STEP_3: 226 };
  return Math.round(base[step] + value - 75 - (amboss ? 5 : 0));
}

function interpolate(points: ReadonlyArray<readonly [number, number]>, value: number): number {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) throw new Error("missing anchors");
  if (value <= first[0]) return first[1];
  if (value >= last[0]) return last[1];
  for (let index = 0; index < points.length - 1; index += 1) {
    const lower = points[index];
    const upper = points[index + 1];
    if (lower && upper && value >= lower[0] && value <= upper[0]) {
      const ratio = (value - lower[0]) / (upper[0] - lower[0]);
      return Math.round(lower[1] + ratio * (upper[1] - lower[1]));
    }
  }
  throw new Error("unreachable interpolation range");
}
