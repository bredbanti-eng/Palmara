// North Indian style Kundli diagram: a fixed square divided into 12
// compartments (houses always sit in the same geometric position — the
// "kite" shapes at the 4 cardinal points are houses 1/4/7/10, the 8 corner
// triangles are the rest). Only the RASHI NUMBER written inside each house
// changes, based on the Ascendant. Coordinates are derived analytically
// (not eyeballed) on a 0-300 box: the two square diagonals and the diamond
// connecting the four edge-midpoints divide the square into exactly these
// 12 regions. Both the web SVG (VedicChartDiagram) and the PDF drawer
// (lib/generateReportPdf.js) scale this same box, so the two renderings can
// never drift apart.
export const BOX_SIZE = 300;

const TL = [0, 0];
const TR = [300, 0];
const BR = [300, 300];
const BL = [0, 300];
const N = [150, 0];
const E = [300, 150];
const S = [150, 300];
const W = [0, 150];
const C = [150, 150];
const mWN = [75, 75];
const mNE = [225, 75];
const mES = [225, 225];
const mSW = [75, 225];

// House number (1-12, fixed geometric position, Ascendant-independent) ->
// polygon points and a label anchor point for the rashi number/planet text.
export const HOUSE_SHAPES = {
  1: { points: [mWN, N, mNE, C], anchor: [150, 55] },
  2: { points: [TL, N, mWN], anchor: [80, 25] },
  3: { points: [TL, mWN, W], anchor: [25, 80] },
  4: { points: [mWN, W, mSW, C], anchor: [75, 150] },
  5: { points: [W, mSW, BL], anchor: [25, 220] },
  6: { points: [mSW, S, BL], anchor: [80, 275] },
  7: { points: [mSW, S, mES, C], anchor: [150, 245] },
  8: { points: [S, mES, BR], anchor: [220, 275] },
  9: { points: [mES, E, BR], anchor: [275, 220] },
  10: { points: [mES, E, mNE, C], anchor: [225, 150] },
  11: { points: [E, mNE, TR], anchor: [275, 80] },
  12: { points: [mNE, N, TR], anchor: [220, 25] },
};

export function polygonToPath(points) {
  return `M ${points.map((p) => p.join(",")).join(" L ")} Z`;
}

// House N always holds the sign (ascendantSignIndex + N - 1) mod 12 — signs
// advance in order starting from the Ascendant's own sign in house 1.
export function signIndexForHouse(ascendantSignIndex, houseNumber) {
  return (ascendantSignIndex + houseNumber - 1) % 12;
}
