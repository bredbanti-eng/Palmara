// Single source of truth for the deterministic (seeded) palm "facts" used
// both to steer the Gemini prompt (app/api/generate-reading/route.js) and to
// render the always-free Palm Snapshot card (PalmSnapshotCard). Both must
// agree on which heart-line/fate-line variant a given seed produced, so both
// read from here instead of each re-deriving their own random pick.
export function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function getPalmFacts(seed) {
  const rand = seededRandom(seed);
  const heartLine = rand() > 0.5 ? "deep" : "faint";
  const fateLine = rand() > 0.4 ? "high" : "mid";
  return { heartLine, fateLine };
}

// Short, instructional phrasing fed into the Gemini prompt (not shown to
// users directly).
export const HAND_SHAPE_TRAITS = {
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

export const HEART_LINE_PROMPT_TEXT = {
  deep: { en: "deep and clearly marked", hi: "गहरी और स्पष्ट रूप से अंकित" },
  faint: { en: "faint and delicate", hi: "हल्की और नाज़ुक" },
};

export const FATE_LINE_PROMPT_TEXT = {
  high: { en: "runs unusually far up the palm", hi: "हथेली में असामान्य रूप से ऊपर तक जाती है" },
  mid: { en: "starts closer to the middle of the hand", hi: "हथेली के मध्य के करीब से शुरू होती है" },
};

// Fuller, reader-facing copy for the free Palm Snapshot card — shown to
// every visitor with no paywall, so it needs to read as a finished thought,
// not a prompt fragment.
const HAND_SHAPE_LABEL = {
  earth: { en: "Earth Hand", hi: "पृथ्वी हाथ" },
  air: { en: "Air Hand", hi: "वायु हाथ" },
  fire: { en: "Fire Hand", hi: "अग्नि हाथ" },
  water: { en: "Water Hand", hi: "जल हाथ" },
};

const HAND_SHAPE_SNAPSHOT_TEXT = {
  earth: {
    en: "A square palm with shorter fingers — traditionally the mark of someone grounded and hands-on, who trusts results over theory and stays steady when things get stressful.",
    hi: "छोटी उंगलियों वाली चौकोर हथेली — पुरानी मान्यता में यह उस इंसान की निशानी है जो व्यावहारिक और स्थिर होता है, बातों से ज़्यादा नतीजों पर भरोसा करता है, और तनाव में भी शांत बना रहता है।",
  },
  air: {
    en: "A square palm with long fingers — traditionally linked to a quick, analytical mind that picks up new ideas fast and is happiest when there's something new to figure out.",
    hi: "लंबी उंगलियों वाली चौकोर हथेली — पुरानी मान्यता में इसका मतलब है तेज़, सोचने-समझने वाला दिमाग, जो नई बातें जल्दी पकड़ लेता है और कुछ नया सुलझाने में सबसे ज़्यादा खुश रहता है।",
  },
  fire: {
    en: "A rectangular palm with shorter fingers — traditionally read as high energy and initiative, someone who leads with instinct and needs a real challenge to stay engaged.",
    hi: "छोटी उंगलियों वाली आयताकार हथेली — पुरानी मान्यता में इसका मतलब है भरपूर ऊर्जा और पहल करने की ताकत, जो अपने मन की सुनकर आगे बढ़ता है और सक्रिय रहने के लिए असली चुनौती चाहता है।",
  },
  water: {
    en: "A long, narrow palm with long fingers — traditionally tied to deep sensitivity and imagination, someone who reads a room instantly but feels things more intensely than they let on.",
    hi: "लंबी उंगलियों वाली लंबी, पतली हथेली — पुरानी मान्यता में गहरी संवेदनशीलता और कल्पनाशीलता की निशानी, जो किसी भी माहौल को तुरंत भांप लेता है लेकिन जितना ज़ाहिर करता है उससे कहीं ज़्यादा गहराई से महसूस करता है।",
  },
};

const HEART_LINE_SNAPSHOT_TEXT = {
  deep: {
    en: "Deep and clearly marked. Traditionally read as strong emotional conviction — once you commit to someone, it's rarely half-hearted.",
    hi: "गहरी और साफ़ उभरी हुई। पुरानी मान्यता में यह मज़बूत भावनात्मक पक्केपन की निशानी है — एक बार जब आप किसी के लिए दिल से जुड़ जाते हैं, तो वह शायद ही कभी आधे मन से होता है।",
  },
  faint: {
    en: "Faint and delicate. Traditionally linked to a more private emotional nature — you feel deeply, but reveal it selectively.",
    hi: "हल्की और नाज़ुक। पुरानी मान्यता में इसका मतलब है एक ज़्यादा निजी भावनात्मक स्वभाव — आप गहराई से महसूस करते हैं, लेकिन इसे चुनिंदा लोगों के सामने ही ज़ाहिर करते हैं।",
  },
};

const FATE_LINE_SNAPSHOT_TEXT = {
  high: {
    en: "Runs unusually far up the palm. Traditionally seen as a sign that your path becomes clearer through early, decisive action rather than waiting for things to settle.",
    hi: "आपकी हथेली में यह रेखा सामान्य से ज़्यादा ऊपर तक जाती है। पुरानी मान्यता में इसका मतलब है कि आपका रास्ता चीज़ों के अपने आप सुलझने का इंतज़ार करने से नहीं, बल्कि शुरुआत में ही लिए गए बड़े फ़ैसलों से साफ़ होता है।",
  },
  mid: {
    en: "Starts closer to the middle of your hand. Traditionally read as a life path that takes real shape only after a defining shift, often in the mid-decades rather than early on.",
    hi: "आपकी हथेली के बीच के हिस्से के करीब से शुरू होती है। पुरानी मान्यता में इसका मतलब है कि आपकी असली राह शुरुआत में नहीं, बल्कि अक्सर बीच की उम्र में किसी बड़े मोड़ के बाद साफ़ होती है।",
  },
};

export function buildPalmSnapshot(handShape, seed, lang = "en") {
  const shape = HAND_SHAPE_SNAPSHOT_TEXT[handShape] ? handShape : "earth";
  const { heartLine, fateLine } = getPalmFacts(seed);
  return {
    handShape: { label: HAND_SHAPE_LABEL[shape][lang], text: HAND_SHAPE_SNAPSHOT_TEXT[shape][lang] },
    heartLine: { text: HEART_LINE_SNAPSHOT_TEXT[heartLine][lang] },
    fateLine: { text: FATE_LINE_SNAPSHOT_TEXT[fateLine][lang] },
  };
}
