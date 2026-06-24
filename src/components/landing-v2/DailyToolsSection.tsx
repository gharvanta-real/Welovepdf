import React, { useState, useEffect, useRef } from "react";
import { tools } from "../../data/tools";
import { ToolIcon } from "../ToolIcon";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

interface DailyToolsSectionProps {
  onToolSelect: (toolName: string) => void;
}

export function DailyToolsSection({ onToolSelect }: DailyToolsSectionProps) {
  // exact mappings of dropdown columns from the topnav
  const convertEditIds = [
    "word-pdf", "excel-pdf", "ppt-pdf", "jpg-pdf", "html-pdf", "txt-pdf",
    "pdf-word", "pdf-excel", "pdf-ppt", "pdf-jpg",
    "pdf-annotator", "document-editor", "rotate", "crop-pdf", "page-numbers"
  ];
  
  const organizeSecureIds = [
    "compress", "flatten", "repair",
    "merge", "split", "organize", "remove", "extract",
    "esign", "unlock", "protect", "watermark-pdf", "bates-numbering"
  ];

  const convertEditTools = convertEditIds
    .map(id => tools.find(t => t.id === id))
    .filter((t): t is typeof tools[0] => t !== undefined);

  const organizeSecureTools = organizeSecureIds
    .map(id => tools.find(t => t.id === id))
    .filter((t): t is typeof tools[0] => t !== undefined);

  // States and Refs for Section 1 (Convert & Edit)
  const [isExpanded1, setIsExpanded1] = useState(false);
  const [collapsedHeight1, setCollapsedHeight1] = useState(580);
  const [fullHeight1, setFullHeight1] = useState(2000);
  const [hasMoreThanTwoRows1, setHasMoreThanTwoRows1] = useState(false);
  const gridRef1 = useRef<HTMLDivElement>(null);

  // States and Refs for Section 2 (Organize & Secure)
  const [isExpanded2, setIsExpanded2] = useState(false);
  const [collapsedHeight2, setCollapsedHeight2] = useState(580);
  const [fullHeight2, setFullHeight2] = useState(2000);
  const [hasMoreThanTwoRows2, setHasMoreThanTwoRows2] = useState(false);
  const gridRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      // Helper to calculate tops of rows and set height boundaries
      const calculateSectionGrid = (
        gridElement: HTMLDivElement | null,
        setFullHeight: (h: number) => void,
        setCollapsedHeight: (h: number) => void,
        setHasMore: (b: boolean) => void
      ) => {
        if (!gridElement) return;
        setFullHeight(gridElement.scrollHeight);
        
        const cards = Array.from(gridElement.children).filter(c => c.tagName === "A");
        if (cards.length > 0) {
          const tops = cards.map((c: any) => c.offsetTop);
          const uniqueTops: number[] = [];
          tops.forEach(top => {
            if (!uniqueTops.some(t => Math.abs(t - top) < 4)) {
              uniqueTops.push(top);
            }
          });
          uniqueTops.sort((a, b) => a - b);
          
          if (uniqueTops.length > 2) {
            // Cut off right in the middle of the grid gap (12px offset from start of row 3)
            setCollapsedHeight(uniqueTops[2] - 12);
            setHasMore(true);
          } else {
            setCollapsedHeight(gridElement.scrollHeight);
            setHasMore(false);
          }
        }
      };

      calculateSectionGrid(gridRef1.current, setFullHeight1, setCollapsedHeight1, setHasMoreThanTwoRows1);
      calculateSectionGrid(gridRef2.current, setFullHeight2, setCollapsedHeight2, setHasMoreThanTwoRows2);
    };

    // Run layout calculation after render and listen for window resizing
    const timer = setTimeout(handleResize, 150);
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [convertEditTools.length, organizeSecureTools.length]);

  return (
    <div id="v2-tools-section" style={{ scrollMarginTop: "80px" }}>
      {/* ── SECTION 1: CONVERT & EDIT TOOLS (From topnav data) ── */}
      <section className="v2-tools-section">
        <div className="v2-container">
          <div className="v2-section-header">
            <div className="v2-section-title-wrap">
              <h2>Convert &amp; Edit Utilities</h2>
              <p>Direct daily utilities to translate, format, and redact document contents instantly</p>
            </div>
          </div>
          
          <div 
            style={{
              position: "relative",
              maxHeight: isExpanded1 ? `${fullHeight1}px` : `${collapsedHeight1}px`,
              overflow: "hidden",
              transition: "max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            <div ref={gridRef1} className="v2-tools-grid">
              {convertEditTools.map(tool => (
                <a
                  key={tool.id}
                  href={`#${tool.id}`}
                  className="v2-tool-card"
                  onClick={(e) => {
                    e.preventDefault();
                    onToolSelect(tool.name);
                  }}
                >
                  <div className="v2-tool-icon-wrapper">
                    <ToolIcon toolNameOrId={tool.id} size={24} />
                  </div>
                  <h3>{tool.name}</h3>
                  <p>{tool.description}</p>
                  <div className="v2-tool-cta">
                    <span>Start Processing</span>
                    <ArrowRight size={14} />
                  </div>
                </a>
              ))}
            </div>

            {/* Premium bottom fade gradient when collapsed */}
            {!isExpanded1 && hasMoreThanTwoRows1 && (
              <div 
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "80px",
                  background: "linear-gradient(to bottom, transparent, var(--v2-bg-page))",
                  pointerEvents: "none",
                  zIndex: 10
                }}
              />
            )}
          </div>

          {/* Centered Chevron Expand Button */}
          {hasMoreThanTwoRows1 && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "32px" }}>
              <button
                onClick={() => setIsExpanded1(!isExpanded1)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 28px",
                  borderRadius: "9999px",
                  border: "1.5px solid var(--v2-border)",
                  backgroundColor: "var(--v2-bg-surface)",
                  color: "var(--v2-text-main)",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "var(--v2-shadow-sm)",
                  outline: "none"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--v2-primary)";
                  e.currentTarget.style.color = "var(--v2-primary)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "var(--v2-shadow-md)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--v2-border)";
                  e.currentTarget.style.color = "var(--v2-text-main)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "var(--v2-shadow-sm)";
                }}
              >
                <span>{isExpanded1 ? "Show Less" : "Show All Tools"}</span>
                {isExpanded1 ? (
                  <ChevronUp size={16} style={{ strokeWidth: 2.5 }} />
                ) : (
                  <ChevronDown size={16} style={{ strokeWidth: 2.5 }} />
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 2: ORGANIZE & SECURE TOOLS (From topnav data) ── */}
      <section className="v2-tools-section">
        <div className="v2-container">
          <div className="v2-section-header">
            <div className="v2-section-title-wrap">
              <h2>Organize &amp; Secure Utilities</h2>
              <p>Reorder pages, merge attachments, sign contracts, and protect files on the fly</p>
            </div>
          </div>

          <div 
            style={{
              position: "relative",
              maxHeight: isExpanded2 ? `${fullHeight2}px` : `${collapsedHeight2}px`,
              overflow: "hidden",
              transition: "max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            <div ref={gridRef2} className="v2-tools-grid">
              {organizeSecureTools.map(tool => (
                <a
                  key={tool.id}
                  href={`#${tool.id}`}
                  className="v2-tool-card"
                  onClick={(e) => {
                    e.preventDefault();
                    onToolSelect(tool.name);
                  }}
                >
                  <div className="v2-tool-icon-wrapper">
                    <ToolIcon toolNameOrId={tool.id} size={24} />
                  </div>
                  <h3>{tool.name}</h3>
                  <p>{tool.description}</p>
                  <div className="v2-tool-cta">
                    <span>Start Processing</span>
                    <ArrowRight size={14} />
                  </div>
                </a>
              ))}
            </div>

            {/* Premium bottom fade gradient when collapsed */}
            {!isExpanded2 && hasMoreThanTwoRows2 && (
              <div 
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "80px",
                  background: "linear-gradient(to bottom, transparent, var(--v2-bg-page))",
                  pointerEvents: "none",
                  zIndex: 10
                }}
              />
            )}
          </div>

          {/* Centered Chevron Expand Button */}
          {hasMoreThanTwoRows2 && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "32px" }}>
              <button
                onClick={() => setIsExpanded2(!isExpanded2)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 28px",
                  borderRadius: "9999px",
                  border: "1.5px solid var(--v2-border)",
                  backgroundColor: "var(--v2-bg-surface)",
                  color: "var(--v2-text-main)",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "var(--v2-shadow-sm)",
                  outline: "none"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--v2-primary)";
                  e.currentTarget.style.color = "var(--v2-primary)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "var(--v2-shadow-md)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--v2-border)";
                  e.currentTarget.style.color = "var(--v2-text-main)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "var(--v2-shadow-sm)";
                }}
              >
                <span>{isExpanded2 ? "Show Less" : "Show All Tools"}</span>
                {isExpanded2 ? (
                  <ChevronUp size={16} style={{ strokeWidth: 2.5 }} />
                ) : (
                  <ChevronDown size={16} style={{ strokeWidth: 2.5 }} />
                )}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
export default DailyToolsSection;
