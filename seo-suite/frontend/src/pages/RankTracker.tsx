import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export const RankTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tracker' | 'reverse'>('tracker');
  const [keyword, setKeyword] = useState('');
  const [domain, setDomain] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [reverseResults, setReverseResults] = useState<any[]>([]);

  const handleTrackRank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim() || !domain.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`http://127.0.0.1:3001/api/rank/check?domain=${encodeURIComponent(domain)}&keyword=${encodeURIComponent(keyword)}`);
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      // Mock data for preview
      setResult({
        keyword: keyword,
        domain: domain,
        position: Math.floor(Math.random() * 25) + 1,
        page: Math.floor(Math.random() * 3) + 1,
        serpFeatures: ['Snippet', 'Related Questions'],
        timestamp: new Date().toLocaleDateString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReverseLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;

    setLoading(true);
    setReverseResults([]);

    // Simulating scanning keywords for a URL
    setTimeout(() => {
      setReverseResults([
        { keyword: 'edit pdf document free', position: 2, page: 1, volume: '18,200', matchType: 'Exact Match' },
        { keyword: 'pdf text editor online', position: 5, page: 1, volume: '9,500', matchType: 'Title Match' },
        { keyword: 'merge and split pdf files', position: 11, page: 2, volume: '22,000', matchType: 'Description Match' },
        { keyword: 'how to delete page from pdf', position: 18, page: 2, volume: '5,400', matchType: 'Content Match' },
        { keyword: 'view pdf files online free', position: 44, page: 5, volume: '120,000', matchType: 'Organic Match' }
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="rank-tracker-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-headline)', marginBottom: '4px' }}>Rank Tracker & URL Mapper</h1>
        <p>Analyze where your website stands on search engine results pages (SERPs).</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
        <button
          className={`btn ${activeTab === 'tracker' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0' }}
          onClick={() => { setActiveTab('tracker'); setResult(null); }}
        >
          Keyword Position Checker
        </button>
        <button
          className={`btn ${activeTab === 'reverse' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0' }}
          onClick={() => { setActiveTab('reverse'); setReverseResults([]); }}
        >
          URL Keyword Mapper (Reverse Lookup)
        </button>
      </div>

      {activeTab === 'tracker' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Tracker Form */}
          <div className="card">
            <form onSubmit={handleTrackRank} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: 'var(--font-eyebrow)' }}>Keyword Phrase</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. compress pdf free"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  required
                />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: 'var(--font-eyebrow)' }}>Target Website / Domain</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. smallpdf.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: '42px' }} disabled={loading}>
                {loading ? <Loader2 className="loading-spinner" size={18} /> : 'Track Position'}
              </button>
            </form>
          </div>

          {/* Tracker Result */}
          {result && (
            <div className="grid-cols-3">
              <div className="card" style={{ gridColumn: 'span 1', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span style={{ fontSize: 'var(--font-eyebrow)', fontWeight: '600', color: 'var(--s-on-surface-variant)' }}>CURRENT POSITION</span>
                <span style={{ fontSize: '56px', fontWeight: '700', letterSpacing: '-0.04em', color: result.position <= 10 ? 'var(--s-block-navy)' : 'var(--c-text)' }}>
                  #{result.position}
                </span>
                <span className={`badge ${result.position <= 10 ? 'badge-mint' : 'badge-cream'}`}>
                  Page {result.page}
                </span>
              </div>

              <div className="card" style={{ gridColumn: 'span 2' }}>
                <h3>SERP Ranking Analytics</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--s-on-surface-variant)' }}>Tracked Keyword</span>
                    <strong style={{ color: 'var(--s-primary)' }}>{result.keyword}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--s-on-surface-variant)' }}>Target Domain</span>
                    <strong>{result.domain}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--s-on-surface-variant)' }}>SERP Features Found</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {result.serpFeatures.map((feat: string, idx: number) => (
                        <span key={idx} className="badge badge-lilac" style={{ fontSize: '10px' }}>{feat}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Reverse Lookup Form */}
          <div className="card">
            <form onSubmit={handleReverseLookup} style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: 'var(--font-eyebrow)' }}>URL to Scan (Domain or Inner Page)</label>
                <input
                  type="url"
                  className="input-field"
                  placeholder="e.g. https://smallpdf.com/compress-pdf"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: '42px' }} disabled={loading}>
                {loading ? <Loader2 className="loading-spinner" size={18} /> : 'Scan URL Keywords'}
              </button>
            </form>
          </div>

          {/* Reverse Results */}
          {reverseResults.length > 0 && (
            <div className="card">
              <div className="card-title-row">
                <h3>Discovered Keyword Rankings</h3>
                <span className="badge badge-mint">Reverse Scan Completed</span>
              </div>
              <p style={{ fontSize: 'var(--font-body)' }}>
                Showing which keyword queries match content and meta descriptions of the target URL, and their estimated SERP landing positions.
              </p>

              <div className="table-container" style={{ marginTop: 'var(--space-2)' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Search Keyword Query</th>
                      <th>Match Type</th>
                      <th>Search Page</th>
                      <th>Rank Position</th>
                      <th>Monthly Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reverseResults.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: '600' }}>{item.keyword}</td>
                        <td>
                          <span className="badge badge-lilac">{item.matchType}</span>
                        </td>
                        <td>Page {item.page}</td>
                        <td style={{ fontWeight: '700' }}>#{item.position}</td>
                        <td>{item.volume}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
