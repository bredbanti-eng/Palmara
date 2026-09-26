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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Nominatim's usage policy caps free usage at ~1 request/second and will
// return 403/429 when that's exceeded — on shared infrastructure like
// Vercel (many unrelated apps can share an egress IP), that threshold can
// be hit by traffic this app never sent. A single such response used to
// permanently drop the chart for that reading. Retries with backoff on
// exactly the transient statuses (429/403/5xx) — never on a clean "no
// results" response, which arrives as 200 with an empty array and means
// try the next fallback query, not retry this one.
async function geocodeQuery(query, attempt = 1) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetchWithTimeout(url, { headers: GEOCODE_HEADERS }, 8000);
  if (!res.ok) {
    const transient = res.status === 429 || res.status === 403 || res.status >= 500;
    if (transient && attempt < 3) {
      console.error(`Geocoding got ${res.status} for "${query}" (attempt ${attempt}/3) — retrying`);
      await sleep(attempt * 500);
      return geocodeQuery(query, attempt + 1);
    }
    console.error(`Geocoding failed for "${query}": HTTP ${res.status}`);
    return null;
  }
  const data = await res.json();
  if (!Array.isArray(data) || !data[0]) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

// Best-effort: returns null on any failure (place not found, network issue,
// geocoder unavailable) rather than throwing.
//
// A free-text birth place like "Kanhalgaon, Brahmapuri, Chandrapur,
// Maharashtra" often fails to geocode as a whole (small villages aren't
// always indexed), so on a miss this progressively drops the leading
// (most specific) segment and retries with the broader remainder —
// "Brahmapuri, Chandrapur, Maharashtra", then "Chandrapur, Maharashtra",
// etc. — which is far more likely to resolve, at some loss of precision
// that's still far better than no chart at all. A short pause between
// attempts also keeps this comfortably under Nominatim's 1 req/sec policy.
async function geocodePlace(place) {
  const segments = (place || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!segments.length) return null;

  for (let start = 0; start < segments.length; start++) {
    const query = segments.slice(start).join(", ");
    try {
      const result = await geocodeQuery(query);
      if (result) return result;
    } catch (err) {
      console.error(`Geocoding attempt failed for "${query}":`, err.message);
    }
    if (start < segments.length - 1) await sleep(300);
  }
  return null;
}

// Roughly the geographic center of India — used only as a last-resort
// stand-in when geocoding fails entirely, and only to give the ephemeris
// library *some* coordinate to run with. Sun/Moon/planet sidereal
// positions, the Nakshatra, and the Navamsa are all location-independent
// (they only depend on date and time), so they're fully accurate even
// with this placeholder. The Ascendant and houses genuinely do depend on
// location, so computeVedicChart forces a Moon-basis chart (same as the
// "birth time unknown" fallback) whenever this placeholder is used,
// rather than presenting a location-dependent Ascendant computed from a
// coordinate that isn't actually where the person was born.
const FALLBACK_COORDS = { lat: 22.5, lon: 79.0 };

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

// Returns a plain-data chart object, or null only if the birth date itself
// can't be parsed or the ephemeris computation throws — callers must still
// treat the chart as optional, but geocoding failure alone no longer
// suppresses it (see FALLBACK_COORDS above).
export async function computeVedicChart({ dob, birthTime, birthTimeUnknown, birthPlace }) {
  if (!dob || !birthPlace) return null;

  const coords = await geocodePlace(birthPlace);
  const locationIsApprox = !coords;
  const usableCoords = coords || FALLBACK_COORDS;

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
      latitude: usableCoords.lat,
      longitude: usableCoords.lon,
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
    // The Ascendant is only trustworthy with both a real birth time AND a
    // real (geocoded) location — without either, the chart falls back to a
    // Moon-sign-based chart (house 1 = Moon's sign), a standard, documented
    // alternative when Lagna can't be reliably computed, rather than
    // showing a guessed Ascendant.
    const ascendantSignIndex = timeIsApprox || locationIsApprox ? null : signOf(horoscope.Ascendant);
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
      locationIsApprox,
    };
  } catch (err) {
    console.error("Vedic chart computation failed:", err.message);
    return null;
  }
}

export { SIGN_KEYS };
