// Classifies a hand into one of four traditional palmistry hand-shape types
// (Earth / Air / Fire / Water) using the ratio of finger length to palm
// length — a real, measurable geometric ratio from the detected landmarks.
export function classifyHandShape(landmarks) {
  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  const middleTip = landmarks[12];

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const palmLength = dist(wrist, middleMcp);
  const fingerLength = dist(middleMcp, middleTip);
  const ratio = fingerLength / palmLength;

  if (ratio < 0.75) return "earth";
  if (ratio < 0.95) return "air";
  if (ratio < 1.15) return "fire";
  return "water";
}

// A small deterministic seed from the landmarks so the same photo always
// produces a consistent reading, without ever storing the photo itself.
export function seedFromLandmarks(landmarks) {
  let seed = 0;
  for (const p of landmarks) {
    seed += Math.round(p.x * 1000) + Math.round(p.y * 1000);
  }
  return seed % 100000;
}
