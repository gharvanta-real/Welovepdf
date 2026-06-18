import React from "react";
import { ChevronDown } from "lucide-react";
import { Footer } from "../Footer";
import { RecentJobs } from "../RecentJobs";

interface UploadHeroProps {
  selectedTool: string;
  blockColor: string;
  eyebrow: string;
  heroDesc: string;
  triggerFileInput: () => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  getAcceptAttribute: (tool: string) => string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleDragOver: (event: React.DragEvent) => void;
  handleDrop: (event: React.DragEvent) => void;
  heroIllustration: React.ReactNode;
  jobs?: any[];
  onRetry?: (job: any) => void;
  features: { icon: string; title: string; desc: string; color: string }[];
  onToolSelect: (toolName: string) => void;
  onViewChange: (view: any) => void;
}

export function UploadHero({
  selectedTool,
  blockColor,
  eyebrow,
  heroDesc,
  triggerFileInput,
  isDropdownOpen,
  setIsDropdownOpen,
  handleFileChange,
  getAcceptAttribute,
  fileInputRef,
  handleDragOver,
  handleDrop,
  heroIllustration,
  jobs,
  onRetry,
  features,
  onToolSelect,
  onViewChange,
}: UploadHeroProps) {
  return (
    <>
      {/* ── HERO SECTION: Colored block card ── */}
      <section style={{ padding: "16px 24px 0" }}>
        <div className="upload-hero-card" style={{
          background: blockColor,
          borderRadius: "16px",
          padding: "clamp(24px, 5vw, 48px) clamp(20px, 5vw, 64px)",
          display: "flex",
          alignItems: "center",
          gap: "clamp(24px, 4vw, 48px)",
          flexWrap: "wrap",
          overflow: "visible",
          position: "relative",
          minHeight: "320px"
        }}>
          {/* Left content */}
          <div style={{ flex: "0 0 min(50%, 480px)", zIndex: 1, minWidth: "260px" }}>
            <span style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "13px",
              letterSpacing: "0.5px",
              color: "rgba(0,0,0,0.55)",
              display: "block",
              marginBottom: "16px",
              fontWeight: 400
            }}>{eyebrow}</span>

            <h1 style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontSize: "clamp(40px, 5vw, 72px)",
              lineHeight: 1.05,
              fontWeight: 340,
              color: "#000000",
              margin: "0 0 24px",
              letterSpacing: "-1.5px"
            }}>{selectedTool}</h1>

            <p style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontSize: "18px",
              lineHeight: "1.55",
              color: "rgba(0,0,0,0.70)",
              maxWidth: "420px",
              margin: "0 0 32px",
              fontWeight: 320
            }}>{heroDesc}</p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}
                style={{
                  background: "#000000",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "9999px",
                  padding: "16px 36px",
                  fontSize: "17px",
                  fontWeight: 480,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "opacity 0.15s ease",
                  letterSpacing: "-0.1px"
                }}
                onMouseOver={e => (e.currentTarget.style.opacity = "0.88")}
                onMouseOut={e => (e.currentTarget.style.opacity = "1")}
              >
                Select {selectedTool.includes("to PDF") ? selectedTool.replace(" to PDF", "") : "PDF"} File
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
              </button>

              {/* Dropdown button wrapper */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
                  style={{
                    background: "rgba(0,0,0,0.08)",
                    color: "#000000",
                    border: "none",
                    borderRadius: "9999px",
                    padding: "16px 20px",
                    fontSize: "16px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    transition: "background 0.15s"
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = "rgba(0,0,0,0.14)")}
                  onMouseOut={e => (e.currentTarget.style.background = "rgba(0,0,0,0.08)")}
                >
                  <ChevronDown size={18} style={{ transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                </button>

                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <div 
                    className="choose-dropdown-menu" 
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      left: "auto",
                      transform: "none",
                      zIndex: 50
                    }} 
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button className="dropdown-item" onClick={() => { triggerFileInput(); setIsDropdownOpen(false); }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                      <span>From device</span>
                    </button>
                    <button className="dropdown-item" onClick={() => { alert("Dropbox coming soon!"); setIsDropdownOpen(false); }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#0061ff"><path d="M6 2l6 4-6 4-6-4 6-4zm12 0l6 4-6 4-6-4 6-4zM6 16l6-4-6-4-6 4 6 4zm12 0l6-4-6-4-6 4 6 4zM12 13v6l-6 4V17l6-4zm0 0v6l6 4V17l-6-4z"/></svg>
                      <span>From Dropbox</span>
                    </button>
                    <button className="dropdown-item" onClick={() => { alert("Google Drive coming soon!"); setIsDropdownOpen(false); }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M2 14.5l3.5-6h13l-3.5 6H2z" fill="#00a859"/><path d="M8.5 2.5l3.5 6H22l-3.5-6H8.5z" fill="#ffc72c"/><path d="M15 8.5l3.5 6-6.5 11.5-3.5-6 6.5-11.5z" fill="#0066b3"/></svg>
                      <span>From Google Drive</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              style={{ display: "none" }}
              accept={getAcceptAttribute(selectedTool)}
            />
          </div>

          {/* Right illustration */}
          <div
            style={{
              flex: "1 1 280px",
              minWidth: "240px",
              height: "300px",
              position: "relative",
              overflow: "hidden",
              borderRadius: "16px"
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Blurred backdrop blob */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(24px)",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.3)",
              transform: "rotate(2deg) scale(1.04)"
            }}></div>
            {heroIllustration}
            <div style={{
              position: "absolute",
              bottom: "16px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "12px",
              color: "rgba(0,0,0,0.45)",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 320,
              whiteSpace: "nowrap"
            }}>or drop files here</div>
          </div>
        </div>
      </section>

      {jobs && jobs.length > 0 && (
        <section style={{ padding: "40px 24px 0" }}>
          <RecentJobs jobs={jobs} onRetry={onRetry} />
        </section>
      )}

      {/* ── FEATURES SECTION ── */}
      <section style={{ padding: "80px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <span style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "13px",
            letterSpacing: "0.8px",
            color: "rgba(0,0,0,0.45)",
            display: "block",
            marginBottom: "16px",
            textTransform: "uppercase"
          }}>EFFICIENCY REDEFINED</span>
          <h2 style={{
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontSize: "clamp(32px, 4vw, 52px)",
            fontWeight: 340,
            color: "#000000",
            letterSpacing: "-1px",
            lineHeight: 1.1,
            margin: "0 auto",
            maxWidth: "600px"
          }}>High-fidelity processing without complexity.</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "48px" }}>
          {features.map((feat, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "20px" }}>
              <div style={{
                width: "56px",
                height: "56px",
                background: feat.color,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                flexShrink: 0
              }}>{feat.icon}</div>
              <h3 style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "20px",
                fontWeight: 540,
                color: "#000000",
                margin: 0
              }}>{feat.title}</h3>
              <p style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#4c4546",
                margin: 0,
                fontWeight: 320
              }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── LILAC CTA SECTION ── */}
      <section style={{
        background: "var(--s-block-lilac, #D6C4FF)",
        padding: "80px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "24px"
      }}>
        <p style={{
          fontFamily: "Plus Jakarta Sans, sans-serif",
          fontSize: "20px",
          color: "#000000",
          margin: 0,
          fontWeight: 540,
          letterSpacing: "-0.3px"
        }}>Ready to process your documents?</p>
        <button
          onClick={triggerFileInput}
          style={{
            background: "#000000",
            color: "#ffffff",
            border: "none",
            borderRadius: "9999px",
            padding: "18px 48px",
            fontSize: "18px",
            fontWeight: 540,
            fontFamily: "Plus Jakarta Sans, sans-serif",
            cursor: "pointer",
            transition: "transform 0.15s ease",
            letterSpacing: "-0.1px"
          }}
          onMouseOver={e => (e.currentTarget.style.transform = "scale(1.04)")}
          onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          Start {selectedTool} Now
        </button>
      </section>

      <Footer onToolSelect={onToolSelect} onViewChange={onViewChange} />
    </>
  );
}
