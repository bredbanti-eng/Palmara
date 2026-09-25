"use client";

import { IconLock } from "./icons";

// The Path Ahead section is a timeline (not prose): the first year is shown
// in full, the remaining years sit behind the same blur/lock treatment as
// every other section, but as rows rather than trailing words — deliberately
// concrete ("4 more specific years, right there, blurred") rather than the
// vaguer word-count cutoff used elsewhere.
export default function PathAheadCard({ title, hook, years, locked, unlockLabel, onUnlockClick }) {
  const [first, ...rest] = years;

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
      </div>
    );
  }

  return (
    <div className="card section-card fade-up">
      <h3 className="section-title">{title}</h3>
      {hook && <p className="section-hook">{hook}</p>}
      {/* Clipped independently of the hook above, so a longer hook never
          pushes the always-visible first year into the blur zone. */}
      <div className="path-ahead-locked-wrap">
        <ul className="path-ahead-list">
          <li className="path-ahead-row">
            <span className="path-ahead-year">{first.year}</span>
            <span className="path-ahead-theme">{first.theme}</span>
          </li>
          <li className="section-continuation" aria-hidden="true">
            <ul className="path-ahead-list">
              {rest.map((y) => (
                <li className="path-ahead-row" key={y.year}>
                  <span className="path-ahead-year">{y.year}</span>
                  <span className="path-ahead-theme">{y.theme}</span>
                </li>
              ))}
            </ul>
          </li>
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
