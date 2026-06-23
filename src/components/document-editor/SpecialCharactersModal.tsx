import React from 'react';
import { X } from 'lucide-react';

interface SpecialCharactersModalProps {
  onClose: () => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
}

export function SpecialCharactersModal({ onClose, editorRef }: SpecialCharactersModalProps) {
  const categories = [
    {
      name: 'Math',
      symbols: ['π', '∞', '±', '≤', '≥', '≠', '÷', '×', '√', '∑', 'Δ', 'Ω', 'μ', 'α', 'β', 'γ', 'θ']
    },
    {
      name: 'Currency',
      symbols: ['$', '€', '£', '¥', '¢', '₱', '₹', '₪', '₩', '₣', '₯']
    },
    {
      name: 'Typography',
      symbols: ['©', '®', '™', '°', '¶', '§', '•', '—', '–', '†', '‡', '…', '«', '»', '¿', '¡']
    }
  ];

  const [activeCategory, setActiveCategory] = React.useState('Math');

  const handleInsert = (symbol: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    // Refocus the editor to ensure execCommand inserts at the cursor
    editor.focus();
    
    try {
      document.execCommand('insertText', false, symbol);
    } catch (e) {
      // Fallback if execCommand fails
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(symbol));
        range.collapse(false);
      }
    }
  };

  const activeSymbols = categories.find(c => c.name === activeCategory)?.symbols || [];

  return (
    <div style={{
      position: 'fixed',
      top: 80,
      right: 24,
      zIndex: 9999,
      backgroundColor: '#ffffff',
      border: '1px solid #dadce0',
      borderRadius: 4,
      boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
      padding: '12px 16px',
      width: 320,
      fontFamily: "'Google Sans', Roboto, sans-serif",
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>Special characters</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 2, display: 'flex' }}>
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #e5e7eb', marginBottom: 12, paddingBottom: 4 }}>
        {categories.map(cat => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            style={{
              padding: '4px 8px',
              fontSize: 12,
              fontWeight: activeCategory === cat.name ? 600 : 500,
              color: activeCategory === cat.name ? '#111827' : '#5f6368',
              backgroundColor: activeCategory === cat.name ? '#f3f4f6' : 'transparent',
              border: 'none',
              borderRadius: 3,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid of symbols */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 6,
        maxHeight: 180,
        overflowY: 'auto',
      }}>
        {activeSymbols.map((sym, idx) => (
          <button
            key={idx}
            onClick={() => handleInsert(sym)}
            style={{
              height: 36,
              fontSize: 16,
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 3,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none',
              transition: 'background-color 0.1s, border-color 0.1s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            {sym}
          </button>
        ))}
      </div>
    </div>
  );
}
