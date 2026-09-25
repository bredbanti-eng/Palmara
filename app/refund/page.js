"use client";

import SiteHeader from "../components/SiteHeader";
import { useLang } from "../components/LangProvider";

export default function RefundPage() {
  const { lang, tr } = useLang();

  return (
    <>
      <SiteHeader />
      <main className="wrap wrap-narrow legal" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-12)" }}>
        {lang === "hi" ? (
          <>
            <h1>धनवापसी नीति</h1>
            <p>
              <strong>पालमारा पर सभी खरीदारी अंतिम हैं। भुगतान पूरा होने के बाद हम कोई
              धनवापसी नहीं करते</strong>, क्योंकि आपकी रीडिंग भुगतान के तुरंत बाद तैयार
              और अनलॉक हो जाती है।
            </p>
            <p>
              कृपया खरीदने से पहले यह जान लें कि रीडिंग में क्या शामिल है। यदि भुगतान में
              कोई वास्तविक समस्या हुई हो (जैसे भुगतान हुआ लेकिन कुछ भी नहीं मिला), तो{" "}
              <a href="mailto:hello@palmara.in">hello@palmara.in</a> पर हमसे संपर्क करें
              — हम इसकी जांच करेंगे।
            </p>
            <p className="updated">
              अंतिम अद्यतन: 2026
            </p>
          </>
        ) : (
          <>
            <h1>Refund Policy</h1>
            <p>
              <strong>All purchases on Palmara are final. We do not offer refunds</strong>{" "}
              once payment is completed, since your reading is generated and unlocked
              immediately.
            </p>
            <p>
              Please review what a reading includes before purchasing. If you have a
              genuine payment issue (e.g. you were charged but nothing was delivered at
              all), contact us at{" "}
              <a href="mailto:hello@palmara.in">hello@palmara.in</a> and we'll look into
              it.
            </p>
            <p className="updated">
              Last updated: 2026
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
