"use client";

import SiteHeader from "../components/SiteHeader";
import { useLang } from "../components/LangProvider";

export default function PrivacyPage() {
  const { lang, tr } = useLang();

  return (
    <>
      <SiteHeader />
      <main className="wrap wrap-narrow legal" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-12)" }}>
        {lang === "hi" ? (
          <>
            <h1>गोपनीयता नीति</h1>
            <h2>आपकी हथेली की फ़ोटो</h2>
            <p>
              आपकी हथेली की फ़ोटो <strong>आपके ब्राउज़र में ही प्रोसेस होती है</strong>। यह
              कभी हमारे सर्वर पर अपलोड या संग्रहीत नहीं होती — केवल हाथ के आकार से जुड़े
              माप (जैसे उंगली/हथेली का अनुपात) भेजे जाते हैं, फ़ोटो नहीं।
            </p>
            <h2>हम क्या संग्रहीत करते हैं</h2>
            <p>
              आपका नाम, जन्म तिथि, जन्म समय (यदि दिया गया हो), जन्म स्थान, हाथ का आकार
              वर्गीकरण, और आपकी रीडिंग का पाठ — ये हमारे डेटाबेस में सुरक्षित रूप से
              संग्रहीत होते हैं ताकि आप अपनी रीडिंग एक्सेस कर सकें।
            </p>
            <h2>भुगतान डेटा</h2>
            <p>
              भुगतान Razorpay द्वारा सीधे संसाधित किया जाता है। हम आपका कार्ड या बैंक
              विवरण कभी नहीं देखते या संग्रहीत नहीं करते।
            </p>
            <h2>हम आपका डेटा नहीं बेचते</h2>
            <p>
              <strong>हम आपका व्यक्तिगत डेटा कभी किसी को नहीं बेचते, किराए पर नहीं देते,
              या किसी भी कारण से किसी के साथ व्यापार नहीं करते।</strong> आपकी जानकारी
              केवल आपकी रीडिंग तैयार करने और भेजने के लिए उपयोग की जाती है, और केवल इस
              वेबसाइट को चलाने के लिए आवश्यक सेवा प्रदाताओं के साथ साझा की जाती है।
            </p>
            <h2>डेटा हटाना</h2>
            <p>
              अपना डेटा हटवाने के लिए हमें{" "}
              <a href="mailto:hello@palmara.in">hello@palmara.in</a> पर लिखें।
            </p>
            <p className="updated">
              अंतिम अद्यतन: 2026
            </p>
          </>
        ) : (
          <>
            <h1>Privacy Policy</h1>
            <h2>Your palm photo</h2>
            <p>
              Your palm photo is <strong>processed entirely in your browser</strong>. It
              is never uploaded to or stored on our servers — only the derived
              hand-shape measurements (like finger-to-palm ratios) are sent, never the
              photo itself.
            </p>
            <h2>What we do store</h2>
            <p>
              Your name, date of birth, time of birth (if provided), place of birth,
              hand-shape classification, and your reading text — stored securely in our
              database so your reading can be retrieved.
            </p>
            <h2>Payment data</h2>
            <p>
              Payments are processed directly by Razorpay. We never see or store your
              card or bank details.
            </p>
            <h2>Deleting your data</h2>
            <p>
              To request deletion of your data, email us at{" "}
              <a href="mailto:hello@palmara.in">hello@palmara.in</a>.
            </p>
            <h2>We do not sell your data</h2>
            <p>
              <strong>We do not sell, rent, or trade your personal data to anyone, for
              any reason.</strong> Your information is used only to generate and deliver
              your reading, and is shared only with the specific service providers
              listed below, solely to run this website.
            </p>
            <h2>Third parties we use</h2>
            <p>
              Google Gemini (to generate reading text), Supabase (database hosting),
              and Razorpay (payments). None of these receive your palm photo.
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
