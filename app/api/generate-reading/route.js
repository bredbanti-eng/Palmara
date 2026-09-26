import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabaseClient";
import { callGeminiJSON } from "@/lib/gemini";
import { REPORT_SECTIONS, flattenSections } from "@/lib/reportSections";
import { getPalmFacts, HAND_SHAPE_TRAITS, HEART_LINE_PROMPT_TEXT, FATE_LINE_PROMPT_TEXT } from "@/lib/palmSnapshot";
import { computeVedicChart } from "@/lib/vedicChart";
import { getRashiName, getNakshatraInfo } from "@/lib/vedicKnowledge";

// Each prose section carries four distinct parts so the report reads as a
// free-preview-then-unlock progression rather than one blurred paragraph:
// hook (curiosity line) -> preview (genuinely complete free insight) ->
// teaser (names what's locked) -> deepDive (the paid specific/detailed part).
const PROSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    hook: { type: "STRING" },
    preview: { type: "STRING" },
    teaser: { type: "STRING" },
    deepDive: { type: "STRING" },
  },
  required: ["hook", "preview", "teaser", "deepDive"],
};

const TIMELINE_SCHEMA = {
  type: "OBJECT",
  properties: {
    hook: { type: "STRING" },
    years: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          year: { type: "INTEGER" },
          theme: { type: "STRING" },
          insight: { type: "STRING" },
        },
        required: ["year", "theme", "insight"],
      },
    },
  },
  required: ["hook", "years"],
};

// closingSynthesis is PDF-only (never rendered on the website) — the report
// deliberately holds back a wrap-up synthesis as one more reason the PDF is
// worth more than what's visible for free on-site.
const SECTIONS_SCHEMA = {
  type: "OBJECT",
  properties: {
    ...Object.fromEntries(REPORT_SECTIONS.map((s) => [s.id, s.kind === "timeline" ? TIMELINE_SCHEMA : PROSE_SCHEMA])),
    closingSynthesis: { type: "STRING" },
  },
  required: [...REPORT_SECTIONS.map((s) => s.id), "closingSynthesis"],
};

