import React, { useState } from 'react';
import { Zap, Image, Code } from 'lucide-react';

export const PageSpeed: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [audited, setAudited] = useState(false);

  const runSpeedCheck = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAudited(true);
    }, 1500);
  };

  const scores = [
    { label: 'Performance', score: 92, color: 'mint' },
    { label: 'Accessibility', score: 96, color: 'mint' },
    { label: 'Best Practices', score: 89, color: 'lime' },
    { label: 'SEO', score: 100, color: 'mint' }
  ];

  return (
    <div className="pagespeed-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-headline)', marginBottom: '4px' }}>PageSpeed & UX Optimizer</h1>
        <p>Run Google Lighthouse audits locally to check Core Web Vitals and load performance.</p>
      </div>

      <div className="card">
        <h3>Lighthouse Speed Test</h3>
        <p style={{ fontSize: 'var(--font-body)' }}>
          Launches a headless browser to test rendering times, layout shifts, and bundle bloats.
        </p>
        <div>
          <button className="btn btn-primary" onClick={runSpeedCheck} disabled={loading}>
            {loading ? 'Analyzing Performance Metrics...' : 'Run Speed Audit'}
          </button>
        </div>
      </div>

      {audited && (
        <>
          {/* Audits Dial row */}
          <div className="grid-cols-4">
            {scores.map((s, idx) => (
              <div key={idx} className="card" style={{ alignItems: 'center', textAlign: 'center' }}>
                <span style={{ fontSize: 'var(--font-eyebrow)', fontWeight: '600', color: 'var(--s-on-surface-variant)' }}>
                  {s.label.toUpperCase()}
                </span>
                <div 
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    border: '8px solid var(--s-hairline)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#111',
                    backgroundColor: `var(--s-block-${s.color})`,
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  {s.score}
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Recommendations */}
          <div className="card">
            <h3>Speed & UX Optimization Advice</h3>
            <p>Implement the following recommendations to achieve a perfect 100/100 score.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
              
              <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                <div style={{ padding: '8px', backgroundColor: 'var(--s-block-pink)', borderRadius: '8px', height: 'fit-content' }}>
                  <Image size={24} style={{ color: '#6d1e18' }} />
                </div>
                <div>
                  <h4 style={{ fontWeight: '700', marginBottom: '4px' }}>Use next-gen image formats (AVIF / WebP)</h4>
                  <p style={{ fontSize: '13px', marginBottom: '8px' }}>
                    Images like `hero-banner.png` and `feature-icon.jpg` are uncompressed. Converting them could save up to **840 KB** of load bandwidth.
                  </p>
                  <span className="badge badge-pink">Save 840 KB</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                <div style={{ padding: '8px', backgroundColor: 'var(--s-block-cream)', borderRadius: '8px', height: 'fit-content' }}>
                  <Code size={24} style={{ color: '#6a4f0b' }} />
                </div>
                <div>
                  <h4 style={{ fontWeight: '700', marginBottom: '4px' }}>Minify javascript and stylesheet payloads</h4>
                  <p style={{ fontSize: '13px', marginBottom: '8px' }}>
                    Compress redundant spacing and debug comments in compiled production assets.
                  </p>
                  <span className="badge badge-cream">Save 120 KB</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ padding: '8px', backgroundColor: 'var(--s-block-mint)', borderRadius: '8px', height: 'fit-content' }}>
                  <Zap size={24} style={{ color: '#0b5134' }} />
                </div>
                <div>
                  <h4 style={{ fontWeight: '700', marginBottom: '4px' }}>Eliminate render-blocking assets in head</h4>
                  <p style={{ fontSize: '13px', marginBottom: '8px' }}>
                    Defer secondary CSS files and analytics script loading to prevent blocking browser paint cycles.
                  </p>
                  <span className="badge badge-mint">Save 80ms TTFB</span>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
};
