import React from 'react';
import { ShieldAlert, Crosshair, Users, Globe } from 'lucide-react';

export const Competitor: React.FC = () => {
  return (
    <div className="competitor-page" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-headline)', marginBottom: '4px' }}>Competitor Spy</h1>
        <p>Analyze and benchmark competitor site keywords, sitemaps, and tech profiles.</p>
      </div>

      <div className="grid-cols-3">
        <div className="card">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Crosshair size={20} />
            <h3>Content Gap</h3>
          </div>
          <p>Find which keywords competitors are ranking for but you aren't targeting yet.</p>
          <span className="badge badge-lilac" style={{ alignSelf: 'flex-start' }}>Coming Soon</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Users size={20} />
            <h3>Audience Overlap</h3>
          </div>
          <p>Track common visitors and traffic shares between your selected domains.</p>
          <span className="badge badge-lilac" style={{ alignSelf: 'flex-start' }}>Coming Soon</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Globe size={20} />
            <h3>Tech Profiler</h3>
          </div>
          <p>Identify trackers, JS libraries, and CMS configurations of competitor sites.</p>
          <span className="badge badge-lilac" style={{ alignSelf: 'flex-start' }}>Coming Soon</span>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)' }}>
          <ShieldAlert size={48} style={{ color: 'var(--s-on-surface-variant)', marginBottom: '16px' }} />
          <h3>Competitor Tracking Setup</h3>
          <p style={{ marginTop: '8px', marginBottom: '16px', maxWidth: '400px', textAlign: 'center' }}>
            Configure up to 3 competitor domains in the dashboard header to begin collecting rank comparisons.
          </p>
          <button className="btn btn-secondary" style={{ width: '200px' }}>Setup Competitors</button>
        </div>
      </div>
    </div>
  );
};
