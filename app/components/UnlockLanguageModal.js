"use client";

import { IconX } from "./icons";

// Shown before checkout opens, regardless of which unlock entry point was
// clicked (main CTA, sticky bar, or a locked section's own overlay). Shows
// both languages up front since the whole point is letting the visitor pick.
export default function UnlockLanguageModal({ open, loading, onChoose, onClose }) {
  if (!open) return null;

  return (
    <div
      className="modal-overlay fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Choose your report language"
      onClick={loading ? undefined : onClose}
    >
      <div className="modal-card modal-card--lang fade-up" onClick={(e) => e.stopPropagation()}>
        {!loading && (
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <IconX size={18} />
          </button>
        )}
        <h2>Choose your report language</h2>
        <p>आपकी रिपोर्ट किस भाषा में चाहिए?</p>
        <div className="lang-choice-row">
          <button
            type="button"
            className="btn btn-secondary lang-choice-btn"
            onClick={() => onChoose("en")}
            disabled={loading}
          >
            English
          </button>
          <button
            type="button"
            className="btn btn-secondary lang-choice-btn"
            onClick={() => onChoose("hi")}
            disabled={loading}
          >
            हिंदी
          </button>
        </div>
        {loading && (
          <div className="loading-row loading-row--center" style={{ marginTop: "var(--space-5)" }}>
            <span className="spinner" />
            <span>Opening secure checkout…</span>
          </div>
        )}
      </div>
    </div>
  );
}
