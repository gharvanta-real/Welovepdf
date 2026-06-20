import React, { useState } from 'react';
import { FileJson, Clipboard } from 'lucide-react';
import { toast } from '../../utils/toast';

export const SchemaGeneratorTool: React.FC = () => {
  const [schemaType, setSchemaType] = useState('Article');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const generateSchema = () => {
    const base: any = {
      "@context": "https://schema.org",
      "@type": schemaType,
      "name": title || "Sample Title",
      "url": url || "https://example.com"
    };

    if (schemaType === 'Article') {
      base["author"] = {
        "@type": "Person",
        "name": author || "Author Name"
      };
      base["publisher"] = {
        "@type": "Organization",
        "name": "Organization Name"
      };
    } else if (schemaType === 'LocalBusiness') {
      base["address"] = {
        "@type": "PostalAddress",
        "streetAddress": "123 Main St",
        "addressLocality": "City Name",
        "postalCode": "12345"
      };
    }

    return JSON.stringify(base, null, 2);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateSchema());
    setCopied(true);
    toast.success("JSON-LD Schema copied to clipboard!");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="card-title-row">
        <div>
          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--s-on-surface-variant)', letterSpacing: '0.05em' }}>
            On-Page & Content
          </span>
          <h1 style={{ fontSize: 'var(--font-headline)', marginTop: '4px', marginBottom: '2px', fontWeight: '700' }}>
            Schema JSON-LD Generator
          </h1>
          <p style={{ fontSize: '13px' }}>Create and validate structured data schemas to boost search engine rich snippets appearance.</p>
        </div>
      </div>

      <div className="grid-cols-2">
        {/* Form */}
        <div className="card" style={{ gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="card-icon-wrapper">
              <FileJson size={18} />
            </div>
            <h3>Structured Data Builder</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: '700' }}>Schema Template Type</label>
              <select 
                value={schemaType} 
                onChange={(e) => setSchemaType(e.target.value)}
                className="input-field"
                style={{ paddingRight: '12px' }}
              >
                <option value="Article">Article Schema</option>
                <option value="LocalBusiness">Local Business Schema</option>
                <option value="Product">Product Review Schema</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: '700' }}>Entity Name / Title</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. How to compress pdf files"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: '700' }}>Target URL Link</label>
              <input
                type="url"
                className="input-field"
                placeholder="e.g. https://domain.com/page"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            {schemaType === 'Article' && (
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: '700' }}>Author Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. John Doe"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Code Output */}
        <div className="card" style={{ gap: 'var(--space-4)' }}>
          <div className="card-title-row">
            <h3>Generated JSON-LD Code</h3>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '11px' }}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : <><Clipboard size={12} /> Copy Code</>}
            </button>
          </div>

          <pre 
            style={{ 
              background: 'var(--s-surface-low)', 
              padding: 'var(--space-4)', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '11px', 
              fontFamily: 'monospace',
              overflowX: 'auto',
              flex: 1,
              maxHeight: '300px'
            }}
          >
            {generateSchema()}
          </pre>
        </div>
      </div>
    </div>
  );
};
export default SchemaGeneratorTool;
