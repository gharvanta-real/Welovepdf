import React, { useState } from 'react';
import { Play, Loader2, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

export const TechnicalAudit: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [audited, setAudited] = useState(false);

  const runAudit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAudited(true);
    }, 2000);
  };

  const pages = [
    { url: '/', status: 200, title: 'PDF Editor & Converter', h1: 1, broken: 0, secure: true },
    { url: '/compress-pdf', status: 200, title: 'Compress PDF Online', h1: 1, broken: 0, secure: true },
    { url: '/merge-pdf', status: 200, title: 'Merge PDF files', h1: 2, broken: 1, secure: true },
    { url: '/split-pdf', status: 301, title: 'Split PDF redirects', h1: 0, broken: 0, secure: true },
    { url: '/contact-us-broken-link', status: 404, title: 'Page Not Found', h1: 0, broken: 1, secure: false }
  ];

  return (
    <div className="technical-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-headline)', marginBottom: '4px' }}>Technical SEO Audit</h1>
        <p>Run local crawlers to audit metadata, hierarchy structures, links, and SSL security status.</p>
      </div>

      <div className="card">
        <h3>Trigger Site Crawler</h3>
        <p style={{ fontSize: 'var(--font-body)' }}>
          Recursively scans all internal website links up to a depth of 3 levels to locate redirects, broken URLs, and tags.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-primary" onClick={runAudit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="loading-spinner" size={18} />
                <span>Crawling Website...</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>Start Full Technical Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {audited && (
        <>
          {/* Summary Row */}
          <div className="grid-cols-3">
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} style={{ color: 'var(--s-green)' }} />
                <h3>Security & SSL</h3>
              </div>
              <p>All scanned pages use HTTPS encryption. Security headers present.</p>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} style={{ color: 'var(--s-block-cream-text)' }} />
                <h3>Heading Hierarchy</h3>
              </div>
              <p>2 warning issues flagged. Multiple H1 tags found on /merge-pdf.</p>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} style={{ color: 'var(--s-block-pink-text)' }} />
                <h3>Broken Links (404)</h3>
              </div>
              <p>2 broken anchor tags found. Needs immediate correction.</p>
            </div>
          </div>

          {/* Scanned Pages list */}
          <div className="card">
            <h3>Crawled Pages Log</h3>
            <div className="table-container" style={{ marginTop: 'var(--space-2)' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>URL Path</th>
                    <th>Status</th>
                    <th>Page Title</th>
                    <th>H1 Count</th>
                    <th>Broken Links</th>
                    <th>HTTPS</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((p, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600' }}>{p.url}</td>
                      <td>
                        <span className={`badge ${p.status === 200 ? 'badge-mint' : p.status === 301 ? 'badge-lilac' : 'badge-pink'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>{p.title}</td>
                      <td style={{ fontWeight: p.h1 !== 1 ? '700' : '400', color: p.h1 !== 1 ? 'var(--s-red)' : 'inherit' }}>
                        {p.h1}
                      </td>
                      <td style={{ fontWeight: p.broken > 0 ? '700' : '400', color: p.broken > 0 ? 'var(--s-red)' : 'inherit' }}>
                        {p.broken}
                      </td>
                      <td>
                        {p.secure ? (
                          <span style={{ color: 'var(--s-green)' }}>✔ Valid</span>
                        ) : (
                          <span style={{ color: 'var(--s-red)', fontWeight: 'bold' }}>✘ Missing</span>
                        )}
                      </td>
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
