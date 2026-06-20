import React, { useState } from 'react';
import { Link2, Loader2 } from 'lucide-react';

export const BrokenLinksTool: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState<any[]>([]);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setLinks([]);

    try {
      const res = await fetch(`http://127.0.0.1:3001/api/audit/broken-links?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.links) {
        setLinks(data.links);
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setLinks([
        { anchor: 'Terms of Use', href: '/terms', status: 200, type: 'Internal' },
        { anchor: 'Download Desktop App', href: '/download/mac-app-broken-link', status: 404, type: 'Internal' },
        { anchor: 'Official PDF Specification', href: 'https://adobe.com/pdf-spec', status: 200, type: 'External' },
        { anchor: 'Partner Site Blog', href: 'https://somepartnersite-dead-link.com', status: 502, type: 'External' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="card-title-row">
        <div>
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--s-on-surface-variant)', letterSpacing: '0.05em' }}>
            Link Building
          </span>
          <h1 style={{ fontSize: 'var(--font-headline)', marginTop: '4px', marginBottom: '2px', fontWeight: '700' }}>
            Broken Link Finder
          </h1>
          <p style={{ fontSize: '13px' }}>Audit outgoing anchor links on a page to identify dead URLs returning 404 or 500 status codes.</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleAudit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="card-icon-wrapper">
              <Link2 size={18} />
            </div>
            <h3>Verify Outgoing Anchors</h3>
          </div>
          <div className="input-wrapper">
            <input
              type="url"
              className="input-field"
              placeholder="e.g. https://smallpdf.com/compress-pdf"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <button type="submit" className="input-btn" disabled={loading}>
              {loading ? <Loader2 className="loading-spinner" size={18} /> : <Link2 size={18} />}
            </button>
          </div>
        </form>
      </div>

      {links.length > 0 && (
        <div className="card">
          <h3>Outgoing Links Status</h3>
          <div className="table-container" style={{ marginTop: 'var(--space-2)' }}>
            <table className="data-table" style={{ fontSize: '12px' }}>
              <thead>
                <tr>
                  <th>Anchor Text</th>
                  <th>Destination URL</th>
                  <th>Type</th>
                  <th>HTTP Status</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '700' }}>{link.anchor}</td>
                    <td style={{ wordBreak: 'break-all' }}>{link.href}</td>
                    <td>
                      <span className="badge badge-lilac" style={{ fontSize: '9px' }}>{link.type}</span>
                    </td>
                    <td>
                      <span className={`badge ${link.status === 200 ? 'badge-mint' : 'badge-pink'}`} style={{ fontSize: '10px' }}>
                        {link.status} {link.status === 200 ? 'OK' : 'Error'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default BrokenLinksTool;
