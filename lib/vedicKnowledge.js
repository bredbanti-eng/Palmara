// Static traditional-astrology reference text, composed with the real
// computed chart (lib/vedicChart.js) to produce sign/planet/nakshatra
// commentary deterministically — no LLM call, no risk of an invented
// "yoga" or placement that doesn't match classical sources. Genuinely
// combinatorial: 9 planet blurbs x 12 sign blurbs covers all 108 placements
// without hand-writing each one.
import { SIGN_KEYS } from "./vedicConstants";

export const RASHI_NAMES = {
  aries: { en: "Aries", hi: "मेष" },
  taurus: { en: "Taurus", hi: "वृषभ" },
  gemini: { en: "Gemini", hi: "मिथुन" },
  cancer: { en: "Cancer", hi: "कर्क" },
  leo: { en: "Leo", hi: "सिंह" },
  virgo: { en: "Virgo", hi: "कन्या" },
  libra: { en: "Libra", hi: "तुला" },
  scorpio: { en: "Scorpio", hi: "वृश्चिक" },
  sagittarius: { en: "Sagittarius", hi: "धनु" },
  capricorn: { en: "Capricorn", hi: "मकर" },
  aquarius: { en: "Aquarius", hi: "कुंभ" },
  pisces: { en: "Pisces", hi: "मीन" },
};

// Short "expresses as" qualifier per sign, combined with a planet's general
// signification to build a planet-in-sign sentence without needing all 108
// unique combinations hand-written.
const SIGN_FLAVOR = {
  aries: { en: "with directness, impatience for results, and a instinct to go first", hi: "सीधेपन, परिणाम की जल्दी, और पहल करने की सहज प्रवृत्ति के साथ" },
  taurus: { en: "with steadiness, patience, and a preference for the tried-and-tested", hi: "स्थिरता, धैर्य, और परखी हुई राह को प्राथमिकता देने के साथ" },
  gemini: { en: "with curiosity, quick adaptability, and a need to talk things through", hi: "जिज्ञासा, तेज़ अनुकूलन क्षमता, और बातचीत के ज़रिए सोचने की ज़रूरत के साथ" },
  cancer: { en: "with emotional depth, protectiveness, and strong attachment to home and family", hi: "भावनात्मक गहराई, सुरक्षात्मक स्वभाव, और घर-परिवार से गहरे जुड़ाव के साथ" },
  leo: { en: "with confidence, a need for recognition, and natural warmth in leadership", hi: "आत्मविश्वास, पहचान की चाहत, और नेतृत्व में स्वाभाविक गर्मजोशी के साथ" },
  virgo: { en: "with precision, a critical eye, and a drive to improve and organize", hi: "सटीकता, बारीक नज़र, और सुधारने-व्यवस्थित करने की प्रवृत्ति के साथ" },
  libra: { en: "with diplomacy, a strong sense of fairness, and discomfort with open conflict", hi: "कूटनीति, न्याय की गहरी भावना, और खुले टकराव से असहजता के साथ" },
  scorpio: { en: "with intensity, a need for control, and an instinct to see beneath the surface", hi: "तीव्रता, नियंत्रण की चाह, और सतह के नीचे देखने की सहज प्रवृत्ति के साथ" },
  sagittarius: { en: "with optimism, a love of freedom, and a philosophical, big-picture outlook", hi: "आशावाद, स्वतंत्रता के प्रति प्रेम, और व्यापक, दार्शनिक दृष्टिकोण के साथ" },
  capricorn: { en: "with discipline, long-term ambition, and a serious, results-first approach", hi: "अनुशासन, दीर्घकालिक महत्वाकांक्षा, और गंभीर, परिणाम-केंद्रित दृष्टिकोण के साथ" },
  aquarius: { en: "with independence, unconventional thinking, and a pull toward causes bigger than oneself", hi: "स्वतंत्रता, अपरंपरागत सोच, और स्वयं से बड़े उद्देश्यों की ओर झुकाव के साथ" },
  pisces: { en: "with sensitivity, imagination, and a tendency to absorb others' emotions", hi: "संवेदनशीलता, कल्पनाशीलता, और दूसरों की भावनाओं को आत्मसात कर लेने की प्रवृत्ति के साथ" },
};

