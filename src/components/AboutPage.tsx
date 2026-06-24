import React from "react";
import { ShieldCheck, Heart, Zap } from "lucide-react";

interface AboutPageProps {
  onBack: () => void;
  onViewChange: (view: any) => void;
}

export function AboutPage({ onBack, onViewChange }: AboutPageProps) {
  return (
    <div className="stitch-landing-v2 theme-blue" style={{ width: "100%", minHeight: "100vh", backgroundColor: "var(--v2-bg-page)", color: "var(--v2-text-main)", fontFamily: "var(--v2-font-sans)", paddingBottom: "100px" }}>
      <div className="v2-container" style={{ paddingTop: "64px", maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Title Section */}
        <div style={{ marginBottom: "48px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--v2-primary)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
            Our Mission & Story
          </span>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 46px)", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.15, marginBottom: "16px", color: "var(--v2-text-main)" }}>
            About PDFMount
          </h1>
          <p style={{ fontSize: "16px", color: "var(--v2-text-muted)", lineHeight: 1.6, margin: 0 }}>
            We build simple, fast, and private tools to help you manage your PDF files without the hassle.
          </p>
        </div>

        {/* Flat Content Layout */}
        <div style={{ display: "flex", flexDirection: "column", gap: "40px", backgroundColor: "#ffffff", padding: "48px", borderRadius: "16px", border: "1px solid var(--v2-border)" }}>
          
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "12px" }}>
              Our Story
            </h2>
            <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: 0 }}>
              PDFMount was started with a very simple goal: to make editing, converting, and organizing PDF documents quick and easy. We realized that most people just want to perform simple tasks—like merging files, compressing a large document, or signing a contract—without having to download heavy software, sign up for paid subscriptions, or worry about where their personal files are being uploaded.
              <br /><br />
              That's why we built a lightweight, browser-based toolset that runs directly in your browser. It does the job instantly, keeps your data completely secure, and is entirely free for everyone to use.
            </p>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--v2-border-light)" }} />

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "20px" }}>
              Our Core Principles
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ color: "var(--v2-primary)", marginTop: "4px" }}>
                  <Zap size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px 0", color: "var(--v2-text-main)" }}>Pure Simplicity</h3>
                  <p style={{ fontSize: "14px", color: "var(--v2-text-muted)", lineHeight: 1.6, margin: 0 }}>
                    We keep our interface clutter-free. There are no complex settings or options—just select a tool, upload your file, and get your result in seconds.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ color: "var(--v2-primary)", marginTop: "4px" }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px 0", color: "var(--v2-text-main)" }}>Privacy First</h3>
                  <p style={{ fontSize: "14px", color: "var(--v2-text-muted)", lineHeight: 1.6, margin: 0 }}>
                    Your files are processed in secure, temporary workspaces and deleted automatically after 60 minutes. We never store, read, or share your documents.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ color: "var(--v2-primary)", marginTop: "4px" }}>
                  <Heart size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px 0", color: "var(--v2-text-main)" }}>Built for You</h3>
                  <p style={{ fontSize: "14px", color: "var(--v2-text-muted)", lineHeight: 1.6, margin: 0 }}>
                    We support our server costs through clean, non-intrusive advertisements. This allows us to keep our tools free and accessible to students and professionals alike.
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div style={{ height: "1px", backgroundColor: "var(--v2-border-light)" }} />

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--v2-text-main)", marginBottom: "12px" }}>
              Need help or have suggestions?
            </h2>
            <p style={{ fontSize: "15px", color: "var(--v2-text-muted)", lineHeight: 1.7, margin: "0 0 24px 0" }}>
              We'd love to hear how we can make PDFMount better for you. Reach out to our developer team or get started with our tools right away.
            </p>
            <div style={{ display: "flex", gap: "16px" }}>
              <button 
                onClick={() => onViewChange("home")}
                className="v2-pill-primary"
                style={{ fontSize: "14px", padding: "12px 28px", border: "none" }}
              >
                Start Using Tools
              </button>
              <button 
                onClick={() => onViewChange("contact")}
                className="v2-pill-outline"
                style={{ fontSize: "14px", padding: "12px 28px" }}
              >
                Contact Support
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default AboutPage;
