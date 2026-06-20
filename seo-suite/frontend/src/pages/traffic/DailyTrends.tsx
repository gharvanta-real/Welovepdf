import React, { useState, useEffect } from 'react';
import { TrendingUp, Loader2, RefreshCw, Flame } from 'lucide-react';

const API = 'http://127.0.0.1:3001';

interface Trend {
  title: string;
  traffic: string;
  relatedQueries: string[];
  startTime?: string;
}

const DailyTrends: React.FC = () => {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(false);
  const [geo, setGeo] = useState('US');
  const [fetchedAt, setFetchedAt] = useState('');

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/traffic/trends?geo=${geo}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setTrends(data.trends || []);
      setFetchedAt(new Date().toLocaleTimeString());
    } catch {
      // Fallback: fetch Google Trends RSS directly from client side
      try {
        await fetch(`https://trends.google.com/trends/hottrends/atom/feed?pn=p1`, { mode: 'no-cors' });
        // no-cors won't give body, so show helpful message
        setTrends([]);
      } catch { /* ignore */ }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrends(); }, [geo]);

  const geoOptions = [
    { code: 'US', label: '🇺🇸 United States' },
    { code: 'IN', label: '🇮🇳 India' },
    { code: 'GB', label: '🇬🇧 United Kingdom' },
    { code: 'AU', label: '🇦🇺 Australia' },
    { code: 'CA', label: '🇨🇦 Canada' },
    { code: 'DE', label: '🇩🇪 Germany' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="card-title-row">
        <div>
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--s-on-surface-variant)', letterSpacing: '0.05em' }}>
            Traffic & Market
          </span>
          <h1 style={{ fontSize: 'var(--font-headline)', marginTop: '4px', marginBottom: '2px', fontWeight: '700' }}>
            Daily Trends
          </h1>
          <p style={{ fontSize: '13px' }}>Real-time trending search topics from Google Trends by country.</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={fetchTrends}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {loading ? <Loader2 size={14} className="loading-spinner" /> : <RefreshCw size={14} />}
          Refresh
        </button>
      </div>

      {/* Geo selector */}
      <div className="card">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--s-on-surface-variant)', marginRight: '4px' }}>Region:</span>
          {geoOptions.map((g) => (
            <button
              key={g.code}
              onClick={() => setGeo(g.code)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: `1px solid ${geo === g.code ? 'var(--s-block-lime-text)' : 'var(--border)'}`,
                background: geo === g.code ? 'var(--s-block-lime)' : 'var(--s-surface-low)',
                color: geo === g.code ? 'var(--s-block-lime-text)' : 'var(--s-on-surface)',
                fontSize: '12px',
                fontWeight: geo === g.code ? '700' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '32px', justifyContent: 'center' }}>
          <Loader2 size={20} className="loading-spinner" />
          <span style={{ color: 'var(--s-on-surface-variant)' }}>Fetching Google Trends for {geo}...</span>
        </div>
      )}

      {!loading && trends.length > 0 && (
        <>
          {fetchedAt && (
            <p style={{ fontSize: '11px', color: 'var(--s-on-surface-variant)', textAlign: 'right' }}>
              Last refreshed: {fetchedAt}
            </p>
          )}
          <div className="grid-cols-3">
            {trends.map((t, i) => (
              <div key={i} className="card" style={{ gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'var(--s-block-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: '700', color: 'var(--s-block-lime-text)', flexShrink: 0
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', lineHeight: 1.3 }}>{t.title}</h3>
                    {t.startTime && (
                      <p style={{ fontSize: '10px', color: 'var(--s-on-surface-variant)', marginTop: '2px' }}>
                        {new Date(t.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Flame size={12} style={{ color: 'var(--s-red)' }} />
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--s-green)' }}>{t.traffic}</span>
                  </div>
                </div>
                {t.relatedQueries?.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {t.relatedQueries.slice(0, 3).map((q, qi) => (
                      <span key={qi} className="badge badge-lilac" style={{ fontSize: '9px' }}>{q}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && trends.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <TrendingUp size={32} style={{ color: 'var(--s-on-surface-variant)', margin: '0 auto 12px' }} />
          <h3>No trends loaded</h3>
          <p style={{ marginTop: '4px' }}>Backend route /api/traffic/trends needs to be running. Click Refresh.</p>
          <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={fetchTrends}>
            Load Trends
          </button>
        </div>
      )}
    </div>
  );
};

export default DailyTrends;