export const PLANET_ABBR = {
  sun: { en: "Su", hi: "सू" },
  moon: { en: "Mo", hi: "चं" },
  mars: { en: "Ma", hi: "मं" },
  mercury: { en: "Me", hi: "बु" },
  jupiter: { en: "Ju", hi: "गु" },
  venus: { en: "Ve", hi: "शु" },
  saturn: { en: "Sa", hi: "श" },
  rahu: { en: "Ra", hi: "रा" },
  ketu: { en: "Ke", hi: "के" },
};

export const PLANET_NAMES = {
  sun: { en: "Sun", hi: "सूर्य" },
  moon: { en: "Moon", hi: "चंद्र" },
  mars: { en: "Mars", hi: "मंगल" },
  mercury: { en: "Mercury", hi: "बुध" },
  jupiter: { en: "Jupiter", hi: "बृहस्पति" },
  venus: { en: "Venus", hi: "शुक्र" },
  saturn: { en: "Saturn", hi: "शनि" },
  rahu: { en: "Rahu", hi: "राहु" },
  ketu: { en: "Ketu", hi: "केतु" },
};

// General classical signification per planet — the part of a person's life
// this graha traditionally governs, independent of which sign it's in.
const PLANET_SIGNIFICATION = {
  sun: { en: "governs identity, confidence, and how you carry authority", hi: "पहचान, आत्मविश्वास, और आप अधिकार को कैसे धारण करते हैं, इसे दर्शाता है" },
  moon: { en: "governs the mind, emotional patterns, and instinctive reactions", hi: "मन, भावनात्मक प्रवृत्तियों, और सहज प्रतिक्रियाओं को दर्शाता है" },
  mars: { en: "governs drive, courage, and how you handle conflict", hi: "साहस, ऊर्जा, और आप टकराव को कैसे संभालते हैं, इसे दर्शाता है" },
  mercury: { en: "governs communication, intellect, and how you process information", hi: "संचार, बुद्धि, और आप जानकारी को कैसे समझते हैं, इसे दर्शाता है" },
  jupiter: { en: "governs wisdom, growth, and where you find meaning", hi: "बुद्धिमत्ता, विकास, और आपको अर्थ कहाँ मिलता है, इसे दर्शाता है" },
  venus: { en: "governs love, aesthetics, and what you find worth pursuing", hi: "प्रेम, सौंदर्यबोध, और आप किसे पाने योग्य समझते हैं, इसे दर्शाता है" },
  saturn: { en: "governs discipline, long-term responsibility, and life's harder lessons", hi: "अनुशासन, दीर्घकालिक ज़िम्मेदारी, और जीवन के कठिन सबक को दर्शाता है" },
  rahu: { en: "traditionally signifies ambition, obsession, and an area of restless craving", hi: "पारंपरिक रूप से महत्वाकांक्षा, जुनून, और एक बेचैन इच्छा के क्षेत्र को दर्शाता है" },
  ketu: { en: "traditionally signifies detachment, past-life carryover, and quiet spiritual pull", hi: "पारंपरिक रूप से वैराग्य, पूर्वजन्म के प्रभाव, और मौन आध्यात्मिक झुकाव को दर्शाता है" },
};

