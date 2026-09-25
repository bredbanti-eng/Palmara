"use client";

import { useEffect, useState } from "react";
import SiteHeader from "../../components/SiteHeader";
import { useLang } from "../../components/LangProvider";
import { IconAlert } from "../../components/icons";
import SectionCard from "../../components/SectionCard";
import PathAheadCard from "../../components/PathAheadCard";
import { REPORT_SECTIONS } from "@/lib/reportSections";
import { generateReportPdf } from "@/lib/generateReportPdf";

export default function ReportPage({ params }) {
  const { lang, tr } = useLang();
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    fetch(`/api/report/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data) => {
        setReport(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [params.id]);

  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);

    // New rows already have structured English sections — no need for the
    // translate-report round-trip at all in that case.
    if (report.sections_en) {
      generateReportPdf({
        brand: "Palmara",
        tagline: "Vedic Palm Readings",
        name: report.name,
        sections: report.sections_en,
        lang: "en",
      });
      setDownloading(false);
      return;
    }

    // Legacy fallback for the one pre-structured-sections report row.
    let englishText = report.full_text;
    if (report.language === "hi") {
      const res = await fetch("/api/translate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: params.id }),
      });
      const data = await res.json();
      englishText = data.englishText || report.full_text;
    }
    generateReportPdf({
      brand: "Palmara",
      tagline: "Vedic Palm Readings",
      name: report.name,
      reportText: englishText,
      lang: "en",
    });
    setDownloading(false);
  }

  return (
    <>
      <SiteHeader />
      <main className="wrap wrap-narrow" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-12)" }}>
        {status === "loading" && (
          <div className="loading-row" aria-live="polite">
            <span className="spinner" />
            <span>{lang === "hi" ? "आपकी रिपोर्ट लोड हो रही है…" : "Loading your report…"}</span>
          </div>
        )}
        {status === "error" && (
          <div className="state-panel" role="alert">
            <IconAlert />
            <p className="error-text" style={{ margin: 0 }}>Report not found.</p>
          </div>
        )}
        {status === "ready" && (
          <div className="fade-up">
            <h1>{report.name}</h1>
            {(() => {
              const sections = lang === "hi" ? report.sections_hi : report.sections_en;
              if (sections) {
                return (
                  <>
                    <div className="section-list">
                      {REPORT_SECTIONS.map((s) => {
                        const data = sections[s.id];
                        if (s.kind === "timeline") {
                          return (
                            <PathAheadCard
                              key={s.id}
                              title={s.title[lang]}
                              hook={data.hook}
                              years={data.years}
                              locked={!report.paid}
                              unlockLabel={tr("section_locked_cta")}
                            />
                          );
                        }
                        return (
                          <SectionCard
                            key={s.id}
                            title={s.title[lang]}
                            hook={data.hook}
                            body={data.body}
                            locked={!report.paid}
                            unlockLabel={tr("section_locked_cta")}
                          />
                        );
                      })}
                    </div>
                    {report.paid && (
                      <div className="result-actions">
                        <button className="btn btn-secondary" onClick={handleDownload} disabled={downloading}>
                          {downloading ? tr("preparing_pdf") : tr("download_pdf_again")}
                        </button>
                      </div>
                    )}
                  </>
                );
              }
              // Legacy rows predating structured sections.
              return report.paid ? (
                <>
                  <div className="report-card">{report.full_text}</div>
                  <div className="result-actions">
                    <button className="btn btn-secondary" onClick={handleDownload} disabled={downloading}>
                      {downloading ? tr("preparing_pdf") : tr("download_pdf_again")}
                    </button>
                  </div>
                </>
              ) : (
                <div className="report-card report-card--teaser">{report.teaser_text}</div>
              );
            })()}
          </div>
        )}
      </main>
    </>
  );
}
