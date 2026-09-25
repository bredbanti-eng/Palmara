"use client";

import { IconCheck } from "./icons";

export default function Stepper({ steps, current }) {
  return (
    <ol className="stepper" aria-label="Progress">
      {steps.map((label, i) => (
        <li
          key={label}
          className={`stepper-item ${i < current ? "is-done" : ""} ${i === current ? "is-active" : ""}`}
          aria-current={i === current ? "step" : undefined}
        >
          <span className="stepper-index" aria-hidden="true">
            {i < current ? <IconCheck size={13} /> : i + 1}
          </span>
          <span className="stepper-label">{label}</span>
          {i < steps.length - 1 && <span className="stepper-connector" aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}