// 27 nakshatras, one classical trait each. Order matches lib/vedicChart.js's
// nakshatraOf() index (0 = Ashwini ... 26 = Revati).
const NAKSHATRA_NAMES_AND_TRAITS = [
  { en: "Ashwini", hi: "अश्विनी", trait: { en: "quick to act and quick to heal", hi: "फुर्ती से काम करने वाला और जल्दी उबरने वाला" } },
  { en: "Bharani", hi: "भरणी", trait: { en: "intense, determined, and willing to carry a heavy load", hi: "तीव्र, दृढ़, और भारी ज़िम्मेदारी उठाने को तैयार" } },
  { en: "Krittika", hi: "कृत्तिका", trait: { en: "sharp, cutting through pretense, direct to a fault", hi: "तीक्ष्ण, दिखावे को भेदने वाला, सीधापन जो कभी-कभी अधिक हो जाता है" } },
  { en: "Rohini", hi: "रोहिणी", trait: { en: "magnetic, growth-oriented, drawn to beauty and comfort", hi: "आकर्षक, विकासोन्मुखी, सुंदरता और सुख की ओर झुकाव रखने वाला" } },
  { en: "Mrigashira", hi: "मृगशिरा", trait: { en: "searching, curious, never quite settled in one direction", hi: "खोजी, जिज्ञासु, किसी एक दिशा में पूरी तरह स्थिर न होने वाला" } },
  { en: "Ardra", hi: "आर्द्रा", trait: { en: "transformative, drawn to storms before clarity", hi: "परिवर्तनकारी, स्पष्टता से पहले उथल-पुथल की ओर खिंचने वाला" } },
  { en: "Punarvasu", hi: "पुनर्वसु", trait: { en: "renewing, resilient, able to start over without bitterness", hi: "नवीनीकरण करने वाला, लचीला, बिना कड़वाहट के फिर से शुरुआत करने वाला" } },
  { en: "Pushya", hi: "पुष्य", trait: { en: "nurturing, dependable, the one others lean on", hi: "पोषण करने वाला, भरोसेमंद, जिस पर दूसरे टिकते हैं" } },
  { en: "Ashlesha", hi: "आश्लेषा", trait: { en: "perceptive, strategic, hard to read at first glance", hi: "सूक्ष्मदर्शी, रणनीतिक, पहली नज़र में समझ पाना कठिन" } },
  { en: "Magha", hi: "मघा", trait: { en: "proud of lineage, drawn to legacy and recognition", hi: "अपनी विरासत पर गर्व करने वाला, धरोहर और सम्मान की ओर झुकाव रखने वाला" } },
  { en: "Purva Phalguni", hi: "पूर्वा फाल्गुनी", trait: { en: "warm, pleasure-seeking, generous with affection", hi: "स्नेही, सुख की चाह रखने वाला, स्नेह में उदार" } },
  { en: "Uttara Phalguni", hi: "उत्तरा फाल्गुनी", trait: { en: "steady in partnership, quietly principled", hi: "साझेदारी में स्थिर, शांत भाव से सिद्धांतवादी" } },
  { en: "Hasta", hi: "हस्त", trait: { en: "skillful with the hands, practical, good at getting things done", hi: "हाथों से कुशल, व्यावहारिक, काम पूरा करवा लेने में माहिर" } },
  { en: "Chitra", hi: "चित्रा", trait: { en: "drawn to craft and appearance, wants their work to be noticed", hi: "शिल्प और रूप-सज्जा की ओर झुकाव, अपने काम को सराहा जाते देखना चाहने वाला" } },
  { en: "Swati", hi: "स्वाति", trait: { en: "independent, adaptable, uncomfortable being pinned down", hi: "स्वतंत्र, अनुकूलनशील, बंधन में असहज महसूस करने वाला" } },
  { en: "Vishakha", hi: "विशाखा", trait: { en: "goal-driven, determined, willing to wait for a bigger win", hi: "लक्ष्य-केंद्रित, दृढ़, बड़ी सफलता के लिए इंतज़ार करने को तैयार" } },
  { en: "Anuradha", hi: "अनुराधा", trait: { en: "loyal, disciplined in friendship, works well in groups", hi: "वफ़ादार, मित्रता में अनुशासित, समूह में अच्छा काम करने वाला" } },
  { en: "Jyeshtha", hi: "ज्येष्ठा", trait: { en: "protective, a natural senior figure, carries responsibility for others", hi: "सुरक्षात्मक, स्वाभाविक रूप से बड़ों जैसी भूमिका निभाने वाला, दूसरों की ज़िम्मेदारी उठाने वाला" } },
  { en: "Mula", hi: "मूल", trait: { en: "investigative, willing to dismantle something to understand its root", hi: "गहराई से जाँच करने वाला, जड़ तक समझने के लिए किसी चीज़ को खोल देने को तैयार" } },
  { en: "Purva Ashadha", hi: "पूर्वाषाढ़ा", trait: { en: "invincible-feeling once committed, convincing when they speak", hi: "एक बार प्रतिबद्ध होने पर अजेय जैसा महसूस करने वाला, बोलने में प्रभावशाली" } },
  { en: "Uttara Ashadha", hi: "उत्तराषाढ़ा", trait: { en: "quietly unstoppable, earns lasting results through patience", hi: "शांत भाव से अडिग, धैर्य से स्थायी परिणाम अर्जित करने वाला" } },
  { en: "Shravana", hi: "श्रवण", trait: { en: "a natural listener, learns by absorbing others' experience", hi: "स्वाभाविक रूप से अच्छा श्रोता, दूसरों के अनुभव से सीखने वाला" } },
  { en: "Dhanishta", hi: "धनिष्ठा", trait: { en: "ambitious, rhythm-driven, good at building wealth through effort", hi: "महत्वाकांक्षी, लय में काम करने वाला, परिश्रम से धन अर्जित करने में सक्षम" } },
  { en: "Shatabhisha", hi: "शतभिषा", trait: { en: "private healer type, secretive about their own struggles", hi: "निजी रूप से उपचारक स्वभाव, अपने संघर्षों को छुपाकर रखने वाला" } },
  { en: "Purva Bhadrapada", hi: "पूर्वाभाद्रपद", trait: { en: "intense idealist, uncomfortable with half-measures", hi: "तीव्र आदर्शवादी, अधूरे प्रयासों से असहज" } },
  { en: "Uttara Bhadrapada", hi: "उत्तराभाद्रपद", trait: { en: "calm depth, carries wisdom quietly rather than announcing it", hi: "शांत गहराई, ज्ञान को चुपचाप धारण करने वाला, प्रदर्शित किए बिना" } },
  { en: "Revati", hi: "रेवती", trait: { en: "gentle guide, instinctively looks after those still finding their way", hi: "कोमल मार्गदर्शक, अपना रास्ता खोज रहे लोगों की स्वाभाविक रूप से देखभाल करने वाला" } },
];

