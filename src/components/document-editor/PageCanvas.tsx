import React, { useEffect } from 'react';
import { PageRuler, PageVerticalRuler } from './PageRuler';

interface Margins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface PageBorder {
  width: string;
  style: string;
  color: string;
}

interface PageCanvasProps {
  contentHtml: string;
  onContentChange: (html: string) => void;
  onSelectionChange: () => void;
  placeholder?: string;
  editorRef: React.RefObject<HTMLDivElement | null>;
  zoom: string;
  margins: Margins;
  pageBgColor: string;
  showRuler?: boolean;
  onMarginsChange?: (margins: Margins) => void;
  layoutMode?: 'print' | 'web';
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'letter' | 'a4' | 'legal' | 'executive';
  pageBorder?: PageBorder;
  showGridlines?: boolean;
  editorMode?: 'editing' | 'viewing';
  onPageCountChange?: (count: number) => void;
}

const paperSizes = {
  letter: { width: 816, height: 1056 },
  a4: { width: 794, height: 1123 },
  legal: { width: 816, height: 1344 },
  executive: { width: 696, height: 1008 },
};

export function PageCanvas({
  contentHtml,
  onContentChange,
  onSelectionChange,
  placeholder = "Start writing your document here...",
  editorRef,
  zoom,
  margins = { top: 96, bottom: 96, left: 96, right: 96 },
  pageBgColor,
  showRuler = true,
  onMarginsChange,
  layoutMode = 'print',
  orientation = 'portrait',
  pageSize = 'letter',
  pageBorder = { width: '0px', style: 'none', color: '#dadce0' },
  showGridlines = false,
  editorMode = 'editing',
  onPageCountChange,
}: PageCanvasProps) {

  useEffect(() => {
    if (typeof document !== 'undefined') {
      try {
        document.execCommand('styleWithCSS', false, 'true');
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== contentHtml) {
      editorRef.current.innerHTML = contentHtml;
    }
  }, [contentHtml]);

  const [computedPages, setComputedPages] = React.useState(1);

  const baseSize = paperSizes[pageSize] || paperSizes.letter;
  const pageWidth = orientation === 'portrait' ? baseSize.width : baseSize.height;
  const pageHeight = orientation === 'portrait' ? baseSize.height : baseSize.width;

  React.useEffect(() => {
    onPageCountChange?.(computedPages);
  }, [computedPages, onPageCountChange]);

  React.useEffect(() => {
    if (layoutMode === 'web') {
      setComputedPages(1);
      return;
    }
    if (editorRef.current) {
      // Temporarily clear styling that forces the height to stretch to the parent container
      const originalMinHeight = editorRef.current.style.minHeight;
      const originalHeight = editorRef.current.style.height;
      editorRef.current.style.minHeight = '0px';
      editorRef.current.style.height = 'auto';
      
      const scrollHeight = editorRef.current.scrollHeight;
      
      // Restore original styling
      editorRef.current.style.minHeight = originalMinHeight;
      editorRef.current.style.height = originalHeight;

      const usableHeight = pageHeight - margins.top - margins.bottom;
      const pages = Math.max(1, Math.ceil(scrollHeight / usableHeight));
      if (pages !== computedPages) {
        setComputedPages(pages);
      }
    }
  }, [contentHtml, margins.top, margins.bottom, computedPages, editorRef, layoutMode, pageHeight]);

  const handleInput = () => {
    if (editorRef.current) {
      onContentChange(editorRef.current.innerHTML);
      if (layoutMode === 'web') {
        setComputedPages(1);
        return;
      }
      const originalMinHeight = editorRef.current.style.minHeight;
      const originalHeight = editorRef.current.style.height;
      editorRef.current.style.minHeight = '0px';
      editorRef.current.style.height = 'auto';
      
      const scrollHeight = editorRef.current.scrollHeight;
      
      editorRef.current.style.minHeight = originalMinHeight;
      editorRef.current.style.height = originalHeight;

      const usableHeight = pageHeight - margins.top - margins.bottom;
      const pages = Math.max(1, Math.ceil(scrollHeight / usableHeight));
      if (pages !== computedPages) {
        setComputedPages(pages);
      }
    }
  };

  const shouldShowVerticalRuler = showRuler && layoutMode === 'print';
  const borderStyling = pageBorder.width === '0px' || pageBorder.style === 'none'
    ? '1px solid #dadce0'
    : `${pageBorder.width} ${pageBorder.style} ${pageBorder.color}`;

  return (
    <div
      className="document-canvas-wrapper"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 0 80px 0',
        backgroundColor: '#e8ebef',
        overflowY: 'auto',
        overflowX: 'auto',
        flex: 1,
        width: '100%',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        /* Placeholder text */
        .gdoc-editor-content:empty::before {
          content: attr(data-placeholder);
          color: #bdc1c6;
          font-style: normal;
          cursor: text;
          pointer-events: none;
        }

        /* Content styling inside editor */
        .gdoc-editor-content {
          min-height: 100%;
          outline: none;
          word-break: break-word;
          line-height: 1.15;
          font-size: 12pt;
          font-family: Arial, sans-serif;
          color: #202124;
        }
        .gdoc-editor-content:focus {
          outline: none;
        }
        .gdoc-editor-content a {
          color: #1a0dab;
          text-decoration: underline;
        }
        .gdoc-editor-content img {
          max-width: 100%;
          border-radius: 2px;
          margin: 4px 0;
        }
        .gdoc-editor-content ul, .gdoc-editor-content ol {
          padding-left: 24px;
          margin: 0 0 6px 0;
          line-height: 1.5;
        }
        .gdoc-editor-content li {
          margin-bottom: 0;
          line-height: 1.5;
        }
        .gdoc-editor-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 8px 0;
        }
        .gdoc-editor-content th, .gdoc-editor-content td {
          border: 1px solid #e0e0e0;
          padding: 6px 12px;
          text-align: left;
          min-width: 60px;
        }
        .gdoc-editor-content th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
        .gdoc-editor-content hr {
          border: none;
          border-top: 1px solid #dadce0;
          margin: 10px 0;
        }
        .gdoc-editor-content h1 {
          font-size: 20pt;
          font-weight: 400;
          margin: 20px 0 6px 0;
          color: #202124;
          line-height: 1.2;
          font-family: Arial, sans-serif;
        }
        .gdoc-editor-content h2 {
          font-size: 16pt;
          font-weight: 400;
          margin: 16px 0 4px 0;
          color: #202124;
          line-height: 1.2;
          font-family: Arial, sans-serif;
        }
        .gdoc-editor-content h3 {
          font-size: 12pt;
          font-weight: 600;
          margin: 12px 0 2px 0;
          color: #202124;
          line-height: 1.2;
          font-family: Arial, sans-serif;
        }
        .gdoc-editor-content h4, .gdoc-editor-content h5, .gdoc-editor-content h6 {
          font-size: 11pt;
          font-weight: 600;
          margin: 8px 0 2px 0;
          color: #202124;
          line-height: 1.15;
          font-family: Arial, sans-serif;
        }
        .gdoc-editor-content p {
          margin: 0 0 0 0;
          line-height: 1.15;
          min-height: 1.15em;
        }
        .gdoc-editor-content blockquote {
          border-left: 4px solid #dadce0;
          padding-left: 16px;
          margin: 8px 0;
          color: #5f6368;
        }

        /* Scrollbar styling to match Google Docs */
        .document-canvas-wrapper::-webkit-scrollbar {
          width: 12px;
        }
        .document-canvas-wrapper::-webkit-scrollbar-track {
          background: #e8ebef;
        }
        .document-canvas-wrapper::-webkit-scrollbar-thumb {
          background: #bdc1c6;
          border-radius: 6px;
          border: 3px solid #e8ebef;
        }
        .document-canvas-wrapper::-webkit-scrollbar-thumb:hover {
          background: #9aa0a6;
        }
      `}} />

      {/* Centered document layout container with both rulers and page in grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: shouldShowVerticalRuler ? `1fr 16px ${pageWidth}px 1fr` : `1fr 0px ${pageWidth}px 1fr`,
        gridTemplateRows: layoutMode === 'web'
          ? (showRuler ? '16px 16px auto' : '24px 0px auto')
          : (showRuler 
            ? `16px 16px ${computedPages * pageHeight}px` 
            : `24px 0px ${computedPages * pageHeight}px`),
        width: '100%',
        boxSizing: 'border-box',
        zoom: parseFloat(zoom) / 100,
      } as React.CSSProperties}>
        {/* Row 1, Col 2: Empty corner matching Google Docs */}
        {showRuler && (
          <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            width: 16,
            height: 16,
            backgroundColor: '#e8eaed',
            borderRight: '1px solid #dadce0',
            borderBottom: '1px solid #dadce0',
            boxSizing: 'border-box',
            gridColumn: 2,
            gridRow: 1,
          }} />
        )}

        {/* Row 1, Col 3: Horizontal PageRuler */}
        {showRuler && (
          <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            gridColumn: 3,
            gridRow: 1,
            alignSelf: 'stretch',
          }}>
            <PageRuler margins={margins} onMarginsChange={editorMode === 'editing' ? onMarginsChange : undefined} zoom={zoom} pageWidth={pageWidth} pageHeight={pageHeight} />
          </div>
        )}

        {/* Row 3, Col 2: PageVerticalRuler (directly next to the page sheet, separated by gap row 2) */}
        {shouldShowVerticalRuler && (
          <div style={{
            gridColumn: 2,
            gridRow: 3,
            backgroundColor: '#e8eaed',
            borderRight: '1px solid #dadce0',
            boxSizing: 'border-box',
            alignSelf: 'stretch',
            position: 'relative',
            zIndex: 10,
          }}>
            <PageVerticalRuler margins={margins} totalPages={computedPages} pageWidth={pageWidth} pageHeight={pageHeight} />
          </div>
        )}

        {/* Row 3, Col 3: White A4/Letter Page */}
        <div
          className="a4-page-sheet"
          style={{
            gridColumn: 3,
            gridRow: 3,
            width: '100%',
            height: '100%',
            padding: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
            backgroundColor: pageBgColor,
            color: '#202124',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            border: borderStyling,
            marginLeft: shouldShowVerticalRuler ? '-1px' : '0px', // overlap vertical ruler's right border to avoid 2px double border
            outline: 'none',
            boxSizing: 'border-box',
            position: 'relative',
            fontFamily: 'Arial, sans-serif',
            fontSize: '12pt',
            lineHeight: '1.15',
            textAlign: 'left',
            backgroundImage: showGridlines 
              ? 'linear-gradient(to right, rgba(59, 130, 246, 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(59, 130, 246, 0.07) 1px, transparent 1px)' 
              : 'none',
            backgroundSize: showGridlines ? '20px 20px' : 'none',
          }}
        >
          {/* Visual Page Breaks (Subtle Dashed Guide in margins only to avoid cutting text) */}
          {layoutMode === 'print' && Array.from({ length: computedPages - 1 }).map((_, idx) => {
            const boundaryY = (idx + 1) * pageHeight;
            return (
              <React.Fragment key={idx}>
                {/* Left Margin Line */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    width: `${margins.left}px`,
                    top: boundaryY,
                    height: 0,
                    borderTop: '1px dashed #cbd5e1',
                    zIndex: 1,
                    pointerEvents: 'none',
                  }}
                />
                {/* Right Margin Line with Label */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${pageWidth - margins.right}px`,
                    right: 0,
                    top: boundaryY,
                    height: 0,
                    borderTop: '1px dashed #cbd5e1',
                    zIndex: 1,
                    pointerEvents: 'none',
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <span style={{
                    position: 'relative',
                    top: '-7px',
                    fontSize: '8px',
                    color: '#9aa0a6',
                    backgroundColor: pageBgColor,
                    padding: '0 6px',
                    fontFamily: "'Google Sans', Roboto, sans-serif",
                    fontWeight: 600,
                    userSelect: 'none',
                    letterSpacing: '0.5px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '3px',
                  }}>
                    Page {idx + 1} Ends
                  </span>
                </div>
              </React.Fragment>
            );
          })}

          <div
            ref={editorRef}
            className="gdoc-editor-content"
            contentEditable={editorMode === 'editing'}
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyUp={onSelectionChange}
            onMouseUp={onSelectionChange}
            onFocus={onSelectionChange}
            data-placeholder={placeholder}
          />
        </div>
      </div>
    </div>
  );
}
