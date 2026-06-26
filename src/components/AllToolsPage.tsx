import React, { useState, useEffect } from "react";
import { tools, sitemapGroups } from "../data/tools";
import { ToolIcon } from "./ToolIcon";
import { ArrowLeft, ArrowRight, Search, X } from "lucide-react";


interface AllToolsPageProps {
  onToolSelect: (toolName: string) => void;
  onPricingClick: () => void;
  onContactSalesClick: () => void;
  onBack: () => void;
  onViewChange: (view: any) => void;
}

// Reusable Google AdSense Ad Unit Component
function AdSenseUnit({ slot, style = {} }: { slot: string; style?: React.CSSProperties }) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.warn("AdSense push failed:", err);
    }
  }, []);

  return (
    <div style={{ margin: "32px 0", textAlign: "center", width: "100%", overflow: "hidden", ...style }}>
      <span style={{ display: "block", fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>
        Advertisement
      </span>
      <ins 
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXX" // Replace with your approved publisher ID
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

// Clean inline SVG Vector Illustrations
const ConversionIllustration = () => (
  <svg width="60" height="60" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: "16px" }}>
    <rect x="6" y="10" width="30" height="40" rx="6" fill="#E5EDFF" stroke="#2563EB" strokeWidth="2"/>
    <rect x="28" y="20" width="30" height="40" rx="6" fill="#FFFFFF" stroke="#6366F1" strokeWidth="2" strokeDasharray="4 4"/>
    <path d="M22 28L26 28L26 24" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M42 36L38 36L38 40" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M25 28C30 28 34 32 38 36" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
    <text x="16" y="22" fill="#2563EB" fontSize="7" fontWeight="bold" fontFamily="system-ui">DOC</text>
    <text x="38" y="50" fill="#6366F1" fontSize="7" fontWeight="bold" fontFamily="system-ui">PDF</text>
  </svg>
);

const OptimizationIllustration = () => (
  <svg width="60" height="60" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: "16px" }}>
    <rect x="10" y="8" width="44" height="20" rx="4" fill="#EBF2FF" stroke="#2563EB" strokeWidth="2"/>
    <rect x="10" y="36" width="44" height="20" rx="4" fill="#EBF2FF" stroke="#2563EB" strokeWidth="2"/>
    <path d="M32 20V26" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
    <path d="M32 38V44" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
    <path d="M28 29.5L32 25.5L36 29.5" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M28 34.5L32 38.5L36 34.5" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="22" y="19" fill="#2563EB" fontSize="6" fontWeight="bold" fontFamily="system-ui">PAGE 1</text>
    <text x="22" y="47" fill="#2563EB" fontSize="6" fontWeight="bold" fontFamily="system-ui">PAGE 2</text>
  </svg>
);

const SecurityIllustration = () => (
  <svg width="60" height="60" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: "16px" }}>
    <path d="M32 6C32 6 48 10 48 24C48 38 32 50 32 50C32 50 16 38 16 24C16 10 32 6 32 6Z" fill="#E5EDFF" stroke="#2563EB" strokeWidth="2" strokeLinejoin="round"/>
    <rect x="24" y="22" width="16" height="12" rx="2" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2"/>
    <path d="M27 22V17C27 14.5 29 12.5 32 12.5C35 12.5 37 14.5 37 17V22" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="32" cy="28" r="1.5" fill="#2563EB"/>
  </svg>
);