export function getRashiName(signIndex, lang) {
  const key = SIGN_KEYS[signIndex];
  return RASHI_NAMES[key]?.[lang] || "";
}

export function getNakshatraInfo(index, lang) {
  const entry = NAKSHATRA_NAMES_AND_TRAITS[index];
  if (!entry) return null;
  return { name: entry[lang], trait: entry.trait[lang] };
}

// The 27 nakshatras cycle through these 9 ruling planets 3 times, in this
// fixed classical order (the same sequence used for Vimshottari dasha) —
// not something to guess per nakshatra, it's a fixed pattern starting from
// Ashwini (index 0).
const NAKSHATRA_LORDS_CYCLE = ["ketu", "venus", "sun", "moon", "mars", "rahu", "jupiter", "saturn", "mercury"];

export function describeNakshatraLord(nakshatraIndex, lang) {
  const lordKey = NAKSHATRA_LORDS_CYCLE[nakshatraIndex % 9];
  const lordName = PLANET_NAMES[lordKey]?.[lang];
  const signification = PLANET_SIGNIFICATION[lordKey]?.[lang];
  if (!lordName || !signification) return "";
  if (lang === "hi") {
    return `आपके चंद्र नक्षत्र का स्वामी ग्रह ${lordName} है — जो ${signification} — यह आपके चंद्र की अभिव्यक्ति में एक अतिरिक्त परत जोड़ता है।`;
  }
  return `Your Moon's nakshatra is ruled by ${lordName} — which ${signification} — adding an extra layer to how your Moon expresses itself.`;
}

