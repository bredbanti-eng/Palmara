"use client";

// Always free, never locked — this is the report's opening "real value,
// right now" moment. It's built from the same deterministic hand-shape/
// heart-line/fate-line facts fed into the Gemini prompt (lib/palmSnapshot.js
// is the shared source), so nothing here is invented separately from what
// the paid sections reference.
export default function PalmSnapshotCard({ title, items }) {
  return (
    <div className="card palm-snapshot-card fade-up">
      <h3 className="section-title">{title}</h3>
      <ul className="palm-snapshot-list">
        {items.map((item) => (
          <li className="palm-snapshot-item" key={item.label}>
            <span className="palm-snapshot-label">{item.label}</span>
            <p className="palm-snapshot-text">{item.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
