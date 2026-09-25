"use client";

export default function StickyUnlockBar({ show, priceWas, priceNow, label, onUnlock }) {
  if (!show) return null;
  return (
    <div className="sticky-unlock-bar fade-in">
      <div className="sticky-unlock-bar__price">
        <span className="price-was">{priceWas}</span>
        <span className="price-now">{priceNow}</span>
      </div>
      <button type="button" className="btn btn-primary" onClick={onUnlock}>
        {label}
      </button>
    </div>
  );
}
