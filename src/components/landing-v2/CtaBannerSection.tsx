import React from "react";

interface CtaBannerSectionProps {
  onScrollToTools: () => void;
}

export function CtaBannerSection({ onScrollToTools }: CtaBannerSectionProps) {
  return (
    <section className="v2-cta-section">
      <div className="v2-container">
        <div className="v2-cta-card">
          {/* Left Column: Copy & Button */}
          <div className="v2-cta-content">
            <h2>Supercharge Your Document Workflows</h2>
            <p>
              Enjoy unlimited access to high-accuracy multi-lingual OCR, automated Bates numbering, and secure PDF tools. 
              Zero installation, zero sign-ups, and completely free to use.
            </p>
            <button className="v2-pill-primary" onClick={onScrollToTools}>
              Explore Daily Tools
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>

          {/* Right Column: Custom PDF_illustration-Cta PNG Artwork */}
          <div className="v2-cta-illustrations">
            <img 
              src="/PDF_illustration-Cta.png" 
              alt="PDF illustration banner artwork" 
              className="v2-cta-img-art" 
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default CtaBannerSection;
