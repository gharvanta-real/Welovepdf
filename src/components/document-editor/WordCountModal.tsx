import React, { useMemo } from 'react';
import { X, FileText } from 'lucide-react';

interface WordCountModalProps {
  contentHtml: string;
  onClose: () => void;
}

export function WordCountModal({ contentHtml, onClose }: WordCountModalProps) {
  const stats = useMemo(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentHtml, 'text/html');
    const text = doc.body.textContent || '';

    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const paragraphs = text.trim() ? text.split(/\n+/).filter(l => l.trim()).length : 0;
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0;
    // Estimate pages: ~500 words per page
    const pages = Math.max(1, Math.ceil(words / 500));

    return { words, chars, charsNoSpaces, paragraphs, sentences, pages };
  }, [contentHtml]);

  const rows = [
    { label: 'Pages', value: stats.pages },
    { label: 'Words', value: stats.words.toLocaleString() },
    { label: 'Characters (with spaces)', value: stats.chars.toLocaleString() },
    { label: 'Characters (no spaces)', value: stats.charsNoSpaces.toLocaleString() },
    { label: 'Paragraphs', value: stats.paragraphs.toLocaleString() },
    { label: 'Sentences', value: stats.sentences.toLocaleString() },
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.35)',
      zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          padding: '24px 28px',
          width: 340,
          fontFamily: "'Google Sans', Roboto, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} style={{ color: '#1f2937' }} />
            <span style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>Word Count</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 2, borderRadius: 3, display: 'flex' }}>
            <X size={16} />
          </button>
        </div>

        {/* Stats rows */}
        <div style={{ borderTop: '1px solid #f3f4f6' }}>
          {rows.map((row, i) => (
            <div
              key={row.label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: i < rows.length - 1 ? '1px solid #f9fafb' : 'none',
              }}
            >
              <span style={{ fontSize: 14, color: '#374151' }}>{row.label}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{row.value}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: '#1f2937', color: '#ffffff',
              border: 'none',
              borderRadius: 3,
              padding: '8px 24px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
