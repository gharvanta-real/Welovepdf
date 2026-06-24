export function exportToPdf(contentHtml: string, title: string = "Document") {
  if (typeof window === 'undefined') return;

  // Create an iframe to print isolated content
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    console.error("Could not access iframe document context.");
    return;
  }

  // Populate the iframe with the document content and print styles
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: 'Inter', sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #1e293b;
            margin: 0;
            padding: 0;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          a {
            color: #0284c7;
            text-decoration: underline;
          }
          img {
            max-width: 100%;
            page-break-inside: avoid;
            border-radius: 4px;
          }
          h1, h2, h3, h4, h5, h6 {
            color: #0f172a;
            page-break-after: avoid;
            margin-top: 18pt;
            margin-bottom: 8pt;
          }
          p {
            margin-top: 0;
            margin-bottom: 10pt;
          }
          ul, ol {
            margin-top: 0;
            margin-bottom: 10pt;
            padding-left: 20pt;
          }
          li {
            margin-bottom: 4pt;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15pt 0;
            page-break-inside: avoid;
          }
          th, td {
            border: 1px solid #e2e8f0;
            padding: 8pt 10pt;
            text-align: left;
            font-size: 10pt;
          }
          th {
            background-color: #f8fafc !important;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div>${contentHtml}</div>
      </body>
    </html>
  `);
  doc.close();

  // Wait for loading fonts/styles, then print
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    
    // Cleanup iframe after a short delay
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 500);
}
