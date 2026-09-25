"use client";

import SiteHeader from "../components/SiteHeader";
import { useLang } from "../components/LangProvider";

export default function TermsPage() {
  const { lang, tr } = useLang();

  return (
    <>
      <SiteHeader />
      <main className="wrap wrap-narrow legal" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-12)" }}>
        {lang === "hi" ? (
          <>
            <h1>नियम एवं शर्तें</h1>
            <p>
              पालमारा एक वैदिक हस्तरेखा और ज्योतिष रीडिंग सेवा है, जो <strong>मनोरंजन और आत्म-चिंतन</strong> के उद्देश्य से प्रदान की जाती है। यह चिकित्सा, कानूनी, वित्तीय, या किसी अन्य पेशेवर सलाह का विकल्प नहीं है।
            </p>
            <h2>सेवा की प्रकृति</h2>
            <p>
              हमारी रीडिंग पारंपरिक हस्तरेखा और ज्योतिष प्रथाओं पर आधारित हैं, साथ ही आपके द्वारा साझा किए गए हाथ के आकार और जन्म-विवरण पर आधारित एक व्यक्तिगत लेखन पर। <strong>रीडिंग में मौजूद हर बात एक पारंपरिक व्याख्या या अनुमान है — यह कोई तथ्यात्मक दावा, गारंटी, या निश्चित भविष्यवाणी नहीं है।</strong> इसे अपने जीवन के बारे में एक तथ्य के रूप में नहीं, बल्कि आत्म-चिंतन के एक साधन के रूप में लें।
            </p>
            <h2>भुगतान</h2>
            <p>
              पूरी रीडिंग अनलॉक करने के लिए एक बार का भुगतान आवश्यक है, जो Razorpay के माध्यम से सुरक्षित रूप से संसाधित किया जाता है। हम आपकी भुगतान जानकारी संग्रहीत नहीं करते।
            </p>
            <h2>उपयोगकर्ता की जिम्मेदारी</h2>
            <p>
              आप पुष्टि करते हैं कि आपके द्वारा साझा किया गया विवरण (नाम, जन्म तिथि, आदि) सही है। हथेली की फ़ोटो केवल इस रीडिंग के लिए उपयोग की जाती है।
            </p>
            <p className="updated">
              अंतिम अद्यतन: 2026
            </p>
          </>
        ) : (
          <>
            <h1>Terms &amp; Conditions</h1>
            <p>
              Palmara is a Vedic palmistry and astrology reading service, provided for{" "}
              <strong>entertainment and self-reflection purposes</strong>. It is not a
              substitute for medical, legal, financial, or other professional advice.
            </p>
            <h2>Nature of the service</h2>
            <p>
              Our readings are based on traditional palmistry and astrology practices,
              combined with a personalized narrative generated from your hand shape and
              birth details. <strong>Everything in a reading is an interpretation or
              assumption drawn from traditional practice — not a factual claim, not a
              guarantee, and not a prediction we stand behind as certain to happen.</strong>{" "}
              Treat it as a reflective tool, not a statement of fact about your life or
              future.
            </p>
            <h2>Payment</h2>
            <p>
              A one-time payment is required to unlock your full reading, processed
              securely through Razorpay. We do not store your payment information.
            </p>
            <h2>Your responsibility</h2>
            <p>
              You confirm that the details you share (name, date of birth, etc.) are
              accurate. Your palm photo is used only to generate this reading.
            </p>
            <h2>Changes to these terms</h2>
            <p>
              We may update these terms from time to time. Continued use of Palmara
              after changes means you accept the updated terms.
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
