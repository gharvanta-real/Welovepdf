import React, { useMemo } from 'react';
import { Plus, MoreVertical, FileText, ChevronLeft } from 'lucide-react';

interface SidebarOutlineProps {
  contentHtml: string;
  onCollapse: () => void;
}

interface HeadingInfo {
  text: string;
  level: number;
  indexInLevel: number;
}

export function SidebarOutline({ contentHtml, onCollapse }: SidebarOutlineProps) {
  const headings = useMemo(() => {
    if (typeof window === 'undefined') return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(contentHtml, 'text/html');
    const elements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

    const levelCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const list: HeadingInfo[] = [];

    elements.forEach((el) => {
      const level = parseInt(el.tagName.substring(1));
      if (level >= 1 && level <= 6) {
        list.push({
          text: el.textContent || '',
          level,
          indexInLevel: levelCounts[level]++
        });
      }
    });

    return list;
  }, [contentHtml]);

  const handleHeadingClick = (level: number, indexInLevel: number) => {
    const editor = document.querySelector('.a4-page-sheet [contenteditable]');
    if (!editor) return;
    const elements = editor.querySelectorAll(`h${level}`);
    if (elements && elements[indexInLevel]) {
      elements[indexInLevel].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div
      style={{
        width: '240px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Google Sans', Roboto, sans-serif",
        boxSizing: 'border-box',
        userSelect: 'none',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .gdoc-sidebar-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #444746;
          outline: none;
          transition: background-color 0.1s;
          flex-shrink: 0;
        }
        .gdoc-sidebar-icon-btn:hover {
          background-color: #f1f3f4;
        }

        .gdoc-outline-link {
          border: none;
          background: transparent;
          text-align: left;
          padding: 6px 12px;
          color: #374151;
          cursor: pointer;
          border-radius: 6px;
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
          outline: none;
          transition: background-color 0.15s, color 0.15s;
          box-sizing: border-box;
          position: relative;
          z-index: 1;
        }
        .gdoc-outline-link:hover {
          color: #111827;
          background-color: #f3f4f6;
        }

        .gdoc-tab-pill {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #f3f4f6;
          color: #1f2937;
          border-radius: 20px;
          padding: 6px 12px 6px 14px;
          margin: 0 8px 4px 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          box-sizing: border-box;
          transition: background-color 0.1s;
        }
        .gdoc-tab-pill:hover {
          background-color: #e5e7eb;
        }
      `}} />

      {/* ── Header: "Document tabs" + collapse arrow + plus ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 8px 8px 12px',
        color: '#444746',
        fontWeight: 500,
        fontSize: '14px',
        lineHeight: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button
            onClick={onCollapse}
            className="gdoc-sidebar-icon-btn"
            title="Close document outline"
          >
            <ChevronLeft size={18} />
          </button>
          <span style={{ color: '#3c4043', fontSize: 14, fontWeight: 500 }}>Document tabs</span>
        </div>
        <button className="gdoc-sidebar-icon-btn" title="Add tab">
          <Plus size={16} />
        </button>
      </div>

      {/* ── Active Tab Pill ── */}
      <div className="gdoc-tab-pill">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={14} style={{ color: '#1f2937', flexShrink: 0 }} />
          <span>Tab 1</span>
        </div>
        <button
          style={{
            border: 'none',
            background: 'transparent',
            display: 'flex',
            padding: 2,
            cursor: 'pointer',
            color: '#444746',
            borderRadius: '50%',
          }}
        >
          <MoreVertical size={14} />
        </button>
      </div>

      {/* Divider */}
      <div style={{
        height: '1px',
        backgroundColor: '#e5e7eb',
        margin: '12px 12px 6px 12px',
      }} />

      {/* Outline Section Title */}
      <div style={{
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        color: '#5f6368',
        padding: '6px 16px 4px 16px',
        letterSpacing: '0.8px',
        fontFamily: "'Google Sans', Roboto, sans-serif",
      }}>
        Outline
      </div>

      {/* ── Headings Outline ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '4px 8px 16px 16px',
        flex: 1,
        position: 'relative',
      }}>
        {headings.length > 0 && (
          <div style={{
            position: 'absolute',
            left: 20,
            top: 8,
            bottom: 24,
            width: '1px',
            backgroundColor: '#e5e7eb',
            zIndex: 0,
          }} />
        )}
        {headings.length === 0 ? (
          <div style={{
            fontSize: 13,
            color: '#80868b',
            padding: '8px 4px',
            lineHeight: '1.6',
            fontFamily: "'Google Sans', Roboto, sans-serif",
          }}>
            Headings you add to the document<br />will appear here.
          </div>
        ) : (
          headings.map((heading, idx) => {
            const indent = (heading.level - 1) * 12 + 12;
            return (
              <button
                key={idx}
                onClick={() => handleHeadingClick(heading.level, heading.indexInLevel)}
                className="gdoc-outline-link"
                style={{
                  paddingLeft: indent,
                  fontSize: heading.level === 1 ? 14 : 13,
                  fontWeight: heading.level <= 2 ? 500 : 400,
                  lineHeight: '20px',
                  fontFamily: "'Google Sans', Roboto, sans-serif",
                }}
                title={heading.text}
              >
                {heading.text || 'Untitled Heading'}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
