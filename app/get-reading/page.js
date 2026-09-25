"use client";

import SiteHeader from "../components/SiteHeader";
import PalmUploader from "../components/PalmUploader";
import { useLang } from "../components/LangProvider";

export default function GetReadingPage() {
  const { tr } = useLang();
  return (
    <>
      <SiteHeader />
      <main className="wrap wrap-narrow" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-12)" }}>
        <PalmUploader />
        <div className="honesty-note section">{tr("honesty_note")}</div>
      </main>
      <footer className="wrap">
        <span>© 2026 {tr("brand")}</span>
        <a href="mailto:hello@palmara.in">{tr("nav_contact")}</a>
      </footer>
    </>
  );
}
