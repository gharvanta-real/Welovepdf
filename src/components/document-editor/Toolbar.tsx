import React, { useState, useRef, useEffect } from 'react';
import {
  Undo2, Redo2, Printer, Paintbrush, Search,
  Bold, Italic, Underline, Strikethrough,
  Link2, Image, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Plus, Minus, ChevronDown, ChevronUp,
  PenLine, Indent, Outdent, Superscript, Subscript,
} from 'lucide-react';
import { EditorState, TextFormat, TextAlignment, ListType } from './types';

interface ToolbarProps {
  state: EditorState;
  onFormat: (format: TextFormat) => void;
  onAlign: (alignment: TextAlignment) => void;
  onList: (listType: ListType) => void;
  onFontChange: (fontName: string) => void;
  onFontSizeChange: (size: string) => void;
  onLink: (url: string) => void;
  onImage: (url: string) => void;
  onClear: () => void;
  onPrint: () => void;
  onOpenFindReplace: () => void;
  zoom: string;
  onZoomChange: (zoom: string) => void;
  isPaintActive: boolean;
  onPaintClick: () => void;
  onCollapse: () => void;
}

const FONTS = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Calibri', value: 'Calibri' },
  { label: 'Comic Sans MS', value: 'Comic Sans MS' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Impact', value: 'Impact' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Open Sans', value: 'Open Sans' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS' },
  { label: 'Verdana', value: 'Verdana' },
];

const STYLES = [
  { label: 'Normal text', tag: 'p' },
  { label: 'Title', tag: 'h1', style: { fontSize: 28, fontWeight: 400 } },
  { label: 'Subtitle', tag: 'h1', style: { fontSize: 16, fontWeight: 400, color: '#6b7280' } },
  { label: 'Heading 1', tag: 'h1' },
  { label: 'Heading 2', tag: 'h2' },
  { label: 'Heading 3', tag: 'h3' },
  { label: 'Heading 4', tag: 'h4' },
  { label: 'Heading 5', tag: 'h5' },
  { label: 'Heading 6', tag: 'h6' },
];

