import React from "react";
import { 
  ChevronDown, 
  Zap, 
  Shield, 
  Cloud, 
  Sparkles, 
  FileText, 
  Lock, 
  Unlock, 
  Star, 
  ArrowRight,
  Layers,
  Scissors,
  Minimize2,
  Table,
  Presentation,
  Image,
  RotateCw,
  PenTool,
  File
} from "lucide-react";
import { Footer } from "../Footer";
import { RecentJobs } from "../RecentJobs";
import { tools } from "../../data/tools";
import { seoPages, indianSeoRoutes } from "../../data/seoPages";
import { ToolIcon } from "../ToolIcon";


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
  onDeleteJob?: (jobId: string) => void;
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
  onDeleteJob,
  features,
  onToolSelect,
  onViewChange,
}: UploadHeroProps) {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const toolObj = tools.find(t => t.name === selectedTool);
  const toolId = toolObj?.id;

  let seoData = toolId ? seoPages[toolId] : null;
  if (typeof window !== "undefined" && toolId === "compress") {
    const currentPath = window.location.pathname;
    const isProgrammaticCompress = currentPath.match(/^\/compress-pdf-to-(\d+)(kb|mb)$/i);
    const indianMatch = indianSeoRoutes.find(r => r.route === currentPath);
    if (indianMatch) {
      seoData = seoPages[indianMatch.key];
    } else if (isProgrammaticCompress) {
      const sizeStr = isProgrammaticCompress[1] + isProgrammaticCompress[2].toLowerCase(); // e.g. "50kb"
      const seoKey = `compress-pdf-to-${sizeStr}`;
      if (seoPages[seoKey]) {
        seoData = seoPages[seoKey];
      }
    }
  }

  return (
    <>
      {/* ── Centered Title & Eyebrow ── */}
      <div style={{ textAlign: "center", paddingTop: "50px", paddingBottom: "28px" }}>
        <h1 style={{
          fontFamily: "Plus Jakarta Sans, sans-serif",
          fontSize: "40px",
          fontWeight: "800",
          color: "#000000",
          margin: "0 0 8px",
          letterSpacing: "-1px"
        }}>{selectedTool}</h1>
        <p style={{
          fontFamily: "Plus Jakarta Sans, sans-serif",
          fontSize: "15px",
          color: "#4B5563",
          fontWeight: 500,
          margin: 0
        }}>{heroDesc}</p>
      </div>

      {/* ── Center Upload Box Card ── */}
      <section style={{ padding: "0 24px", display: "flex", justifyContent: "center" }}>
        <div 
          className="upload-hero-card" 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            background: "#ffffff",
            border: "2px dashed #cfc4c5",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "900px",
            minHeight: "280px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 32px",
            boxSizing: "border-box",
            textAlign: "center",
            position: "relative",
            cursor: "pointer"
          }}
          onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}
        >
          {/* Premium Double-Page Upload Vector Illustration */}
          <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Background file sheet with blue dash border */}
              <rect x="18" y="8" width="32" height="40" rx="6" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3 3" />
              
              {/* Foreground main file sheet */}
              <rect x="12" y="14" width="32" height="40" rx="6" fill="#FFFFFF" stroke="#475569" strokeWidth="2" />
              <line x1="18" y1="24" x2="38" y2="24" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
              <line x1="18" y1="30" x2="34" y2="30" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
              <line x1="18" y1="36" x2="30" y2="36" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
              
              {/* Overlapping blue upload badge */}
              <circle cx="44" cy="44" r="13" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M44 50V38M44 38L40 42M44 38L48 42" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Upload Message */}
          <p style={{
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontSize: "16px",
            fontWeight: "600",
            color: "#1b1b1b",
            margin: "0 0 20px"
          }}>
            Drop document here to upload
          </p>

          {/* Action buttons (Choose Files + Dropdown Caret) */}
          <div style={{ display: "flex", gap: "1px", alignItems: "center", position: "relative", zIndex: 10 }} onClick={e => e.stopPropagation()}>
            <button
              onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}
              style={{
                background: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px 0 0 8px",
                padding: "16px 36px",
                fontSize: "17px",
                fontWeight: "600",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                transition: "background-color 0.15s ease"
              }}
              onMouseOver={e => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
              onMouseOut={e => (e.currentTarget.style.backgroundColor = "#2563eb")}
            >
              Choose Files
            </button>

            {/* Dropdown arrow button */}
            <div style={{ position: "relative" }}>
              <button
                onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
                style={{
                  background: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "0 8px 8px 0",
                  borderLeft: "1px solid rgba(255, 255, 255, 0.2)",
                  padding: "16px 18px",
                  fontSize: "17px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  height: "100%",
                  transition: "background-color 0.15s ease"
                }}
                onMouseOver={e => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
                onMouseOut={e => (e.currentTarget.style.backgroundColor = "#2563eb")}
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
      </section>

      {/* ── Bullet checklist directly under the card ── */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "32px",
        flexWrap: "wrap",
        marginTop: "20px",
        padding: "0 24px",
        marginBottom: "40px"
      }}>
        {features.map((feat, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#4B5563", fontWeight: 500 }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              backgroundColor: "#EBF2FF",
              color: "#2563eb",
              fontSize: "11px",
              fontWeight: "bold"
            }}>✓</span>
            <span>{feat.title}</span>
          </div>
        ))}
      </div>

      {jobs && jobs.length > 0 && (
        <section style={{ padding: "10px 24px 30px", maxWidth: "900px", margin: "0 auto" }}>
          <RecentJobs jobs={jobs} onRetry={onRetry} onDeleteJob={onDeleteJob} />
        </section>
      )}

      {/* ── 6 BENEFITS FEATURES GRID ── */}
      <section style={{ padding: "40px 24px 60px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px"
        }}>
          {[
            {
              title: `Simple & Free ${selectedTool.replace(" PDF", "")}`,
              desc: `Our browser-native tool lets you ${selectedTool.toLowerCase()} instantly in just a few clicks. No learning curve required.`,
              badgeBg: "#2563eb",
              icon: <Zap size={20} color="#ffffff" />
            },
            {
              title: "Encrypted & Volatile",
              desc: "Security is guaranteed. Files are encrypted in transit via TLS 1.3 and wiped from our servers after 60 minutes.",
              badgeBg: "#2563eb",
              icon: <Shield size={20} color="#ffffff" />
            },
            {
              title: "No Installation",
              desc: "Processing happens entirely in the cloud. Works seamlessly on Windows, Mac, Linux, iOS, and Android without setup.",
              badgeBg: "#2563eb",
              icon: <Cloud size={20} color="#ffffff" />
            },
            {
              title: "High-Fidelity Output",
              desc: "We parse PDF catalogs and streams directly, ensuring typography subsets, formatting, and vectors remain intact.",
              badgeBg: "#2563eb",
              icon: <Sparkles size={20} color="#ffffff" />
            },
            {
              title: "Scans & Forms Support",
              desc: "Edit interactive PDF form fields, checkbox fields, and scans safely without page shifts or graphic distortions.",
              badgeBg: "#2563eb",
              icon: <FileText size={20} color="#ffffff" />
            },
            {
              title: "Clean B2B Platform",
              desc: "No registrations, card info, or sign-ups required. Generate professional files instantly with zero watermarks.",
              badgeBg: "#2563eb",
              icon: <Unlock size={20} color="#ffffff" />
            }
          ].map((benefit, i) => (
            <div key={i} style={{
              background: "#F8FAFC",
              border: "1px solid #F1F5F9",
              borderRadius: "16px",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              boxShadow: "none",
              textAlign: "left"
            }}>
              <h3 style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "18px",
                fontWeight: 700,
                color: "#000000",
                margin: 0
              }}>{benefit.title}</h3>
              <p style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "14.5px",
                lineHeight: "1.6",
                color: "#4B5563",
                margin: 0,
                fontWeight: 400
              }}>{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SEO SECTION & ACCORDIONS ── */}
      {seoData && (
        <section style={{
          padding: "40px 24px 80px",
          maxWidth: "1200px",
          margin: "0 auto",
          fontFamily: "Plus Jakarta Sans, sans-serif"
        }}>
          {/* Divider */}
          <div style={{
            height: "1px",
            background: "linear-gradient(90deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.02) 100%)",
            marginBottom: "60px"
          }} />

          {/* Intro & Detailed Content */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "60px", marginBottom: "80px" }}>
            <div>
              <span style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "12px",
                letterSpacing: "1px",
                color: "var(--s-primary, #2563eb)",
                display: "block",
                fontWeight: "600",
                marginBottom: "12px",
                textTransform: "uppercase"
              }}>Overview</span>
              <h2 style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "clamp(26px, 3vw, 36px)",
                fontWeight: "700",
                lineHeight: 1.2,
                color: "#000000",
                margin: "0 0 20px",
                letterSpacing: "-0.5px"
              }}>{seoData.h1}</h2>
              <p style={{
                fontSize: "16.5px",
                lineHeight: "1.65",
                color: "#1B1B1B",
                fontWeight: 450,
                margin: 0
              }}>{seoData.intro}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", justifyContent: "center" }}>
              {seoData.detailedContent.map((para, idx) => (
                <p key={idx} style={{
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "#4B5563",
                  margin: 0,
                  fontWeight: 400
                }}>{para}</p>
              ))}
            </div>
          </div>

          {/* How-To Steps */}
          {seoData.steps && seoData.steps.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "48px", marginBottom: "80px", alignItems: "center" }}>
              {/* Left side: Illustration */}
              <div style={{
                background: "#f4f4f4",
                borderRadius: "16px",
                height: "320px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                border: "none"
              }}>
                {heroIllustration}
              </div>

              {/* Right side: Steps ordered list */}
              <div>
                <span style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "12px",
                  letterSpacing: "1px",
                  color: "var(--s-primary, #2563eb)",
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "12px",
                  textTransform: "uppercase"
                }}>Step-by-Step Guide</span>
                <h3 style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#000000",
                  letterSpacing: "-0.5px",
                  marginBottom: "24px"
                }}>How to use our free {selectedTool}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {seoData.steps.map((stepText, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: "#EBF2FF",
                        color: "#2563eb",
                        fontSize: "13px",
                        fontWeight: "700",
                        flexShrink: 0,
                        marginTop: "2px"
                      }}>{idx + 1}</span>
                      <p style={{
                        fontSize: "15px",
                        lineHeight: "1.5",
                        color: "#4B5563",
                        margin: 0,
                        fontWeight: 400
                      }}>{stepText}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FAQ Accordions */}
          {seoData.faqs && seoData.faqs.length > 0 && (
            <div style={{ marginBottom: "80px", paddingTop: "20px" }}>
              <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <span style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "12px",
                  letterSpacing: "1px",
                  color: "var(--s-primary, #2563eb)",
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "12px",
                  textTransform: "uppercase"
                }}>FAQ</span>
                <h3 style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#000000",
                  letterSpacing: "-0.5px"
                }}>{selectedTool} Frequently Asked Questions</h3>
              </div>
              <div style={{
                maxWidth: "800px",
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}>
                {seoData.faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={idx} style={{
                      border: "1px solid rgba(0,0,0,0.05)",
                      borderRadius: "8px",
                      background: "#ffffff",
                      padding: "4px 20px",
                      overflow: "hidden"
                    }}>
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        style={{
                          width: "100%",
                          background: "none",
                          border: "none",
                          padding: "16px 0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          textAlign: "left",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "#1b1b1b"
                        }}
                      >
                        <span>{faq.q}</span>
                        <ChevronDown size={16} style={{
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s",
                          color: "#2563eb"
                        }} />
                      </button>
                      <div style={{
                        maxHeight: isOpen ? "200px" : "0",
                        opacity: isOpen ? 1 : 0,
                        transition: "max-height 0.2s ease, opacity 0.2s ease",
                        overflow: "hidden"
                      }}>
                        <p style={{
                          margin: "0 0 16px",
                          fontSize: "14.5px",
                          lineHeight: "1.65",
                          color: "#4B5563",
                          fontWeight: 400
                        }}>{faq.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Related Workflows grid of 6 cards */}
          <div style={{ marginBottom: "60px" }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <span style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "12px",
                letterSpacing: "1px",
                color: "var(--s-primary, #2563eb)",
                display: "block",
                fontWeight: "600",
                marginBottom: "12px",
                textTransform: "uppercase"
              }}>Explore</span>
              <h4 style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "26px",
                fontWeight: "700",
                color: "#000000",
                letterSpacing: "-0.5px"
              }}>Popular PDF Workflows</h4>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px"
            }}>
              {tools
                .filter(t => t.status !== "coming-soon" && t.name !== selectedTool)
                .slice(0, 6)
                .map((t) => (
                  <div
                    key={t.id}
                    style={{
                      background: "#ffffff",
                      border: "1px solid rgba(0,0,0,0.05)",
                      borderRadius: "12px",
                      padding: "24px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.01)",
                      cursor: "pointer"
                    }}
                    onClick={() => onToolSelect(t.name)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <ToolIcon toolNameOrId={t.name} size={16} style={{ width: "32px", height: "32px", borderRadius: "6px" }} />
                      <h5 style={{
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#1b1b1b",
                        margin: 0
                      }}>{t.name}</h5>
                    </div>
                    <p style={{
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      fontSize: "13.5px",
                      lineHeight: "1.45",
                      color: "#4B5563",
                      margin: 0,
                      fontWeight: 400,
                      flex: 1
                    }}>{t.description}</p>
                    <span style={{
                      fontSize: "13.5px",
                      fontWeight: "600",
                      color: "#2563eb",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      marginTop: "8px"
                    }}>
                      Try Tool <ArrowRight size={14} />
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Ratings Trust Banner */}
          <div style={{
            textAlign: "center",
            padding: "24px 0",
            borderTop: "1px solid rgba(0,0,0,0.06)",
            marginBottom: "20px"
          }}>
            <div style={{ display: "inline-flex", flexDirection: "column", gap: "6px", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "4px", color: "#fbbf24", marginBottom: "4px" }}>
                <Star size={18} fill="#fbbf24" stroke="none" />
                <Star size={18} fill="#fbbf24" stroke="none" />
                <Star size={18} fill="#fbbf24" stroke="none" />
                <Star size={18} fill="#fbbf24" stroke="none" />
                <Star size={18} fill="#fbbf24" stroke="none" />
              </div>
              <span style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                color: "#4B5563"
              }}>
                <strong>4.8 / 5 stars</strong> — trusted by 10,000+ users monthly
              </span>
            </div>
          </div>

        </section>
      )}

      <Footer onToolSelect={onToolSelect} onViewChange={onViewChange} />
    </>
  );
}