// One combined passage per planet: signification + sign flavor + (when a
// house is known) which life area that energy concentrates in — entirely
// deterministic from the real computed chart, so it can never drift from
// the classical correspondences below.
export function describePlanetInSign(planetKey, signIndex, lang, houseNumber) {
  const signKey = SIGN_KEYS[signIndex];
  const planetName = PLANET_NAMES[planetKey]?.[lang];
  const signName = RASHI_NAMES[signKey]?.[lang];
  const signification = PLANET_SIGNIFICATION[planetKey]?.[lang];
  const flavor = SIGN_FLAVOR[signKey]?.[lang];
  if (!planetName || !signName || !signification || !flavor) return "";
  const houseMeaning = houseNumber ? HOUSE_MEANINGS[houseNumber]?.[lang] : null;
  if (lang === "hi") {
    let text = `${planetName} आपकी कुंडली में ${signName} राशि में है — यह ${signification}, यहाँ यह ${flavor} प्रकट होता है।`;
    if (houseMeaning) {
      text += ` यह आपके ${houseNumber}वें भाव में स्थित है, जो ${houseMeaning} से जुड़ा है — इसलिए यह ऊर्जा स्वाभाविक रूप से वहीं केंद्रित होती है।`;
    }
    return text;
  }
  let text = `${planetName} sits in ${signName} for you — it ${signification}, and here it tends to express itself ${flavor}.`;
  if (houseMeaning) {
    text += ` It falls in your ${houseNumber}${ORDINAL_SUFFIX(houseNumber)} house — the house of ${houseMeaning} — so this energy naturally concentrates there.`;
  }
  return text;
}

