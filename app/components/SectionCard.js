"use client";

import { IconLock } from "./icons";

const VISIBLE_WORDS = 28;

export default function SectionCard({ title, hook, body, locked, unlockLabel, onUnlockClick }) {
  if (!locked) {
    return (
      <div className="card section-card fade-up">
        <h3 className="section-title">{title}</h3>
        {hook && <p className="section-hook">{hook}</p>}
        <p className="section-body">{body}</p>
      </div>
    );
  }

  const words = body.trim().split(/\s+/);
  const visible = words.slice(0, VISIBLE_WORDS).join(" ");
  const rest = words.slice(VISIBLE_WORDS).join(" ");

  return (
    <div className="card section-card fade-up">
      <h3 className="section-title">{title}</h3>
      {hook && <p className="section-hook">{hook}</p>}
      {/* Clipped independently of the hook above, so a longer (2-3 line)
          hook never pushes the visible body words into the blur zone. */}
      <div className="section-locked-wrap">
        <p className="section-body">
          {visible}
          {rest && <span className="section-continuation" aria-hidden="true"> {rest}</span>}
        </p>
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
