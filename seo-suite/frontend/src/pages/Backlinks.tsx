import React from 'react';
import { Link2, Sparkles, Anchor } from 'lucide-react';

export const Backlinks: React.FC = () => {
  return (
    <div className="backlinks-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-headline)', marginBottom: '4px' }}>Backlink Explorer</h1>
        <p>Monitor external links pointing to your domain and analyze anchor text distributions.</p>
      </div>

      <div className="grid-cols-2">
        <div className="card">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Anchor size={20} />
            <h3>Anchor Text Cloud</h3>
          </div>
          <p>Scan and cluster words competitors use to link to you.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
            <span className="badge badge-mint" style={{ fontSize: '18px', padding: '6px 12px' }}>pdf editor</span>
            <span className="badge badge-lime" style={{ fontSize: '14px', padding: '4px 10px' }}>compress file</span>
            <span className="badge badge-lilac" style={{ fontSize: '16px', padding: '5px 11px' }}>merge pdf</span>
            <span className="badge badge-cream" style={{ fontSize: '12px', padding: '3px 8px' }}>online pdf converter</span>
            <span className="badge badge-pink" style={{ fontSize: '10px', padding: '2px 6px' }}>click here</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link2 size={20} />
            <h3>Referring Domains</h3>
          </div>
          <p>Analyze TLD spreads (.com vs .org vs country codes) linking back to you.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span>Commercial (.com)</span>
                <span>74%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--s-surface-low)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '74%', background: 'var(--s-primary)' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span>Organizations (.org)</span>
                <span>18%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--s-surface-low)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '18%', background: 'var(--s-primary)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)' }}>
        <Sparkles size={40} style={{ color: 'var(--s-on-surface-variant)', marginBottom: '16px' }} />
        <h3>Local Crawl Links</h3>
        <p style={{ marginTop: '8px', marginBottom: '16px', maxWidth: '500px', textAlign: 'center', fontSize: 'var(--font-body)' }}>
          To build backlinks locally for free, we scan Google index using queries like `"domain.com" -site:domain.com` to see who references you.
        </p>
        <button className="btn btn-primary" style={{ width: '220px' }}>Search Backlink Mentions</button>
      </div>
    </div>
  );
};