const FONT_SIZES = [6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

const TEXT_COLORS = ['#000000','#374151','#dc2626','#ea580c','#ca8a04','#16a34a','#2563eb','#7c3aed','#db2777','#ffffff','#f3f4f6','#fef9c3'];
const HIGHLIGHT_COLORS = ['#fef08a','#bbf7d0','#bfdbfe','#fecdd3','#e9d5ff','#fed7aa','#f4f4f4','#ffffff','transparent'];

export function Toolbar({
  state, onFormat, onAlign, onList,
  onFontChange, onFontSizeChange, onLink, onImage, onClear, onPrint, onOpenFindReplace,
  zoom, onZoomChange, isPaintActive, onPaintClick,
  onCollapse,
}: ToolbarProps) {
  const [styleVal, setStyleVal] = useState('Normal text');
  const [fontVal, setFontVal] = useState('Arial');
  const [fontSizeInput, setFontSizeInput] = useState(11);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showAlignDropdown, setShowAlignDropdown] = useState(false);
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showZoomDropdown, setShowZoomDropdown] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [activeTextColor, setActiveTextColor] = useState('#000000');
  const [activeHighlight, setActiveHighlight] = useState('#fef08a');

  const alignDropdownRef = useRef<HTMLDivElement>(null);
  const linkModalRef = useRef<HTMLDivElement>(null);
  const imageModalRef = useRef<HTMLDivElement>(null);
  const styleDropdownRef = useRef<HTMLDivElement>(null);
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const zoomDropdownRef = useRef<HTMLDivElement>(null);
  const textColorRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (alignDropdownRef.current && !alignDropdownRef.current.contains(target)) setShowAlignDropdown(false);
      if (linkModalRef.current && !linkModalRef.current.contains(target)) setShowLinkModal(false);
      if (imageModalRef.current && !imageModalRef.current.contains(target)) setShowImageModal(false);
      if (styleDropdownRef.current && !styleDropdownRef.current.contains(target)) setShowStyleDropdown(false);
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(target)) setShowFontDropdown(false);
      if (zoomDropdownRef.current && !zoomDropdownRef.current.contains(target)) setShowZoomDropdown(false);
      if (textColorRef.current && !textColorRef.current.contains(target)) setShowTextColorPicker(false);
      if (highlightRef.current && !highlightRef.current.contains(target)) setShowHighlightPicker(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (state.fontName) {
      setFontVal(state.fontName);
    }
  }, [state.fontName]);

  useEffect(() => {
    if (state.fontSize) {
      let sizeNum = 11;
      if (state.fontSize.endsWith('px')) {
        sizeNum = Math.round(parseFloat(state.fontSize) * 0.75); // px to pt
      } else if (state.fontSize.endsWith('pt')) {
        sizeNum = Math.round(parseFloat(state.fontSize));
      } else {
        const num = parseInt(state.fontSize);
        if (!isNaN(num)) {
          const legacyMap: Record<number, number> = { 1: 9, 2: 10, 3: 12, 4: 14, 5: 18, 6: 24, 7: 36 };
          sizeNum = legacyMap[num] || 11;
        }
      }
      setFontSizeInput(sizeNum);
    }
  }, [state.fontSize]);

  useEffect(() => {
    if (state.foreColor) {
      setActiveTextColor(state.foreColor);
    }
    if (state.backColor) {
      setActiveHighlight(state.backColor);
    }
  }, [state.foreColor, state.backColor]);

  const handleStyleChange = (val: string, tag: string) => {
    setStyleVal(val);
    setShowStyleDropdown(false);
    document.execCommand('formatBlock', false, `<${tag}>`);
  };

  const handleFontChange = (font: string) => {
    setFontVal(font);
    setShowFontDropdown(false);
    onFontChange(font);
  };

  const handleFontSizeAdjust = (increment: boolean) => {
    let current = fontSizeInput;
    if (increment) {
      const next = FONT_SIZES.find(s => s > current);
      if (next) current = next;
    } else {
      const prev = [...FONT_SIZES].reverse().find(s => s < current);
      if (prev) current = prev;
    }
    setFontSizeInput(current);
    onFontSizeChange(`${current}pt`);
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLink(linkUrl);
    setLinkUrl('');
    setShowLinkModal(false);
  };

  const handleImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onImage(imageUrl);
    setImageUrl('');
    setShowImageModal(false);
  };

  const applyTextColor = (color: string) => {
    setActiveTextColor(color);
    setShowTextColorPicker(false);
    document.execCommand('foreColor', false, color);
  };

  const applyHighlight = (color: string) => {
    setActiveHighlight(color);
    setShowHighlightPicker(false);
    if (color === 'transparent') {
      document.execCommand('backColor', false, 'transparent');
    } else {
      document.execCommand('backColor', false, color);
    }
  };

  const ZOOM_OPTIONS = ['50%', '75%', '90%', '100%', '110%', '125%', '150%', '175%', '200%'];



  return (
    <div
      className="pme-toolbar-root"
      style={{
        display: 'flex', alignItems: 'center',
        padding: '2px 6px', backgroundColor: 'transparent',
        color: '#374151', gap: '1px', flexWrap: 'nowrap',
        overflowX: 'visible', boxSizing: 'border-box', minHeight: '34px',
      }}
    >
      <ToolbarStyles />

      {/* â”€â”€ Formatting controls â”€â”€ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1px', flex: 1, flexWrap: 'nowrap' }}>

        {/* Search menus */}
        <button className="ptb-btn" title="Find (Ctrl+F)" onClick={onOpenFindReplace}>
          <Search size={15} />
        </button>

        {/* Undo / Redo / Print */}
        <button className="ptb-btn" title="Undo (Ctrl+Z)" onClick={() => document.execCommand('undo')}><Undo2 size={15} /></button>
        <button className="ptb-btn" title="Redo (Ctrl+Y)" onClick={() => document.execCommand('redo')}><Redo2 size={15} /></button>
        <button className="ptb-btn" title="Print (Ctrl+P)" onClick={onPrint}><Printer size={15} /></button>
        <button className={`ptb-btn ${isPaintActive ? 'active' : ''}`} title="Paint format" onClick={onPaintClick}><Paintbrush size={15} /></button>

        <div className="ptb-divider" />

        {/* Zoom dropdown */}
        <div ref={zoomDropdownRef} className="ptb-select-wrap" style={{ position: 'relative' }}>
          <div className="ptb-display-val-narrow" style={{ width: 46 }} onClick={() => setShowZoomDropdown(!showZoomDropdown)}>
            {zoom}
          </div>
          <ChevronDown size={11} style={{ color: '#9ca3af', marginRight: 3, pointerEvents: 'none' }} />
          {showZoomDropdown && (
            <div className="ptb-dropdown" style={{ minWidth: 80 }}>
              {ZOOM_OPTIONS.map(z => (
                <button key={z} className={`ptb-dropdown-item ${z === zoom ? 'active' : ''}`} onClick={() => { onZoomChange(z); setShowZoomDropdown(false); }}>{z}</button>
              ))}
            </div>
          )}
        </div>

        <div className="ptb-divider" />

        {/* Paragraph Style */}
        <div ref={styleDropdownRef} className="ptb-select-wrap" style={{ position: 'relative' }}>
          <div className="ptb-display-val" style={{ maxWidth: 110 }} onClick={() => setShowStyleDropdown(!showStyleDropdown)}>
            {styleVal}
          </div>
          <ChevronDown size={11} style={{ color: '#9ca3af', marginRight: 3, pointerEvents: 'none' }} />
          {showStyleDropdown && (
            <div className="ptb-dropdown" style={{ minWidth: 180 }}>
              {STYLES.map(s => (
                <button key={s.label} className={`ptb-dropdown-item ${s.label === styleVal ? 'active' : ''}`} onClick={() => handleStyleChange(s.label, s.tag)}
                  style={s.style ? { fontSize: Math.min((s.style as any).fontSize || 13, 15), fontWeight: (s.style as any).fontWeight, color: (s.style as any).color } : undefined}>
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ptb-divider" />

        {/* Font Family */}
        <div ref={fontDropdownRef} className="ptb-select-wrap" style={{ position: 'relative' }}>
          <div className="ptb-display-val" style={{ maxWidth: 96, fontFamily: fontVal }} onClick={() => setShowFontDropdown(!showFontDropdown)}>
            {fontVal}
          </div>
          <ChevronDown size={11} style={{ color: '#9ca3af', marginRight: 3, pointerEvents: 'none' }} />
          {showFontDropdown && (
            <div className="ptb-dropdown" style={{ minWidth: 180 }}>
              {FONTS.map(f => (
                <button key={f.value} className={`ptb-dropdown-item ${f.value === fontVal ? 'active' : ''}`} onClick={() => handleFontChange(f.value)} style={{ fontFamily: f.value }}>
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ptb-divider" />

        {/* Font Size */}
        <button className="ptb-btn" title="Decrease font size" onClick={() => handleFontSizeAdjust(false)} style={{ width: 22 }}>
          <Minus size={13} />
        </button>
        <input
          type="number" className="ptb-font-size-input" value={fontSizeInput} min={1} max={400}
          onChange={e => setFontSizeInput(parseInt(e.target.value) || fontSizeInput)}
          onBlur={() => {
            onFontSizeChange(`${fontSizeInput}pt`);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            }
          }}
        />
        <button className="ptb-btn" title="Increase font size" onClick={() => handleFontSizeAdjust(true)} style={{ width: 22 }}>
          <Plus size={13} />
        </button>

        <div className="ptb-divider" />

        {/* Bold, Italic, Underline, Strikethrough, Superscript, Subscript */}
        <button className={`ptb-btn ${state.isBold ? 'active' : ''}`} title="Bold (Ctrl+B)" onClick={() => onFormat('bold')}><Bold size={15} /></button>
        <button className={`ptb-btn ${state.isItalic ? 'active' : ''}`} title="Italic (Ctrl+I)" onClick={() => onFormat('italic')}><Italic size={15} /></button>
        <button className={`ptb-btn ${state.isUnderline ? 'active' : ''}`} title="Underline (Ctrl+U)" onClick={() => onFormat('underline')}><Underline size={15} /></button>
        <button className="ptb-btn" title="Strikethrough" onClick={() => document.execCommand('strikeThrough')}><Strikethrough size={15} /></button>
        <button className="ptb-btn" title="Superscript" onClick={() => document.execCommand('superscript')}><Superscript size={14} /></button>
        <button className="ptb-btn" title="Subscript" onClick={() => document.execCommand('subscript')}><Subscript size={14} /></button>

        <div className="ptb-divider" />

        {/* Text Color */}
        <div ref={textColorRef} style={{ position: 'relative' }}>
          <button
            className="ptb-btn"
            title="Text color"
            onClick={() => setShowTextColorPicker(v => !v)}
            style={{ flexDirection: 'column', gap: 1, height: 26, padding: '2px 3px' }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1 }}>A</span>
            <div style={{ width: 14, height: 3, backgroundColor: activeTextColor, borderRadius: 1 }} />
          </button>
          {showTextColorPicker && (
            <div className="ptb-dropdown" style={{ minWidth: 160 }}>
              <p style={{ margin: '6px 10px 4px', fontSize: 12, color: '#6b7280', fontFamily: "'Google Sans', Roboto, sans-serif" }}>Text Color</p>
              <div className="ptb-color-swatch-grid">
                {TEXT_COLORS.map(c => (
                  <div key={c} className="ptb-color-swatch" style={{ backgroundColor: c, outline: c === activeTextColor ? '2px solid #1f2937' : undefined }} onClick={() => applyTextColor(c)} title={c} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Highlight Color */}
        <div ref={highlightRef} style={{ position: 'relative' }}>
          <button
            className="ptb-btn"
            title="Highlight color"
            onClick={() => setShowHighlightPicker(v => !v)}
            style={{ flexDirection: 'column', gap: 1, height: 26, padding: '2px 3px' }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: '#111827', lineHeight: 1, fontFamily: 'serif' }}>ab</span>
            <div style={{ width: 14, height: 3, backgroundColor: activeHighlight === 'transparent' ? '#e5e7eb' : activeHighlight, borderRadius: 1 }} />
          </button>
          {showHighlightPicker && (
            <div className="ptb-dropdown" style={{ minWidth: 150 }}>
              <p style={{ margin: '6px 10px 4px', fontSize: 12, color: '#6b7280', fontFamily: "'Google Sans', Roboto, sans-serif" }}>Highlight</p>
              <div className="ptb-color-swatch-grid">
                {HIGHLIGHT_COLORS.map(c => (
                  <div key={c} className="ptb-color-swatch" style={{ backgroundColor: c === 'transparent' ? '#ffffff' : c, border: c === 'transparent' ? '1px dashed #9ca3af' : '1px solid rgba(0,0,0,0.12)', outline: c === activeHighlight ? '2px solid #1f2937' : undefined }} onClick={() => applyHighlight(c)} title={c === 'transparent' ? 'None' : c} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="ptb-divider" />

        {/* Link */}
        <div ref={linkModalRef} style={{ position: 'relative' }}>
          <button className={`ptb-btn ${state.isLinkActive ? 'active' : ''}`} title="Insert link (Ctrl+K)" onClick={() => setShowLinkModal(!showLinkModal)}>
            <Link2 size={15} />
          </button>
          {showLinkModal && (
            <div className="ptb-modal">
              <form onSubmit={handleLinkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#6b7280', fontFamily: "'Google Sans', Roboto, sans-serif", fontWeight: 500 }}>Insert Link</span>
                <input type="url" placeholder="https://example.com" value={linkUrl} required autoFocus onChange={e => setLinkUrl(e.target.value)} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button type="button" onClick={() => setShowLinkModal(false)} style={{ padding: '5px 14px', border: 'none', borderRadius: 3, background: '#f3f4f6', cursor: 'pointer', fontSize: 13, color: '#374151', fontWeight: 500 }}>Cancel</button>
                  <button type="submit" style={{ padding: '5px 14px', border: 'none', borderRadius: 3, backgroundColor: '#1f2937', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Apply</button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Image */}
        <div ref={imageModalRef} style={{ position: 'relative' }}>
          <button className="ptb-btn" title="Insert image" onClick={() => setShowImageModal(!showImageModal)}>
            <Image size={15} />
          </button>
          {showImageModal && (
            <div className="ptb-modal">
              <form onSubmit={handleImageSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#6b7280', fontFamily: "'Google Sans', Roboto, sans-serif", fontWeight: 500 }}>Insert Image</span>
                <input type="url" placeholder="https://example.com/image.png" value={imageUrl} required autoFocus onChange={e => setImageUrl(e.target.value)} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button type="button" onClick={() => setShowImageModal(false)} style={{ padding: '5px 14px', border: 'none', borderRadius: 3, background: '#f3f4f6', cursor: 'pointer', fontSize: 13, color: '#374151', fontWeight: 500 }}>Cancel</button>
                  <button type="submit" style={{ padding: '5px 14px', border: 'none', borderRadius: 3, backgroundColor: '#1f2937', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Insert</button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="ptb-divider" />

        {/* Alignment */}
        <div ref={alignDropdownRef} style={{ position: 'relative' }}>
          <button className={`ptb-btn ${showAlignDropdown ? 'active' : ''}`} title="Alignment" onClick={() => setShowAlignDropdown(!showAlignDropdown)} style={{ width: 36, gap: 0 }}>
            {state.alignment === 'left' && <AlignLeft size={15} />}
            {state.alignment === 'center' && <AlignCenter size={15} />}
            {state.alignment === 'right' && <AlignRight size={15} />}
            {state.alignment === 'justify' && <AlignJustify size={15} />}
            {!state.alignment && <AlignLeft size={15} />}
            <ChevronDown size={10} style={{ color: '#9ca3af', marginLeft: 1 }} />
          </button>
          {showAlignDropdown && (
            <div className="ptb-dropdown" style={{ minWidth: 180 }}>
              {[
                { val: 'left' as TextAlignment, icon: AlignLeft, label: 'Left (Ctrl+Shift+L)' },
                { val: 'center' as TextAlignment, icon: AlignCenter, label: 'Center (Ctrl+Shift+E)' },
                { val: 'right' as TextAlignment, icon: AlignRight, label: 'Right (Ctrl+Shift+R)' },
                { val: 'justify' as TextAlignment, icon: AlignJustify, label: 'Justified (Ctrl+Shift+J)' },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button key={item.val} className={`ptb-dropdown-item ${state.alignment === item.val ? 'active' : ''}`} onClick={() => { onAlign(item.val); setShowAlignDropdown(false); }}>
                    <Icon size={15} /><span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Lists + Indent */}
        <button className="ptb-btn" title="Bulleted list (Ctrl+Shift+8)" onClick={() => onList('unordered')}><List size={15} /></button>
        <button className="ptb-btn" title="Numbered list (Ctrl+Shift+7)" onClick={() => onList('ordered')}><ListOrdered size={15} /></button>
        <button className="ptb-btn" title="Decrease indent" onClick={() => document.execCommand('outdent')}><Outdent size={15} /></button>
        <button className="ptb-btn" title="Increase indent" onClick={() => document.execCommand('indent')}><Indent size={15} /></button>

        <div className="ptb-divider" />

        {/* Clear formatting */}
        <button className="ptb-btn" title="Clear formatting (Ctrl+\\)" onClick={onClear}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m7 21-4.3-4.3c-1-1-.8-2.7.5-3.4L13 5l5 5-8.3 8.3"/>
            <path d="M22 21H7"/>
            <line x1="2" y1="2" x2="22" y2="22" stroke="#ef4444"/>
          </svg>
        </button>
      </div>

      {/* â”€â”€ Right side: editing mode + collapse â”€â”€ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
        <button className="ptb-mode-btn" title="Editing mode">
          <PenLine size={13} style={{ color: '#1f2937' }} />
          <span style={{ color: '#374151' }}>Editing</span>
          <ChevronDown size={11} style={{ color: '#9ca3af' }} />
        </button>
        <div className="ptb-divider" />
        <button
          className="ptb-btn"
          title="Collapse toolbar"
          onClick={onCollapse}
          style={{
            width: 26,
            height: 26,
            borderRadius: '3px',
            color: '#374151',
          }}
        >
          <ChevronUp size={15} />
        </button>
      </div>
    </div>
  );
}

const ToolbarStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    .ptb-btn {
      display: flex; align-items: center; justify-content: center;
      min-width: 26px; height: 26px; border-radius: 3px; border: none;
      background: transparent; color: #4b5563; cursor: pointer;
      transition: background-color 0.1s; outline: none; flex-shrink: 0;
      padding: 0 2px;
    }
    .ptb-btn:hover { background-color: rgba(0,0,0,0.07); }
    .ptb-btn.active { background-color: #e8eaed; color: #111827; }
    .ptb-btn:disabled { opacity: 0.35; cursor: default; }
    .ptb-btn:disabled:hover { background: transparent; }
    .ptb-divider { width: 1px; height: 18px; background-color: #e5e7eb; margin: 0 3px; flex-shrink: 0; }
    .ptb-select-wrap { display: flex; align-items: center; position: relative; border-radius: 3px; cursor: pointer; transition: background-color 0.1s; flex-shrink: 0; }
    .ptb-select-wrap:hover { background-color: rgba(0,0,0,0.06); }
    .ptb-dropdown {
      position: absolute; top: calc(100% + 4px); left: 0;
      background: #ffffff; box-shadow: 0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08);
      border-radius: 4px; padding: 4px 0; z-index: 3000; min-width: 160px;
      max-height: 280px; overflow-y: auto; border: 1px solid #e5e7eb;
    }
    .ptb-dropdown-item {
      display: flex; align-items: center; padding: 0 14px; height: 34px;
      font-size: 13px; font-family: 'Google Sans', Roboto, sans-serif;
      color: #374151; cursor: pointer; border: none; background: transparent;
      width: 100%; text-align: left; white-space: nowrap; outline: none; gap: 8px;
      transition: background-color 0.08s;
    }
    .ptb-dropdown-item:hover { background-color: #f9fafb; }
    .ptb-dropdown-item.active { color: #111827; font-weight: 600; }
    .ptb-display-val {
      font-size: 13px; font-family: 'Google Sans', Roboto, sans-serif;
      font-weight: 500; color: #374151; padding: 0 4px 0 8px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      cursor: pointer; user-select: none;
    }
    .ptb-display-val-narrow {
      font-size: 13px; font-family: 'Google Sans', Roboto, sans-serif;
      font-weight: 500; color: #374151; padding: 0 2px 0 6px;
      white-space: nowrap; cursor: pointer; user-select: none;
    }
    .ptb-font-size-input {
      width: 34px; height: 24px; text-align: center;
      border: 1px solid #d1d5db; border-radius: 3px; font-size: 13px;
      font-family: 'Google Sans', Roboto, sans-serif; font-weight: 500;
      color: #111827; background: #ffffff; outline: none; cursor: text; box-sizing: border-box;
    }
    .ptb-font-size-input:hover { border-color: #9ca3af; }
    .ptb-font-size-input:focus { border-color: #374151; box-shadow: 0 0 0 2px rgba(55,65,81,0.15); }
    .ptb-color-swatch-grid { display: grid; grid-template-columns: repeat(6, 20px); gap: 4px; padding: 10px; }
    .ptb-color-swatch { width: 20px; height: 20px; border-radius: 3px; border: 1px solid rgba(0,0,0,0.15); cursor: pointer; transition: transform 0.1s; }
    .ptb-color-swatch:hover { transform: scale(1.2); }
    .ptb-modal {
      position: absolute; top: calc(100% + 8px); left: 0;
      background: #ffffff; border-radius: 4px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08);
      padding: 14px; z-index: 3000; width: 290px; border: 1px solid #e5e7eb;
    }
    .ptb-modal input[type=url], .ptb-modal input[type=text] {
      width: 100%; box-sizing: border-box; padding: 7px 10px; font-size: 13px;
      border: 1px solid #d1d5db; border-radius: 3px; outline: none;
      font-family: 'Google Sans', Roboto, sans-serif; color: #111827;
    }
    .ptb-modal input:focus { border-color: #374151; box-shadow: 0 0 0 2px rgba(55,65,81,0.15); }
    .ptb-mode-btn {
      display: flex; align-items: center; gap: 5px; padding: 0 8px; height: 26px;
      border-radius: 13px; border: none; background: transparent; color: #374151;
      cursor: pointer; font-size: 13px; font-family: 'Google Sans', Roboto, sans-serif;
      font-weight: 600; outline: none; transition: background-color 0.1s;
      flex-shrink: 0; white-space: nowrap;
    }
    .ptb-mode-btn:hover { background-color: rgba(0,0,0,0.07); }
  `}} />
);