export function AllToolsPage({ onToolSelect, onPricingClick, onContactSalesClick, onBack, onViewChange }: AllToolsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Exclude coming-soon tools and filter based on search and category
  const filteredTools = tools.filter(tool => {
    if (tool.status === "coming-soon") return false;

    // Filter by selected category tab
    if (selectedCategory !== "All" && tool.sitemapGroup !== selectedCategory) {
      return false;
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      return (
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return (
    <div className="stitch-landing" style={{ width: "100%", minHeight: "100vh", backgroundColor: "#ffffff" }}>
      {/* Scope custom classes and styles for this clean page */}
      <style>{`
        .all-tools-clean-card {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s ease, box-shadow 0.2s ease;
          min-height: 180px;
          position: relative;
        }
        .all-tools-clean-card:hover {
          transform: translateY(-4px);
          border-color: #2563eb !important;
          box-shadow: 0 12px 30px rgba(37, 99, 235, 0.08);
        }
        .all-tools-clean-card:hover .card-arrow {
          transform: translateX(4px);
        }
        .card-arrow {
          transition: transform 0.2s ease;
        }
        @media (min-width: 1024px) {
          .all-tools-grid-desktop {
            grid-template-columns: repeat(5, 1fr) !important;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .all-tools-grid-desktop {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 767px) {
          .all-tools-grid-desktop {
            grid-template-columns: repeat(1, 1fr) !important;
          }
        }
        
        /* Custom scrollbar styling for category list on mobile */
        .category-tabs-container::-webkit-scrollbar {
          height: 4px;
        }
        .category-tabs-container::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 2px;
        }
      `}</style>

      <div className="stitch-container" style={{ paddingTop: "64px", paddingBottom: "100px" }}>
        
        {/* Back Button */}
        <button 
          onClick={onBack} 
          className="stitch-pill-outline"
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            padding: "8px 20px", 
            fontSize: "14px", 
            marginBottom: "20px",
            border: "1px solid #e2e8f0",
            borderRadius: "9999px",
            backgroundColor: "#ffffff",
            color: "#4b5563",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#2563eb";
            e.currentTarget.style.color = "#2563eb";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.color = "#4b5563";
          }}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        {/* Hero Section */}
        <div style={{ marginBottom: "48px", maxWidth: "900px" }}>
          <h1 style={{ 
            fontSize: "clamp(28px, 3.5vw, 40px)", 
            fontWeight: 700, 
            letterSpacing: "-1px", 
            lineHeight: 1.15, 
            marginBottom: "16px", 
            color: "#0F172A" 
          }}>
            All PDF tools at your fingertips.
          </h1>
          <p style={{ 
            color: "#4B5563", 
            fontSize: "14px", 
            fontWeight: 400, 
            lineHeight: 1.5, 
            margin: 0, 
            maxWidth: "700px" 
          }}>
            Edit, convert, merge, and sign PDF documents in seconds. Professional-grade utilities wrapped in a minimalist, high-fidelity workspace.
          </p>
        </div>

        {/* AdSense Unit (Top) */}
        <AdSenseUnit slot="top-responsive-ad" style={{ marginBottom: "40px" }} />

        {/* Search & Categories Bar */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "24px", 
          marginBottom: "40px",
          paddingBottom: "24px",
          borderBottom: "1px solid #f4f4f4"
        }}>
          {/* Search Input */}
          <div style={{ position: "relative", maxWidth: "480px", width: "100%" }}>
            <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input 
              type="text" 
              placeholder="Search tools..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 48px",
                fontSize: "14px",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                outline: "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
                backgroundColor: "#ffffff",
                color: "#0F172A",
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#2563eb";
                e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div 
            className="category-tabs-container"
            style={{ 
              display: "flex", 
              gap: "8px", 
              flexWrap: "nowrap",
              overflowX: "auto",
              paddingBottom: "8px",
              width: "100%"
            }}
          >
            {["All", ...sitemapGroups].map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: "8px 18px",
                  fontSize: "14px",
                  fontWeight: 500,
                  borderRadius: "9999px",
                  border: "1px solid",
                  borderColor: selectedCategory === category ? "#2563eb" : "#e2e8f0",
                  backgroundColor: selectedCategory === category ? "#2563eb" : "#ffffff",
                  color: selectedCategory === category ? "#ffffff" : "#4b5563",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap"
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        {filteredTools.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#64748B" }}>
            <p style={{ fontSize: "16px", margin: 0 }}>No tools found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div 
            style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(5, 1fr)", 
              gap: "20px",
              marginBottom: "40px"
            }}
            className="all-tools-grid-desktop"
          >
            {filteredTools.map(tool => {
              const isBeta = tool.status === "beta";
              return (
                <div 
                  key={tool.id}
                  onClick={() => onToolSelect(tool.name)}
                  className="all-tools-clean-card"
                >
                  <div>
                    {/* Icon & Status Banner */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                      <div 
                        style={{ 
                          width: "40px", 
                          height: "40px", 
                          borderRadius: "10px", 
                          overflow: "hidden",
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center"
                        }}
                      >
                        <ToolIcon toolNameOrId={tool.name} size={22} style={{ width: "36px", height: "36px", borderRadius: "8px" }} />
                      </div>
                      {isBeta && (
                        <span style={{ 
                          fontSize: "10px", 
                          padding: "2px 6px", 
                          borderRadius: "4px", 
                          backgroundColor: "#fef3c7", 
                          color: "#d97706", 
                          fontWeight: "bold" 
                        }}>
                          Beta
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 style={{ 
                      fontSize: "18px", 
                      fontWeight: 600, 
                      color: "#0F172A", 
                      margin: "0 0 6px 0",
                      lineHeight: 1.3
                    }}>
                      {tool.name}
                    </h3>

                    {/* Description */}
                    <p style={{ 
                      fontSize: "14px", 
                      fontWeight: 400, 
                      color: "#64748B", 
                      lineHeight: 1.4, 
                      margin: 0 
                    }}>
                      {tool.description}
                    </p>
                  </div>

                  {/* Clean CTA Link */}
                  <div className="card-arrow" style={{ 
                    alignSelf: "flex-start", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "6px",
                    color: "#2563eb", 
                    fontSize: "13px", 
                    fontWeight: 600,
                    marginTop: "20px"
                  }}>
                    <span>Open Tool</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SEO & Resource Guide Section (At the Bottom, Well Organized, Non-Robotic, with Vector Illustrations) */}
        <div style={{ marginTop: "80px", paddingTop: "60px", borderTop: "1px solid #f4f4f4" }}>
          
          {/* Article Header */}
          <div style={{ maxWidth: "900px", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#0F172A", marginBottom: "16px" }}>
              The Evolution of Document Formats: Why PDF Reigns Supreme
            </h2>
            <p style={{ fontSize: "14px", color: "#4B5563", lineHeight: 1.6, margin: 0 }}>
              Welcome to the Pdfmount.online help center and resource guide. As digital documents form the backbone of modern business communication, academic research, and legal transactions, managing them efficiently is a fundamental skill. Portable Document Format (PDF) files have become the universal standard because they preserve formatting, fonts, and layouts across all operating systems and devices. However, modifying or converting these static documents has historically required expensive software licenses or slow desktop installations. Our browser-based suite solves this challenge by delivering high-fidelity, secure, and fast tools directly in your browser. This comprehensive guide explains the core categories of document utilities and outlines best practices to protect your data during digital workflows.
            </p>
          </div>

          {/* Three-Column Utility Guide */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
            gap: "24px", 
            marginBottom: "64px" 
          }}>
            {/* Card 1: Conversion */}
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <ConversionIllustration />
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#0F172A", marginBottom: "12px" }}>
                Seamless Format Conversion
              </h3>
              <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.5, margin: 0 }}>
                Transforming file formats shouldn't corrupt your spacing, tables, or fonts. When converting from formats like Microsoft Word, Excel, or PowerPoint into PDF, our engine runs deep layout parsing to ensure that elements look exactly as they did in their source application. Conversely, exporting a PDF back to an editable Word document or spreadsheet requires advanced optical character recognition (OCR) and paragraph clustering. This ensures that text segments are editable rather than flattened as random characters. Image-based conversions, such as transforming a gallery of JPGs or PNGs into a single PDF portfolio, are optimized to maintain high resolution while adjusting margins and page dimensions automatically. Clean format translations prevent communication errors and maintain professionalism in all files.
              </p>
            </div>

            {/* Card 2: Optimization */}
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <OptimizationIllustration />
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#0F172A", marginBottom: "12px" }}>
                Layout & Size Optimization
              </h3>
              <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.5, margin: 0 }}>
                Government portals, academic admissions, and corporate emails frequently impose strict size limits on PDF attachments. Simply shrinking images makes text illegible. Our compression utility analyzes the internal structure of your document, removing redundant metadata, compacting embedded font objects, and downsampling images using clean spatial compression without rendering the text blurry. For file management, merging multiple files gathers pages into a single document, while splitting extracts specific page ranges into independent sheets. Page-level organization tools enable you to rotate individual pages that were scanned sideways, delete blank sheets, crop custom borders, and insert page numbers in headers or footers, giving you total control over the document's structure.
              </p>
            </div>

            {/* Card 3: Security */}
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <SecurityIllustration />
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#0F172A", marginBottom: "12px" }}>
                Secure Signatures & Protection
              </h3>
              <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.5, margin: 0 }}>
                Digital document safety requires modern cryptographic protocols. When you draw, type, or upload an electronic signature onto a PDF contract, it is embedded directly into the document layer. For sensitive materials, applying an owner password with AES-256 bit encryption restricts copying, editing, or printing, preventing unauthorized tampering. If you need to access a restricted file, our unlock tool decrypts it, provided you have the legal right or passcode. For legal and corporate indexing, Bates numbering applies unique sequential alphanumeric keys to each page, ensuring audit-trail tracking. Additionally, editing metadata fields removes hidden author profiles, save history, and creation dates, securing your corporate privacy before documents are shared with the public.
              </p>
            </div>
          </div>

          {/* AdSense Unit (Middle) */}
          <AdSenseUnit slot="middle-responsive-ad" />

          {/* How to Use - Full Width Image, No Card, No Badge */}
          <div style={{ marginBottom: "64px" }}>
            <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#0F172A", marginBottom: "12px" }}>
              How to Use Any Tool
            </h3>
            <p style={{ fontSize: "14px", color: "#4B5563", lineHeight: 1.6, marginBottom: "28px", maxWidth: "680px" }}>
              Every tool on Pdfmount.online follows the same simple three-step flow - upload your file, choose your settings, and download the result instantly. No software installation, no account required for basic tasks.
            </p>
            <img
              src="/How-to-use-any-tools.png"
              alt="How to use any PDF tool - upload, process, download"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                borderRadius: "0px"
              }}
            />
          </div>

          {/* Interactive FAQ Grid */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#0F172A", marginBottom: "32px", textAlign: "center" }}>
              Frequently Asked Questions & Answers
            </h2>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
              gap: "24px" 
            }}>
              {/* FAQ 1 */}
              <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px" }}>
                <h4 style={{ fontSize: "18px", fontWeight: 600, color: "#0F172A", marginTop: 0, marginBottom: "10px" }}>
                  Are my private files safe on Pdfmount.online?
                </h4>
                <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.5, margin: 0 }}>
                  Yes. Security is our primary architecture. All file uploads are fully encrypted in transit using secure HTTPS protocols. Files are processed in isolated sandboxed containers and are automatically and permanently deleted from our servers within a short processing window. We do not inspect, share, or store your document contents.
                </p>
              </div>

              {/* FAQ 2 */}
              <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px" }}>
                <h4 style={{ fontSize: "18px", fontWeight: 600, color: "#0F172A", marginTop: 0, marginBottom: "10px" }}>
                  How does PDF compression reduce size without losing quality?
                </h4>
                <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.5, margin: 0 }}>
                  Our compression algorithms optimize the underlying PDF code. It targets resource-heavy elements like duplicate font profiles and metadata, and compresses images using balanced vector settings. This reduces the footprint while keeping text and graphics crisp.
                </p>
              </div>

              {/* FAQ 3 */}
              <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px" }}>
                <h4 style={{ fontSize: "18px", fontWeight: 600, color: "#0F172A", marginTop: 0, marginBottom: "10px" }}>
                  Can I add signatures or text comments to a document directly?
                </h4>
                <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.5, margin: 0 }}>
                  Yes. The PDF Annotator and Sign PDF tools allow you to draw, type, or import electronic signatures, write text notes, highlight key sentences, and draw shapes directly onto the document layers, which can then be saved and downloaded as a standard PDF.
                </p>
              </div>

              {/* FAQ 4 */}
              <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px" }}>
                <h4 style={{ fontSize: "18px", fontWeight: 600, color: "#0F172A", marginTop: 0, marginBottom: "10px" }}>
                  What is the advantage of browser-based processing over desktop apps?
                </h4>
                <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.5, margin: 0 }}>
                  It is instant, requires no installation, works on any operating system, and is completely free. Running sandboxed tasks also ensures that local software exploits are avoided, providing a clean, isolated environment to view and organize your files.
                </p>
              </div>
            </div>
          </div>

          {/* AdSense Unit (Bottom) */}
          <AdSenseUnit slot="bottom-responsive-ad" />

        </div>
      </div>
    </div>
  );
}

