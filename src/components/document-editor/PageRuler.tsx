import React, { useState, useEffect, useRef } from 'react';

/**
 * Dynamic Pixel-perfect Google Docs horizontal and vertical rulers.
 * Supports custom page dimensions (portrait/landscape, letter/A4/etc)
 * and independent margins (top, bottom, left, right).
 */

interface Tick {
  value: number;        // inch value
  px: number;           // pixel position from left
  isMajor: boolean;     // whole inch
  isHalf: boolean;      // half inch
  isQuarter: boolean;   // quarter inch
}

function buildTicks(widthInches: number): Tick[] {
  const result: Tick[] = [];
  const steps = Math.floor(widthInches * 4); // 1/4 inch steps
  for (let i = 0; i <= steps; i++) {
    const value = i / 4;
    const px = value * 96; // 96 DPI
    const isMajor = i % 4 === 0;
    const isHalf = !isMajor && i % 2 === 0;
    const isQuarter = !isMajor && !isHalf;
    result.push({ value, px, isMajor, isHalf, isQuarter });
  }
  return result;
}

interface VerticalTick {
  value: number;
  py: number;
  isMajor: boolean;
  isHalf: boolean;
  isQuarter: boolean;
}

function buildVerticalTicks(heightInches: number): VerticalTick[] {
  const result: VerticalTick[] = [];
  const steps = Math.floor(heightInches * 4);
  for (let i = 0; i <= steps; i++) {
    const value = i / 4;
    const py = value * 96;
    const isMajor = i % 4 === 0;
    const isHalf = !isMajor && i % 2 === 0;
    const isQuarter = !isMajor && !isHalf;
    result.push({ value, py, isMajor, isHalf, isQuarter });
  }
  return result;
}

interface Margins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface PageRulerProps {
  margins?: Margins;
  onMarginsChange?: (margins: Margins) => void;
  totalPages?: number;
  zoom?: string;
  pageWidth?: number;
  pageHeight?: number;
}

