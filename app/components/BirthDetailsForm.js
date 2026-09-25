"use client";

import { useState } from "react";
import { useLang } from "./LangProvider";

function to12Hour(time24) {
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${mStr} ${ampm}`;
}

export default function BirthDetailsForm({ onSubmit }) {
  const { tr } = useLang();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [time, setTime] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [place, setPlace] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      name,
      email,
      dob,
      birthTime: !timeUnknown && time ? to12Hour(time) : null,
      birthTimeUnknown: timeUnknown || !time,
      birthPlace: place,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate={false}>
      <div className="form-grid-2">
        <div className="field">
          <label htmlFor="bd-name">{tr("form_name")}</label>
          <input
            id="bd-name"
            className="input"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="bd-email">{tr("form_email")}</label>
          <input
            id="bd-email"
            className="input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={tr("form_email_hint")}
            required
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="bd-dob">{tr("form_dob")}</label>
        <input
          id="bd-dob"
          className="input"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="bd-time">{tr("form_time")}</label>
        <div className="time-row">
          <input
            id="bd-time"
            className="input"
            type="time"
            disabled={timeUnknown}
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required={!timeUnknown}
          />
        </div>
        <label className="checkbox-row" htmlFor="bd-time-unknown">
          <input
            id="bd-time-unknown"
            type="checkbox"
            checked={timeUnknown}
            onChange={(e) => setTimeUnknown(e.target.checked)}
          />
          {tr("form_time_unknown")}
        </label>
      </div>

      <div className="field">
        <label htmlFor="bd-place">{tr("form_place")}</label>
        <input
          id="bd-place"
          className="input"
          type="text"
          autoComplete="address-level2"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary btn-block">
        {tr("form_submit")}
      </button>
    </form>
  );
}
