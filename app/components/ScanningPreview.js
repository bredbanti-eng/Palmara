"use client";

export default function ScanningPreview({ imageUrl }) {
  if (!imageUrl) return null;
  return (
    <div className="scan-frame">
      <img src={imageUrl} alt="" />
      <div className="scan-grid-overlay" />
      <div className="scan-line" />
    </div>
  );
}
