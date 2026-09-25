import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabaseClient";
import { callGeminiJSON } from "@/lib/gemini";
import { REPORT_SECTIONS, flattenSections } from "@/lib/reportSections";

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const HAND_SHAPE_TRAITS = {
  earth: {
    en: "a grounded, practical hand shape — square palm, shorter fingers, often linked to being steady and hands-on.",
    hi: "एक स्थिर, व्यावहारिक हाथ की आकृति — चौकोर हथेली, छोटी उंगलियाँ, अक्सर स्थिरता और व्यावहारिकता से जुड़ी।",
  },
  air: {
    en: "a square palm with long fingers — traditionally linked to sharp thinking and curiosity.",
    hi: "चौकोर हथेली और लंबी उंगलियाँ — पारंपरिक रूप से तीव्र सोच और जिज्ञासा से जुड़ी।",
  },
  fire: {
    en: "a rectangular palm with shorter fingers — often associated with energy and initiative.",
    hi: "आयताकार हथेली और छोटी उंगलियाँ — अक्सर ऊर्जा और पहल करने की क्षमता से जुड़ी।",
  },
  water: {
    en: "a long, narrow palm with long fingers — traditionally tied to sensitivity and imagination.",
    hi: "लंबी, संकरी हथेली और लंबी उंगलियाँ — पारंपरिक रूप से संवेदनशीलता और कल्पनाशीलता से जुड़ी।",
  },
};

const PROSE_SCHEMA = {
  type: "OBJECT",
  properties: { hook: { type: "STRING" }, body: { type: "STRING" } },
  required: ["hook", "body"],
};

const TIMELINE_SCHEMA = {
  type: "OBJECT",
  properties: {
    hook: { type: "STRING" },
    years: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { year: { type: "INTEGER" }, theme: { type: "STRING" } },
        required: ["year", "theme"],
      },
    },
  },
  required: ["hook", "years"],
};

const SECTIONS_SCHEMA = {
  type: "OBJECT",
  properties: Object.fromEntries(
    REPORT_SECTIONS.map((s) => [s.id, s.kind === "timeline" ? TIMELINE_SCHEMA : PROSE_SCHEMA])
  ),
  required: REPORT_SECTIONS.map((s) => s.id),
};

