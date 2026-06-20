import React, { useState } from 'react';
import { Navigation, Search, Loader2, MapPin, Star, XCircle, TrendingUp } from 'lucide-react';

const API = 'http://127.0.0.1:3001';

interface LocalRank {
  keyword: string;
  city: string;
  position: number | null;
  mapPack: boolean;
  url: string;
  title: string;
  rating?: number;
  reviewCount?: number;
  inTop3: boolean;
}

const MapRankTracker: React.FC = () => {
  const [keywords, setKeywords] = useState('');
  const [city, setCity] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LocalRank[]>([]);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywords.trim() || !city.trim()) return;
    setLoading(true);
    setError('');
    setResults([]);

    const kwList = keywords.split('\n').map(k => k.trim()).filter(Boolean);

    try {
      const res = await fetch(`${API}/api/local/rank-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: kwList, city: city.trim(), domain: domain.trim() }),
      });
      if (!res.ok) throw new Error('Backend error');
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      setError('Could not connect to backend. Please ensure backend is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };

  const getPositionBadge = (pos: number | null, mapPack: boolean) => {
    if (pos === null) return <span className="badge badge-pink" style={{ fontSize: '9px' }}>Not Found</span>;
    if (mapPack) return <span className="badge badge-lime" style={{ fontSize: '9px' }}>Map Pack</span>;
    if (pos <= 3) return <span className="badge badge-mint" style={{ fontSize: '9px' }}>Top 3</span>;
    if (pos <= 10) return <span className="badge badge-lilac" style={{ fontSize: '9px' }}>Page 1</span>;
    return <span className="badge badge-cream" style={{ fontSize: '9px' }}>Page 2+</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="card-title-row">
        <div>
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--s-on-surface-variant)', letterSpacing: '0.05em' }}>
            Local · Competitive Analysis
          </span>
          <h1 style={{ fontSize: 'var(--font-headline)', marginTop: '4px', marginBottom: '2px', fontWeight: '700' }}>
            Map Rank Tracker
          </h1>
          <p style={{ fontSize: '13px' }}>Check your local Google search rankings, map pack presence, and business listing positions.</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleTrack} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="card-icon-wrapper"><Navigation size={18} /></div>
            <h3>Local Rank Check</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--s-on-surface-variant)', display: 'block', marginBottom: '6px' }}>
                City / Location
              </label>
              <input
                type="text"
                className="input-field"
                style={{ width: '100%' }}
                placeholder="e.g. New York, NY"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--s-on-surface-variant)', display: 'block', marginBottom: '6px' }}>
                Your Domain (optional)
              </label>
              <input
                type="text"
                className="input-field"
                style={{ width: '100%' }}
                placeholder="e.g. mybusiness.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--s-on-surface-variant)', display: 'block', marginBottom: '6px' }}>
              Keywords (one per line)
            </label>
            <textarea
              className="input-field"
              style={{ width: '100%', height: '110px', resize: 'vertical', fontFamily: 'inherit', padding: '10px' }}
              placeholder={"plumber near me\nbest pizza in city\nlocal dentist"}
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
            {loading ? (
              <><Loader2 size={14} className="loading-spinner" /> <span>Checking rankings...</span></>
            ) : (
              <><Search size={14} /> <span>Check Local Rankings</span></>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'var(--s-block-pink)', borderRadius: '8px', fontSize: '12px', color: 'var(--s-block-pink-text)', border: '1px solid var(--s-block-pink-text)' }}>
          ✕ {error}
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '32px', justifyContent: 'center' }}>
          <Loader2 size={20} className="loading-spinner" />
          <span style={{ color: 'var(--s-on-surface-variant)' }}>Scraping Google local results for {city}...</span>
        </div>
      )}

      {results.length > 0 && !loading && (
        <>
          {/* Summary */}
          <div className="grid-cols-3">
            {[
              { label: 'Map Pack', count: results.filter(r => r.mapPack).length, icon: MapPin, color: 'var(--s-block-lime)' },
              { label: 'Top 3 Positions', count: results.filter(r => r.inTop3).length, icon: TrendingUp, color: 'var(--s-block-mint)' },
              { label: 'Not Ranking', count: results.filter(r => r.position === null).length, icon: XCircle, color: 'var(--s-block-pink)' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '10px', background: s.color, borderRadius: '10px' }}>
                    <Icon size={18} style={{ color: 'var(--s-on-surface)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--s-on-surface)' }}>{s.count}</div>
                    <div style={{ fontSize: '11px', color: 'var(--s-on-surface-variant)', textTransform: 'uppercase', fontWeight: '700' }}>{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Results Table */}
          <div className="card">
            <h3 style={{ marginBottom: 'var(--space-3)' }}>Ranking Results — {city}</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Keyword</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Ranking URL</th>
                    <th>Title</th>
                    {results.some(r => r.rating) && <th>Rating</th>}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '600' }}>{r.keyword}</td>
                      <td style={{ fontWeight: '700', fontSize: '16px', color: r.position && r.position <= 3 ? 'var(--s-green)' : 'var(--s-on-surface)' }}>
                        {r.position !== null ? `#${r.position}` : '—'}
                      </td>
                      <td>{getPositionBadge(r.position, r.mapPack)}</td>
                      <td style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--s-block-lilac-text)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.url || '—'}
                      </td>
                      <td style={{ fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.title || '—'}
                      </td>
                      {results.some(r2 => r2.rating) && (
                        <td>
                          {r.rating ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Star size={11} style={{ color: '#fbbf24' }} />
                              <span style={{ fontSize: '12px', fontWeight: '600' }}>{r.rating}</span>
                              <span style={{ fontSize: '10px', color: 'var(--s-on-surface-variant)' }}>({r.reviewCount})</span>
                            </div>
                          ) : '—'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MapRankTracker;
