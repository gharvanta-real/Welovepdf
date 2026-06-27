import React, { useRef, useEffect, useState } from "react";
import { ResumeData, ResumeStyles } from "./types";
import { compileResumeToHtml } from "./templates";

interface ResumePreviewProps {
  data: ResumeData;
  styles: ResumeStyles;
  zoomMode: "auto" | "manual";
  zoomLevel: number;
}

// Check if resume has any meaningful content to show
function isResumeEmpty(data: ResumeData): boolean {
  return (
    !data.basics.name.trim() &&
    !data.basics.label.trim() &&
    data.work.length === 0 &&
    data.education.length === 0 &&
    data.skills.length === 0
  );
}

export function ResumePreview({ data, styles, zoomMode, zoomLevel }: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const isEmpty = isResumeEmpty(data);
  const compiledHtml = isEmpty ? "" : compileResumeToHtml(data, styles);

  // Resize scaling — only depends on zoomMode/zoomLevel, NOT data/styles (content doesn't affect layout size)
  useEffect(() => {
    if (zoomMode === "manual") {
      setScale(zoomLevel);
      return;
    }

    const handleResize = () => {
      if (!containerRef.current) return;
      const parent = containerRef.current.parentElement;
      if (!parent) return;

      const parentWidth = parent.clientWidth;
      const targetWidth = 800; // standard A4 width representation in px

      // Calculate scale — cap between 0.3x and 1.2x (raised from 1.1 for better large-screen usage)
      let scaleRatio = (parentWidth - 40) / targetWidth;
      if (scaleRatio > 1.2) scaleRatio = 1.2;
      if (scaleRatio < 0.3) scaleRatio = 0.3;

      setScale(scaleRatio);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    const timer = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [zoomMode, zoomLevel]); // ✅ Fixed: removed data/styles from deps — resize doesn't depend on content

  // Load custom Google Font inside preview client DOM if active
  useEffect(() => {
    if (styles.fontFamily === "custom" && styles.customFontFamily) {
      const fontName = styles.customFontFamily.trim();
      if (fontName) {
        const fontId = fontName.replace(/\s+/g, "+");
        const linkId = `google-font-preview-${fontId}`;
        if (!document.getElementById(linkId)) {
          const link = document.createElement("link");
          link.id = linkId;
          link.rel = "stylesheet";
          link.href = `https://fonts.googleapis.com/css2?family=${fontId}:wght@300;400;500;600;700;800&display=swap`;
          document.head.appendChild(link);
        }
      }
    }
  }, [styles.fontFamily, styles.customFontFamily]);

  const [tooltipStyles, setTooltipStyles] = useState<React.CSSProperties | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);

  // Detect selection finalized on mouseup or keyup to prevent drag-flicker issues
  useEffect(() => {
    const checkSelection = () => {
      // Small timeout to allow the browser selection range to settle
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !selection.toString().trim()) {
          setShowTooltip(false);
          setShowSizeMenu(false);
          return;
        }

        try {
          const range = selection.getRangeAt(0);
          const commonAncestor = range.commonAncestorContainer;
          const previewContent = containerRef.current;
          if (!previewContent || !previewContent.contains(commonAncestor)) {
            setShowTooltip(false);
            setShowSizeMenu(false);
            return;
          }

          const rect = range.getBoundingClientRect();
          const tooltipWidth = 320;
          
          let left = rect.left + rect.width / 2 - tooltipWidth / 2;
          let top = rect.top - 46; // Positioned exactly above highlighted text
          
          // Keep bounds within safe horizontal boundaries of the viewport
          if (left < 10) left = 10;
          if (left + tooltipWidth > window.innerWidth - 10) {
            left = window.innerWidth - tooltipWidth - 10;
          }

          setTooltipStyles({
            position: "fixed", // Position fixed relative to viewport to prevent container offsets
            left: `${left}px`,
            top: `${top}px`,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            gap: "2px",
            backgroundColor: "#1F2937",
            border: "1px solid #374151",
            borderRadius: "4px",
            padding: "3px 4px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)"
          });
          setShowTooltip(true);
        } catch (err) {
          setShowTooltip(false);
        }
      }, 20);
    };

    const handleMouseDown = () => {
      // Instantly hide formatting tooltip when a new selection click/drag begins
      setShowTooltip(false);
      setShowSizeMenu(false);
    };

    document.addEventListener("mouseup", checkSelection);
    document.addEventListener("keyup", checkSelection);
    document.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("scroll", checkSelection, true); // Keep aligned when scrolling

    return () => {
      document.removeEventListener("mouseup", checkSelection);
      document.removeEventListener("keyup", checkSelection);
      document.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("scroll", checkSelection, true);
    };
  }, []);

  // Format command triggers
  const triggerFormat = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
  };

  const applyFontSize = (size: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    
    document.execCommand("styleWithCSS", false, "true");
    const span = document.createElement("span");
    span.style.fontSize = size;
    
    try {
      range.surroundContents(span);
    } catch {
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
    }
    
    setShowSizeMenu(false);
  };

  // Empty state — guide user to fill in details
  if (isEmpty) {
    return (
      <div className="rb-preview-viewport rb-preview-empty-state">
        <div className="rb-empty-preview-card">
          <div className="rb-empty-preview-icon">📄</div>
          <h3 className="rb-empty-preview-title">Your resume preview will appear here</h3>
          <p className="rb-empty-preview-text">
            Start filling in your details on the left panel to see a live preview of your resume.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rb-preview-viewport" style={{ position: "relative" }}>
      {/* Outer sheet container for scaling using native CSS zoom to preserve text selection coordinates */}
      <div
        ref={containerRef}
        className="rb-preview-a4-sheet"
        style={{
          zoom: scale,
          width: "800px",
          minHeight: "1130px", // A4 aspect ratio at 96dpi
          backgroundColor: "#ffffff",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
          borderRadius: "4px",
          overflow: "hidden"
        }}
      >
        <div
          className="rb-preview-content-injected"
          contentEditable={true}
          suppressContentEditableWarning={true}
          onDragStart={(e) => e.preventDefault()}
          dangerouslySetInnerHTML={{ __html: compiledHtml }}
          style={{ height: "100%", width: "100%", outline: "none" }}
        />
      </div>

      {/* Floating formatting shortcut popup */}
      {showTooltip && tooltipStyles && (
        <div style={tooltipStyles} className="rb-format-tooltip">
          <button
            onMouseDown={(e) => { e.preventDefault(); triggerFormat("bold"); }}
            style={{
              background: "transparent",
              border: "none",
              color: "#D1D5DB",
              padding: "4px 8px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              borderRadius: "3px"
            }}
            title="Bold"
          >
            B
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); triggerFormat("italic"); }}
            style={{
              background: "transparent",
              border: "none",
              color: "#D1D5DB",
              padding: "4px 8px",
              fontSize: "12px",
              fontStyle: "italic",
              fontWeight: "400",
              cursor: "pointer",
              borderRadius: "3px"
            }}
            title="Italic"
          >
            I
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); triggerFormat("underline"); }}
            style={{
              background: "transparent",
              border: "none",
              color: "#D1D5DB",
              padding: "4px 8px",
              fontSize: "12px",
              textDecoration: "underline",
              fontWeight: "400",
              cursor: "pointer",
              borderRadius: "3px"
            }}
            title="Underline"
          >
            U
          </button>
          
          <div style={{ width: "1px", height: "14px", backgroundColor: "#4B5563", margin: "0 3px" }}></div>
          
          {/* Size Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onMouseDown={(e) => { e.preventDefault(); setShowSizeMenu(!showSizeMenu); }}
              style={{
                background: "transparent",
                border: "none",
                color: "#D1D5DB",
                padding: "4px 6px",
                fontSize: "11px",
                fontWeight: "400",
                cursor: "pointer",
                borderRadius: "3px"
              }}
              title="Font Size"
            >
              Size
            </button>
            {showSizeMenu && (
              <div style={{
                position: "absolute",
                bottom: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "4px",
                padding: "4px 0",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                minWidth: "65px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                marginBottom: "6px",
                zIndex: 100000
              }}>
                {["9pt", "10pt", "11pt", "12pt", "14pt", "16pt"].map((sz) => (
                  <button
                    key={sz}
                    onMouseDown={(e) => { e.preventDefault(); applyFontSize(sz); }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#E5E7EB",
                      padding: "4px 8px",
                      fontSize: "11px",
                      fontWeight: "400",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "center"
                    }}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div style={{ width: "1px", height: "14px", backgroundColor: "#4B5563", margin: "0 3px" }}></div>
          
          <button
            onMouseDown={(e) => { e.preventDefault(); triggerFormat("justifyLeft"); }}
            style={{
              background: "transparent",
              border: "none",
              color: "#D1D5DB",
              padding: "4px 6px",
              fontSize: "11px",
              fontWeight: "400",
              cursor: "pointer",
              borderRadius: "3px"
            }}
            title="Align Left"
          >
            Left
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); triggerFormat("justifyCenter"); }}
            style={{
              background: "transparent",
              border: "none",
              color: "#D1D5DB",
              padding: "4px 6px",
              fontSize: "11px",
              fontWeight: "400",
              cursor: "pointer",
              borderRadius: "3px"
            }}
            title="Align Center"
          >
            Center
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); triggerFormat("justifyRight"); }}
            style={{
              background: "transparent",
              border: "none",
              color: "#D1D5DB",
              padding: "4px 6px",
              fontSize: "11px",
              fontWeight: "400",
              cursor: "pointer",
              borderRadius: "3px"
            }}
            title="Align Right"
          >
            Right
          </button>
          
          <div style={{ width: "1px", height: "14px", backgroundColor: "#4B5563", margin: "0 3px" }}></div>
          
          <button
            onMouseDown={(e) => { e.preventDefault(); triggerFormat("insertUnorderedList"); }}
            style={{
              background: "transparent",
              border: "none",
              color: "#D1D5DB",
              padding: "4px 6px",
              fontSize: "11px",
              fontWeight: "400",
              cursor: "pointer",
              borderRadius: "3px"
            }}
            title="Bullet List"
          >
            • List
          </button>
          
          <button
            onMouseDown={(e) => { e.preventDefault(); triggerFormat("removeFormat"); }}
            style={{
              background: "transparent",
              border: "none",
              color: "#EF4444",
              padding: "4px 6px",
              fontSize: "11px",
              fontWeight: "400",
              cursor: "pointer",
              borderRadius: "3px"
            }}
            title="Clear Formatting"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
