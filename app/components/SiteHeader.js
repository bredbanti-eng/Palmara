"use client";

import Link from "next/link";
import PalmaraIcon from "./PalmaraIcon";
import { useLang } from "./LangProvider";

export default function SiteHeader() {
  const { lang, setLang, tr } = useLang();
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/" className="wordmark">
          <PalmaraIcon size={28} />
          {tr("brand")}
        </Link>
        <div className="lang-toggle" role="group" aria-label="Language">
          <button
            type="button"
            className={lang === "en" ? "active" : ""}
            aria-pressed={lang === "en"}
            onClick={() => setLang("en")}
          >
            English
          </button>
          <button
            type="button"
            className={lang === "hi" ? "active" : ""}
            aria-pressed={lang === "hi"}
            onClick={() => setLang("hi")}
          >
            हिंदी
          </button>
        </div>
      </div>
    </header>
  );
}
