"use client";

import SiteHeader from "../components/SiteHeader";
import { useLang } from "../components/LangProvider";

export default function AboutPage() {
  const { lang, tr } = useLang();

  return (
    <>
      <SiteHeader />
      <main className="wrap wrap-narrow legal" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-12)" }}>
        {lang === "hi" ? (
          <>
            <h1>पालमारा के बारे में</h1>
            <p>
              पालमारा वैदिक हस्तरेखा और ज्योतिष में रुचि रखने वाले लोगों की एक टीम द्वारा
              बनाया गया है। हम मानते हैं कि पारंपरिक हस्तरेखा शास्त्र, जब सोच-समझकर और
              ईमानदारी से प्रस्तुत किया जाए, तो आत्म-चिंतन का एक सार्थक ज़रिया बन सकता है
              — बिना किसी झूठे दावे के कि यह आपके भविष्य की गारंटी देता है।
            </p>
            <p>
              हमारी हर रीडिंग आपकी हथेली के वास्तविक, मापे गए आकार और आपके साझा किए गए
              जन्म-विवरण पर आधारित होती है — कोई सामान्य, एक-जैसा उत्तर नहीं।
            </p>
          </>
        ) : (
          <>
            <h1>About Palmara</h1>
            <p>
              Palmara was built by a team interested in Vedic palmistry and astrology.
              We believe traditional palmistry, presented thoughtfully and honestly, can
              be a genuinely useful tool for self-reflection — without claiming to
              guarantee your future.
            </p>
            <p>
              Every reading is grounded in your hand's real, measured shape and the
              birth details you share — not a generic, one-size-fits-all answer.
            </p>
            <p>
              Questions or feedback? Write to us at{" "}
              <a href="mailto:hello@palmara.in">hello@palmara.in</a>.
            </p>
          </>
        )}
      </main>
      <footer className="wrap">
        <span>© 2026 {tr("brand")}</span>
        <a href="mailto:hello@palmara.in">{tr("nav_contact")}</a>
      </footer>
    </>
  );
}
