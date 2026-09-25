// Pure data, no dependencies — safe to import from both server code
// (lib/vedicChart.js, which also pulls in the server-only ephemeris
// library) and client components (VedicChartDiagram, vedicKnowledge.js),
// without dragging that server-only dependency into the browser bundle.
export const SIGN_KEYS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];
