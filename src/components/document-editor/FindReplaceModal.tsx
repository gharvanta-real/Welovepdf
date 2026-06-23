import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronDown, ChevronUp, Replace } from 'lucide-react';

interface FindReplaceModalProps {
  onClose: () => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
}

export function FindReplaceModal({ onClose, editorRef }: FindReplaceModalProps) {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [matches, setMatches] = useState<Range[]>([]);
  const findInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    findInputRef.current?.focus();
    return () => clearHighlights();
  }, []);

  const clearHighlights = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const marks = editor.querySelectorAll('mark[data-find-highlight]');
    marks.forEach(mark => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parent.normalize();
      }
    });
  }, [editorRef]);

  const doFind = useCallback((text: string) => {
    clearHighlights();
    const editor = editorRef.current;
    if (!editor || !text) { setMatchCount(0); setCurrentMatch(0); setMatches([]); return; }

    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let node;
    while ((node = walker.nextNode())) textNodes.push(node as Text);

    const flags = matchCase ? 'g' : 'gi';
    let escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (wholeWord) escapedText = `\\b${escapedText}\\b`;
    const regex = new RegExp(escapedText, flags);

    let count = 0;
    textNodes.forEach(tn => {
      const fullText = tn.textContent || '';
      let match;
      regex.lastIndex = 0;
      const parts: (string | 'MATCH')[] = [];
      let lastIndex = 0;
      while ((match = regex.exec(fullText)) !== null) {
        if (match.index > lastIndex) parts.push(fullText.slice(lastIndex, match.index));
        parts.push('MATCH');
        lastIndex = match.index + match[0].length;
        count++;
      }
      if (parts.length === 0) return;
      if (lastIndex < fullText.length) parts.push(fullText.slice(lastIndex));

      const frag = document.createDocumentFragment();
      parts.forEach(part => {
        if (part === 'MATCH') {
          const mark = document.createElement('mark');
          mark.setAttribute('data-find-highlight', 'true');
          mark.textContent = text;
          mark.style.cssText = 'background:#fef08a;color:inherit;border-radius:2px;';
          frag.appendChild(mark);
        } else {
          frag.appendChild(document.createTextNode(part));
        }
      });
      tn.parentNode?.replaceChild(frag, tn);
    });

    setMatchCount(count);
    setCurrentMatch(count > 0 ? 1 : 0);
  }, [clearHighlights, editorRef, matchCase, wholeWord]);

  useEffect(() => {
    const timer = setTimeout(() => doFind(findText), 200);
    return () => clearTimeout(timer);
  }, [findText, matchCase, wholeWord, doFind]);

  const navigateMatch = (dir: 'next' | 'prev') => {
    const editor = editorRef.current;
    if (!editor || matchCount === 0) return;
    const marks = Array.from(editor.querySelectorAll('mark[data-find-highlight]'));
    if (marks.length === 0) return;
    let next = dir === 'next' ? currentMatch % marks.length : (currentMatch - 2 + marks.length) % marks.length;
    setCurrentMatch(next + 1);
    marks[next].scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const doReplace = () => {
    const editor = editorRef.current;
    if (!editor || matchCount === 0) return;
    const marks = Array.from(editor.querySelectorAll('mark[data-find-highlight]'));
    const idx = (currentMatch - 1 + marks.length) % marks.length;
    const mark = marks[idx];
    if (mark) {
      mark.textContent = replaceText;
      mark.removeAttribute('data-find-highlight');
      (mark as HTMLElement).style.background = '';
      setMatchCount(m => Math.max(0, m - 1));
      setCurrentMatch(m => Math.min(m, matchCount - 1));
    }
  };

  const doReplaceAll = () => {
    const editor = editorRef.current;
    if (!editor || matchCount === 0) return;
    const marks = Array.from(editor.querySelectorAll('mark[data-find-highlight]'));
    marks.forEach(mark => {
      const tn = document.createTextNode(replaceText);
      mark.parentNode?.replaceChild(tn, mark);
    });
    setMatchCount(0); setCurrentMatch(0);
  };

  return (
    <div style={{
      position: 'fixed', top: 80, right: 24, zIndex: 9999,
      backgroundColor: '#ffffff',
      border: '1px solid #dadce0',
      borderRadius: 4,
      boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
      padding: '12px 16px',
      width: 360,
      fontFamily: "'Google Sans', Roboto, sans-serif",
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>
          {showReplace ? 'Find & Replace' : 'Find in document'}
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 2, borderRadius: 4, display: 'flex' }}>
          <X size={16} />
        </button>
      </div>

      {/* Find row */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            ref={findInputRef}
            type="text"
            placeholder="Find"
            value={findText}
            onChange={e => setFindText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') navigateMatch(e.shiftKey ? 'prev' : 'next'); if (e.key === 'Escape') onClose(); }}
            style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', fontSize: 14, border: '1px solid #d1d5db', borderRadius: 3, outline: 'none', fontFamily: 'inherit', color: '#111827' }}
          />
          {matchCount > 0 && (
            <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#6b7280' }}>
              {currentMatch}/{matchCount}
            </span>
          )}
        </div>
        <button onClick={() => navigateMatch('prev')} title="Previous match" style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 3, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
          <ChevronUp size={14} />
        </button>
        <button onClick={() => navigateMatch('next')} title="Next match" style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 3, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Replace row */}
      {showReplace && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <input
            type="text"
            placeholder="Replace with"
            value={replaceText}
            onChange={e => setReplaceText(e.target.value)}
            style={{ flex: 1, boxSizing: 'border-box', padding: '6px 10px', fontSize: 14, border: '1px solid #d1d5db', borderRadius: 3, outline: 'none', fontFamily: 'inherit', color: '#111827' }}
          />
          <button onClick={doReplace} title="Replace" style={{ background: '#1f2937', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer', padding: '0 10px', fontSize: 13, fontWeight: 500 }}>
            Replace
          </button>
          <button onClick={doReplaceAll} title="Replace all" style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 3, cursor: 'pointer', padding: '0 8px', fontSize: 13, fontWeight: 500, color: '#374151' }}>
            All
          </button>
        </div>
      )}

      {/* Options */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 6 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
          <input type="checkbox" checked={matchCase} onChange={e => setMatchCase(e.target.checked)} style={{ margin: 0 }} />
          Match case
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
          <input type="checkbox" checked={wholeWord} onChange={e => setWholeWord(e.target.checked)} style={{ margin: 0 }} />
          Whole word
        </label>
        <button
          onClick={() => setShowReplace(r => !r)}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#1f2937', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500, textDecoration: 'underline' }}
        >
          <Replace size={13} />
          {showReplace ? 'Hide replace' : 'Replace'}
        </button>
      </div>

      {findText && matchCount === 0 && (
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#dc2626' }}>No matches found</p>
      )}
    </div>
  );
}
