import { jsPDF } from "jspdf";
import { REPORT_SECTIONS } from "./reportSections";

const MARGIN = 56;
const MAROON = [122, 18, 32];
const MAROON_DEEP = [89, 16, 25];
const GOLD = [184, 134, 11];
const INK = [43, 27, 18];
const INK_SOFT = [90, 69, 49];

const FOOTER_TEXT = {
  en: "This reading is for reflection and entertainment, not scientific advice.",
  hi: "यह रीडिंग चिंतन और मनोरंजन के लिए है, वैज्ञानिक सलाह नहीं।",
};

// jsPDF's doc.text() never auto-paginates — dumping every wrapped line at one
// Y position just runs content off the bottom of the page and clips it
// silently. Everything below is built around a manually tracked Y cursor
// that inserts a page break (with a repeated slim header) whenever the next
// block wouldn't fit, which is the actual fix for that.
function buildDoc({ brand, tagline, name, sections, reportText, lang = "en" }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN * 2;
  const footerText = FOOTER_TEXT[lang] || FOOTER_TEXT.en;

  let y = 0;

  function drawFooter() {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...INK_SOFT);
    doc.text(footerText, MARGIN, pageHeight - 26);
  }

  function drawCoverHeader() {
    doc.setFillColor(...MAROON);
    doc.rect(0, 0, pageWidth, 90, "F");
    doc.setTextColor(255, 245, 225);
    doc.setFont("times", "bold");
    doc.setFontSize(26);
    doc.text(brand, MARGIN, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...GOLD.map((c) => Math.min(255, c + 60)));
    doc.text(tagline, MARGIN, 70);

    y = 130;
    doc.setTextColor(...INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(name || "", MARGIN, y);
    y += 34;
  }

  function drawContinuationHeader() {
    doc.setFillColor(...MAROON_DEEP);
    doc.rect(0, 0, pageWidth, 44, "F");
    doc.setTextColor(255, 245, 225);
    doc.setFont("times", "bold");
    doc.setFontSize(13);
    doc.text(brand, MARGIN, 28);
    y = 78;
  }

  // Call before drawing any block: if it wouldn't fit in the remaining
  // space, close out the current page (footer) and start a new one.
  function ensureSpace(neededHeight) {
    if (y + neededHeight > pageHeight - 58) {
      drawFooter();
      doc.addPage();
      drawContinuationHeader();
    }
  }

  function drawSectionHeading(title) {
    ensureSpace(52);
    doc.setFont("times", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...MAROON_DEEP);
    doc.text(title, MARGIN, y);
    y += 8;
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(1.2);
    doc.line(MARGIN, y, MARGIN + 60, y);
    y += 20;
  }

  // Font/color are re-applied on every line (not just once before the loop)
  // because ensureSpace() can insert a page break mid-block, and
  // drawContinuationHeader() changes both to draw the brand bar — without
  // re-applying, a line stranded right after a page break silently inherits
  // the header's white-on-maroon color and becomes invisible on the ivory
  // page background.
  function drawHook(hook) {
    if (!hook) return;
    const lines = doc.splitTextToSize(hook, contentWidth);
    lines.forEach((line) => {
      ensureSpace(18);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(11);
      doc.setTextColor(...MAROON);
      doc.text(line, MARGIN, y);
      y += 16;
    });
    y += 8;
  }

  function drawParagraph(text) {
    const lines = doc.splitTextToSize(text || "", contentWidth);
    lines.forEach((line) => {
      ensureSpace(18);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(...INK);
      doc.text(line, MARGIN, y);
      y += 16.5;
    });
  }

  function drawYearRow(yearVal, theme) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const themeLines = doc.splitTextToSize(theme, contentWidth - 56);
    ensureSpace(Math.max(20, themeLines.length * 15) + 6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...MAROON);
    doc.text(String(yearVal), MARGIN, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text(themeLines, MARGIN + 52, y);
    y += Math.max(20, themeLines.length * 15) + 6;
  }

  drawCoverHeader();

  if (sections) {
    REPORT_SECTIONS.forEach((s) => {
      const data = sections[s.id];
      if (!data) return;
      drawSectionHeading(s.title.en);
      drawHook(data.hook);
      if (s.kind === "timeline") {
        (data.years || []).forEach((yr) => drawYearRow(yr.year, yr.theme));
      } else {
        drawParagraph(data.body);
      }
      y += 22;
    });
  } else {
    // Legacy fallback for the one pre-structured-sections report row.
    drawParagraph(reportText);
  }

  drawFooter();

  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...INK_SOFT);
    doc.text(`${p} / ${totalPages}`, pageWidth - MARGIN, pageHeight - 26, { align: "right" });
  }

  return doc;
}

// Triggers an immediate browser download (used right after payment / on the
// manual re-download button).
export function generateReportPdf(params) {
  const doc = buildDoc(params);
  doc.save(`${params.brand}-reading.pdf`);
}

// Returns the same PDF as a base64 string, for attaching to the confirmation
// email — no duplicated layout logic, same document either way.
//
// jsPDF has no "base64" output type (that string was silently a no-op,
// returning undefined) — the correct type for this is "datauristring", which
// returns a full "data:application/pdf;filename=...;base64,XXXX" URI that
// needs the prefix stripped to get the raw base64 payload Resend expects.
export function generateReportPdfBase64(params) {
  const doc = buildDoc(params);
  const dataUri = doc.output("datauristring");
  return dataUri.split(",")[1] || "";
}
