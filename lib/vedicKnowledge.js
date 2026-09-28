// Static traditional-astrology reference text, composed with the real
// computed chart (lib/vedicChart.js) to produce sign/planet/nakshatra
// commentary deterministically — no LLM call, no risk of an invented
// "yoga" or placement that doesn't match classical sources. Genuinely
// combinatorial: 9 planet blurbs x 12 sign blurbs covers all 108 placements
// without hand-writing each one.
//
// Written in plain, spoken language on purpose (both languages) — this
// reads out loud like an astrologer actually talking, not a textbook.
// Hindi in particular avoids heavy Sanskritized (tatsam) vocabulary in
// favor of the everyday words people actually say.
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
  aries: { en: "direct, impatient for results, and quick to go first", hi: "सीधी बात करने, जल्दी नतीजे चाहने, और सबसे पहले कदम बढ़ाने के अंदाज़ में" },
  taurus: { en: "steady, patient, and inclined to stick with what's already proven", hi: "स्थिरता, धैर्य, और जो पहले से आज़माया हुआ है उसे चुनने के अंदाज़ में" },
  gemini: { en: "curious, quick to adapt, and someone who thinks out loud by talking", hi: "जिज्ञासा, नए हालात में जल्दी ढल जाने, और बात करके सोचने के अंदाज़ में" },
  cancer: { en: "emotionally deep, protective, and deeply attached to home and family", hi: "गहरी भावनाओं, अपनों की रक्षा करने की सोच, और घर-परिवार से गहरे लगाव के अंदाज़ में" },
  leo: { en: "confident, hungry for recognition, and warm as a natural leader", hi: "आत्मविश्वास, पहचान पाने की चाह, और नेतृत्व में स्वाभाविक गर्मजोशी के अंदाज़ में" },
  virgo: { en: "precise, sharp-eyed, and always looking to fix and organize things", hi: "सटीकता, बारीक नज़र, और चीज़ों को सुधारने-व्यवस्थित करने के अंदाज़ में" },
  libra: { en: "diplomatic, big on fairness, and someone who avoids open conflict", hi: "समझदारी से बात संभालने, इंसाफ़ को अहमियत देने, और सीधी बहस से बचने के अंदाज़ में" },
  scorpio: { en: "intense, wanting control, and quick to see past the surface", hi: "गहरी तीव्रता, नियंत्रण की चाह, और चीज़ों को सतह के नीचे तक देखने के अंदाज़ में" },
  sagittarius: { en: "optimistic, freedom-loving, and always thinking in the big picture", hi: "आशावाद, आज़ादी से जीने की चाह, और बड़ी सोच रखने के अंदाज़ में" },
  capricorn: { en: "disciplined, ambitious for the long run, and serious about results", hi: "अनुशासन, लंबे समय की महत्वाकांक्षा, और नतीजों पर गंभीरता से ध्यान देने के अंदाज़ में" },
  aquarius: { en: "independent, unconventional, and drawn to causes bigger than themselves", hi: "आज़ाद ख्याली, हटकर सोचने, और अपने से बड़े मकसद की तरफ़ झुकाव के अंदाज़ में" },
  pisces: { en: "sensitive, imaginative, and quick to pick up on others' feelings", hi: "नरम दिल, कल्पनाशीलता, और दूसरों की भावनाओं को तुरंत भांप लेने के अंदाज़ में" },
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
  sun: { en: "shapes your identity, confidence, and how you carry authority", hi: "आपकी पहचान, आत्मविश्वास, और आप ज़िम्मेदारी को कैसे संभालते हैं — यह दिखाता है" },
  moon: { en: "shapes your mind, emotional patterns, and gut reactions", hi: "आपके मन, भावनाओं के पैटर्न, और बिना सोचे आने वाली प्रतिक्रियाओं को दिखाता है" },
  mars: { en: "shapes your drive, courage, and how you handle conflict", hi: "आपका साहस, जोश, और आप झगड़े को कैसे संभालते हैं — यह दिखाता है" },
  mercury: { en: "shapes how you talk, think, and process information", hi: "आप कैसे बात करते हैं, सोचते हैं, और जानकारी को समझते हैं — यह दिखाता है" },
  jupiter: { en: "shapes your wisdom, growth, and where you find meaning", hi: "आपकी समझदारी, तरक्की, और ज़िंदगी में मतलब कहाँ मिलता है — यह दिखाता है" },
  venus: { en: "shapes your love life, taste, and what you find worth chasing", hi: "आपका प्यार, पसंद, और आप किसे पाने लायक मानते हैं — यह दिखाता है" },
  saturn: { en: "shapes your discipline, long-term responsibility, and life's harder lessons", hi: "आपका अनुशासन, लंबी ज़िम्मेदारी, और ज़िंदगी के मुश्किल सबक — यह दिखाता है" },
  rahu: { en: "traditionally points to ambition, obsession, and a craving that never quite settles", hi: "पुरानी मान्यता में महत्वाकांक्षा, जुनून, और एक ऐसी बेचैन चाह को दिखाता है जो कभी शांत नहीं होती" },
  ketu: { en: "traditionally points to detachment, past-life carryover, and a quiet pull toward spirituality", hi: "पुरानी मान्यता में मोह-माया से दूरी, पिछले जन्म के असर, और चुपचाप आध्यात्म की तरफ़ झुकाव को दिखाता है" },
};

