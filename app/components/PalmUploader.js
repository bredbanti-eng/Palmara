"use client";

import { useEffect, useRef, useState } from "react";
import BirthDetailsForm from "./BirthDetailsForm";
import UpsellCTA from "./UpsellCTA";
import EmailSentModal from "./EmailSentModal";
import ScanningPreview from "./ScanningPreview";
import Stepper from "./Stepper";
import SectionCard from "./SectionCard";
import PathAheadCard from "./PathAheadCard";
import PalmSnapshotCard from "./PalmSnapshotCard";
import BirthChartSnapshotCard from "./BirthChartSnapshotCard";
import StickyUnlockBar from "./StickyUnlockBar";
import UnlockLanguageModal from "./UnlockLanguageModal";
import { IconUpload, IconAlert, IconCheck } from "./icons";
import { classifyHandShape, seedFromLandmarks } from "@/lib/handClassifier";
import { generateReportPdf, generateReportPdfBase64 } from "@/lib/generateReportPdf";
import { REPORT_SECTIONS } from "@/lib/reportSections";
import { buildPalmSnapshot } from "@/lib/palmSnapshot";
import { useRazorpayCheckout } from "@/lib/useRazorpayCheckout";
import { getTodaysUnlockCount } from "@/lib/socialProofCounter";
import { useLang } from "./LangProvider";

const GENERATING_MSG_INTERVAL_MS = 2800;

