"use client";

import { IconLock } from "./icons";

// preview is genuinely complete free content (not a mid-sentence word-count
// cutoff of the paid text) — so the free/locked split falls on a clean
// paragraph boundary instead of chopping a sentence in half. teaser is a
// specific, always-visible one-liner naming what's inside deepDive, meant to
// read as a real curiosity hook rather than a generic "unlock for more".
export default function SectionCard({ title, hook, preview, teaser, deepDive, body, locked, unlockLabel, onUnlockClick }) {
  // body is a fallback for any legacy pre-restructure report row.
  const previewText = preview || body;
  const deepDiveText = deepDive || "";

  if (!locked) {
    return (
      <div className="card section-card fade-up">
        <h3 className="section-title">{title}</h3>
        {hook && <p className="section-hook">{hook}</p>}
        <p className="section-body">{previewText}</p>
        {deepDiveText && <p className="section-body">{deepDiveText}</p>}
      </div>
    );
  }

  return (
    <div className="card section-card fade-up">
      <h3 className="section-title">{title}</h3>
      {hook && <p className="section-hook">{hook}</p>}
      <p className="section-body">{previewText}</p>
      {teaser && (
        <p className="section-teaser">
          <IconLock size={13} />
          {teaser}
        </p>
      )}
      {deepDiveText && (
        <div className="section-locked-wrap">
          <p className="section-body section-continuation" aria-hidden="true">
            {deepDiveText}
          </p>
          <button type="button" className="section-lock-overlay" onClick={onUnlockClick}>
            <span className="section-lock-chip">
              <IconLock size={16} />
              {unlockLabel}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
