"use client";

import { IconLock } from "./icons";

// Free preview shows year 1 and 2 in full, then year 3 cut off mid-theme —
// a visible, deliberate "there's more here" cliffhanger rather than either
// giving away the whole 5-year timeline or hiding it entirely. Years 4-5
// and every year's "insight" (the why/what-to-do) stay fully locked.
const FREE_YEARS = 2;

function splitThemeInHalf(theme) {
  const words = (theme || "").trim().split(/\s+/);
  const half = Math.max(1, Math.ceil(words.length / 2));
  return { visible: words.slice(0, half).join(" "), rest: words.slice(half).join(" ") };
}

export default function PathAheadCard({ title, hook, years, locked, unlockLabel, onUnlockClick }) {
  if (!locked) {
    return (
      <div className="card section-card fade-up">
        <h3 className="section-title">{title}</h3>
        {hook && <p className="section-hook">{hook}</p>}
        <ul className="path-ahead-list">
          {years.map((y) => (
            <li className="path-ahead-row" key={y.year}>
              <span className="path-ahead-year">{y.year}</span>
              <span className="path-ahead-theme">{y.theme}</span>
            </li>
          ))}
        </ul>
        <ul className="path-ahead-list path-ahead-insights">
          {years.map((y) => (
            <li className="path-ahead-row" key={`insight-${y.year}`}>
              <span className="path-ahead-year" aria-hidden="true" />
              <span className="path-ahead-theme path-ahead-insight-text">{y.insight}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const freeYears = years.slice(0, FREE_YEARS);
  const partialYear = years[FREE_YEARS];
  const hiddenYears = years.slice(FREE_YEARS + 1);
  const partialSplit = partialYear ? splitThemeInHalf(partialYear.theme) : null;

  return (
    <div className="card section-card fade-up">
      <h3 className="section-title">{title}</h3>
      {hook && <p className="section-hook">{hook}</p>}
      <ul className="path-ahead-list">
        {freeYears.map((y) => (
          <li className="path-ahead-row" key={y.year}>
            <span className="path-ahead-year">{y.year}</span>
            <span className="path-ahead-theme">{y.theme}</span>
          </li>
        ))}
      </ul>

      <div className="path-ahead-locked-wrap">
        <ul className="path-ahead-list">
          {partialYear && (
            <li className="path-ahead-row">
              <span className="path-ahead-year">{partialYear.year}</span>
              <span className="path-ahead-theme">
                {partialSplit.visible}
                {partialSplit.rest && (
                  <span className="section-continuation" aria-hidden="true"> {partialSplit.rest}</span>
                )}
              </span>
            </li>
          )}
          {hiddenYears.length > 0 && (
            <li className="section-continuation" aria-hidden="true">
              <ul className="path-ahead-list">
                {hiddenYears.map((y) => (
                  <li className="path-ahead-row" key={y.year}>
                    <span className="path-ahead-year">{y.year}</span>
                    <span className="path-ahead-theme">{y.theme}</span>
                  </li>
                ))}
              </ul>
            </li>
          )}
        </ul>
        <button type="button" className="section-lock-overlay" onClick={onUnlockClick}>
          <span className="section-lock-chip">
            <IconLock size={16} />
            {unlockLabel}
          </span>
        </button>
      </div>
    </div>
  );
}
