import React, { useState } from 'react';
import { Star, Loader2, Search, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

const API = 'http://127.0.0.1:3001';

interface Review {
  author: string;
  rating: number;
  text: string;
  date: string;
  platform: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface ReviewStats {
  totalReviews: number;
  avgRating: number;
  ratingDistribution: Record<string, number>;
  platforms: { name: string; count: number; avg: number }[];
}

const ReviewManagement: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setReviews([]);
    setStats(null);

    try {
      const res = await fetch(`${API}/api/local/reviews?query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Backend error');
      const data = await res.json();
      setReviews(data.reviews || []);
      setStats(data.stats || null);
    } catch {
      setError('Could not fetch live reviews. Showing sample data.');
      const sample: Review[] = [
        { author: 'Sarah M.', rating: 5, text: 'Absolutely love this service! Fast, reliable, and the customer support is top notch.', date: '2026-06-15', platform: 'Google', sentiment: 'positive' },
        { author: 'James K.', rating: 4, text: 'Great product, minor UI issues but overall very happy with the experience.', date: '2026-06-12', platform: 'Google', sentiment: 'positive' },
        { author: 'Priya L.', rating: 2, text: 'Had an issue with billing that took too long to resolve. Customer service needs improvement.', date: '2026-06-10', platform: 'Trustpilot', sentiment: 'negative' },
        { author: 'Ahmed R.', rating: 5, text: 'Best tool in its category. Saves me hours every week. Highly recommend!', date: '2026-06-08', platform: 'Google', sentiment: 'positive' },
        { author: 'Lisa T.', rating: 3, text: 'It works okay. Does the job but nothing special. Expected more features.', date: '2026-06-05', platform: 'Trustpilot', sentiment: 'neutral' },
        { author: 'Carlos V.', rating: 1, text: 'Very disappointed. The app crashed multiple times and I lost my work.', date: '2026-06-01', platform: 'Google', sentiment: 'negative' },
      ];
      setReviews(sample);
      setStats({
        totalReviews: 1284,
        avgRating: 4.2,
        ratingDistribution: { '5': 58, '4': 22, '3': 10, '2': 6, '1': 4 },
        platforms: [
          { name: 'Google', count: 847, avg: 4.3 },
          { name: 'Trustpilot', count: 312, avg: 4.0 },
          { name: 'G2', count: 125, avg: 4.4 },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const sentimentIcon = (s: Review['sentiment']) =>
    s === 'positive' ? <ThumbsUp size={12} style={{ color: 'var(--s-green)' }} /> :
    s === 'negative' ? <ThumbsDown size={12} style={{ color: 'var(--s-red)' }} /> :
    <MessageSquare size={12} style={{ color: 'var(--s-on-surface-variant)' }} />;

  const renderStars = (rating: number) => (
    <span>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: s <= rating ? '#fbbf24' : 'var(--s-hairline-soft)', fontSize: '12px' }}>★</span>
      ))}
    </span>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="card-title-row">
        <div>
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--s-on-surface-variant)', letterSpacing: '0.05em' }}>
            Local · Reviews
          </span>
          <h1 style={{ fontSize: 'var(--font-headline)', marginTop: '4px', marginBottom: '2px', fontWeight: '700' }}>
            Review Management
          </h1>
          <p style={{ fontSize: '13px' }}>Aggregate and analyze customer reviews from Google, Trustpilot, and other platforms.</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="card-icon-wrapper"><Star size={18} /></div>
            <h3>Search Business Reviews</h3>
          </div>
          <div className="input-wrapper">
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Smallpdf, ilovepdf, or mybusiness.com"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
            />
            <button type="submit" className="input-btn" disabled={loading}>
              {loading ? <Loader2 size={16} className="loading-spinner" /> : <Search size={16} />}
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '32px', justifyContent: 'center' }}>
          <Loader2 size={20} className="loading-spinner" />
          <span style={{ color: 'var(--s-on-surface-variant)' }}>Fetching reviews...</span>
        </div>
      )}

      {error && (
        <div style={{ padding: '10px 14px', background: 'var(--s-block-cream)', borderRadius: '8px', fontSize: '12px', color: 'var(--s-block-cream-text)' }}>
          ⚠ {error}
        </div>
      )}

      {stats && !loading && (
        <>
          {/* Stats */}
          <div className="grid-cols-3">
            <div className="card" style={{ alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: '11px', color: 'var(--s-on-surface-variant)', fontWeight: '700', textTransform: 'uppercase' }}>Overall Rating</span>
              <div style={{ fontSize: '48px', fontWeight: '700', color: '#fbbf24' }}>{stats.avgRating.toFixed(1)}</div>
              {renderStars(Math.round(stats.avgRating))}
              <span style={{ fontSize: '12px', color: 'var(--s-on-surface-variant)' }}>{stats.totalReviews.toLocaleString()} total reviews</span>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: 'var(--space-3)' }}>Rating Breakdown</h3>
              {['5', '4', '3', '2', '1'].map(star => (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', width: '16px', color: 'var(--s-on-surface)' }}>{star}★</span>
                  <div style={{ flex: 1, height: '8px', background: 'var(--s-hairline)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${stats.ratingDistribution[star] || 0}%`, height: '100%', background: star >= '4' ? '#fbbf24' : star === '3' ? 'var(--s-block-cream)' : 'var(--s-red)', transition: 'width 0.8s' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--s-on-surface-variant)', width: '28px', textAlign: 'right' }}>{stats.ratingDistribution[star] || 0}%</span>
                </div>
              ))}
            </div>

            <div className="card">
              <h3 style={{ marginBottom: 'var(--space-3)' }}>By Platform</h3>
              {stats.platforms.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < stats.platforms.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '13px' }}>{p.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--s-on-surface-variant)' }}>{p.count} reviews</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', color: '#fbbf24' }}>{p.avg.toFixed(1)}★</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Review List */}
          <div className="card">
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Recent Reviews</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reviews.map((r, i) => (
                <div key={i} style={{ padding: '14px', background: 'var(--s-surface-low)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--s-block-lilac)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px', color: 'var(--s-block-lilac-text)' }}>
                        {r.author.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '13px' }}>{r.author}</div>
                        <div>{renderStars(r.rating)}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {sentimentIcon(r.sentiment)}
                      <span className={`badge badge-${r.platform === 'Google' ? 'mint' : r.platform === 'Trustpilot' ? 'lilac' : 'lime'}`} style={{ fontSize: '9px' }}>{r.platform}</span>
                      <span style={{ fontSize: '11px', color: 'var(--s-on-surface-variant)' }}>{r.date}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--s-on-surface-variant)', margin: 0 }}>{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewManagement;
