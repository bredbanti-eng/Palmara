// jsPDF has no text-shaping engine (no GSUB/GPOS) — it maps each Unicode
// codepoint straight to a glyph via the font's cmap and draws them in
// logical order. For Devanagari that's wrong on two counts: conjuncts
// (क + ् + ष -> क्ष) never form, and dependent vowel signs that are
// written before the consonant (ि) still get drawn after it, since jsPDF
// never reorders. No font fixes this — it's a rendering-pipeline gap, not
// a font-quality issue.
//
// The actual fix: let the browser's own text engine — which does full,
// correct Devanagari shaping — lay the text out on an offscreen canvas,
// then embed that as an image in the PDF instead of asking jsPDF to draw
// the text itself. This module renders single lines of Hindi text to PNG
// data URIs (and measures/wraps them) for lib/generateReportPdf.js to
// place with doc.addImage().
const FONT_FAMILY = "Noto Sans Devanagari PDF";
// jsPDF units are points; canvas font sizes are CSS pixels (96dpi vs 72dpi).
export const PT_TO_PX = 96 / 72;
// Supersample so the embedded PNG stays crisp at normal PDF zoom levels.
// 3x at 96dpi-per-scale-unit works out to 288 DPI (standard print-quality
// threshold) — 4x (384 DPI) was imperceptibly sharper but roughly doubled
// file size across a report with hundreds of individual text images.
const CANVAS_SCALE = 3;

let fontLoadPromise = null;

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

// Registers the variable font once per page load (idempotent — safe to
// call from every PDF generation). Declaring the weight range lets the
// browser interpolate the correct weight from the single variable-font
// file when the canvas font string asks for e.g. "700 11px ...".
//
// The ~640KB font is loaded via a dynamic import (not a top-level static
// one) so it only ever downloads for a Hindi PDF — an English download
// (the common case) never pulls Devanagari font data into its bundle.
export function loadHindiCanvasFont() {
  if (fontLoadPromise) return fontLoadPromise;
  fontLoadPromise = (async () => {
    const { NOTO_SANS_DEVANAGARI_BASE64 } = await import("./fonts/notoSansDevanagariBase64");
    const buffer = base64ToArrayBuffer(NOTO_SANS_DEVANAGARI_BASE64);
    const face = new FontFace(FONT_FAMILY, buffer, { weight: "100 900" });
    await face.load();
    document.fonts.add(face);
  })();
  return fontLoadPromise;
}

function fontSpec(fontPx, weight) {
  const cssWeight = weight === "bold" ? "700" : "400";
  return `${cssWeight} ${fontPx}px "${FONT_FAMILY}"`;
}

// Splits on whitespace and greedily packs words into lines that fit
// maxWidthPx — the direct analogue of jsPDF's splitTextToSize, but driven
// by the canvas's own (correctly shaped) text measurement rather than
// jsPDF's naive per-glyph width sum, so wrap decisions match what will
// actually be drawn.
export function wrapHindiText(text, maxWidthPx, { fontPx, weight = "normal" }) {
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.font = fontSpec(fontPx, weight);
  const words = (text || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines = [];
  let current = words[0];
  for (let i = 1; i < words.length; i++) {
    const trial = `${current} ${words[i]}`;
    if (ctx.measureText(trial).width <= maxWidthPx) {
      current = trial;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

// Renders one line of text to a PNG data URI, sized tightly to the text's
// own measured bounds. Returns pixel dimensions (at CANVAS_SCALE) — the
// caller converts to PDF points and positions with doc.addImage().
export function renderHindiTextImage(text, { fontPx, weight = "normal", color }) {
  const measureCtx = document.createElement("canvas").getContext("2d");
  measureCtx.font = fontSpec(fontPx, weight);
  const metrics = measureCtx.measureText(text);
  const width = Math.max(1, Math.ceil(metrics.width));
  const ascent = Math.ceil(metrics.actualBoundingBoxAscent || fontPx * 0.9);
  const descent = Math.ceil(metrics.actualBoundingBoxDescent || fontPx * 0.3);
  const height = ascent + descent + 2;

  const canvas = document.createElement("canvas");
  canvas.width = width * CANVAS_SCALE;
  canvas.height = height * CANVAS_SCALE;
  const ctx = canvas.getContext("2d");
  ctx.scale(CANVAS_SCALE, CANVAS_SCALE);
  ctx.font = fontSpec(fontPx, weight);
  ctx.fillStyle = color;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, 0, ascent);

  return { dataUrl: canvas.toDataURL("image/png"), widthPx: width, heightPx: height, ascentPx: ascent };
}
