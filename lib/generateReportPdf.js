import { jsPDF } from "jspdf";
import { REPORT_SECTIONS } from "./reportSections";
import { HOUSE_SHAPES, signIndexForHouse } from "./kundliChartGeometry";
import {
  PLANET_ABBR,
  PLANET_NAMES,
  getRashiName,
  getNakshatraInfo,
  describeAscendant,
  describeNakshatraLord,
  describePlanetInSign,
  describeHouse,
  describeVenusNavamsa,
  getHouseMeaning,
  findStelliumHouses,
} from "./vedicKnowledge";

const PLANET_ORDER = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu", "ketu"];

function ordinalSuffix(n) {
  if (n % 100 >= 11 && n % 100 <= 13) return "th";
  switch (n % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

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

const PALM_SNAPSHOT_TITLE = { en: "Your Palm at a Glance", hi: "आपकी हथेली एक नज़र में" };
const BIRTH_CHART_TITLE = { en: "Your Birth Chart (Kundli)", hi: "आपकी जन्म कुंडली" };
const ASCENDANT_TITLE = { en: "Your Ascendant", hi: "आपकी लग्न" };
const PLANET_BY_PLANET_TITLE = { en: "Planet-by-Planet", hi: "ग्रह-दर-ग्रह विश्लेषण" };
const HOUSE_MAP_TITLE = { en: "Your Twelve-House Life Map", hi: "आपके बारह भावों का जीवन मानचित्र" };
const NAVAMSA_TITLE = { en: "Navamsa (D9): Relationships & Deeper Values", hi: "नवांश (D9): रिश्ते और गहरे मूल्य" };
const NAVAMSA_INTRO = {
  en: "Beyond the main D1 chart, classical Vedic astrology uses the Navamsa (D9) — a finer subdivision of each planet's exact degree — to examine marriage, relationships, and the values a person holds beneath their surface personality. Here is where each of your planets falls in the D9:",
  hi: "मुख्य D1 कुंडली के अलावा, पारंपरिक वैदिक ज्योतिष नवांश (D9) का उपयोग करता है — हर ग्रह के सटीक अंश का एक सूक्ष्म उपविभाजन — जो विवाह, रिश्तों, और व्यक्ति की सतही प्रकृति के नीचे छिपे मूल्यों की जांच करता है। यहाँ आपके हर ग्रह की D9 स्थिति दी गई है:",
};
const NAVAMSA_TABLE_HEADERS = { en: ["Graha", "D1 Rashi", "D9 Rashi"], hi: ["ग्रह", "D1 राशि", "D9 राशि"] };
const NOTABLE_PLACEMENTS_TITLE = { en: "Your Most Active House", hi: "आपका सबसे सक्रिय भाव" };
const CLOSING_TITLE = { en: "Bringing It Together", hi: "सार रूप में" };
const METHODOLOGY_TITLE = { en: "How This Report Was Prepared", hi: "यह रिपोर्ट कैसे तैयार की गई" };

const TABLE_HEADERS = {
  en: ["Graha", "Rashi", "Degree", "House"],
  hi: ["ग्रह", "राशि", "अंश", "भाव"],
};

const CHART_BASIS_NOTE = {
  lagna: {
    en: "Based on your exact birth time (Ascendant / Lagna chart).",
    hi: "आपके सटीक जन्म समय पर आधारित (लग्न कुंडली)।",
  },
  moon: {
    en: "An exact birth time and place weren't both available, so this chart is based on your Moon sign instead of the Ascendant.",
    hi: "सटीक जन्म समय और स्थान दोनों उपलब्ध नहीं थे, इसलिए यह कुंडली लग्न के बजाय आपकी चंद्र राशि पर आधारित है।",
  },
};

const METHODOLOGY_TEXT = {
  en: "This report combines three inputs: your hand's real, measured shape (classified privately in your browser — the photo itself is never uploaded), a sidereal Vedic birth chart computed from your birth date, time, and place using standard astronomical calculations (Lahiri-equivalent ayanamsha, whole-sign houses), and narrative commentary written using both. The chart's planetary positions and Ascendant are genuinely computed, not invented — when an exact birth time wasn't available, the chart falls back to a Moon-sign basis rather than guessing an Ascendant. Vedic astrology is a traditional interpretive system passed down over centuries, not a scientifically validated predictive method. Nothing in this report should be treated as certain, and no decision — financial, medical, legal, or personal — should be made on this basis alone.",
  hi: "यह रिपोर्ट तीन आधारों को जोड़ती है: आपकी हथेली की वास्तविक, मापी गई आकृति (आपके ब्राउज़र में निजी तौर पर वर्गीकृत — फ़ोटो कभी अपलोड नहीं होती), आपकी जन्म तिथि, समय और स्थान से मानक खगोलीय गणनाओं (लाहिड़ी-समकक्ष अयनांश, समान-राशि भाव पद्धति) का उपयोग करके गणना की गई एक सायन वैदिक जन्म कुंडली, और दोनों के आधार पर लिखी गई व्याख्या। कुंडली के ग्रहों की स्थिति और लग्न वास्तव में गणना की गई हैं, गढ़ी नहीं गई — जब सटीक जन्म समय उपलब्ध नहीं था, तो कुंडली लग्न का अनुमान लगाने के बजाय चंद्र राशि पर आधारित कर दी गई। वैदिक ज्योतिष सदियों से चली आ रही एक पारंपरिक व्याख्यात्मक प्रणाली है, कोई वैज्ञानिक रूप से सिद्ध भविष्यवाणी पद्धति नहीं। इस रिपोर्ट में किसी भी बात को निश्चित न मानें, और केवल इसके आधार पर कोई भी वित्तीय, चिकित्सीय, कानूनी या व्यक्तिगत निर्णय न लें।",
};

// jsPDF's built-in fonts (helvetica/times) have no Devanagari glyphs — a
// Hindi report rendered with them silently prints blank boxes/nothing. Mukta
// (same family already used for Hindi UI on-site) is embedded as a real TTF
// via addFileToVFS/addFont so Hindi PDFs actually render body text. The
// base64 font data (~1.1MB combined) is dynamically imported so English
// downloads — the common case — never pull it into their bundle/request.
async function registerHindiFont(doc) {
  const [{ MUKTA_REGULAR_BASE64 }, { MUKTA_BOLD_BASE64 }] = await Promise.all([
    import("./fonts/muktaRegularBase64"),
    import("./fonts/muktaBoldBase64"),
  ]);
  doc.addFileToVFS("Mukta-Regular.ttf", MUKTA_REGULAR_BASE64);
  doc.addFont("Mukta-Regular.ttf", "Mukta", "normal");
  doc.addFileToVFS("Mukta-Bold.ttf", MUKTA_BOLD_BASE64);
  doc.addFont("Mukta-Bold.ttf", "Mukta", "bold");
}

// jsPDF's doc.text() never auto-paginates — dumping every wrapped line at one
// Y position just runs content off the bottom of the page and clips it
// silently. Everything below is built around a manually tracked Y cursor
// that inserts a page break (with a repeated slim header) whenever the next
// block wouldn't fit, which is the actual fix for that.
async function buildDoc({ brand, tagline, name, sections, snapshot, chart, reportText, lang = "en" }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN * 2;
  const footerText = FOOTER_TEXT[lang] || FOOTER_TEXT.en;

  // Mukta has no bundled italic, and Times/Helvetica have no Devanagari —
  // so Hindi body copy renders in Mukta throughout (regular/bold only,
  // hook lines use color instead of italic for emphasis).
  const bodyFont = lang === "hi" ? "Mukta" : "helvetica";
  const headingFont = lang === "hi" ? "Mukta" : "times";
  if (lang === "hi") await registerHindiFont(doc);

  let y = 0;

  function drawFooter() {
    doc.setFont(bodyFont, "normal");
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
    doc.setFont(bodyFont, "bold");
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
    doc.setFont(headingFont, "bold");
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
      doc.setFont(bodyFont, lang === "hi" ? "bold" : "italic");
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
      doc.setFont(bodyFont, "normal");
      doc.setFontSize(11);
      doc.setTextColor(...INK);
      doc.text(line, MARGIN, y);
      y += 16.5;
    });
  }

  function drawYearRow(yearVal, theme, insight) {
    doc.setFont(bodyFont, "normal");
    doc.setFontSize(11);
    const themeLines = doc.splitTextToSize(theme, contentWidth - 56);
    const insightLines = insight ? doc.splitTextToSize(insight, contentWidth - 56) : [];
    const blockHeight = themeLines.length * 15 + insightLines.length * 14.5 + 6;
    ensureSpace(Math.max(20, blockHeight));
    doc.setFont(bodyFont, "bold");
    doc.setFontSize(12);
    doc.setTextColor(...MAROON);
    doc.text(String(yearVal), MARGIN, y);
    doc.setFont(bodyFont, "normal");
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text(themeLines, MARGIN + 52, y);
    let localY = y + themeLines.length * 15;
    if (insightLines.length) {
      doc.setFont(bodyFont, "normal");
      doc.setFontSize(10);
      doc.setTextColor(...INK_SOFT);
      doc.text(insightLines, MARGIN + 52, localY);
      localY += insightLines.length * 14.5;
    }
    y = Math.max(localY, y + 20) + 6;
  }

  // Draws the North Indian diamond chart using the exact same house-shape
  // geometry as the on-site SVG (lib/kundliChartGeometry.js) — scaled from
  // its 0-300 reference box into the PDF's content width, so the two
  // renderings can never show a different chart.
  function drawKundliChart(chart) {
    if (!chart || chart.houseBaseSignIndex == null) return;
    const boxSize = 220;
    ensureSpace(boxSize + 20);
    const offsetX = MARGIN + (contentWidth - boxSize) / 2;
    const offsetY = y;
    const scale = boxSize / 300;
    const scalePt = ([px, py]) => [offsetX + px * scale, offsetY + py * scale];

    const planetsByHouse = {};
    Object.entries(chart.planets || {}).forEach(([key, data]) => {
      if (!data || data.house == null) return;
      if (!planetsByHouse[data.house]) planetsByHouse[data.house] = [];
      planetsByHouse[data.house].push(PLANET_ABBR[key]?.[lang] || key);
    });

    doc.setDrawColor(...MAROON_DEEP);
    doc.setLineWidth(1);
    Object.values(HOUSE_SHAPES).forEach((shape) => {
      const pts = shape.points.map(scalePt);
      for (let i = 0; i < pts.length; i++) {
        const [x1, y1] = pts[i];
        const [x2, y2] = pts[(i + 1) % pts.length];
        doc.line(x1, y1, x2, y2);
      }
    });

    Object.entries(HOUSE_SHAPES).forEach(([houseNum, shape]) => {
      const signIndex = signIndexForHouse(chart.houseBaseSignIndex, Number(houseNum));
      const [ax, ay] = scalePt(shape.anchor);
      doc.setFont(bodyFont, "normal");
      doc.setFontSize(9);
      doc.setTextColor(...INK_SOFT);
      doc.text(String(signIndex + 1), ax, ay - 4, { align: "center" });
      const planetLabels = planetsByHouse[houseNum];
      if (planetLabels?.length) {
        doc.setFont(bodyFont, "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(...MAROON);
        doc.text(planetLabels.join(" "), ax, ay + 9, { align: "center" });
      }
    });

    y = offsetY + boxSize + 20;
  }

  function drawPlanetTable(chart) {
    if (!chart) return;
    const headers = TABLE_HEADERS[lang] || TABLE_HEADERS.en;
    const colX = [MARGIN, MARGIN + 110, MARGIN + 230, MARGIN + 330];

    ensureSpace(24);
    doc.setFont(bodyFont, "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...MAROON_DEEP);
    headers.forEach((h, i) => doc.text(h, colX[i], y));
    y += 8;
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.8);
    doc.line(MARGIN, y, MARGIN + contentWidth, y);
    y += 16;

    PLANET_ORDER.forEach((key) => {
      const data = chart.planets?.[key];
      if (!data) return;
      ensureSpace(20);
      doc.setFont(bodyFont, "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(...INK);
      doc.text(PLANET_NAMES[key]?.[lang] || key, colX[0], y);
      doc.text(getRashiName(data.signIndex, lang), colX[1], y);
      doc.text(`${data.degreeInSign.toFixed(2)}°`, colX[2], y);
      doc.text(data.house != null ? String(data.house) : "—", colX[3], y);
      y += 19;
    });
    y += 12;
  }

  drawCoverHeader();

  if (snapshot) {
    drawSectionHeading(PALM_SNAPSHOT_TITLE[lang] || PALM_SNAPSHOT_TITLE.en);
    drawParagraph(`${snapshot.handShape.label}: ${snapshot.handShape.text}`);
    y += 10;
    drawParagraph(snapshot.heartLine.text);
    y += 10;
    drawParagraph(snapshot.fateLine.text);
    y += 22;
  }

  // Everything from here to the Path Ahead section is PDF-exclusive content
  // built on the real computed chart — the diagram/table are also shown
  // free on-site, but the Ascendant analysis, full planet-by-planet
  // breakdown, and notable-placement note are deliberately PDF-only, part
  // of what makes the paid report substantially more than the site preview.
  if (chart) {
    drawSectionHeading(BIRTH_CHART_TITLE[lang] || BIRTH_CHART_TITLE.en);
    const basisNote = CHART_BASIS_NOTE[chart.chartBasis]?.[lang];
    if (basisNote) {
      doc.setFont(bodyFont, lang === "hi" ? "bold" : "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(...INK_SOFT);
      const lines = doc.splitTextToSize(basisNote, contentWidth);
      lines.forEach((line) => {
        ensureSpace(14);
        doc.text(line, MARGIN, y);
        y += 13;
      });
      y += 10;
    }
    drawKundliChart(chart);
    drawPlanetTable(chart);

    if (chart.ascendantSignIndex != null) {
      drawSectionHeading(ASCENDANT_TITLE[lang] || ASCENDANT_TITLE.en);
      drawParagraph(describeAscendant(chart.ascendantSignIndex, lang));
      y += 12;
    }
    if (chart.nakshatra) {
      drawParagraph(describeNakshatraLord(chart.nakshatra.index, lang));
      y += 18;
    }

    drawSectionHeading(PLANET_BY_PLANET_TITLE[lang] || PLANET_BY_PLANET_TITLE.en);
    PLANET_ORDER.forEach((key) => {
      const data = chart.planets?.[key];
      if (!data) return;
      drawParagraph(describePlanetInSign(key, data.signIndex, lang, data.house));
      y += 10;
    });
    y += 12;

    if (chart.houseBaseSignIndex != null) {
      const planetsByHouse = {};
      Object.entries(chart.planets || {}).forEach(([key, data]) => {
        if (!data || data.house == null) return;
        if (!planetsByHouse[data.house]) planetsByHouse[data.house] = [];
        planetsByHouse[data.house].push(key);
      });
      drawSectionHeading(HOUSE_MAP_TITLE[lang] || HOUSE_MAP_TITLE.en);
      for (let houseNum = 1; houseNum <= 12; houseNum++) {
        const signIndex = signIndexForHouse(chart.houseBaseSignIndex, houseNum);
        drawParagraph(describeHouse(houseNum, signIndex, planetsByHouse[houseNum], lang));
        y += 8;
      }
      y += 14;
    }

    drawSectionHeading(NAVAMSA_TITLE[lang] || NAVAMSA_TITLE.en);
    drawParagraph(NAVAMSA_INTRO[lang] || NAVAMSA_INTRO.en);
    y += 12;
    const navHeaders = NAVAMSA_TABLE_HEADERS[lang] || NAVAMSA_TABLE_HEADERS.en;
    const navColX = [MARGIN, MARGIN + 140, MARGIN + 280];
    ensureSpace(24);
    doc.setFont(bodyFont, "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...MAROON_DEEP);
    navHeaders.forEach((h, i) => doc.text(h, navColX[i], y));
    y += 8;
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.8);
    doc.line(MARGIN, y, MARGIN + contentWidth, y);
    y += 16;
    PLANET_ORDER.forEach((key) => {
      const data = chart.planets?.[key];
      if (!data || data.navamsaSignIndex == null) return;
      ensureSpace(20);
      doc.setFont(bodyFont, "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(...INK);
      doc.text(PLANET_NAMES[key]?.[lang] || key, navColX[0], y);
      doc.text(getRashiName(data.signIndex, lang), navColX[1], y);
      doc.text(getRashiName(data.navamsaSignIndex, lang), navColX[2], y);
      y += 19;
    });
    y += 12;
    if (chart.planets?.venus) {
      drawParagraph(describeVenusNavamsa(chart.planets.venus.navamsaSignIndex, lang));
      y += 18;
    }
  }

  if (sections) {
    REPORT_SECTIONS.forEach((s) => {
      const data = sections[s.id];
      if (!data) return;
      drawSectionHeading(s.title[lang] || s.title.en);
      drawHook(data.hook);
      if (s.kind === "timeline") {
        (data.years || []).forEach((yr) => drawYearRow(yr.year, yr.theme, yr.insight));
      } else if (data.preview || data.deepDive) {
        drawParagraph(data.preview);
        if (data.deepDive) {
          y += 6;
          drawParagraph(data.deepDive);
        }
      } else {
        // Legacy fallback for pre-restructure report rows.
        drawParagraph(data.body);
      }
      y += 22;
    });

    if (chart) {
      const stelliums = findStelliumHouses(chart.planets);
      if (stelliums.length) {
        drawSectionHeading(NOTABLE_PLACEMENTS_TITLE[lang] || NOTABLE_PLACEMENTS_TITLE.en);
        stelliums.forEach((s) => {
          const meaning = getHouseMeaning(s.house, lang);
          const planetList = s.planetKeys.map((k) => PLANET_NAMES[k]?.[lang] || k).join(lang === "hi" ? " और " : " and ");
          const note =
            lang === "hi"
              ? `आपकी कुंडली में ${planetList} एक साथ आपके ${s.house}वें भाव में हैं — जो ${meaning} से जुड़ा है। पारंपरिक रूप से, एक ही भाव में कई ग्रहों का इकट्ठा होना जीवन की काफ़ी ऊर्जा को उसी एक क्षेत्र में केंद्रित कर देता है, जिससे यह आपकी कुंडली के सबसे सक्रिय हिस्सों में से एक बन जाता है।`
              : `${planetList} sit together in your ${s.house}${ordinalSuffix(s.house)} house — the house of ${meaning}. Traditionally, multiple planets sharing one house concentrate a significant share of life's energy into that single area, making it one of the most active parts of your chart.`;
          drawParagraph(note);
          y += 12;
        });
        y += 6;
      }
    }

    if (sections.closingSynthesis) {
      drawSectionHeading(CLOSING_TITLE[lang] || CLOSING_TITLE.en);
      drawParagraph(sections.closingSynthesis);
      y += 22;
    }

    drawSectionHeading(METHODOLOGY_TITLE[lang] || METHODOLOGY_TITLE.en);
    drawParagraph(METHODOLOGY_TEXT[lang] || METHODOLOGY_TEXT.en);
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
// manual re-download button). Async because buildDoc lazy-loads the Hindi
// font when lang is "hi".
export async function generateReportPdf(params) {
  const doc = await buildDoc(params);
  doc.save(`${params.brand}-reading.pdf`);
}

// Returns the same PDF as a base64 string, for attaching to the confirmation
// email — no duplicated layout logic, same document either way.
//
// jsPDF has no "base64" output type (that string was silently a no-op,
// returning undefined) — the correct type for this is "datauristring", which
// returns a full "data:application/pdf;filename=...;base64,XXXX" URI that
// needs the prefix stripped to get the raw base64 payload Resend expects.
export async function generateReportPdfBase64(params) {
  const doc = await buildDoc(params);
  const dataUri = doc.output("datauristring");
  return dataUri.split(",")[1] || "";
}
