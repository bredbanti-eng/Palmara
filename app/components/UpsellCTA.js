"use client";

import { useState } from "react";
import { useLang } from "./LangProvider";
import { IconCheck } from "./icons";

export default function UpsellCTA({ reportId }) {
  const { tr } = useLang();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, name, contact, interest: "mahadasha" }),
    });
    setSubmitting(false);
    setSent(true);
  }

  if (sent) {
    return (
      <p className="upsell-thanks">
        <IconCheck size={16} />
        {tr("upsell_thanks")}
      </p>
    );
  }

  return (
    <div>
      <h3>{tr("upsell_heading")}</h3>
      <p>{tr("upsell_body")}</p>
      <form onSubmit={handleSubmit} className="upsell-form">
        <input
          type="text"
          className="input"
          placeholder={tr("upsell_name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          aria-label={tr("upsell_name")}
        />
        <input
          type="text"
          className="input"
          placeholder={tr("upsell_contact")}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
          aria-label={tr("upsell_contact")}
        />
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {tr("upsell_submit")}
        </button>
      </form>
    </div>
  );
}
