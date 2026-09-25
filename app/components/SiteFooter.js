"use client";

import Link from "next/link";
import { useLang } from "./LangProvider";

export default function SiteFooter() {
  const { lang, tr } = useLang();
  return (
    <footer className="site-footer">
      <div className="wrap">
        <nav className="footer-links" aria-label="Footer">
          <Link href="/about">{lang === "hi" ? "हमारे बारे में" : "About"}</Link>
          <Link href="/terms">{lang === "hi" ? "नियम एवं शर्तें" : "Terms & Conditions"}</Link>
          <Link href="/privacy">{lang === "hi" ? "गोपनीयता नीति" : "Privacy Policy"}</Link>
          <Link href="/refund">{lang === "hi" ? "धनवापसी नीति" : "Refund Policy"}</Link>
          <a href="mailto:hello@palmara.in">{tr("nav_contact")}</a>
        </nav>
        <span className="copyright">© 2026 {tr("brand")}</span>
      </div>
    </footer>
  );
}
