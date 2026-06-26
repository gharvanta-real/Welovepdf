import React from "react";

export function TrustStrip() {
  return (
    <section className="v2-trust-strip">
      <div className="v2-container">
        <div className="v2-trust-grid">
          
          <div className="v2-trust-item" style={{ alignItems: "center" }}>
            <div className="v2-trust-icon-box-large">
              <img 
                src="/End-to-End%20Encryption.svg" 
                alt="End-to-End Encryption" 
                className="v2-trust-icon-svg-large"
              />
            </div>
            <div className="v2-trust-text">
              <h4>End-to-End Encryption</h4>
              <p>Your documents are protected using SSL/TLS and bank-grade AES-256 encryption during processing.</p>
            </div>
          </div>

          <div className="v2-trust-item" style={{ alignItems: "center" }}>
            <div className="v2-trust-icon-box-large">
              <img 
                src="/Privacy%20Control%20icon.png" 
                alt="100% Privacy Control" 
                className="v2-trust-icon-svg-large"
              />
            </div>
            <div className="v2-trust-text">
              <h4>100% Privacy Control</h4>
              <p>We do not look at, inspect, or copy your files. Operations run locally in your browser whenever possible.</p>
            </div>
          </div>

          <div className="v2-trust-item" style={{ alignItems: "center" }}>
            <div className="v2-trust-icon-box-large">
              <img 
                src="/auto-delete-in-1-hour.png" 
                alt="Auto-Deleted in 1 Hour" 
                className="v2-trust-icon-svg-large"
              />
            </div>
            <div className="v2-trust-text">
              <h4>Auto-Deleted in 1 Hour</h4>
              <p>Uploaded documents are automatically and permanently purged from our servers after 1 hour, or instantly upon request.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default TrustStrip;