function buildSectionsPrompt({ handShape, seed, language, name, dob, birthTime, birthTimeUnknown, birthPlace }) {
  const rand = seededRandom(seed);
  const heartLine =
    rand() > 0.5
      ? { en: "deep and clearly marked", hi: "गहरी और स्पष्ट रूप से अंकित" }
      : { en: "faint and delicate", hi: "हल्की और नाज़ुक" };
  const fateLine =
    rand() > 0.4
      ? { en: "runs unusually far up the palm", hi: "हथेली में असामान्य रूप से ऊपर तक जाती है" }
      : { en: "starts closer to the middle of the hand", hi: "हथेली के मध्य के करीब से शुरू होती है" };
  const traits = HAND_SHAPE_TRAITS[handShape]?.[language] || HAND_SHAPE_TRAITS.earth[language];
  const timeStr = birthTimeUnknown ? (language === "hi" ? "अज्ञात" : "unknown") : birthTime;
  const currentYear = new Date().getFullYear();
  const proseSections = REPORT_SECTIONS.filter((s) => s.kind === "prose");

  if (language === "hi") {
    const sectionList = proseSections.map((s, i) => `${i + 1}. "${s.id}" — ${s.title.hi}: ${s.brief.hi}`).join("\n");
    return `आप पालमारा की इन-हाउस टीम के एक वरिष्ठ ज्योतिषी हैं — सामुद्रिक शास्त्र (हस्तरेखा) और वैदिक ज्योतिष दोनों में निपुण। "${name}" नाम के ग्राहक के लिए एक गर्मजोशी भरी, आत्मविश्वास से भरी और व्यक्तिगत महसूस होने वाली रीडिंग हिंदी में लिखें। कभी भी एक AI सहायक की तरह न लिखें — कभी यह न कहें कि आप "गणना नहीं कर सकते" या आपके पास "डेटा नहीं है"। एक अनुभवी ज्योतिषी की तरह आत्मविश्वास और गर्मजोशी के साथ पारंपरिक व्याख्याएं दें।

हाथ और जन्म विवरण:
- हाथ की आकृति: ${traits}
- हृदय रेखा: ${heartLine.hi}
- भाग्य रेखा: ${fateLine.hi}
- जन्म तिथि: ${dob}, जन्म समय: ${timeStr}, जन्म स्थान: ${birthPlace}

पांच खंड लिखें ("personality", "career", "wealth", "love", "challenges"), हर एक के लिए:
- "hook": एक आकर्षक, विशिष्ट, उत्सुकता जगाने वाला वाक्य (12-20 शब्द) जो बॉडी टेक्स्ट की पहली पंक्ति को दोहराए बिना यह झलक दे कि खंड में क्या है — पाठक को आगे पढ़ने के लिए उत्सुक करे।
- "body": 120-180 शब्द, व्यक्तिगत और विशिष्ट महसूस होने वाला — हाथ/जन्म विवरण का ज़िक्र केवल पहले खंड में नहीं, स्वाभाविक रूप से पूरे पाठ में करें।

${sectionList}

छठा खंड, "path_ahead", अलग है — इसमें एक पैराग्राफ की बजाय दें:
- "hook": एक आकर्षक, आगे की ओर देखने वाला वाक्य।
- "years": ${currentYear} से ${currentYear + 4} तक ठीक 5 प्रविष्टियों की एक सूची, हर एक {"year": <संख्या>, "theme": "<एक संक्षिप्त वाक्यांश, 8-15 शब्द, उस वर्ष के लिए एक पारंपरिक संभावना>"}।

केवल मान्य JSON लौटाएं, बिल्कुल इसी आकार में, कोई अन्य पाठ नहीं:
{"personality": {"hook": "...", "body": "..."}, "career": {"hook": "...", "body": "..."}, "wealth": {"hook": "...", "body": "..."}, "love": {"hook": "...", "body": "..."}, "challenges": {"hook": "...", "body": "..."}, "path_ahead": {"hook": "...", "years": [{"year": ${currentYear}, "theme": "..."}, ...]}}

कोई निश्चित भविष्यवाणी न करें — हर खंड और हर वर्ष के लिए बताएं कि यह पैटर्न परंपरागत रूप से व्यक्ति के बारे में क्या सुझाव देता है।`;
  }

  const sectionList = proseSections.map((s, i) => `${i + 1}. "${s.id}" — ${s.title.en}: ${s.brief.en}`).join("\n");
  return `You are a senior astrologer on Palmara's in-house panel — skilled in both Samudrik Shastra (palmistry) and Vedic astrology (Jyotish). Write a warm, confident, specific-feeling reading in English for a customer named "${name}". Never write like an AI assistant — never say you "cannot calculate" something or "don't have" the data. Write the way an experienced astrologer would: offering traditional interpretations with warmth and authority.

Palm & birth details to weave in naturally:
- Hand shape: ${traits}
- Heart line: ${heartLine.en}
- Fate line: ${fateLine.en}
- Date of birth: ${dob}, time of birth: ${timeStr}, place of birth: ${birthPlace}

Write five sections ("personality", "career", "wealth", "love", "challenges"), each needing:
- "hook": one punchy, specific, curiosity-building sentence (12-20 words) that teases what's in the section WITHOUT just repeating the body's opening line — it should make the reader want to keep reading.
- "body": 120-180 words, feeling personal and specific — reference the palm/birth details naturally throughout, not only in the first section.

${sectionList}

The sixth section, "path_ahead", is different — instead of a body paragraph, give:
- "hook": one punchy, forward-looking sentence.
- "years": an array of exactly 5 entries for ${currentYear} through ${currentYear + 4}, each {"year": <number>, "theme": "<one short phrase, 8-15 words, a traditional possibility for that year>"}.

Return ONLY valid JSON in exactly this shape, no other text:
{"personality": {"hook": "...", "body": "..."}, "career": {"hook": "...", "body": "..."}, "wealth": {"hook": "...", "body": "..."}, "love": {"hook": "...", "body": "..."}, "challenges": {"hook": "...", "body": "..."}, "path_ahead": {"hook": "...", "years": [{"year": ${currentYear}, "theme": "..."}, ...]}}

Do not make definite predictions — for every section and every year, describe what these patterns traditionally suggest about the person.`;
}

function isValidSections(obj) {
  if (!obj || obj.quotaExceeded) return false;
  return REPORT_SECTIONS.every((s) => {
    const entry = obj[s.id];
    if (!entry || typeof entry.hook !== "string" || !entry.hook.trim()) return false;
    if (s.kind === "timeline") {
      return Array.isArray(entry.years) && entry.years.length >= 2 && entry.years.every((y) => y.year && y.theme);
    }
    return typeof entry.body === "string" && entry.body.trim().length > 0;
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { handShape, seed } = body;

    if (!handShape || typeof seed !== "number") {
      return NextResponse.json({ error: "Missing handShape or seed" }, { status: 400 });
    }

    // Both languages are generated up front so the header's EN/हिंदी toggle
    // can switch the report body instantly, with no re-generation wait.
    const [sectionsEn, sectionsHi] = await Promise.all([
      callGeminiJSON(buildSectionsPrompt({ ...body, language: "en" }), SECTIONS_SCHEMA, { timeoutMs: 20000 }),
      callGeminiJSON(buildSectionsPrompt({ ...body, language: "hi" }), SECTIONS_SCHEMA, { timeoutMs: 20000 }),
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

    const { data: inserted, error } = await getSupabase()
      .from("reports")
      .insert({
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
        paid: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Could not save report" }, { status: 500 });
    }

    return NextResponse.json({ sectionsEn, sectionsHi, reportId: inserted.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
