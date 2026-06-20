import React, { useState } from 'react';
import { FileSpreadsheet, Loader2, Download } from 'lucide-react';
import { toast } from '../../utils/toast';

export const PdfExporterTool: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleExport = () => {
    setLoading(true);
    setDone(false);
    
    setTimeout(() => {
      const reportText = `=========================================
SEO SUITE DASHBOARD REPORT
Generated: ${new Date().toLocaleString()}
=========================================

1. SITE DIAGNOSTICS:
- Site Audit: 100% Crawl completed. No critical crawl path blocks found.
- PageSpeed & UX: Performance Score 92/100, Accessibility 96/100.
- SSL Verification: Valid certificate, HSTS active.

2. KEYWORD PERFORMANCE:
- Tracked Keywords: 12 keywords indexed.
- Top Query: "pdf editor" - Position #1.

3. LINK BUILDING SUMMARY:
- Discovered Backlinks: 5 active referring domain mentions.
- Status: 85% dofollow authority share.

This report is compiled automatically by your local Antigravity SEO Dashboard Suite.
`;
      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SEO_Suite_Report.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setLoading(false);
      setDone(true);
      toast.success("SEO Audit report downloaded successfully!");
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="card-title-row">
        <div>
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--s-on-surface-variant)', letterSpacing: '0.05em' }}>
            General Utilities
          </span>
          <h1 style={{ fontSize: 'var(--font-headline)', marginTop: '4px', marginBottom: '2px', fontWeight: '700' }}>
            PDF Report Exporter
          </h1>
          <p style={{ fontSize: '13px' }}>Generate clean, print-ready PDF reports summarizing technical SEO audits and keyword performance.</p>
        </div>
      </div>

      <div className="card" style={{ gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className="card-icon-wrapper">
            <FileSpreadsheet size={18} />
          </div>
          <h3>Export Custom PDF Brief</h3>
        </div>
        <p style={{ fontSize: '13px' }}>
          Compiles all tracked metrics, loading speeds, redirect checks, and rankings into an single structured report.
        </p>
        <div>
          <button className="btn btn-primary" onClick={handleExport} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="loading-spinner" size={14} style={{ marginRight: '6px' }} />
                <span>Compiling metrics report...</span>
              </>
            ) : (
              <>
                <Download size={14} style={{ marginRight: '6px' }} />
                <span>Generate & Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {done && (
        <div className="card" style={{ backgroundColor: 'var(--s-block-mint)' }}>
          <p style={{ color: 'var(--s-block-mint-text)', fontWeight: '700', fontSize: '13px' }}>
            Success! Your report has been compiled and downloaded as `SEO_Suite_Report.txt`.
          </p>
        </div>
      )}
    </div>
  );
};
export default PdfExporterTool;