function ORDINAL_SUFFIX(n) {
  if (n % 100 >= 11 && n % 100 <= 13) return "th";
  switch (n % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

// Classical significations of the 12 houses, used for the PDF-only "which
// areas of life are most active for you" note (based on real planet
// clustering per house, not an invented "yoga").
const HOUSE_MEANINGS = {
  1: { en: "self and identity", hi: "स्वयं और पहचान" },
  2: { en: "wealth, speech, and family values", hi: "धन, वाणी, और पारिवारिक मूल्य" },
  3: { en: "courage, siblings, and self-effort", hi: "साहस, भाई-बहन, और स्वयं का प्रयास" },
  4: { en: "home, mother, and inner peace", hi: "घर, माँ, और आंतरिक शांति" },
  5: { en: "creativity, intelligence, and children", hi: "रचनात्मकता, बुद्धि, और संतान" },
  6: { en: "health, service, and obstacles overcome", hi: "स्वास्थ्य, सेवा, और बाधाओं पर विजय" },
  7: { en: "partnerships and marriage", hi: "साझेदारी और विवाह" },
  8: { en: "transformation and deep change", hi: "रूपांतरण और गहरा परिवर्तन" },
  9: { en: "fortune, higher learning, and dharma", hi: "भाग्य, उच्च शिक्षा, और धर्म" },
  10: { en: "career and public standing", hi: "करियर और सार्वजनिक प्रतिष्ठा" },
  11: { en: "gains, networks, and aspirations", hi: "लाभ, नेटवर्क, और आकांक्षाएँ" },
  12: { en: "release, distant places, and spiritual life", hi: "मुक्ति, दूर के स्थान, और आध्यात्मिक जीवन" },
};

export function getHouseMeaning(houseNumber, lang) {
  return HOUSE_MEANINGS[houseNumber]?.[lang] || "";
}

// Detects houses where 2+ classical planets sit together — a real,
// computed pattern (not a fabricated "yoga" requiring astrological rules
// this app doesn't implement) worth calling out as notably active.
export function findStelliumHouses(planets) {
  const counts = {};
  Object.entries(planets || {}).forEach(([key, data]) => {
    if (!data || data.house == null) return;
    if (!counts[data.house]) counts[data.house] = [];
    counts[data.house].push(key);
  });
  return Object.entries(counts)
    .filter(([, keys]) => keys.length >= 2)
    .map(([house, keys]) => ({ house: Number(house), planetKeys: keys }))
    .sort((a, b) => b.planetKeys.length - a.planetKeys.length);
}

// Full per-house passage for the "Twelve-House Life Map" — combines the
// house's classical signification, the flavor of whichever sign currently
// occupies it (real, computed via signIndexForHouse), and any planets
// actually placed there. Entirely deterministic.
export function describeHouse(houseNumber, signIndex, planetKeys, lang) {
  const signKey = SIGN_KEYS[signIndex];
  const signName = RASHI_NAMES[signKey]?.[lang];
  const flavor = SIGN_FLAVOR[signKey]?.[lang];
  const meaning = HOUSE_MEANINGS[houseNumber]?.[lang];
  if (!signName || !flavor || !meaning) return "";
  const planetNames = (planetKeys || []).map((k) => PLANET_NAMES[k]?.[lang]).filter(Boolean);
  if (lang === "hi") {
    let text = `भाव ${houseNumber} — ${meaning}। यहाँ ${signName} राशि है, इसलिए यह क्षेत्र स्वाभाविक रूप से ${flavor} व्यक्त होता है।`;
    if (planetNames.length) {
      text += ` ${planetNames.join(", ")} यहाँ स्थित ${planetNames.length > 1 ? "हैं" : "है"}, जो इस क्षेत्र को आपकी कुंडली में विशेष रूप से सक्रिय बनाता है।`;
    } else {
      text += ` इस भाव में कोई ग्रह नहीं है, जो पारंपरिक रूप से यह दर्शाता है कि यह क्षेत्र अपने आप संभल जाता है — इसे आपके अधिक सक्रिय भावों जितने सचेत प्रयास की ज़रूरत नहीं पड़ती।`;
    }
    return text;
  }
  let text = `House ${houseNumber} — ${meaning}. With ${signName} here, this area of life naturally unfolds ${flavor}.`;
  if (planetNames.length) {
    text += ` ${planetNames.join(" and ")} ${planetNames.length > 1 ? "sit" : "sits"} here, making this one of the more active areas in your chart.`;
  } else {
    text += ` No planets sit here for you, which traditionally suggests this area runs largely on its own — it tends to ask for less conscious management than your more occupied houses.`;
  }
  return text;
}

// Venus's Navamsa (D9) sign is the classical relationship-values indicator
// — reuses the same sign-flavor table as everywhere else, just framed for
// what a person values in a partner/relationship rather than personality.
export function describeVenusNavamsa(signIndex, lang) {
  const signKey = SIGN_KEYS[signIndex];
  const signName = RASHI_NAMES[signKey]?.[lang];
  const flavor = SIGN_FLAVOR[signKey]?.[lang];
  if (!signName || !flavor) return "";
  if (lang === "hi") {
    return `आपकी शुक्र की नवांश राशि ${signName} है — पारंपरिक रूप से यह दर्शाता है कि गहराई में, आप रिश्तों में ${flavor} को महत्व देते हैं, भले ही आपका ऊपरी स्वभाव इससे अलग दिखे।`;
  }
  return `Your Venus falls in ${signName} in the Navamsa — traditionally this suggests that underneath the surface, what you actually value in relationships comes with ${flavor}, even if your outward personality reads differently.`;
}

export function describeAscendant(signIndex, lang) {
  const signKey = SIGN_KEYS[signIndex];
  const signName = RASHI_NAMES[signKey]?.[lang];
  const flavor = SIGN_FLAVOR[signKey]?.[lang];
  if (!signName || !flavor) return "";
  if (lang === "hi") {
    return `आपकी लग्न (उदय राशि) ${signName} है — जिस तरह से दुनिया आपको सबसे पहले अनुभव करती है, वह अक्सर ${flavor} जैसा दिखता है। लग्न आपके व्यक्तित्व और शारीरिक स्वभाव की नींव मानी जाती है।`;
  }
  return `Your Ascendant (Lagna) is ${signName} — the way the world first experiences you tends to come across ${flavor}. Classically, the Ascendant is treated as the foundation of personality and physical temperament.`;
}
