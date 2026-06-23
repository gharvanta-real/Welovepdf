import React, { useState } from 'react';
import { X, Search, BookOpen } from 'lucide-react';

interface DictionaryModalProps {
  onClose: () => void;
}

export function DictionaryModal({ onClose }: DictionaryModalProps) {
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!word.trim()) return;
    setLoading(true);
    setError('');
    setDefinition(null);

    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim().toLowerCase())}`);
      if (!res.ok) {
        throw new Error('Word not found in dictionary.');
      }
      const data = await res.json();
      if (data && data.length > 0) {
        setDefinition(data[0]);
      } else {
        throw new Error('Word not found.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching the definition.');
    } finally {
      setLoading(false);
    }
  };

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
      width: 340,
      fontFamily: "'Google Sans', Roboto, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '400px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#111827' }}>
          <BookOpen size={16} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Dictionary Lookup</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 2, display: 'flex' }}>
          <X size={16} />
        </button>
      </div>

      {/* Search Input bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexShrink: 0 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Search word..."
            value={word}
            onChange={e => setWord(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
            style={{
              width: '100%',
              padding: '6px 30px 6px 10px',
              fontSize: 12,
              border: '1px solid #cbd5e1',
              borderRadius: 3,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <Search size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: '6px 12px',
            fontSize: 12,
            backgroundColor: '#1f2937',
            color: '#ffffff',
            border: 'none',
            borderRadius: 3,
            fontWeight: 600,
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Results content */}
      <div style={{ flex: 1, overflowY: 'auto', fontSize: 12, paddingRight: 2 }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px 0', color: '#64748b' }}>
            <span>Retrieving definition...</span>
          </div>
        )}

        {error && (
          <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: 8, borderRadius: 3, border: '1px solid #fee2e2' }}>
            {error}
          </div>
        )}

        {definition && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{definition.word}</span>
              {definition.phonetic && (
                <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>{definition.phonetic}</span>
              )}
            </div>

            {definition.meanings?.map((meaning: any, mIdx: number) => (
              <div key={mIdx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, fontStyle: 'italic', fontWeight: 600, color: '#4b5563', borderBottom: '1px solid #f1f3f4', paddingBottom: 2 }}>
                  {meaning.partOfSpeech}
                </span>
                <ul style={{ paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {meaning.definitions?.slice(0, 2).map((def: any, dIdx: number) => (
                    <li key={dIdx} style={{ color: '#374151', lineHeight: '1.4' }}>
                      <div>{def.definition}</div>
                      {def.example && (
                        <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic', marginTop: 2 }}>
                          "{def.example}"
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && !definition && (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '24px 0' }}>
            Enter a word to find definitions, parts of speech, and word origins.
          </div>
        )}
      </div>
    </div>
  );
}
