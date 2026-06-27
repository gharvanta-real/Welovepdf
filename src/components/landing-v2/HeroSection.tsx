import React from "react";
import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onScrollToTools: () => void;
}

export function HeroSection({ onScrollToTools }: HeroSectionProps) {
  return (
    <section className="v2-hero">
      <div className="v2-container v2-hero-inner">
        <div className="v2-hero-copy">
          <div className="v2-hero-trust-bar">
            <div className="v2-hero-stars-row">
              <span className="v2-hero-stars">★★★★★</span>
              <span className="v2-hero-rating-score">Loved by our users</span>
            </div>
          </div>
          <h1>All Types of PDF Operations.</h1>
          <p>
            Merge, split, convert, and sign PDFs online. Fast, secure, and running directly inside your browser.
          </p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
            <button className="v2-pill-primary" onClick={onScrollToTools}>
              Explore Tools <ArrowRight size={18} />
            </button>
            <button className="v2-pill-outline" onClick={onScrollToTools}>
              Read More
            </button>
          </div>
        </div>
        <div className="v2-hero-illustration">
          <img
            src="/v2_hero.png"
            alt="PDF Operations Illustration"
            className="v2-hero-img"
          />
        </div>
      </div>
    </section>
  );
}
