import React, { useState } from 'react';
import { Search, AlertCircle, Loader2 } from 'lucide-react';

export const KeywordResearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://127.0.0.1:3001/api/keywords/suggest?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Failed to fetch suggestions');
      const data = await res.json();
      setResults(data.suggestions || []);
    } catch (err: any) {
      setError(err.message || 'Error occurred while fetching data');
      // Set some mock data if server is offline during dev/preview
      setResults([
        { keyword: query, intent: 'Transactional', volume: '12,500', difficulty: '45' },
        { keyword: `${query} free`, intent: 'Informational', volume: '8,400', difficulty: '22' },
        { keyword: `best ${query} tool`, intent: 'Commercial', volume: '3,200', difficulty: '56' },
        { keyword: `${query} alternative`, intent: 'Commercial', volume: '1,900', difficulty: '34' },
        { keyword: `how to use ${query}`, intent: 'Informational', volume: '5,600', difficulty: '18' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Group counts for intents to show a custom HTML layout chart
  const intentCounts = results.reduce((acc: any, curr) => {
    acc[curr.intent] = (acc[curr.intent] || 0) + 1;
    return acc;
  }, {});

  const totalIntents = results.length || 1;

  return (
    <div className="keyword-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-headline)', marginBottom: '4px' }}>Keyword Research Tool</h1>
        <p>Discover search keywords, search intent patterns, difficulty indices, and long-tail variants.</p>
      </div>

      {/* Main Search Input Card */}
      <div className="card">
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h3>Discover Keywords</h3>
          <p style={{ fontSize: 'var(--font-body)' }}>
            Enter a seed word (e.g., "pdf merge", "online tool") to scrape autocomplete suggestions directly from search engines.
          </p>
          <div className="input-wrapper">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-field"
              placeholder="e.g., compress pdf, edit document, free tools..."
              disabled={loading}
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
            <span>{error} (Fallback mock data loaded below)</span>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid-cols-3">
          {/* Intent Distribution Chart */}
          <div className="card" style={{ gridColumn: 'span 1' }}>
            <h3>Search Intent Profile</h3>
            <p style={{ fontSize: 'var(--font-eyebrow)' }}>User search behavior classifications.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              {Object.keys(intentCounts).map((intent) => {
                const count = intentCounts[intent];
                const percentage = Math.round((count / totalIntents) * 100);
                const badgeType = 
                  intent === 'Transactional' ? 'mint' : 
                  intent === 'Commercial' ? 'lilac' : 
                  intent === 'Informational' ? 'lime' : 'cream';

                return (
                  <div key={intent}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: 'var(--font-eyebrow)' }}>
                      <span className={`badge badge-${badgeType}`}>{intent}</span>
                      <span style={{ fontWeight: '600' }}>{percentage}% ({count})</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--s-surface-low)', borderRadius: '4px', overflow: 'hidden' }}>
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

          {/* Keyword suggestion table */}
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div className="card-title-row">
              <h3>Keyword Suggestions & Metrics</h3>
              <span className="badge badge-muted">{results.length} results</span>
            </div>

            <div className="table-container" style={{ marginTop: 'var(--space-2)' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Suggested Phrase</th>
                    <th>Intent</th>
                    <th>Est. Volume</th>
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
                        <td style={{ fontWeight: '600' }}>{r.keyword}</td>
                        <td>
                          <span className={`badge badge-${badgeType}`}>{r.intent}</span>
                        </td>
                        <td>{r.volume}</td>
                        <td>
                          <span className={`badge ${diff > 50 ? 'badge-pink' : diff > 30 ? 'badge-cream' : 'badge-mint'}`}>
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