export function PageRuler({
  margins = { top: 96, bottom: 96, left: 96, right: 96 },
  onMarginsChange,
  zoom = '100%',
  pageWidth = 816,
  pageHeight = 1056,
}: PageRulerProps) {
  const leftMarginPx = margins.left;
  const rightMarginPx = margins.right;
  const leftMarginInches = leftMarginPx / 96;
  const activeWidth = pageWidth - leftMarginPx - rightMarginPx;

  const containerRef = useRef<HTMLDivElement>(null);
  const [dragType, setDragType] = useState<'left' | 'right' | null>(null);

  const widthInches = pageWidth / 96;
  const ticks = buildTicks(widthInches);

  useEffect(() => {
    if (!dragType) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const zoomFactor = parseFloat(zoom) / 100 || 1.0;
      const relativeX = (e.clientX - rect.left) / zoomFactor;

      if (dragType === 'left') {
        // Limit left margin: range [24px, 300px] and ensure it doesn't overlap right margin
        const maxLeft = pageWidth - rightMarginPx - 48;
        const newLeft = Math.min(Math.min(300, maxLeft), Math.max(24, Math.round(relativeX)));
        onMarginsChange?.({ ...margins, left: newLeft });
      } else if (dragType === 'right') {
        // Limit right margin: range [24px, 300px] and ensure it doesn't overlap left margin
        const relativeFromRight = pageWidth - relativeX;
        const maxRight = pageWidth - leftMarginPx - 48;
        const newRight = Math.min(Math.min(300, maxRight), Math.max(24, Math.round(relativeFromRight)));
        onMarginsChange?.({ ...margins, right: newRight });
      }
    };

    const handleMouseUp = () => {
      setDragType(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragType, zoom, margins, pageWidth, leftMarginPx, rightMarginPx, onMarginsChange]);

  return (
    <div
      aria-hidden="true"
      ref={containerRef}
      style={{
        width: pageWidth,
        height: 16, // RULER_SIZE
        position: 'relative',
        userSelect: 'none',
        flexShrink: 0,
        overflow: 'visible',
        boxSizing: 'border-box',
        fontFamily: "'Google Sans', Roboto, sans-serif",
        backgroundColor: '#e8eaed',
        borderBottom: '1px solid #dadce0',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .ruler-margin-handle {
          transition: background-color 0.15s;
        }
        .ruler-margin-handle:hover {
          background-color: rgba(59, 130, 246, 0.25) !important;
        }
      `}} />

      {/* Active area panel (white) */}
      <div style={{
        position: 'absolute',
        left: leftMarginPx,
        top: 0,
        width: activeWidth,
        height: '100%',
        backgroundColor: '#ffffff',
        zIndex: 1,
      }} />

      {/* ── Tick marks ────────────────────────────────────────────────── */}
      {ticks.map((tick, idx) => {
        const { value, px, isMajor, isHalf, isQuarter } = tick;
        const tickH = isMajor ? 8 : isHalf ? 5 : 3;
        
        // Show number labels relative to left margin
        let labelValue = 0;
        let showLabel = false;
        if (isMajor) {
          if (value < leftMarginInches) {
            labelValue = leftMarginInches - value;
            showLabel = true; // left of margin
          } else if (value > leftMarginInches && value <= (pageWidth - rightMarginPx) / 96) {
            labelValue = value - leftMarginInches;
            showLabel = true; // right of margin
          }
        }
        const label = Math.floor(labelValue);
        const tickColor = '#9aa0a6';

        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: px,
              top: 0,
              width: 0,
              height: '100%',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          >
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              transform: 'translateX(-50%)',
              width: 1,
              height: tickH,
              backgroundColor: tickColor,
            }} />

            {showLabel && label > 0 && (
              <span style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                transform: 'translate(-50%, -50%)',
                fontSize: '10px',
                lineHeight: '1',
                color: '#5f6368',
                fontFamily: "'Google Sans', Roboto, sans-serif",
                whiteSpace: 'nowrap',
                letterSpacing: 0,
              }}>
                {label}
              </span>
            )}
          </div>
        );
      })}

      {/* ── Margin Drag Handles (Interactive Overlay) ─────────────────── */}
      {/* Left Margin drag zone */}
      <div
        className="ruler-margin-handle"
        title="Left Margin"
        onMouseDown={(e) => {
          e.preventDefault();
          setDragType('left');
        }}
        style={{
          position: 'absolute',
          left: leftMarginPx - 5,
          top: 0,
          width: 10,
          height: '100%',
          cursor: 'col-resize',
          zIndex: 15,
          backgroundColor: dragType === 'left' ? 'rgba(59, 130, 246, 0.35)' : 'transparent',
        }}
      />

      {/* Right Margin drag zone */}
      <div
        className="ruler-margin-handle"
        title="Right Margin"
        onMouseDown={(e) => {
          e.preventDefault();
          setDragType('right');
        }}
        style={{
          position: 'absolute',
          left: pageWidth - rightMarginPx - 5,
          top: 0,
          width: 10,
          height: '100%',
          cursor: 'col-resize',
          zIndex: 15,
          backgroundColor: dragType === 'right' ? 'rgba(59, 130, 246, 0.35)' : 'transparent',
        }}
      />

      {/* ── Indent markers (Sleek blue interactive markers) ──────────── */}
      {/* Blue first-line marker ▼ */}
      <div
        title="First line indent"
        onMouseDown={(e) => {
          e.preventDefault();
          setDragType('left');
        }}
        style={{
          position: 'absolute',
          left: leftMarginPx,
          top: 1,
          transform: 'translateX(-50%)',
          cursor: 'col-resize',
          zIndex: 11,
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: '6px solid #3b82f6',
        }}
      />

      {/* Blue left-indent marker ▲ */}
      <div
        title="Left indent"
        onMouseDown={(e) => {
          e.preventDefault();
          setDragType('left');
        }}
        style={{
          position: 'absolute',
          left: leftMarginPx,
          bottom: 1,
          transform: 'translateX(-50%)',
          cursor: 'col-resize',
          zIndex: 10,
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderBottom: '6px solid #3b82f6',
        }}
      />

      {/* Right-indent marker ▲ */}
      <div
        title="Right indent"
        onMouseDown={(e) => {
          e.preventDefault();
          setDragType('right');
        }}
        style={{
          position: 'absolute',
          left: pageWidth - rightMarginPx,
          bottom: 1,
          transform: 'translateX(-50%)',
          cursor: 'col-resize',
          zIndex: 10,
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderBottom: '6px solid #3b82f6',
        }}
      />

      {/* ── Vertical Guide Line (renders during drag) ───────────────── */}
      {dragType && (
        <div
          style={{
            position: 'absolute',
            left: dragType === 'left' ? leftMarginPx : pageWidth - rightMarginPx,
            top: 0,
            width: 1,
            height: 2500, // drawing down the canvas
            borderLeft: '1px dashed #3b82f6',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        />
      )}
    </div>
  );
}

export function PageVerticalRuler({
  margins = { top: 96, bottom: 96, left: 96, right: 96 },
  totalPages = 1,
  pageWidth = 816,
  pageHeight = 1056,
}: PageRulerProps) {
  const topMarginPx = margins.top;
  const bottomMarginPx = margins.bottom;
  const topMarginInches = topMarginPx / 96;
  const activeHeight = pageHeight - topMarginPx - bottomMarginPx;

  const heightInches = pageHeight / 96;
  const vTicks = buildVerticalTicks(heightInches);

  return (
    <div
      aria-hidden="true"
      style={{
        width: 16, // RULER_SIZE
        height: pageHeight * totalPages,
        position: 'relative',
        userSelect: 'none',
        flexShrink: 0,
        overflow: 'visible',
        boxSizing: 'border-box',
        fontFamily: "'Google Sans', Roboto, sans-serif",
        backgroundColor: '#e8eaed',
        borderRight: '1px solid #dadce0',
      }}
    >
      {/* Active area panel (white) per page */}
      {Array.from({ length: totalPages }).map((_, pageIdx) => (
        <div
          key={pageIdx}
          style={{
            position: 'absolute',
            top: pageIdx * pageHeight + topMarginPx,
            left: 0,
            width: '100%',
            height: activeHeight,
            backgroundColor: '#ffffff',
            zIndex: 1,
          }}
        />
      ))}

      {/* ── Tick marks per page ───────────────────────────────────────── */}
      {Array.from({ length: totalPages }).map((_, pageIdx) => (
        <React.Fragment key={pageIdx}>
          {vTicks.map((tick, idx) => {
            const { value, py, isMajor, isHalf, isQuarter } = tick;
            const absolutePy = pageIdx * pageHeight + py;
            const tickW = isMajor ? 8 : isHalf ? 5 : 3;
            
            // Show number labels relative to top margin
            let labelValue = 0;
            let showLabel = false;
            if (isMajor) {
              if (value < topMarginInches) {
                labelValue = topMarginInches - value;
                showLabel = true;
              } else if (value > topMarginInches && value <= (pageHeight - bottomMarginPx) / 96) {
                labelValue = value - topMarginInches;
                showLabel = true;
              }
            }
            const label = Math.floor(labelValue);
            const tickColor = '#9aa0a6';

            return (
              <div
                key={`${pageIdx}-${idx}`}
                style={{
                  position: 'absolute',
                  top: absolutePy,
                  left: 0,
                  width: '100%',
                  height: 0,
                  pointerEvents: 'none',
                  zIndex: 3,
                }}
              >
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  transform: 'translateY(-50%)',
                  width: tickW,
                  height: 1,
                  backgroundColor: tickColor,
                }} />

                {showLabel && label > 0 && (
                  <span style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    transform: 'translate(-50%, -50%) rotate(-90deg)',
                    fontSize: '10px',
                    lineHeight: '1',
                    color: '#5f6368',
                    fontFamily: "'Google Sans', Roboto, sans-serif",
                    whiteSpace: 'nowrap',
                    letterSpacing: 0,
                  }}>
                    {label}
                  </span>
                )}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}
