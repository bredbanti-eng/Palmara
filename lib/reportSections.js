// Canonical structure for a generated reading. Both the Gemini prompt (which
// asks for exactly these keys as JSON) and the report UI (which needs fixed,
// pre-translated headings rather than model-generated ones, for reliability)
// read from this single list so they can never drift apart.
//
// Every section carries a "hook" — a short, always-visible teaser line shown
// above the blurred/locked body, written specifically to build curiosity.
// Five sections are "prose" (hook + paragraph body); path_ahead is a
// "timeline" (hook + a list of {year, theme} entries, first one visible).
export const REPORT_SECTIONS = [
  {
    id: "personality",
    kind: "prose",
    title: { en: "Your Core Personality & Life Path", hi: "आपका मूल स्वभाव और जीवन पथ" },
    brief: {
      en: "their core nature and life path, grounded in hand shape and heart/fate line",
      hi: "हाथ की आकृति और हृदय/भाग्य रेखा पर आधारित उनका मूल स्वभाव और जीवन पथ",
    },
  },
  {
    id: "career",
    kind: "prose",
    title: { en: "Career & Ambition", hi: "करियर और महत्वाकांक्षा" },
    brief: {
      en: "professional direction, ambition, and leadership style",
      hi: "व्यावसायिक दिशा, महत्वाकांक्षा और नेतृत्व शैली",
    },
  },
  {
    id: "wealth",
    kind: "prose",
    title: { en: "Wealth & Money", hi: "धन और समृद्धि" },
    brief: {
      en: "money mindset, financial instincts, and traditional wealth-related indicators",
      hi: "धन के प्रति सोच, वित्तीय प्रवृत्ति, और पारंपरिक धन-संकेत",
    },
  },
  {
    id: "love",
    kind: "prose",
    title: { en: "Love & Relationships", hi: "प्रेम और रिश्ते" },
    brief: {
      en: "relationship patterns, emotional style, and compatibility themes",
      hi: "रिश्तों के पैटर्न, भावनात्मक शैली, और अनुकूलता से जुड़े विषय",
    },
  },
  {
    id: "challenges",
    kind: "prose",
    title: { en: "Challenges & Growth", hi: "चुनौतियाँ और विकास" },
    brief: {
      en: "growth areas and patterns worth self-reflection, framed constructively",
      hi: "आत्म-चिंतन योग्य विकास के क्षेत्र और पैटर्न, सकारात्मक ढंग से प्रस्तुत",
    },
  },
  {
    id: "path_ahead",
    kind: "timeline",
    title: { en: "Your Path Ahead", hi: "आपका आगे का मार्ग" },
    brief: {
      en: "5 upcoming years, each with a short one-line traditional theme — not a certain date or event, a reflective possibility",
      hi: "आने वाले 5 वर्ष, हर एक के लिए एक संक्षिप्त पारंपरिक विषय — कोई निश्चित घटना नहीं, एक चिंतनशील संभावना",
    },
  },
];

function flattenOne(s, data, lang) {
  const title = s.title[lang];
  if (s.kind === "timeline") {
    const years = (data.years || [])
      .map((y) => `${y.year} — ${y.theme}${y.insight ? `\n${y.insight}` : ""}`)
      .join("\n\n");
    return `${title}\n\n${data.hook}\n\n${years}`;
  }
  // preview/deepDive is the current shape; body is kept as a fallback for
  // any legacy pre-restructure rows still sitting in the database.
  const body = data.preview || data.deepDive ? [data.preview, data.deepDive].filter(Boolean).join("\n\n") : data.body;
  return `${title}\n\n${data.hook}\n\n${body}`;
}

// Flattens a sections object into one plain-text block with headings — used
// for the PDF/email export and as the storage format for full_text (always
// English, regardless of the report's language).
export function flattenSections(sections, lang = "en") {
  return REPORT_SECTIONS.map((s) => flattenOne(s, sections[s.id], lang)).join("\n\n---\n\n");
}