export default function PalmUploader() {
  const { lang, setLang, tr } = useLang();
  const [status, setStatus] = useState("idle");
  // idle -> detecting -> awaiting-details -> generating -> result
  const [errorMsg, setErrorMsg] = useState("");
  const [handShape, setHandShape] = useState(null);
  const [seed, setSeed] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sectionsEn, setSectionsEn] = useState(null);
  const [sectionsHi, setSectionsHi] = useState(null);
  const [chart, setChart] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [paid, setPaid] = useState(false);
  const [emailModalStatus, setEmailModalStatus] = useState(null); // null | sending | sent | failed
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [generatingMsgIndex, setGeneratingMsgIndex] = useState(0);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const canvasRef = useRef(null);
  // handlePaymentSuccess is bound into checkout/onPaid at render time, before
  // the user's language pick has applied via setLang (state updates aren't
  // synchronous) — so it was reading the site's pre-click lang instead of
  // what was just chosen. A ref sidesteps that: refs stay the same object
  // across renders, so even a stale closure reads the current value.
  const reportLangRef = useRef(lang);

  const steps = [tr("stepper_upload"), tr("stepper_details"), tr("stepper_reading")];
  const stepIndex = reportId ? 2 : handShape ? 1 : 0;
  const currentSections = lang === "hi" ? sectionsHi : sectionsEn;
  const snapshot = handShape && seed != null ? buildPalmSnapshot(handShape, seed, lang) : null;

  const checkout = useRazorpayCheckout({
    reportId,
    name,
    onPaid: () => handlePaymentSuccess(),
  });

  // Cycle the "writing your reading" message so a 5-20s wait doesn't look
  // stuck on one static line the whole time.
  useEffect(() => {
    if (status !== "generating") return;
    setGeneratingMsgIndex(0);
    const messages = tr("generating_messages");
    const id = setInterval(() => {
      setGeneratingMsgIndex((i) => (i + 1) % messages.length);
    }, GENERATING_MSG_INTERVAL_MS);
    return () => clearInterval(id);
  }, [status, lang]);

  // Sticky unlock bar appears once the visitor has scrolled past the intro
  // (stepper + heading), so the purchase CTA is never more than a glance
  // away, however far down the section list they've read.
  useEffect(() => {
    if (status !== "result" || paid) {
      document.body.classList.remove("has-sticky-bar");
      setShowStickyBar(false);
      return;
    }
    function onScroll() {
      setShowStickyBar(window.scrollY > 380);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.body.classList.remove("has-sticky-bar");
    };
  }, [status, paid]);

  useEffect(() => {
    document.body.classList.toggle("has-sticky-bar", showStickyBar);
  }, [showStickyBar]);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setStatus("detecting");
    setErrorMsg("");
    const scanStartedAt = Date.now();
    const MIN_SCAN_MS = 1800;

    async function waitForMinimumScanTime() {
      const elapsed = Date.now() - scanStartedAt;
      if (elapsed < MIN_SCAN_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_SCAN_MS - elapsed));
      }
    }

    try {
      const imageBitmap = await createImageBitmap(file);
      const canvas = canvasRef.current;
      canvas.width = imageBitmap.width;
      canvas.height = imageBitmap.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(imageBitmap, 0, 0);

      // Some formats (e.g. HEIC from iPhone cameras) decode fine via
      // createImageBitmap but won't render in a plain <img src="blob:...">.
      // Re-derive the preview from the canvas we just decoded onto so the
      // scanning frame always has something displayable.
      const decodedPreviewUrl = canvas.toDataURL("image/jpeg", 0.85);
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(decodedPreviewUrl);

      const { HandLandmarker, FilesetResolver } = await import(
        "@mediapipe/tasks-vision"
      );
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        },
        runningMode: "IMAGE",
        numHands: 1,
      });

      const result = handLandmarker.detect(canvas);
      if (!result.landmarks || result.landmarks.length === 0) {
        await waitForMinimumScanTime();
        URL.revokeObjectURL(objectUrl);
        setStatus("error");
        setErrorMsg(tr("detect_error"));
        return;
      }

      const landmarks = result.landmarks[0];
      setHandShape(classifyHandShape(landmarks));
      setSeed(seedFromLandmarks(landmarks));
      await waitForMinimumScanTime();
      URL.revokeObjectURL(objectUrl);
      setStatus("awaiting-details");
    } catch (err) {
      console.error(err);
      await waitForMinimumScanTime();
      URL.revokeObjectURL(objectUrl);
      setStatus("error");
      setErrorMsg(tr("detect_error"));
    }
  }

  async function handleDetailsSubmit(details) {
    setStatus("generating");
    setName(details.name);
    setEmail(details.email);
    try {
      const res = await fetch("/api/generate-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handShape,
          seed,
          language: lang,
          ...details,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.sectionsEn || !data.sectionsHi || !data.reportId) {
        console.error("Reading generation returned an incomplete response:", data);
        setStatus("error");
        setErrorMsg(
          data.error ||
            (lang === "hi"
              ? "आपकी रीडिंग तैयार करने में कोई समस्या हुई। कृपया फिर से कोशिश करें।"
              : "Something went wrong generating your reading. Please try again.")
        );
        return;
      }

      setSectionsEn(data.sectionsEn);
      setSectionsHi(data.sectionsHi);
      setChart(data.chart || null);
      setReportId(data.reportId);
      setStatus("result");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg(tr("detect_error"));
    }
  }

  // Both languages are already on the client after generation, so the PDF
  // needs no extra network round-trip — just pick whichever language's
  // sections match the currently displayed report.
  async function handleDownloadPdf() {
    setIsDownloading(true);
    await generateReportPdf({
      brand: "Palmara",
      tagline: "Vedic Palm Readings",
      name,
      sections: currentSections,
      snapshot,
      chart,
      lang,
    });
    setIsDownloading(false);
  }

  async function handlePaymentSuccess() {
    setPaid(true);
    setEmailModalStatus("sending");

    const emailLang = reportLangRef.current;
    const emailSections = emailLang === "hi" ? sectionsHi : sectionsEn;
    const emailSnapshot = handShape && seed != null ? buildPalmSnapshot(handShape, seed, emailLang) : null;
    const pdfBase64 = await generateReportPdfBase64({
      brand: "Palmara",
      tagline: "Vedic Palm Readings",
      name,
      sections: emailSections,
      snapshot: emailSnapshot,
      chart,
      lang: emailLang,
    });

    try {
      const res = await fetch("/api/send-report-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email, name, lang: reportLangRef.current, reportId, pdfBase64 }),
      });
      const result = await res.json();
      setEmailModalStatus(result.sent ? "sent" : "failed");
    } catch (err) {
      console.error(err);
      setEmailModalStatus("failed");
    }
  }

  function openUnlockFlow() {
    setShowLangModal(true);
  }

  function chooseReportLanguage(chosenLang) {
    reportLangRef.current = chosenLang;
    setLang(chosenLang);
    checkout.payNow();
  }

  const generatingMessages = tr("generating_messages");

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <Stepper steps={steps} current={stepIndex} />

      {status === "idle" && (
        <div className="dropzone fade-in">
          <IconUpload className="dropzone-icon" aria-hidden="true" />
          <p className="dropzone-label">{tr("upload_box_label")}</p>
          <p className="dropzone-hint">{tr("upload_hint")}</p>
          <span className="btn btn-secondary dropzone-btn" aria-hidden="true">
            {tr("upload_browse_btn")}
          </span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            aria-label={tr("upload_box_label")}
          />
        </div>
      )}

      {status === "detecting" && (
        <div className="fade-in" aria-live="polite">
          <ScanningPreview imageUrl={previewUrl} />
          <div className="loading-row loading-row--center">
            <span className="spinner" />
            <span>{tr("detecting")}</span>
          </div>
        </div>
      )}

      {status === "awaiting-details" && (
        <div className="fade-up card">
          <BirthDetailsForm onSubmit={handleDetailsSubmit} />
        </div>
      )}

      {status === "generating" && (
        <div className="loading-row loading-row--center fade-in" aria-live="polite">
          <span className="spinner" />
          <span>{generatingMessages[generatingMsgIndex]}</span>
        </div>
      )}

      {status === "error" && (
        <div className="state-panel fade-in" role="alert">
          <IconAlert />
          <div>
            <p className="error-text" style={{ margin: 0 }}>{errorMsg}</p>
            <button className="btn btn-primary" style={{ marginTop: "var(--space-4)" }} onClick={() => setStatus(handShape ? "awaiting-details" : "idle")}>
              {lang === "hi" ? "फिर से कोशिश करें" : "Try again"}
            </button>
          </div>
        </div>
      )}

      {status === "result" && currentSections && (
        <div className="fade-up">
          <h3>{tr("teaser_heading")}</h3>

          {paid && (
            <div className="unlocked-banner">
              <span className="check-pop">
                <IconCheck size={16} />
              </span>
              {lang === "hi" ? "अनलॉक हो गया" : "Unlocked"}
            </div>
          )}

          {chart && (
            <BirthChartSnapshotCard
              chart={chart}
              lang={lang}
              title={tr("birth_chart_title")}
              approxNote={tr("birth_chart_approx_note")}
              ascendantLabel={tr("birth_chart_ascendant_label")}
              moonLabel={tr("birth_chart_moon_label")}
              nakshatraLabel={tr("birth_chart_nakshatra_label")}
              sunLabel={tr("birth_chart_sun_label")}
            />
          )}

          {snapshot && (
            <PalmSnapshotCard
              title={tr("palm_snapshot_title")}
              items={[
                { label: `${tr("palm_snapshot_hand_label")} — ${snapshot.handShape.label}`, text: snapshot.handShape.text },
                { label: tr("palm_snapshot_heart_label"), text: snapshot.heartLine.text },
                { label: tr("palm_snapshot_fate_label"), text: snapshot.fateLine.text },
              ]}
            />
          )}

          <div className="section-list">
            {REPORT_SECTIONS.map((s) => {
              const data = currentSections[s.id];
              if (s.kind === "timeline") {
                return (
                  <PathAheadCard
                    key={s.id}
                    title={s.title[lang]}
                    hook={data.hook}
                    years={data.years}
                    locked={!paid}
                    unlockLabel={tr("section_locked_cta")}
                    insightsLabel={tr("path_ahead_insights_label")}
                    onUnlockClick={openUnlockFlow}
                  />
                );
              }
              return (
                <SectionCard
                  key={s.id}
                  title={s.title[lang]}
                  hook={data.hook}
                  preview={data.preview}
                  teaser={data.teaser}
                  deepDive={data.deepDive}
                  locked={!paid}
                  unlockLabel={tr("section_locked_cta")}
                  onUnlockClick={openUnlockFlow}
                />
              );
            })}
          </div>

          {!paid && (
            <div className="unlock-panel unlock-panel--sections fade-up stagger-1">
              <p className="unlock-urgency">
                {tr("unlock_urgency").replace("{count}", getTodaysUnlockCount())}
              </p>
              <div className="price-display">
                <span className="price-was">{tr("unlock_price_was")}</span>
                <span className="price-now">{tr("unlock_price_now")}</span>
              </div>
              <ul className="unlock-checklist">
                {tr("unlock_checklist").map((item) => (
                  <li key={item}>
                    <IconCheck size={14} />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={openUnlockFlow}
                disabled={checkout.loading}
              >
                {checkout.loading && <span className="spinner spinner--on-dark" />}
                {tr("unlock_button")}
              </button>
              <p className="unlock-note">{tr("unlock_note")}</p>
            </div>
          )}

          {paid && (
            <>
              <div className="result-actions">
                <button className="btn btn-secondary" onClick={handleDownloadPdf} disabled={isDownloading}>
                  {isDownloading ? tr("preparing_pdf") : tr("download_pdf_again")}
                </button>
              </div>
              <div className="card upsell-card fade-up stagger-2">
                <UpsellCTA reportId={reportId} />
              </div>
            </>
          )}
        </div>
      )}

      <StickyUnlockBar
        show={showStickyBar}
        priceWas={tr("unlock_price_was")}
        priceNow={tr("unlock_price_now")}
        label={tr("unlock_button")}
        onUnlock={openUnlockFlow}
      />

      <UnlockLanguageModal
        open={showLangModal}
        loading={checkout.loading}
        onChoose={(l) => {
          setShowLangModal(false);
          chooseReportLanguage(l);
        }}
        onClose={() => setShowLangModal(false)}
      />

      {emailModalStatus && (
        <EmailSentModal
          status={emailModalStatus}
          email={email}
          onDownload={handleDownloadPdf}
          onClose={() => setEmailModalStatus(null)}
        />
      )}
    </div>
  );
}
