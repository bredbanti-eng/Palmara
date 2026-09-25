// Real sidereal (Lahiri-equivalent) Vedic birth chart computation — not a
// seeded/invented placement like the palm traits. circular-natal-horoscope-js
// computes actual planetary ecliptic longitudes and, given a geocoded lat/lon
// and local birth time, a real Ascendant. Verified against a third-party
// reference chart for the same birth data: Ascendant, all 7 classical
// planets, and the lunar nodes matched within arc-minutes.
// Loaded via require(), not `import ... from`: this package has no
// __esModule marker, and Next.js's webpack bundling of the API route
// resolved the ESM-interop default export to undefined at build/runtime
// ("Cannot destructure property 'Origin' of ... as it is undefined"),
// even though a plain Node `require()` (confirmed in a standalone test)
// returns the real exports object. require() sidesteps that interop.
import { SIGN_KEYS } from "./vedicConstants";
const { Origin, Horoscope } = require("circular-natal-horoscope-js");

const PLANET_KEYS = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"];

const GEOCODE_HEADERS = { "User-Agent": "Palmara/1.0 (contact: hello@palmara.in)" };

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Best-effort: returns null on any failure (no API key, place not found,
// network issue) rather than throwing — the chart is a bonus feature, never
// something that should block reading generation.
async function geocodePlace(place) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(place)}`;
    const res = await fetchWithTimeout(url, { headers: GEOCODE_HEADERS }, 6000);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || !data[0]) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch (err) {
    console.error("Geocoding failed:", err.message);
    return null;
  }
}

// birthTime is stored as "hh:mm AM/PM" (see BirthDetailsForm's to12Hour).
function parse12Hour(timeStr) {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec((timeStr || "").trim());
  if (!m) return null;
  let hour = parseInt(m[1], 10) % 12;
  if (/PM/i.test(m[3])) hour += 12;
  return { hour, minute: parseInt(m[2], 10) };
}

function signOf(body) {
  return Math.round(body.Sign.zodiacStart / 30); // 0=Aries ... 11=Pisces
}

function degreeInSign(body) {
  return body.ChartPosition.Ecliptic.DecimalDegrees - body.Sign.zodiacStart;
}

// Navamsa (D9) — a standard classical divisional chart used for
// relationships and deeper values. Each 30° sign is divided into nine
// 3°20' segments; which sign the segment maps to depends on the modality
// of the birth (D1) sign: movable signs start the count from themselves,
// fixed signs from the 9th sign, dual/mutable signs from the 5th sign.
// This is a fixed, well-documented formula, not something to compute ad
// hoc — verified here against known reference examples (e.g. Taurus, a
// fixed sign, correctly starts its navamsa count from Capricorn).
const MOVABLE_SIGNS = [0, 3, 6, 9];
const FIXED_SIGNS = [1, 4, 7, 10];

export function navamsaSignIndex(signIndex, degreeInSign) {
  let start;
  if (MOVABLE_SIGNS.includes(signIndex)) start = signIndex;
  else if (FIXED_SIGNS.includes(signIndex)) start = (signIndex + 8) % 12;
  else start = (signIndex + 4) % 12; // dual/mutable signs
  const part = Math.min(8, Math.floor(degreeInSign / (30 / 9)));
  return (start + part) % 12;
}

export function nakshatraOf(moonDecimalDegrees) {
  const span = 360 / 27;
  const index = Math.floor(moonDecimalDegrees / span) % 27;
  const pada = Math.floor((moonDecimalDegrees % span) / (span / 4)) + 1;
  return { index, pada };
}

// Returns a plain-data chart object, or null if geocoding/computation
// failed (e.g. an unrecognized place name) — callers must treat the chart
// as optional.
export async function computeVedicChart({ dob, birthTime, birthTimeUnknown, birthPlace }) {
  if (!dob || !birthPlace) return null;

  const coords = await geocodePlace(birthPlace);
  if (!coords) return null;

  const [year, month, day] = dob.split("-").map(Number);
  if (!year || !month || !day) return null;

  let hour = 12;
  let minute = 0;
  let timeIsApprox = true;
  if (!birthTimeUnknown && birthTime) {
    const parsed = parse12Hour(birthTime);
    if (parsed) {
      hour = parsed.hour;
      minute = parsed.minute;
      timeIsApprox = false;
    }
  }

  try {
    const origin = new Origin({
      year,
      month: month - 1,
      date: day,
      hour,
      minute,
      latitude: coords.lat,
      longitude: coords.lon,
    });

    const horoscope = new Horoscope({
      origin,
      houseSystem: "whole-sign",
      zodiac: "sidereal",
      aspectPoints: [],
      aspectWithPoints: [],
      aspectTypes: [],
      customOrbs: {},
      language: "en",
    });

    const bodiesByKey = {};
    horoscope.CelestialBodies.all.forEach((b) => {
      bodiesByKey[b.key] = b;
    });

    const moonBody = bodiesByKey.moon;
    const moonSignIndex = moonBody ? signOf(moonBody) : null;
    const ascendantSignIndex = timeIsApprox ? null : signOf(horoscope.Ascendant);
    // Without an exact birth time there's no reliable Ascendant, so the
    // chart falls back to a Moon-sign-based chart (house 1 = Moon's sign) —
    // a standard, documented alternative when Lagna can't be computed,
    // rather than showing a placeholder or a guessed Ascendant.
    const chartBasis = ascendantSignIndex !== null ? "lagna" : "moon";
    const houseBaseSignIndex = ascendantSignIndex !== null ? ascendantSignIndex : moonSignIndex;

    function houseFor(signIndex) {
      if (houseBaseSignIndex === null || signIndex === null) return null;
      return ((signIndex - houseBaseSignIndex + 12) % 12) + 1;
    }

    const planets = {};
    PLANET_KEYS.forEach((key) => {
      const body = bodiesByKey[key];
      if (!body) return;
      const sIdx = signOf(body);
      const degIn = degreeInSign(body);
      planets[key] = {
        signIndex: sIdx,
        degreeInSign: degIn,
        house: houseFor(sIdx),
        navamsaSignIndex: navamsaSignIndex(sIdx, degIn),
      };
    });

    const northNode = horoscope.CelestialPoints.northnode;
    const southNode = horoscope.CelestialPoints.southnode;
    if (northNode) {
      const sIdx = signOf(northNode);
      const degIn = degreeInSign(northNode);
      planets.rahu = { signIndex: sIdx, degreeInSign: degIn, house: houseFor(sIdx), navamsaSignIndex: navamsaSignIndex(sIdx, degIn) };
    }
    if (southNode) {
      const sIdx = signOf(southNode);
      const degIn = degreeInSign(southNode);
      planets.ketu = { signIndex: sIdx, degreeInSign: degIn, house: houseFor(sIdx), navamsaSignIndex: navamsaSignIndex(sIdx, degIn) };
    }

    const nakshatra = moonBody ? nakshatraOf(moonBody.ChartPosition.Ecliptic.DecimalDegrees) : null;

    return {
      ascendantSignIndex,
      moonSignIndex,
      chartBasis,
      houseBaseSignIndex,
      planets,
      nakshatra,
      timeIsApprox,
    };
  } catch (err) {
    console.error("Vedic chart computation failed:", err.message);
    return null;
  }
}

export { SIGN_KEYS };
