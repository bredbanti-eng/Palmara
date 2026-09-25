"use client";

import { useLang } from "./LangProvider";
import { IconX, IconCheck, IconAlert } from "./icons";

export default function EmailSentModal({ status, email, onDownload, onClose }) {
  const { tr } = useLang();
  const dismissable = status !== "sending";

  return (
    <div
      className="modal-overlay fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={tr("email_sent_title")}
      onClick={dismissable ? onClose : undefined}
    >
      <div className="modal-card fade-up" onClick={(e) => e.stopPropagation()}>
        {dismissable && (
          <button className="modal-close" onClick={onClose} aria-label={tr("modal_close")}>
            <IconX size={18} />
          </button>
        )}

        {status === "sending" && (
          <div className="loading-row loading-row--center" aria-live="polite">
            <span className="spinner" />
            <span>{tr("email_sending")}</span>
          </div>
        )}

        {status === "sent" && (
          <>
            <div className="check-pop" style={{ margin: "0 auto var(--space-4)" }}>
              <IconCheck size={16} />
            </div>
            <h2>{tr("email_sent_title")}</h2>
            <p>
              {tr("email_sent_body")} <strong>{email}</strong>.
            </p>
            <p className="text-soft" style={{ fontSize: "var(--text-xs)" }}>
              {tr("email_sent_check_spam")}
            </p>
          </>
        )}

        {status === "failed" && (
          <>
            <IconAlert size={28} style={{ color: "var(--maroon)", margin: "0 auto var(--space-3)", display: "block" }} />
            <h2>{tr("brand")}</h2>
            <p className="error-text">{tr("email_failed")}</p>
          </>
        )}

        {status !== "sending" && (
          <div className="modal-actions">
            <button className="btn btn-primary" onClick={onDownload}>
              {tr("download_pdf")}
            </button>
            <button className="btn btn-ghost" onClick={onClose}>
              {tr("modal_close")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
