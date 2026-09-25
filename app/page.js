"use client";

import Link from "next/link";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import PalmaraIcon from "./components/PalmaraIcon";
import { useLang } from "./components/LangProvider";

export default function LandingPage() {
  const { tr } = useLang();

  return (
    <>
      <SiteHeader />
      <main className="wrap hero" style={{ paddingBottom: 0 }}>
        <div className="trust-row fade-up">
          <span className="trust-item">{tr("trust_1")}</span>
          <span className="trust-dot" aria-hidden="true">·</span>
          <span className="trust-item">{tr("trust_2")}</span>
          <span className="trust-dot" aria-hidden="true">·</span>
          <span className="trust-item">{tr("trust_3")}</span>
        </div>

        <h1 className="hero-title fade-up stagger-1">{tr("landing_headline")}</h1>
        <p className="hero-sub fade-up stagger-2">{tr("landing_sub")}</p>
        <div className="fade-up stagger-3">
          <Link href="/get-reading" className="btn btn-primary">
            {tr("landing_cta")}
          </Link>
        </div>

        <div className="section">
          <h2>{tr("how_it_works")}</h2>
          <div className="steps">
            <div className="card step-card card-hover fade-up stagger-1">
              <span className="step-num">1</span>
              <h3>{tr("step1_title")}</h3>
              <p>{tr("step1_body")}</p>
            </div>
            <div className="card step-card card-hover fade-up stagger-2">
              <span className="step-num">2</span>
              <h3>{tr("step2_title")}</h3>
              <p>{tr("step2_body")}</p>
            </div>
            <div className="card step-card card-hover fade-up stagger-3">
              <span className="step-num">3</span>
              <h3>{tr("step3_title")}</h3>
              <p>{tr("step3_body")}</p>
            </div>
          </div>
        </div>

        <div className="section">
          <span className="eyebrow">{tr("services_kicker")}</span>
          <h2 style={{ marginTop: 0, marginBottom: "var(--space-5)" }}>{tr("services_heading")}</h2>
          <div className="card pricing-card fade-up">
            <p className="tag">{tr("service_main_tag")}</p>
            <h3>{tr("service_main_title")}</h3>
            <p>{tr("service_main_desc")}</p>
            <div className="price-row">
              <span className="price-now">{tr("unlock_price_now")}</span>
              <span className="price-was">{tr("unlock_price_was")}</span>
            </div>
          </div>
        </div>

        <div className="card team-panel section fade-up">
          <div className="team-avatars" aria-hidden="true">
            <div className="avatar">
              <PalmaraIcon size={26} reversed />
            </div>
            <div className="avatar">
              <PalmaraIcon size={26} reversed />
            </div>
            <div className="avatar">
              <PalmaraIcon size={26} reversed />
            </div>
          </div>
          <div>
            <h3>{tr("team_heading")}</h3>
            <p>{tr("team_desc")}</p>
            <div className="stat-row">
              <div>
                <b>30+</b>
                <span>{tr("team_stat_1")}</span>
              </div>
              <div>
                <b>2L+</b>
                <span>{tr("team_stat_2")}</span>
              </div>
              <div>
                <b>4.7★</b>
                <span>{tr("team_stat_3")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="teaser-panel section fade-up">
          <span className="eyebrow eyebrow--inverse">{tr("teaser_kicker")}</span>
          <h2>{tr("teaser_heading_landing")}</h2>
          <p>{tr("teaser_lead")}</p>
          <div className="teaser-lines">
            <div className="teaser-line">
              <h4>{tr("teaser_heart_title")}</h4>
              <p>{tr("teaser_heart_body")}</p>
            </div>
            <div className="teaser-line">
              <h4>{tr("teaser_fate_title")}</h4>
              <p>{tr("teaser_fate_body")}</p>
            </div>
            <div className="teaser-line">
              <h4>{tr("teaser_sun_title")}</h4>
              <p>{tr("teaser_sun_body")}</p>
            </div>
          </div>
          <Link href="/get-reading" className="btn btn-primary">
            {tr("landing_cta")}
          </Link>
        </div>

        <div className="honesty-note section fade-up">{tr("honesty_note")}</div>

        <div className="section">
          <span className="eyebrow">{tr("testimonials_kicker")}</span>
          <h2 style={{ marginTop: 0, marginBottom: "var(--space-5)" }}>{tr("testimonials_heading")}</h2>
          <div className="quote-grid fade-up">
            <div className="card quote-card">
              <span className="quote-mark" aria-hidden="true">“</span>
              <p className="quote">{tr("testimonial_1")}</p>
              <p className="who">{tr("testimonial_1_who")}</p>
            </div>
            <div className="card quote-card">
              <span className="quote-mark" aria-hidden="true">“</span>
              <p className="quote">{tr("testimonial_2")}</p>
              <p className="who">{tr("testimonial_2_who")}</p>
            </div>
            <div className="card quote-card">
              <span className="quote-mark" aria-hidden="true">“</span>
              <p className="quote">{tr("testimonial_3")}</p>
              <p className="who">{tr("testimonial_3_who")}</p>
            </div>
          </div>
        </div>

        <div className="final-cta fade-up">
          <h2>{tr("final_cta_heading")}</h2>
          <p>{tr("final_cta_body")}</p>
          <Link href="/get-reading" className="btn btn-primary">
            {tr("landing_cta")}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
