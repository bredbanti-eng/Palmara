// Rendered from the actual brand mark (extracted from Palmara.pdf), not a
// hand-drawn approximation — keeps the header logo and any dark-background
// use pixel-faithful to the source art instead of redrawing its curves.
export default function PalmaraIcon({ size = 32, reversed = false, alt = "" }) {
  const src = reversed ? "/logo-mark-reversed.png" : "/logo-mark.png";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} width={size} height={size} alt={alt} style={{ display: "block" }} />
  );
}
