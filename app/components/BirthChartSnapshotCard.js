"use client";

import VedicChartDiagram from "./VedicChartDiagram";
import { getRashiName, getNakshatraInfo, describeAscendant } from "@/lib/vedicKnowledge";

// Always free, never locked — like PalmSnapshotCard, this is real computed
// data (lib/vedicChart.js), not invented, so it's safe to give away in full
// as the report's other "legitimate, personalized, right now" moment.
export default function BirthChartSnapshotCard({ chart, lang, title, approxNote, ascendantLabel, moonLabel, nakshatraLabel, sunLabel }) {
  if (!chart) return null;

  const houseBase = chart.houseBaseSignIndex;
  const moonName = chart.moonSignIndex != null ? getRashiName(chart.moonSignIndex, lang) : null;
  const sunName = chart.planets?.sun ? getRashiName(chart.planets.sun.signIndex, lang) : null;
  const nak = chart.nakshatra ? getNakshatraInfo(chart.nakshatra.index, lang) : null;
  const ascendantText = chart.ascendantSignIndex != null ? describeAscendant(chart.ascendantSignIndex, lang) : null;

  return (
    <div className="card palm-snapshot-card fade-up">
      <h3 className="section-title">{title}</h3>
      <VedicChartDiagram houseBaseSignIndex={houseBase} planets={chart.planets} lang={lang} />
      {chart.timeIsApprox && approxNote && <p className="chart-approx-note">{approxNote}</p>}
      <ul className="palm-snapshot-list" style={{ marginTop: "var(--space-4)" }}>
        {ascendantText && (
          <li className="palm-snapshot-item">
            <span className="palm-snapshot-label">{ascendantLabel}</span>
            <p className="palm-snapshot-text">{ascendantText}</p>
          </li>
        )}
        {moonName && (
          <li className="palm-snapshot-item">
            <span className="palm-snapshot-label">{moonLabel} — {moonName}</span>
          </li>
        )}
        {nak && (
          <li className="palm-snapshot-item">
            <span className="palm-snapshot-label">{nakshatraLabel} — {nak.name}</span>
            <p className="palm-snapshot-text">{nak.trait}</p>
          </li>
        )}
        {sunName && (
          <li className="palm-snapshot-item">
            <span className="palm-snapshot-label">{sunLabel} — {sunName}</span>
          </li>
        )}
      </ul>
    </div>
  );
}