function buildSectionsPrompt({ handShape, seed, language, name, dob, birthTime, birthTimeUnknown, birthPlace, chart }) {
  const { heartLine: heartLineKey, fateLine: fateLineKey } = getPalmFacts(seed);
  const heartLine = HEART_LINE_PROMPT_TEXT[heartLineKey][language];
  const fateLine = FATE_LINE_PROMPT_TEXT[fateLineKey][language];
  const traits = HAND_SHAPE_TRAITS[handShape]?.[language] || HAND_SHAPE_TRAITS.earth[language];
  const timeStr = birthTimeUnknown ? (language === "hi" ? "अज्ञात" : "unknown") : birthTime;
  const currentYear = new Date().getFullYear();
  const proseSections = REPORT_SECTIONS.filter((s) => s.kind === "prose");

  // When available, ground the writing in the REAL computed sidereal chart
  // (not just the palm/seed traits) so the commentary can reference an
  // actual Ascendant/Moon sign/Nakshatra rather than only invented palm
  // details. Optional — reading generation must still work if geocoding or
  // chart computation failed for this birth place.
  let chartContext = "";
  if (chart) {
    const ascendantName = chart.ascendantSignIndex != null ? getRashiName(chart.ascendantSignIndex, language) : null;
    const moonName = chart.moonSignIndex != null ? getRashiName(chart.moonSignIndex, language) : null;
    const nak = chart.nakshatra ? getNakshatraInfo(chart.nakshatra.index, language) : null;
    const lines = [];
    if (ascendantName) lines.push(language === "hi" ? `लग्न (उदय राशि): ${ascendantName}` : `Ascendant: ${ascendantName}`);
    if (moonName) lines.push(language === "hi" ? `चंद्र राशि: ${moonName}` : `Moon sign: ${moonName}`);
    if (nak) lines.push(language === "hi" ? `नक्षत्र: ${nak.name}` : `Nakshatra: ${nak.name}`);
    if (lines.length) {
      chartContext =
        (language === "hi"
          ? "\nवास्तविक गणना की गई जन्म कुंडली (यह पहले से एक अलग मुफ़्त कार्ड में दिखाई जा चुकी है — सीधे न दोहराएं, बल्कि इसके आधार पर लिखें):\n"
          : "\nActual computed birth chart (already shown separately in a free card — don't restate it directly, write from it instead):\n") +
        lines.join("\n") +
        "\n";
    }
  }

  if (language === "hi") {
    const sectionList = proseSections.map((s, i) => `${i + 1}. "${s.id}" — ${s.title.hi}: ${s.brief.hi}`).join("\n");
    return `आप पालमारा की इन-हाउस टीम के एक वरिष्ठ ज्योतिषी हैं — सामुद्रिक शास्त्र (हस्तरेखा) और वैदिक ज्योतिष दोनों में निपुण। "${name}" नाम के ग्राहक के लिए एक गर्मजोशी भरी, आत्मविश्वास से भरी और व्यक्तिगत महसूस होने वाली रीडिंग हिंदी में लिखें। कभी भी एक AI सहायक की तरह न लिखें — कभी यह न कहें कि आप "गणना नहीं कर सकते" या आपके पास "डेटा नहीं है"। एक अनुभवी ज्योतिषी की तरह आत्मविश्वास और गर्मजोशी के साथ पारंपरिक व्याख्याएं दें।

हाथ और जन्म विवरण (ये पहले ही एक अलग मुफ़्त "पाम स्नैपशॉट" कार्ड में पाठक को दिखाए जा चुके हैं, तो नीचे के खंडों में इन्हें सीधे न दोहराएं — इसके बजाय इनके आधार पर आगे की, नई व्याख्याएं बनाएं):
- हाथ की आकृति: ${traits}
- हृदय रेखा: ${heartLine}
- भाग्य रेखा: ${fateLine}
- जन्म तिथि: ${dob}, जन्म समय: ${timeStr}, जन्म स्थान: ${birthPlace}
${chartContext}
यह रिपोर्ट दो चरणों में पढ़ी जाती है — पहले एक मुफ़्त झलक, फिर भुगतान के बाद पूरी पहुंच — इसलिए हर खंड में चार अलग-अलग हिस्से होने चाहिए, हर एक का अपना काम। हर खंड के लिए ये चारों लिखें:

- "hook" (12-20 शब्द): सबसे ऊपर एक आकर्षक, विशिष्ट, उत्सुकता जगाने वाला वाक्य — यह "preview" की शुरुआती पंक्ति को दोहराए बिना खंड की दिशा की झलक दे।
- "preview" (55-80 शब्द, 3-4 पूरे वाक्य): यह मुफ़्त सामग्री है, जिसे पाठक बिना भुगतान किए देखता है। यह वास्तव में पूर्ण, उपयोगी और विशिष्ट झलक होनी चाहिए — असली मूल्य, भरावट नहीं — कुछ ऐसा जिस पर पाठक कुछ और पढ़े बिना भी अमल कर सके। इसे किसी अधिक विशिष्ट बात की ओर एक स्वाभाविक मोड़ पर समाप्त करें, बिना अभी वह विशिष्ट बात बताए।
- "teaser" (8-14 शब्द): एक तीखा, ठोस वाक्य जो बताए कि पेवॉल के पीछे ठीक क्या छिपा है — किसी अध्याय के शीर्षक या प्रश्न जैसा, इतना विशिष्ट कि असली लगे (जैसे "आपकी भाग्य रेखा में छिपा वह एक पैटर्न जो यह समयरेखा पूरी तरह बदल देता है")। कभी सामान्य न हो ("और जानने के लिए अनलॉक करें" जैसा कुछ नहीं)।
- "deepDive" (380-440 शब्द, 4-6 छोटे पैराग्राफ): भुगतान वाली सामग्री — teaser में किया गया वादा पूरा करते हुए विशिष्ट विवरण को वास्तव में गहराई से समझाएं (केवल एक अंतर्दृष्टि नहीं — तर्क, एक ठोस उदाहरण जहाँ यह घटित होता है, एक अपवाद या बारीकी जो ध्यान देने योग्य हो, और आगे इसका क्या अर्थ है, यह सब शामिल करें), और एक स्पष्ट, व्यक्तिगत, व्यावहारिक सुझाव पर समाप्त हो जिसे पाठक तुरंत इस्तेमाल कर सके।

पांच खंड लिखें ("personality", "career", "wealth", "love", "challenges"), हर एक के लिए ऊपर बताए अनुसार hook/preview/teaser/deepDive:

${sectionList}

छठा खंड, "path_ahead", अलग है — एक 5-वर्षीय समयरेखा। दें:
- "hook": एक आकर्षक, आगे की ओर देखने वाला वाक्य।
- "years": ${currentYear} से ${currentYear + 4} तक ठीक 5 प्रविष्टियाँ, हर एक में:
  - "year": संख्या
  - "theme": मुफ़्त, 8-15 शब्द — उस वर्ष के समग्र भाव के लिए एक संक्षिप्त पारंपरिक लेबल, हर पाठक को दिखे।
  - "insight": भुगतान वाला, 45-65 शब्द — उस वर्ष के लिए विशिष्ट "क्यों" और 1-2 व्यावहारिक सुझाव, theme से अधिक ठोस।

इसके अलावा, एक "closingSynthesis" फ़ील्ड दें — 220-260 शब्दों का एक समापन पैराग्राफ जो ऊपर के सभी खंडों को एक साथ जोड़े और पाठक को एक स्पष्ट, एकीकृत भावना दे कि इस समय उनके लिए सबसे ज़्यादा मायने क्या रखता है। यह केवल PDF रिपोर्ट में दिखेगा, वेबसाइट पर नहीं — इसलिए यह पहले से कही गई बातों का सार बनकर भी नई तरह से बांधे रखने वाला होना चाहिए।

केवल मान्य JSON लौटाएं, बिल्कुल इसी आकार में, कोई अन्य पाठ नहीं:
{"personality": {"hook":"...","preview":"...","teaser":"...","deepDive":"..."}, "career": {"hook":"...","preview":"...","teaser":"...","deepDive":"..."}, "wealth": {"hook":"...","preview":"...","teaser":"...","deepDive":"..."}, "love": {"hook":"...","preview":"...","teaser":"...","deepDive":"..."}, "challenges": {"hook":"...","preview":"...","teaser":"...","deepDive":"..."}, "path_ahead": {"hook": "...", "years": [{"year": ${currentYear}, "theme": "...", "insight": "..."}, ...]}, "closingSynthesis": "..."}

कोई निश्चित भविष्यवाणी न करें — हर खंड और हर वर्ष के लिए बताएं कि यह पैटर्न परंपरागत रूप से व्यक्ति के बारे में क्या सुझाव देता है।`;
  }

  const sectionList = proseSections.map((s, i) => `${i + 1}. "${s.id}" — ${s.title.en}: ${s.brief.en}`).join("\n");
  return `You are a senior astrologer on Palmara's in-house panel — skilled in both Samudrik Shastra (palmistry) and Vedic astrology (Jyotish). Write a warm, confident, specific-feeling reading in English for a customer named "${name}". Never write like an AI assistant — never say you "cannot calculate" something or "don't have" the data. Write the way an experienced astrologer would: offering traditional interpretations with warmth and authority.

Palm & birth details (these are already shown to the reader for free in a separate "Palm Snapshot" card, so don't just restate them below — build NEW interpretation on top of them instead):
- Hand shape: ${traits}
- Heart line: ${heartLine}
- Fate line: ${fateLine}
- Date of birth: ${dob}, time of birth: ${timeStr}, place of birth: ${birthPlace}
${chartContext}
This report is read in two stages — a free preview, then a paid unlock — so each section needs FOUR distinct parts, each with a different job. Write all four for every section:

- "hook" (12-20 words): a punchy, specific curiosity-building line above everything else — teases the section's angle without repeating the preview's opening line.
- "preview" (55-80 words, 3-4 full sentences): FREE content the reader sees with no payment. This must be a genuinely complete, useful, specific mini-insight — real value, not filler — something the reader could act on even if they read nothing else. End it on a natural pivot toward something more specific, without revealing that specific thing yet.
- "teaser" (8-14 words): one sharp, concrete sentence naming exactly what's hidden behind the paywall — phrased like a chapter title or a question, specific enough to feel real (e.g. "The one habit in your fate line that changes this timeline"). Never generic ("Unlock to learn more").
- "deepDive" (380-440 words, 4-6 short paragraphs): the paid content — the specific detail promised by the teaser, explored in real depth (not just one insight — walk through the reasoning, a concrete scenario where it plays out, a counterpoint or nuance worth flagging, and what it means going forward), ending in one clear, personal, practical takeaway the reader can use.

Write five sections ("personality", "career", "wealth", "love", "challenges"), each needing hook/preview/teaser/deepDive as described above:

${sectionList}

The sixth section, "path_ahead", is different — a 5-year timeline. Give:
- "hook": one punchy, forward-looking sentence.
- "years": exactly 5 entries for ${currentYear} through ${currentYear + 4}, each with:
  - "year": the number
  - "theme": FREE, 8-15 words — a short traditional label for that year's overall flavor, shown to every reader.
  - "insight": PAID, 45-65 words — the specific "why" and 1-2 pieces of practical guidance for that year, more concrete than the theme.

Also include a "closingSynthesis" field — a 220-260 word closing paragraph that ties all the sections above together into one clear, unified sense of what matters most for this person right now. This appears ONLY in the PDF report, never on the website — so it should feel like a genuine synthesis, not a rehash.

Return ONLY valid JSON in exactly this shape, no other text:
{"personality": {"hook":"...","preview":"...","teaser":"...","deepDive":"..."}, "career": {"hook":"...","preview":"...","teaser":"...","deepDive":"..."}, "wealth": {"hook":"...","preview":"...","teaser":"...","deepDive":"..."}, "love": {"hook":"...","preview":"...","teaser":"...","deepDive":"..."}, "challenges": {"hook":"...","preview":"...","teaser":"...","deepDive":"..."}, "path_ahead": {"hook": "...", "years": [{"year": ${currentYear}, "theme": "...", "insight": "..."}, ...]}, "closingSynthesis": "..."}

Do not make definite predictions — for every section and every year, describe what these patterns traditionally suggest about the person.`;
}

