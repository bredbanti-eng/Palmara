// Illustrative "X unlocked today" counter for the unlock panel — NOT derived
// from real purchase data. Deterministic per calendar day (same number all
// day, changes tomorrow) so it doesn't look glitchy jumping around on every
// refresh. Added at explicit stakeholder request, despite this repo's usual
// stance against fabricated stats — see conversation history if revisiting.
export function getTodaysUnlockCount() {
  const dayKey = new Date().toISOString().slice(0, 10);
  let seed = 0;
  for (let i = 0; i < dayKey.length; i++) {
    seed = (seed * 31 + dayKey.charCodeAt(i)) >>> 0;
  }
  const min = 42;
  const max = 96;
  return min + (seed % (max - min + 1));
}
