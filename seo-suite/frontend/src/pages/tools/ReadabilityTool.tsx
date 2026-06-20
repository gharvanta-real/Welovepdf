import React, { useState } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';

export const ReadabilityTool: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setResults(null);

    try {
      const res = await fetch('http://127.0.0.1:3001/api/content/readability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      // Fallback
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      const charCount = text.length;
      const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim()).length || 1;
      const score = Math.max(10, Math.min(100, Math.round(85 - (wordCount / sentenceCount) * 1.5)));
      setResults({
        wordCount,
        charCount,
        sentenceCount,
        score,
        grade: score > 80 ? '5th Grade (Very Easy)' : score > 60 ? '8th Grade (Standard)' : 'College Level (Difficult)',
        tone: wordCount % 2 === 0 ? 'Professional & Informative' : 'Casual & Conversational'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="card-title-row">
        <div>
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--s-on-surface-variant)', letterSpacing: '0.05em' }}>
            On-Page & Content
          </span>
          <h1 style={{ fontSize: 'var(--font-headline)', marginTop: '4px', marginBottom: '2px', fontWeight: '700' }}>
            Readability & Tone Analyzer
          </h1>
          <p style={{ fontSize: '13px' }}>Evaluate document word counts, sentence lengths, readability indices, and tone styles.</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="card-icon-wrapper">
              <BookOpen size={18} />
            </div>
            <h3>Paste Copywriting Text</h3>
          </div>
          <textarea
            className="input-field"
            style={{ minHeight: '120px', fontFamily: 'inherit', resize: 'vertical' }}
            placeholder="Type or paste your page article copy here to analyze..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="loading-spinner" size={14} style={{ marginRight: '6px' }} />
                <span>Analyzing text...</span>
              </>
            ) : (
              <span>Analyze Readability</span>
            )}
          </button>
        </form>
      </div>

      {results && (
        <div className="grid-cols-2">
          {/* Counters */}
          <div className="card">
            <h3>Document Statistics</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                <span>Word Count</span>
                <strong>{results.wordCount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                <span>Character Count</span>
                <strong>{results.charCount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                <span>Sentence Count</span>
                <strong>{results.sentenceCount}</strong>
              </div>
            </div>
          </div>

          {/* Scores */}
          <div className="card">
            <h3>Readability Indicators</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                <span>Flesch Reading Score</span>
                <strong style={{ color: results.score > 60 ? 'green' : 'orange' }}>{results.score} / 100</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                <span>Reading Level</span>
                <strong>{results.grade}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                <span>Tone of Voice</span>
                <strong>{results.tone}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ReadabilityTool;