// 27 nakshatras, one classical trait each. Order matches lib/vedicChart.js's
// nakshatraOf() index (0 = Ashwini ... 26 = Revati).
const NAKSHATRA_NAMES_AND_TRAITS = [
  { en: "Ashwini", hi: "अश्विनी", trait: { en: "quick to act and quick to heal", hi: "फुर्ती से काम करने वाला और जल्दी उबरने वाला" } },
  { en: "Bharani", hi: "भरणी", trait: { en: "intense, determined, and ready to carry a heavy load", hi: "गहरी सोच वाला, दृढ़, और भारी ज़िम्मेदारी उठाने को तैयार" } },
  { en: "Krittika", hi: "कृत्तिका", trait: { en: "sharp-eyed, quick to see through pretense, sometimes too blunt", hi: "पैनी नज़र वाला, दिखावे को तुरंत भांप लेने वाला, कभी-कभी ज़रूरत से ज़्यादा सीधा बोलने वाला" } },
  { en: "Rohini", hi: "रोहिणी", trait: { en: "attractive, always growing, drawn to beauty and comfort", hi: "आकर्षक, हमेशा आगे बढ़ने की सोच रखने वाला, सुंदरता और आराम पसंद करने वाला" } },
  { en: "Mrigashira", hi: "मृगशिरा", trait: { en: "searching, curious, never quite settled in one direction", hi: "खोजी, जिज्ञासु, किसी एक दिशा में पूरी तरह टिक न पाने वाला" } },
  { en: "Ardra", hi: "आर्द्रा", trait: { en: "brings change, drawn into the storm before things get clear", hi: "बदलाव लाने वाला, साफ़ रास्ता मिलने से पहले उथल-पुथल की तरफ़ खिंच जाने वाला" } },
  { en: "Punarvasu", hi: "पुनर्वसु", trait: { en: "good at starting over, flexible, no grudges held", hi: "फिर से शुरुआत करने में माहिर, लचीला, मन में मैल रखे बिना आगे बढ़ने वाला" } },
  { en: "Pushya", hi: "पुष्य", trait: { en: "nurturing, dependable, the one others lean on", hi: "देखभाल करने वाला, भरोसेमंद, जिस पर दूसरे लोग टिकते हैं" } },
  { en: "Ashlesha", hi: "आश्लेषा", trait: { en: "sharp, strategic, hard to read at first glance", hi: "बारीकी से देखने वाला, सोच-समझकर चाल चलने वाला, पहली नज़र में समझ पाना मुश्किल" } },
  { en: "Magha", hi: "मघा", trait: { en: "proud of where they come from, drawn to legacy and respect", hi: "अपनी विरासत पर गर्व करने वाला, पुरानी परंपरा और इज़्ज़त को अहमियत देने वाला" } },
  { en: "Purva Phalguni", hi: "पूर्वा फाल्गुनी", trait: { en: "warm, likes the good things in life, generous with affection", hi: "स्नेही, ज़िंदगी की अच्छी चीज़ें पसंद करने वाला, प्यार बांटने में उदार" } },
  { en: "Uttara Phalguni", hi: "उत्तरा फाल्गुनी", trait: { en: "steady in relationships, quietly principled", hi: "रिश्तों में स्थिर, चुपचाप अपने उसूलों पर टिके रहने वाला" } },
  { en: "Hasta", hi: "हस्त", trait: { en: "good with their hands, practical, gets things done", hi: "हाथों से कुशल, व्यावहारिक, काम पूरा करवा लेने में माहिर" } },
  { en: "Chitra", hi: "चित्रा", trait: { en: "drawn to craft and appearance, wants their work noticed", hi: "हुनर और दिखावट को सजाने की तरफ़ झुकाव, अपने काम की तारीफ़ सुनना चाहने वाला" } },
  { en: "Swati", hi: "स्वाति", trait: { en: "independent, adaptable, doesn't like being boxed in", hi: "स्वतंत्र, हालात के हिसाब से ढल जाने वाला, बंधन में असहज महसूस करने वाला" } },
  { en: "Vishakha", hi: "विशाखा", trait: { en: "goal-driven, determined, willing to wait for a bigger win", hi: "लक्ष्य पर टिका, दृढ़, बड़ी सफलता के लिए इंतज़ार करने को तैयार" } },
  { en: "Anuradha", hi: "अनुराधा", trait: { en: "loyal, disciplined in friendship, works well in a team", hi: "वफ़ादार, दोस्ती में अनुशासित, टीम में अच्छा काम करने वाला" } },
  { en: "Jyeshtha", hi: "ज्येष्ठा", trait: { en: "protective, naturally the senior one, carries others' load too", hi: "सुरक्षात्मक, स्वाभाविक रूप से बड़ों जैसी भूमिका निभाने वाला, दूसरों की ज़िम्मेदारी भी उठाने वाला" } },
  { en: "Mula", hi: "मूल", trait: { en: "digs deep, willing to take something apart to understand its root", hi: "गहराई से जाँच करने वाला, जड़ तक समझने के लिए किसी भी चीज़ को खोलकर देखने को तैयार" } },
  { en: "Purva Ashadha", hi: "पूर्वाषाढ़ा", trait: { en: "feels unstoppable once committed, convincing when they speak", hi: "एक बार ठान लेने पर अजेय जैसा महसूस करने वाला, बोलने में असरदार" } },
  { en: "Uttara Ashadha", hi: "उत्तराषाढ़ा", trait: { en: "quietly unstoppable, wins through patience, not noise", hi: "शांत भाव से अडिग, शोर नहीं धैर्य से नतीजे पाने वाला" } },
  { en: "Shravana", hi: "श्रवण", trait: { en: "a natural listener, learns from others' experience", hi: "स्वाभाविक रूप से अच्छा श्रोता, दूसरों के अनुभव से सीखने वाला" } },
  { en: "Dhanishta", hi: "धनिष्ठा", trait: { en: "ambitious, works in rhythm, good at building wealth through effort", hi: "महत्वाकांक्षी, अपनी लय में काम करने वाला, मेहनत से धन कमाने में माहिर" } },
  { en: "Shatabhisha", hi: "शतभिषा", trait: { en: "a private healer type, keeps their own struggles to themselves", hi: "निजी तौर पर उपचारक स्वभाव, अपने संघर्षों को छुपाकर रखने वाला" } },
  { en: "Purva Bhadrapada", hi: "पूर्वाभाद्रपद", trait: { en: "believes in big ideals, uncomfortable with half-done work", hi: "बड़े आदर्शों में यकीन रखने वाला, आधे-अधूरे काम से असहज होने वाला" } },
  { en: "Uttara Bhadrapada", hi: "उत्तराभाद्रपद", trait: { en: "deep and calm, holds their wisdom quietly instead of showing it off", hi: "अंदर से गहरा और शांत, अपने ज्ञान को चुपचाप अपने पास रखने वाला, दिखावा किए बिना" } },
  { en: "Revati", hi: "रेवती", trait: { en: "a gentle guide, naturally looks after people still finding their way", hi: "कोमल मार्गदर्शक, अपना रास्ता खोज रहे लोगों की स्वाभाविक रूप से देखभाल करने वाला" } },
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
    return `आपके चंद्र नक्षत्र का स्वामी ग्रह ${lordName} है — जो ${signification} — यह आपके चंद्र के असर में एक और परत जोड़ देता है।`;
  }
  return `Your Moon's nakshatra is ruled by ${lordName} — which ${signification} — adding one more layer to how your Moon shows up.`;
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
    let text = `आपकी कुंडली में ${planetName} ${signName} राशि में है — यह ${signification}, और यहाँ यह ${flavor} नज़र आता है।`;
    if (houseMeaning) {
      text += ` यह आपके ${houseNumber}वें भाव में बैठा है, जो ${houseMeaning} से जुड़ा है — तो इसका असर सबसे ज़्यादा वहीं दिखता है।`;
    }
    return text;
  }
  let text = `${planetName} sits in ${signName} for you — it ${signification}, and here it tends to show up ${flavor}.`;
  if (houseMeaning) {
    text += ` It falls in your ${houseNumber}${ORDINAL_SUFFIX(houseNumber)} house — the house of ${houseMeaning} — so this shows up there most.`;
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
  2: { en: "money, speech, and family values", hi: "धन, बातचीत, और पारिवारिक मूल्य" },
  3: { en: "courage, siblings, and your own effort", hi: "साहस, भाई-बहन, और अपनी मेहनत" },
  4: { en: "home, mother, and inner peace", hi: "घर, माँ, और मन की शांति" },
  5: { en: "creativity, intelligence, and children", hi: "रचनात्मकता, बुद्धि, और संतान" },
  6: { en: "health, service, and obstacles you overcome", hi: "सेहत, सेवा, और मुश्किलों पर जीत" },
  7: { en: "partnerships and marriage", hi: "साझेदारी और शादी" },
  8: { en: "transformation and deep change", hi: "बड़े बदलाव और गहरा रूपांतरण" },
  9: { en: "luck, higher learning, and dharma", hi: "भाग्य, ऊंची पढ़ाई, और धर्म" },
  10: { en: "career and public standing", hi: "करियर और समाज में पहचान" },
  11: { en: "gains, networks, and goals", hi: "फ़ायदा, जान-पहचान, और लक्ष्य" },
  12: { en: "letting go, distant places, and spiritual life", hi: "त्याग, दूर की जगहें, और आध्यात्मिक जीवन" },
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
    let text = `भाव ${houseNumber} — ${meaning}। यहाँ ${signName} राशि है, तो यह हिस्सा आमतौर पर ${flavor} दिखता है।`;
    if (planetNames.length) {
      text += ` ${planetNames.join(", ")} यहाँ ${planetNames.length > 1 ? "बैठे हैं" : "बैठा है"}, इसलिए आपकी कुंडली में यह जगह ख़ास तौर पर सक्रिय है।`;
    } else {
      text += ` यहाँ कोई ग्रह नहीं है — पुरानी मान्यता में इसका मतलब है कि यह हिस्सा अपने आप संभल जाता है, इसे बाकी जगहों जितनी मेहनत नहीं चाहिए।`;
    }
    return text;
  }
  let text = `House ${houseNumber} — ${meaning}. With ${signName} here, this area of life usually plays out ${flavor}.`;
  if (planetNames.length) {
    text += ` ${planetNames.join(" and ")} ${planetNames.length > 1 ? "sit" : "sits"} here, making this one of the more active areas in your chart.`;
  } else {
    text += ` No planets sit here for you, which traditionally means this area runs on its own — it doesn't ask for as much conscious effort as your more occupied houses.`;
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
    return `आपके शुक्र की नवांश राशि ${signName} है — पुरानी मान्यता के अनुसार, अंदर से आप रिश्तों में ${flavor} को अहमियत देते हैं, भले ही ऊपर से आपका स्वभाव कुछ और लगे।`;
  }
  return `Your Venus falls in ${signName} in the Navamsa — traditionally this means that underneath, what you actually value in relationships comes across ${flavor}, even if your outward personality reads differently.`;
}

export function describeAscendant(signIndex, lang) {
  const signKey = SIGN_KEYS[signIndex];
  const signName = RASHI_NAMES[signKey]?.[lang];
  const flavor = SIGN_FLAVOR[signKey]?.[lang];
  if (!signName || !flavor) return "";
  if (lang === "hi") {
    return `आपकी लग्न ${signName} है — जब लोग आपसे पहली बार मिलते हैं, तो उन्हें आमतौर पर आपमें ${flavor} नज़र आता है। पुरानी मान्यता में लग्न को आपके स्वभाव और शक्ल-सूरत की नींव माना जाता है।`;
  }
  return `Your Ascendant (Lagna) is ${signName} — when people first meet you, they usually pick up on you being ${flavor}. Classically, the Ascendant is treated as the foundation of personality and physical build.`;
}