function isValidSections(obj) {
  if (!obj || obj.quotaExceeded) return false;
  if (typeof obj.closingSynthesis !== "string" || !obj.closingSynthesis.trim()) return false;
  return REPORT_SECTIONS.every((s) => {
    const entry = obj[s.id];
    if (!entry || typeof entry.hook !== "string" || !entry.hook.trim()) return false;
    if (s.kind === "timeline") {
      return (
        Array.isArray(entry.years) &&
        entry.years.length >= 2 &&
        entry.years.every((y) => y.year && y.theme && y.insight)
      );
    }
    return (
      typeof entry.preview === "string" &&
      entry.preview.trim().length > 0 &&
      typeof entry.teaser === "string" &&
      entry.teaser.trim().length > 0 &&
      typeof entry.deepDive === "string" &&
      entry.deepDive.trim().length > 0
    );
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { handShape, seed } = body;

    if (!handShape || typeof seed !== "number") {
      return NextResponse.json({ error: "Missing handShape or seed" }, { status: 400 });
    }

    // The chart is best-effort (geocoding can fail for an unrecognized place
    // name) — reading generation must never block on it. Computed once and
    // reused for both language prompts and the stored report row.
    const chart = await computeVedicChart(body).catch((err) => {
      console.error("computeVedicChart threw:", err);
      return null;
    });

    // Both languages are generated up front so the header's EN/हिंदी toggle
    // can switch the report body instantly, with no re-generation wait.
    const [sectionsEn, sectionsHi] = await Promise.all([
      callGeminiJSON(buildSectionsPrompt({ ...body, chart, language: "en" }), SECTIONS_SCHEMA, { timeoutMs: 30000 }),
      callGeminiJSON(buildSectionsPrompt({ ...body, chart, language: "hi" }), SECTIONS_SCHEMA, { timeoutMs: 30000 }),
    ]);

    if (sectionsEn?.quotaExceeded || sectionsHi?.quotaExceeded) {
      return NextResponse.json(
        { error: "We're getting a lot of requests right now — please try again in about a minute." },
        { status: 429 }
      );
    }
    if (!isValidSections(sectionsEn) || !isValidSections(sectionsHi)) {
      return NextResponse.json({ error: "Reading generation failed" }, { status: 502 });
    }

    const reportRow = {
      name: body.name,
      email: body.email,
      dob: body.dob,
      birth_time: body.birthTime,
      birth_time_unknown: body.birthTimeUnknown || false,
      birth_place: body.birthPlace,
      hand_shape: handShape,
      seed,
      language: body.language || "en",
      sections_en: sectionsEn,
      sections_hi: sectionsHi,
      full_text: flattenSections(sectionsEn),
      chart,
      paid: false,
    };

    let { data: inserted, error } = await getSupabase().from("reports").insert(reportRow).select().single();

    // "column not found in schema cache" — happens if the `chart` migration
    // (alter table reports add column if not exists chart jsonb) hasn't
    // been run yet in this environment. The chart is a bonus feature, not
    // something reading generation should hard-fail over, so retry once
    // without it rather than losing the whole reading.
    if (error && /chart/i.test(error.message || "")) {
      console.error("`chart` column missing on `reports` — retrying insert without it. Run: alter table reports add column if not exists chart jsonb;");
      const { chart: _omit, ...rowWithoutChart } = reportRow;
      ({ data: inserted, error } = await getSupabase().from("reports").insert(rowWithoutChart).select().single());
    }

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Could not save report" }, { status: 500 });
    }

    return NextResponse.json({ sectionsEn, sectionsHi, chart, reportId: inserted.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
