import React, { useState } from 'react';
import { Building2, Search, Loader2, CheckCircle2, XCircle, AlertTriangle, Globe, Phone, MapPin, Clock } from 'lucide-react';

const API = 'http://127.0.0.1:3001';

interface ListingResult {
  platform: string;
  found: boolean;
  name?: string;
  address?: string;
  phone?: string;
  website?: string;
  hours?: string;
  consistency: 'good' | 'warning' | 'missing';
  issues: string[];
}

const ListingManagement: React.FC = () => {
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState<ListingResult[]>([]);
  const [napScore, setNapScore] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;
    setLoading(true);
    setError('');
    setListings([]);
    setNapScore(null);

    try {
      const res = await fetch(`${API}/api/local/listing-check?business=${encodeURIComponent(businessName)}&city=${encodeURIComponent(city)}`);
      if (!res.ok) throw new Error('Backend error');
      const data = await res.json();
      setListings(data.listings || []);
      setNapScore(data.napScore || null);
    } catch {
      setError('Live check unavailable. Showing NAP analysis sample.');
      setNapScore(72);
      setListings([
        {
          platform: 'Google Business Profile',
          found: true,
          name: businessName,
          address: `123 Main St, ${city || 'New York'}, NY 10001`,
          phone: '+1 (555) 123-4567',
          website: 'https://example.com',
          hours: 'Mon-Fri 9am-6pm',
          consistency: 'good',
          issues: []
        },
        {
          platform: 'Yelp',
          found: true,
          name: businessName,
          address: `123 Main Street, ${city || 'New York'}, NY 10001`,
          phone: '(555) 123-4567',
          website: 'http://example.com',
          hours: 'Mon-Fri 9:00 AM - 6:00 PM',
          consistency: 'warning',
          issues: ['Address format differs from GBP', 'Website uses HTTP not HTTPS']
        },
        {
          platform: 'Apple Maps',
          found: true,
          name: `${businessName} Inc.`,
          address: `123 Main St, ${city || 'New York'}, NY`,
          phone: '+1 555-123-4567',
          consistency: 'warning',
          issues: ['Business name has extra "Inc." suffix', 'Missing ZIP code in address']
        },
        {
          platform: 'Bing Places',
          found: false,
          consistency: 'missing',
          issues: ['Business not found on Bing Places — listing recommended']
        },
        {
          platform: 'Facebook Business',
          found: true,
          name: businessName,
          address: `123 Main St, ${city || 'New York'}, NY 10001`,
          phone: '+1 (555) 123-4567',
          consistency: 'good',
          issues: []
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const consistencyIcon = (c: ListingResult['consistency']) =>
    c === 'good' ? <CheckCircle2 size={16} style={{ color: 'var(--s-green)' }} /> :
    c === 'warning' ? <AlertTriangle size={16} style={{ color: '#fbbf24' }} /> :
    <XCircle size={16} style={{ color: 'var(--s-red)' }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="card-title-row">
        <div>
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--s-on-surface-variant)', letterSpacing: '0.05em' }}>
            Local · Listings
          </span>
          <h1 style={{ fontSize: 'var(--font-headline)', marginTop: '4px', marginBottom: '2px', fontWeight: '700' }}>
            Listing Management
          </h1>
          <p style={{ fontSize: '13px' }}>Check NAP (Name, Address, Phone) consistency across Google, Yelp, Apple Maps and more.</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleCheck} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="card-icon-wrapper"><Building2 size={18} /></div>
            <h3>NAP Consistency Checker</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--s-on-surface-variant)', display: 'block', marginBottom: '6px' }}>Business Name *</label>
              <input type="text" className="input-field" style={{ width: '100%' }}
                placeholder="e.g. Joe's Pizza" value={businessName}
                onChange={(e) => setBusinessName(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--s-on-surface-variant)', display: 'block', marginBottom: '6px' }}>City / State</label>
              <input type="text" className="input-field" style={{ width: '100%' }}
                placeholder="e.g. New York, NY" value={city}
                onChange={(e) => setCity(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
            {loading ? <><Loader2 size={14} className="loading-spinner" /> <span>Checking listings...</span></> : <><Search size={14} /> <span>Check All Listings</span></>}
          </button>
        </form>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'var(--s-block-cream)', borderRadius: '8px', fontSize: '12px', color: 'var(--s-block-cream-text)' }}>
          ⚠ {error}
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '32px', justifyContent: 'center' }}>
          <Loader2 size={20} className="loading-spinner" />
          <span style={{ color: 'var(--s-on-surface-variant)' }}>Scanning business directories...</span>
        </div>
      )}

      {napScore !== null && !loading && (
        <>
          {/* NAP Score */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0,
              border: `6px solid ${napScore >= 80 ? 'var(--s-green)' : napScore >= 60 ? '#fbbf24' : 'var(--s-red)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: '700', color: 'var(--s-on-surface)'
            }}>
              {napScore}
            </div>
            <div>
              <h3 style={{ margin: 0 }}>NAP Consistency Score</h3>
              <p style={{ marginTop: '4px', fontSize: '13px' }}>
                {napScore >= 80 ? '✅ Excellent NAP consistency across platforms.' :
                 napScore >= 60 ? '⚠️ Minor inconsistencies detected. Fix to improve local rankings.' :
                 '❌ Significant NAP issues found. This may harm local search visibility.'}
              </p>
            </div>
          </div>

          {/* Listings Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {listings.map((l, i) => (
              <div key={i} className="card" style={{ gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {consistencyIcon(l.consistency)}
                    <h3 style={{ margin: 0, fontSize: '14px' }}>{l.platform}</h3>
                  </div>
                  <span className={`badge ${l.found ? 'badge-mint' : 'badge-pink'}`} style={{ fontSize: '9px' }}>
                    {l.found ? 'Found' : 'Not Listed'}
                  </span>
                </div>

                {l.found && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: 'var(--s-on-surface-variant)' }}>
                    {l.name && <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><Building2 size={10} /> <span>{l.name}</span></div>}
                    {l.address && <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><MapPin size={10} /> <span>{l.address}</span></div>}
                    {l.phone && <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><Phone size={10} /> <span>{l.phone}</span></div>}
                    {l.website && <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><Globe size={10} /> <span>{l.website}</span></div>}
                    {l.hours && <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><Clock size={10} /> <span>{l.hours}</span></div>}
                  </div>
                )}

                {l.issues.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {l.issues.map((issue, ii) => (
                      <div key={ii} style={{ fontSize: '11px', color: l.consistency === 'missing' ? 'var(--s-red)' : '#fbbf24', display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
                        <span style={{ marginTop: '1px' }}>•</span>
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ListingManagement;
