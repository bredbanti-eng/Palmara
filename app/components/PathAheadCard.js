"use client";

import { IconLock } from "./icons";

// The year + theme label for all 5 years is free — a real 5-year timeline
// given away up front is strong, concrete value on its own. What's locked is
// the "insight" per year: the specific why-and-what-to-do that turns a
// one-line label into actual guidance.
export default function PathAheadCard({ title, hook, years, locked, unlockLabel, insightsLabel, onUnlockClick }) {
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

      {locked ? (
        <div className="path-ahead-locked-wrap">
          {insightsLabel && <p className="section-teaser">
            <IconLock size={13} />
            {insightsLabel}
          </p>}
          <ul className="path-ahead-list section-continuation" aria-hidden="true">
            {years.map((y) => (
              <li className="path-ahead-row" key={`insight-${y.year}`}>
                <span className="path-ahead-year">{y.year}</span>
                <span className="path-ahead-theme">{y.insight}</span>
              </li>
            ))}
          </ul>
          <button type="button" className="section-lock-overlay" onClick={onUnlockClick}>
            <span className="section-lock-chip">
              <IconLock size={16} />
              {unlockLabel}
            </span>
          </button>
        </div>
      ) : (
        <ul className="path-ahead-list path-ahead-insights">
          {years.map((y) => (
            <li className="path-ahead-row" key={`insight-${y.year}`}>
              <span className="path-ahead-year" aria-hidden="true" />
              <span className="path-ahead-theme path-ahead-insight-text">{y.insight}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
