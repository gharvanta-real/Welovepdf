import React, { useState } from 'react';
import { KeyRound, Search, AlertCircle, Loader2 } from 'lucide-react';

export const KeywordMagicTool: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://127.0.0.1:3001/api/keywords/suggest?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('API server unreachable');
      const data = await res.json();
      setResults(data.suggestions || []);
    } catch (err) {
      setError('Cannot connect to local server. Falling back to mockup data...');
      setResults([
        { keyword: query, intent: 'Transactional', volume: '14,800', difficulty: '45' },
        { keyword: `${query} tool`, intent: 'Commercial', volume: '6,400', difficulty: '28' },
        { keyword: `best ${query} online`, intent: 'Commercial', volume: '11,200', difficulty: '62' },
        { keyword: `free ${query} website`, intent: 'Informational', volume: '9,100', difficulty: '31' }
      ]);
    }
    setLoading(false);
  };

  const intentCounts = results.reduce((acc: any, curr) => {
    acc[curr.intent] = (acc[curr.intent] || 0) + 1;
    return acc;
  }, {});

  const total = results.length || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="card-title-row">
        <div>
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--s-on-surface-variant)', letterSpacing: '0.05em' }}>
            Keyword Research
          </span>
          <h1 style={{ fontSize: 'var(--font-headline)', marginTop: '4px', marginBottom: '2px', fontWeight: '700' }}>
            Keyword Magic Tool
          </h1>
          <p style={{ fontSize: '13px' }}>Scrape hundreds of keyword recommendations classified by search intentions and volumes.</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="card-icon-wrapper">
              <KeyRound size={18} />
            </div>
            <h3>Discover Search Queries</h3>
          </div>
          <div className="input-wrapper">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-field"
              placeholder="e.g. merge pdf, convert excel..."
              required
            />
            <button type="submit" className="input-btn" disabled={loading}>
              {loading ? <Loader2 className="loading-spinner" size={18} /> : <Search size={18} />}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="card" style={{ backgroundColor: 'var(--s-block-pink)', border: 'none' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--s-block-pink-text)' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid-cols-3">
          {/* Intent Share */}
          <div className="card" style={{ gridColumn: 'span 1', gap: '16px' }}>
            <h3>Search Intent Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.keys(intentCounts).map((intent) => {
                const count = intentCounts[intent];
                const percentage = Math.round((count / total) * 100);
                const badgeType = 
                  intent === 'Transactional' ? 'mint' : 
                  intent === 'Commercial' ? 'lilac' : 
                  intent === 'Informational' ? 'lime' : 'cream';

                return (
                  <div key={intent}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                      <span className={`badge badge-${badgeType}`} style={{ fontSize: '9px' }}>{intent}</span>
                      <span style={{ fontWeight: '700' }}>{percentage}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--s-surface-low)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${percentage}%`, 
                          backgroundColor: `var(--s-block-${badgeType})` 
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metrics Table */}
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <h3>Keyword Metrics</h3>
            <div className="table-container" style={{ marginTop: 'var(--space-2)' }}>
              <table className="data-table" style={{ fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Keyword</th>
                    <th>Intent</th>
                    <th>Search Volume</th>
                    <th>Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, idx) => {
                    const badgeType = 
                      r.intent === 'Transactional' ? 'mint' : 
                      r.intent === 'Commercial' ? 'lilac' : 
                      r.intent === 'Informational' ? 'lime' : 'cream';
                    const diff = parseInt(r.difficulty);

                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight: '700' }}>{r.keyword}</td>
                        <td>
                          <span className={`badge badge-${badgeType}`} style={{ fontSize: '10px' }}>{r.intent}</span>
                        </td>
                        <td>{r.volume}</td>
                        <td>
                          <span className={`badge ${diff > 50 ? 'badge-pink' : diff > 30 ? 'badge-cream' : 'badge-mint'}`} style={{ fontSize: '10px' }}>
                            {r.difficulty}/100
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default KeywordMagicTool;
