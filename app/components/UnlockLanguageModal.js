"use client";

import { useEffect, useState } from "react";
import { IconX, IconCheck, IconBook, IconSparkle } from "./icons";
import { t } from "@/lib/i18n";
import { BASE_PRICE_INR, MANTRA_ADDON_PRICE_INR } from "@/lib/pricing";

const CONFETTI = [
  { dx: "-26px", dy: "-18px", color: "var(--gold)" },
  { dx: "-4px", dy: "-30px", color: "var(--maroon)" },
  { dx: "20px", dy: "-22px", color: "var(--green)" },
  { dx: "-30px", dy: "6px", color: "var(--gold-light)" },
  { dx: "26px", dy: "2px", color: "var(--maroon-deep)" },
  { dx: "6px", dy: "22px", color: "var(--gold)" },
];

// Shown before checkout opens, regardless of which unlock entry point was
// clicked (main CTA, sticky bar, or a locked section's own overlay).
// Two phases in one modal, no extra screen to abandon on: pick a language
// first (bilingual, since we don't know the choice yet), then — once
// picked — the same card swaps to the Mantra Companion order-bump offer in
// the chosen language, with a running total, before checkout ever opens.
export default function UnlockLanguageModal({ open, loading, onContinue, onClose }) {
  const [phase, setPhase] = useState("language");
  const [chosenLang, setChosenLang] = useState(null);
  const [addonSelected, setAddonSelected] = useState(false);
  const [burstKey, setBurstKey] = useState(0);

  // Reset to a clean first phase every time the modal is reopened, rather
  // than leaving it wherever the visitor left it last time (e.g. mid-bump
  // after closing without paying).
  useEffect(() => {
    if (open) {
      setPhase("language");
      setChosenLang(null);
      setAddonSelected(false);
    }
  }, [open]);

  if (!open) return null;

  function pickLang(l) {
    setChosenLang(l);
    setPhase("bump");
  }

  function toggleAddon() {
    setAddonSelected((prev) => {
      const next = !prev;
      if (next) setBurstKey((k) => k + 1);
      return next;
    });
  }

  function handleContinue() {
    onContinue({ lang: chosenLang, addonMantra: addonSelected });
  }

  const total = BASE_PRICE_INR + (addonSelected ? MANTRA_ADDON_PRICE_INR : 0);

  return (
    <div
      className="modal-overlay fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Choose your report language"
      onClick={loading ? undefined : onClose}
    >
      <div
        className={`modal-card modal-card--lang fade-up ${phase === "bump" ? "modal-card--bump" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {!loading && (
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <IconX size={18} />
          </button>
        )}

        {phase === "language" && (
          <div key="phase-language">
            <h2>Choose your report language</h2>
            <p>आपकी रिपोर्ट किस भाषा में चाहिए?</p>
            <div className="lang-choice-row">
              <button
                type="button"
                className="btn btn-secondary lang-choice-btn"
                onClick={() => pickLang("en")}
              >
                English
              </button>
              <button
                type="button"
                className="btn btn-secondary lang-choice-btn"
                onClick={() => pickLang("hi")}
              >
                हिंदी
              </button>
            </div>
          </div>
        )}

        {phase === "bump" && (
          <div key="phase-bump" className="fade-up">
            <button
              type="button"
              className="bump-back-link"
              onClick={() => setPhase("language")}
              disabled={loading}
            >
              {chosenLang === "hi" ? "‹ भाषा बदलें" : "‹ change language"}
            </button>

            <div className="bump-card">
              <span className="bump-badge">
                <IconSparkle size={11} />
                {t(chosenLang, "addon_badge")}
                <IconSparkle size={11} />
              </span>

              <div className="bump-icon-wrap">
                <IconBook size={26} />
                <IconSparkle size={13} className="bump-sparkle bump-sparkle--1" />
                <IconSparkle size={9} className="bump-sparkle bump-sparkle--2" />
                <IconSparkle size={8} className="bump-sparkle bump-sparkle--3" />
              </div>

              <h3 className="bump-heading">{t(chosenLang, "addon_heading")}</h3>
              <p className="bump-body">{t(chosenLang, "addon_body")}</p>

              <ul className="bump-bullets">
                <li>
                  <IconCheck size={13} />
                  {t(chosenLang, "addon_bullet_1")}
                </li>
                <li>
                  <IconCheck size={13} />
                  {t(chosenLang, "addon_bullet_2")}
                </li>
                <li>
                  <IconCheck size={13} />
                  {t(chosenLang, "addon_bullet_3")}
                </li>
              </ul>

              <label
                className={`bump-checkbox-row ${addonSelected ? "bump-checkbox-row--checked" : ""}`}
              >
                <span className="bump-checkbox-box">
                  {addonSelected && <IconCheck size={13} />}
                </span>
                <input
                  type="checkbox"
                  checked={addonSelected}
                  onChange={toggleAddon}
                  disabled={loading}
                  className="bump-checkbox-input"
                />
                <span className="bump-checkbox-label">{t(chosenLang, "addon_checkbox_label")}</span>
                <span className="bump-price-tag">
                  <span className="bump-price-was">{t(chosenLang, "addon_price_was")}</span>
                  <span className="bump-price-now">{t(chosenLang, "addon_price_now")}</span>
                </span>

                {addonSelected && (
                  <span key={burstKey} className="confetti-burst" aria-hidden="true">
                    {CONFETTI.map((c, i) => (
                      <i
                        key={i}
                        className="confetti-dot"
                        style={{ "--dx": c.dx, "--dy": c.dy, background: c.color, animationDelay: `${i * 0.03}s` }}
                      />
                    ))}
                  </span>
                )}
              </label>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-block bump-cta"
              onClick={handleContinue}
              disabled={loading}
            >
              {loading && <span className="spinner spinner--on-dark" />}
              {loading ? (
                chosenLang === "hi" ? "सुरक्षित भुगतान खुल रहा है…" : "Opening secure checkout…"
              ) : (
                <>
                  {t(chosenLang, "continue_to_payment")}
                  {" — "}
                  <span key={total} className="bump-cta-price">₹{total}</span>
                </>
              )}
            </button>
            <p className="bump-skip-note">{t(chosenLang, "addon_skip_note")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
