import { ResumeData, ResumeStyles } from "./types";

export const COLOR_SCHEMES = [
  { id: "navy", name: "Navy Blue", primary: "#1E3A8A", secondary: "#4B5563" },
  { id: "emerald", name: "Emerald Green", primary: "#065F46", secondary: "#374151" },
  { id: "slate", name: "Slate Charcoal", primary: "#1E293B", secondary: "#475569" },
  { id: "burgundy", name: "Burgundy Executive", primary: "#701A75", secondary: "#475569" },
  { id: "royal", name: "Royal Blue", primary: "#2563EB", secondary: "#4B5563" },
  { id: "teal", name: "Teal Tech", primary: "#0F766E", secondary: "#374151" },
  { id: "minimal-black", name: "Minimal Black", primary: "#111827", secondary: "#4B5563" },
];

export const FONT_COMBINATIONS = [
  { id: "modern", name: "Modern Sans (Inter)", headerFont: "Inter, sans-serif", bodyFont: "Inter, sans-serif" },
  { id: "classic", name: "Classic Serif (Georgia)", headerFont: "Georgia, serif", bodyFont: "Georgia, serif" },
  { id: "academic", name: "Playfair & Inter", headerFont: "'Playfair Display', serif", bodyFont: "Inter, sans-serif" },
  { id: "tech", name: "JetBrains Mono", headerFont: "'JetBrains Mono', monospace", bodyFont: "Inter, sans-serif" },
  { id: "creative", name: "Poppins", headerFont: "Poppins, sans-serif", bodyFont: "Poppins, sans-serif" },
];

export const TEMPLATES = [
  { id: "traditional", name: "Traditional", description: "Clean, ATS-friendly single-column layout suitable for all roles.", category: "ats" },
  { id: "modern-split", name: "Modern Split", description: "Clean two-column design with a highlighted left sidebar.", category: "recruiters" },
  { id: "executive", name: "Executive Centered", description: "Formal centered header layout for managers and senior executives.", category: "ats" },
  { id: "creative-tech", name: "Creative Tech", description: "Minimalist spacing with border highlights and accent skill badges.", category: "recruiters" },
  { id: "minimalist", name: "Minimalist", description: "Sleek and highly readable with generous margins and simple layout.", category: "ats" },
];

export const SAMPLE_RESUME_DATA: ResumeData = {
  basics: {
    name: "Aman Sharma",
    label: "Senior Software Engineer",
    email: "aman.sharma@email.com",
    phone: "+91 98765 43210",
    url: "linkedin.com/in/amansharma",
    location: "New Delhi, India",
    summary: "Dedicated and innovative Software Engineer with 5+ years of experience building scalable web applications and distributed systems. Expert in React, TypeScript, Node.js, and cloud architectures. Proven track record of improving application performance and leading agile developer teams."
  },
  work: [
    {
      id: "w1",
      company: "Techify Solutions",
      position: "Lead React Engineer",
      startDate: "2023-03",
      endDate: "Present",
      location: "Bengaluru, India",
      highlights: [
        "Led a team of 4 frontend developers to rebuild the customer portal using React and TypeScript, resulting in a 40% speed improvement.",
        "Created a reusable component library used across 3 products, saving an estimated 150+ developer hours.",
        "Optimized client-side rendering bottlenecks to decrease bundle sizes by 25%."
      ]
    },
    {
      id: "w2",
      company: "Innovate Labs",
      position: "Software Developer",
      startDate: "2021-01",
      endDate: "2023-02",
      location: "Noida, India",
      highlights: [
        "Developed and maintained critical microservices in Node.js, handling over 10,000 requests per minute.",
        "Integrated third-party payment gateways and auth modules using OAuth2 and JWT standards.",
        "Reduced database query execution times by 30% through index optimization and caching."
      ]
    }
  ],
  education: [
    {
      id: "e1",
      institution: "Delhi Technological University",
      area: "Computer Science & Engineering",
      studyType: "Bachelor of Technology",
      startDate: "2016-08",
      endDate: "2020-05",
      gpa: "8.5 / 10.0"
    }
  ],
  skills: [
    { id: "s1", name: "React / Next.js", level: "Expert" },
    { id: "s2", name: "TypeScript & ES6", level: "Expert" },
    { id: "s3", name: "Node.js & Express", level: "Intermediate" },
    { id: "s4", name: "REST APIs & GraphQL", level: "Expert" },
    { id: "s5", name: "PostgreSQL & MongoDB", level: "Intermediate" },
    { id: "s6", name: "AWS (S3, EC2, Lambda)", level: "Intermediate" },
    { id: "s7", name: "Git & CI/CD Pipelines", level: "Expert" },
  ],
  projects: [
    {
      id: "p1",
      name: "PDFMount Converter Engine",
      role: "Lead Creator",
      description: "Built a lightning-fast browser-based PDF converter application that handles secure docx to PDF transformations locally inside WebAssembly.",
      url: "github.com/aman/pdfmount-converter"
    },
    {
      id: "p2",
      name: "TaskManager Dashboard",
      role: "Developer",
      description: "A collaborative project management board using React, Socket.io, and Node.js for real-time task updates and messaging.",
      url: "github.com/aman/taskmanager"
    }
  ],
  certifications: [
    {
      id: "c1",
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2024-02"
    },
    {
      id: "c2",
      name: "Meta Frontend Developer Professional Certificate",
      issuer: "Coursera",
      date: "2022-09"
    }
  ],
  languages: "English (Fluent), Hindi (Native), Spanish (Basic)"
};

// HTML Template Compiler
// HTML Template Compiler (Wrapper supporting systematic overrides)
export function compileResumeToHtml(data: ResumeData, styles: ResumeStyles): string {
  let html = compileResumeToHtmlRaw(data, styles);

  // Apply dynamic section header renames systematically
  if (styles.titleWork) {
    html = html.replace(/Professional Experience<\/h2>/g, `${escapeHtml(styles.titleWork)}</h2>`)
               .replace(/Work Experience<\/h2>/g, `${escapeHtml(styles.titleWork)}</h2>`);
  }
  if (styles.titleEducation) {
    html = html.replace(/Education<\/h2>/g, `${escapeHtml(styles.titleEducation)}</h2>`);
  }
  if (styles.titleSkills) {
    html = html.replace(/Key Skills<\/h2>/g, `${escapeHtml(styles.titleSkills)}</h2>`)
               .replace(/Skills<\/h2>/g, `${escapeHtml(styles.titleSkills)}</h2>`);
  }
  if (styles.titleProjects) {
    html = html.replace(/Key Projects<\/h2>/g, `${escapeHtml(styles.titleProjects)}</h2>`)
               .replace(/Projects<\/h2>/g, `${escapeHtml(styles.titleProjects)}</h2>`);
  }
  if (styles.titleCertifications) {
    html = html.replace(/Certifications &amp; Affiliations<\/h2>/g, `${escapeHtml(styles.titleCertifications)}</h2>`)
               .replace(/Certifications<\/h2>/g, `${escapeHtml(styles.titleCertifications)}</h2>`);
  }

  return html;
}

function compileResumeToHtmlRaw(data: ResumeData, styles: ResumeStyles): string {
  const scheme = COLOR_SCHEMES.find((c) => c.id === styles.colorScheme) || COLOR_SCHEMES[0];
  const fontCombo = { ...(FONT_COMBINATIONS.find((f) => f.id === styles.fontFamily) || FONT_COMBINATIONS[0]) };
  
  // Spacing conversion
  const paddingMap = { compact: "12px", normal: "20px", spacious: "30px" };
  const marginMap = { compact: "8px", normal: "14px", spacious: "20px" };
  const padding = paddingMap[styles.spacing];
  const margin = marginMap[styles.spacing];

  // Colors
  const primaryColor = styles.colorScheme === "custom" && styles.customColor
    ? styles.customColor
    : scheme.primary;
  const secondaryColor = scheme.secondary;
  const textMuted = "#4B5563";
  const lightGrey = "#F3F4F6";

  // Emojis/Icons conditional rendering helpers
  const showIcons = styles.showIcons ?? true;
  const iconPhone = showIcons ? "📞 " : "";
  const iconEmail = showIcons ? "✉️ " : "";
  const iconLocation = showIcons ? "📍 " : "";
  const iconLink = showIcons ? "🔗 " : "";
  const separator = " &nbsp;·&nbsp; ";

  // Web fonts for compiled HTML output (loaded from Google Fonts)
  let fontImports = `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  `;

  // Dynamically resolve custom Google Font if configured
  if (styles.fontFamily === "custom" && styles.customFontFamily) {
    const formattedFont = styles.customFontFamily.trim();
    if (formattedFont) {
      const fontId = formattedFont.replace(/\s+/g, "+");
      fontImports += `
        <link href="https://fonts.googleapis.com/css2?family=${fontId}:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      `;
      fontCombo.headerFont = `'${formattedFont}', sans-serif`;
      fontCombo.bodyFont = `'${formattedFont}', sans-serif`;
    }
  }

  // Check if styles.templateId is a custom dynamic template
  if (typeof window !== "undefined") {
    try {
      const rawCustom = localStorage.getItem("pdfmount_custom_templates");
      if (rawCustom) {
        const customList = JSON.parse(rawCustom);
        const match = customList.find((t: any) => t.id === styles.templateId);
        if (match) {
          let html = match.html;
          // Interpolate standard variables
          html = html.replace(/\{\{basics\.name\}\}/g, escapeHtml(data.basics.name || ""));
          html = html.replace(/\{\{basics\.label\}\}/g, escapeHtml(data.basics.label || ""));
          html = html.replace(/\{\{basics\.email\}\}/g, escapeHtml(data.basics.email || ""));
          html = html.replace(/\{\{basics\.phone\}\}/g, escapeHtml(data.basics.phone || ""));
          html = html.replace(/\{\{basics\.url\}\}/g, escapeHtml(data.basics.url || ""));
          html = html.replace(/\{\{basics\.location\}\}/g, escapeHtml(data.basics.location || ""));
          html = html.replace(/\{\{basics\.summary\}\}/g, escapeHtml(data.basics.summary || ""));
          html = html.replace(/\{\{primaryColor\}\}/g, primaryColor);
          
          // Interpolate work array loops
          const workRegex = /\{\{#each work\}\}([\s\S]*?)\{\{\/each\}\}/g;
          html = html.replace(workRegex, (_: string, inner: string) => {
            return (data.work || []).map(w => {
              let block = inner;
              block = block.replace(/\{\{position\}\}/g, escapeHtml(w.position || ""));
              block = block.replace(/\{\{company\}\}/g, escapeHtml(w.company || ""));
              block = block.replace(/\{\{startDate\}\}/g, escapeHtml(w.startDate || ""));
              block = block.replace(/\{\{endDate\}\}/g, escapeHtml(w.endDate || ""));
              return block;
            }).join("");
          });

          return `${fontImports}${html}`;
        }
      }
    } catch (e) {
      console.error("Error compiling custom template", e);
    }
  }

  // Shared styles
  const baseStyles = `
    --primary-color: ${primaryColor};
    --secondary-color: ${secondaryColor};
    --text-color: #1F2937;
    --text-muted: ${textMuted};
    --border-color: #E5E7EB;
    font-family: ${fontCombo.bodyFont};
    zoom: ${styles.fontSize === "compact" ? "0.9" : styles.fontSize === "spacious" ? "1.1" : "1.0"};
  `;

  // â”€â”€ URL normalization: prevent https://https:// double prefix â”€â”€
  const safeUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  // Compiling helpers (Using tables for metadata rows to preserve structure inside ContentEditable)
  const renderWork = () => {
    if (!data.work || data.work.length === 0) return "";
    return data.work.map(w => `
      <div style="margin-bottom: ${margin}; page-break-inside: avoid;">
        <table style="width: 100%; border-collapse: collapse; border: none; margin: 0; padding: 0; margin-bottom: 4px;">
          <tr>
            <td style="text-align: left; vertical-align: baseline; padding: 0; font-family: ${fontCombo.headerFont};">
              <strong style="font-size: 11pt; color: #111827;">${escapeHtml(w.company)}</strong>
            </td>
            <td style="text-align: right; vertical-align: baseline; padding: 0; font-family: ${fontCombo.headerFont};">
              <span style="font-size: 9.5pt; color: ${secondaryColor}; font-weight: 500;">${escapeHtml(w.startDate)} &mdash; ${escapeHtml(w.endDate)}</span>
            </td>
          </tr>
          <tr>
            <td style="text-align: left; vertical-align: baseline; padding: 0; padding-top: 2px;">
              <span style="font-size: 10pt; color: ${primaryColor}; font-weight: 500; font-style: italic;">${escapeHtml(w.position)}</span>
            </td>
            <td style="text-align: right; vertical-align: baseline; padding: 0; padding-top: 2px;">
              <span style="font-size: 9pt; color: ${textMuted};">${escapeHtml(w.location)}</span>
            </td>
          </tr>
        </table>
        <ul style="margin: 0; padding-left: 18px; font-size: 9.5pt; color: #374151; line-height: 1.5;">
          ${w.highlights.map(h => `<li style="margin-bottom: 2px;">${escapeHtml(h)}</li>`).join("")}
        </ul>
      </div>
    `).join("");
  };

  const renderEducation = () => {
    if (!data.education || data.education.length === 0) return "";
    return data.education.map(e => `
      <div style="margin-bottom: ${margin}; page-break-inside: avoid;">
        <table style="width: 100%; border-collapse: collapse; border: none; margin: 0; padding: 0; margin-bottom: 2px;">
          <tr>
            <td style="text-align: left; vertical-align: baseline; padding: 0; font-family: ${fontCombo.headerFont};">
              <strong style="font-size: 11pt; color: #111827;">${escapeHtml(e.institution)}</strong>
            </td>
            <td style="text-align: right; vertical-align: baseline; padding: 0; font-family: ${fontCombo.headerFont};">
              <span style="font-size: 9.5pt; color: ${secondaryColor}; font-weight: 500;">${escapeHtml(e.startDate)} &mdash; ${escapeHtml(e.endDate)}</span>
            </td>
          </tr>
          <tr>
            <td style="text-align: left; vertical-align: baseline; padding: 0; padding-top: 2px;">
              <span style="font-size: 10pt; color: #374151;">${escapeHtml(e.studyType)} in ${escapeHtml(e.area)}</span>
            </td>
            <td style="text-align: right; vertical-align: baseline; padding: 0; padding-top: 2px;">
              ${e.gpa ? `<span style="font-size: 9pt; color: ${textMuted}; font-weight: 500;">GPA: ${escapeHtml(e.gpa)}</span>` : ""}
            </td>
          </tr>
        </table>
      </div>
    `).join("");
  };

  const renderSkills = (asPills = false) => {
    if (!data.skills || data.skills.length === 0) return "";
    if (asPills) {
      return `
        <div style="margin-top: 4px; line-height: 1.8;">
          ${data.skills.map(s => `
            <span style="background-color: ${lightGrey}; color: ${primaryColor}; border-radius: 4px; padding: 3px 8px; font-size: 8.5pt; font-weight: 500; display: inline-block; margin-right: 6px; margin-bottom: 6px;">
              ${escapeHtml(s.name)}${s.level ? `<span style="opacity:0.65; font-weight:400; margin-left:3px;">(${escapeHtml(s.level)})</span>` : ""}
            </span>
          `).join("")}
        </div>
      `;
    }
    // Inline list with bullet separators â€” use filter+join to avoid trailing bullet
    const skillTokens = data.skills.map(s =>
      `<span style="font-weight: 600; color: #111827;">${escapeHtml(s.name)}</span>${s.level ? ` <span style="color: ${textMuted}; font-size: 8.5pt;">(${escapeHtml(s.level)})</span>` : ""}`
    );
    return `
      <div style="font-size: 9.5pt; color: #374151; line-height: 1.6;">
        ${skillTokens.join(`<span style="color: ${primaryColor}; margin: 0 6px;">&bull;</span>`)}
      </div>
    `;
  };


  const renderProjects = () => {
    if (!data.projects || data.projects.length === 0) return "";
    return data.projects.map(p => `
      <div style="margin-bottom: ${margin}; page-break-inside: avoid;">
        <table style="width: 100%; border-collapse: collapse; border: none; margin: 0; padding: 0; margin-bottom: 2px;">
          <tr>
            <td style="text-align: left; vertical-align: baseline; padding: 0; font-family: ${fontCombo.headerFont};">
              <strong style="font-size: 10.5pt; color: #111827;">${escapeHtml(p.name)}</strong>
            </td>
            <td style="text-align: right; vertical-align: baseline; padding: 0; font-family: ${fontCombo.headerFont};">
              ${p.url ? `<a href="https://${p.url}" target="_blank" style="font-size: 9pt; color: ${primaryColor}; text-decoration: none;">${escapeHtml(p.url)}</a>` : ""}
            </td>
          </tr>
        </table>
        ${p.role ? `<span style="font-size: 9pt; color: ${secondaryColor}; font-weight: 500; display: block; margin-bottom: 2px;">Role: ${escapeHtml(p.role)}</span>` : ""}
        <p style="margin: 0; font-size: 9.5pt; color: #374151; line-height: 1.5;">${escapeHtml(p.description)}</p>
      </div>
    `).join("");
  };

  const renderCertifications = () => {
    if (!data.certifications || data.certifications.length === 0) return "";
    return data.certifications.map(c => `
      <div style="margin-bottom: 8px; page-break-inside: avoid;">
        <table style="width: 100%; border-collapse: collapse; border: none; margin: 0; padding: 0;">
          <tr>
            <td style="text-align: left; vertical-align: middle; padding: 0;">
              <span style="font-size: 9.5pt; color: #111827; font-weight: 500;">
                ${escapeHtml(c.name)} <span style="color: ${textMuted}; font-size: 9pt;">- ${escapeHtml(c.issuer)}</span>
              </span>
            </td>
            <td style="text-align: right; vertical-align: middle; padding: 0;">
              <span style="font-size: 9pt; color: ${secondaryColor}; font-weight: 500;">${escapeHtml(c.date)}</span>
            </td>
          </tr>
        </table>
      </div>
    `).join("");
  };

  // Compile layouts
  if (styles.templateId === "modern-split") {
    // 2-Column Split Layout
    return `${fontImports}
      <div style="${baseStyles} padding: ${padding}; box-sizing: border-box; background-color: #ffffff; color: #1F2937; min-height: 100%;">
        <table style="width: 100%; border-collapse: collapse; border: none; margin: 0; padding: 0;">
          <tr>
            <!-- Sidebar Left -->
            <td style="width: 33%; border-right: 1.5px solid #E5E7EB; padding-right: 20px; text-align: left; vertical-align: top;">
              <div style="margin-bottom: 24px;">
                <h1 style="font-family: ${fontCombo.headerFont}; font-size: 22pt; font-weight: 700; color: ${primaryColor}; margin: 0 0 4px 0; line-height: 1.2;">
                  ${escapeHtml(data.basics.name)}
                </h1>
                <div style="font-size: 10pt; color: ${secondaryColor}; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                  ${escapeHtml(data.basics.label)}
                </div>
              </div>

              <div style="margin-bottom: 20px; font-size: 9pt; color: #374151; line-height: 1.6;">
                <h3 style="font-family: ${fontCombo.headerFont}; font-size: 11pt; color: ${primaryColor}; text-transform: uppercase; border-bottom: 2px solid ${primaryColor}; padding-bottom: 3px; margin: 0 0 10px 0;">Contact</h3>
                <div style="margin-bottom: 6px;">${iconPhone}${escapeHtml(data.basics.phone)}</div>
                <div style="margin-bottom: 6px; word-break: break-all;">${iconEmail}<a href="mailto:${data.basics.email}" style="color: inherit; text-decoration: none;">${escapeHtml(data.basics.email)}</a></div>
                <div style="margin-bottom: 6px;">${iconLocation}${escapeHtml(data.basics.location)}</div>
                ${data.basics.url ? `<div style="word-break: break-all;">${iconLink}<a href="${safeUrl(data.basics.url)}" target="_blank" style="color: ${primaryColor}; text-decoration: none;">${escapeHtml(data.basics.url)}</a></div>` : ""}
              </div>

              <div style="margin-bottom: 20px;">
                <h3 style="font-family: ${fontCombo.headerFont}; font-size: 11pt; color: ${primaryColor}; text-transform: uppercase; border-bottom: 2px solid ${primaryColor}; padding-bottom: 3px; margin: 0 0 10px 0;">Skills</h3>
                ${renderSkills(true)}
              </div>

              ${data.languages ? `
              <div style="margin-bottom: 20px;">
                <h3 style="font-family: ${fontCombo.headerFont}; font-size: 11pt; color: ${primaryColor}; text-transform: uppercase; border-bottom: 2px solid ${primaryColor}; padding-bottom: 3px; margin: 0 0 10px 0;">Languages</h3>
                <div style="font-size: 9.5pt; color: #374151; line-height: 1.4;">${escapeHtml(data.languages)}</div>
              </div>
              ` : ""}
            </td>

            <!-- Main Body Right -->
            <td style="width: 67%; padding-left: 20px; text-align: left; vertical-align: top;">
              ${data.basics.summary ? `
              <div style="margin-bottom: 24px;">
                <p style="margin: 0; font-size: 9.5pt; color: #374151; line-height: 1.6; text-align: justify;">
                  ${escapeHtml(data.basics.summary)}
                </p>
              </div>
              ` : ""}

              <div style="margin-bottom: 24px;">
                <h2 style="font-family: ${fontCombo.headerFont}; font-size: 12pt; color: ${primaryColor}; border-bottom: 1.5px solid #D1D5DB; padding-bottom: 4px; margin: 0 0 12px 0; text-transform: uppercase; font-weight: 600;">Professional Experience</h2>
                ${renderWork()}
              </div>

              <div style="margin-bottom: 24px;">
                <h2 style="font-family: ${fontCombo.headerFont}; font-size: 12pt; color: ${primaryColor}; border-bottom: 1.5px solid #D1D5DB; padding-bottom: 4px; margin: 0 0 12px 0; text-transform: uppercase; font-weight: 600;">Education</h2>
                ${renderEducation()}
              </div>

              ${data.projects && data.projects.length > 0 ? `
              <div style="margin-bottom: 24px;">
                <h2 style="font-family: ${fontCombo.headerFont}; font-size: 12pt; color: ${primaryColor}; border-bottom: 1.5px solid #D1D5DB; padding-bottom: 4px; margin: 0 0 12px 0; text-transform: uppercase; font-weight: 600;">Key Projects</h2>
                ${renderProjects()}
              </div>
              ` : ""}

              ${data.certifications && data.certifications.length > 0 ? `
              <div style="margin-bottom: 24px;">
                <h2 style="font-family: ${fontCombo.headerFont}; font-size: 12pt; color: ${primaryColor}; border-bottom: 1.5px solid #D1D5DB; padding-bottom: 4px; margin: 0 0 12px 0; text-transform: uppercase; font-weight: 600;">Certifications</h2>
                ${renderCertifications()}
              </div>
              ` : ""}
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  if (styles.templateId === "executive") {
    // Centered layout
    return `${fontImports}
      <div style="${baseStyles} padding: ${padding}; box-sizing: border-box; background-color: #ffffff; color: #1F2937; text-align: center; min-height: 100%;">
        <!-- Header -->
        <div style="margin-bottom: 20px; border-bottom: 2px solid ${primaryColor}; padding-bottom: 12px;">
          <h1 style="font-family: ${fontCombo.headerFont}; font-size: 22pt; font-weight: 700; color: ${primaryColor}; margin: 0 0 4px 0;">
            ${escapeHtml(data.basics.name)}
          </h1>
          <div style="font-size: 10.5pt; color: ${secondaryColor}; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
            ${escapeHtml(data.basics.label)}
          </div>
          <div style="font-size: 9pt; color: ${textMuted}; font-family: ${fontCombo.bodyFont}; line-height: 1.4; text-align: center; margin-top: 4px;">
            <span>${iconLocation}${escapeHtml(data.basics.location)}</span>${separator}
            <span>${iconPhone}${escapeHtml(data.basics.phone)}</span>${separator}
            <span>${iconEmail}<a href="mailto:${data.basics.email}" style="color: inherit; text-decoration: none;">${escapeHtml(data.basics.email)}</a></span>
            ${data.basics.url ? `${separator}<span>${iconLink}<a href="${safeUrl(data.basics.url)}" target="_blank" style="color: inherit; text-decoration: none;">${escapeHtml(data.basics.url)}</a></span>` : ""}
          </div>
        </div>

        <!-- Summary -->
        ${data.basics.summary ? `
        <div style="margin-bottom: 20px; text-align: justify; font-size: 9.5pt; color: #374151; line-height: 1.6;">
          ${escapeHtml(data.basics.summary)}
        </div>
        ` : ""}

        <!-- Experience -->
        <div style="margin-bottom: 20px; text-align: left;">
          <h2 style="font-family: ${fontCombo.headerFont}; font-size: 12pt; color: ${primaryColor}; border-bottom: 1px solid #D1D5DB; padding-bottom: 2px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Work Experience</h2>
          ${renderWork()}
        </div>

        <!-- Education -->
        <div style="margin-bottom: 20px; text-align: left;">
          <h2 style="font-family: ${fontCombo.headerFont}; font-size: 12pt; color: ${primaryColor}; border-bottom: 1px solid #D1D5DB; padding-bottom: 2px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Education</h2>
          ${renderEducation()}
        </div>

        <!-- Skills -->
        <div style="margin-bottom: 20px; text-align: left;">
          <h2 style="font-family: ${fontCombo.headerFont}; font-size: 12pt; color: ${primaryColor}; border-bottom: 1px solid #D1D5DB; padding-bottom: 2px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Skills & Core Competencies</h2>
          ${renderSkills(false)}
        </div>

        <!-- Projects & Certs -->
        ${data.projects && data.projects.length > 0 ? `
        <div style="margin-bottom: 20px; text-align: left;">
          <h2 style="font-family: ${fontCombo.headerFont}; font-size: 12pt; color: ${primaryColor}; border-bottom: 1px solid #D1D5DB; padding-bottom: 2px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Key Projects</h2>
          ${renderProjects()}
        </div>
        ` : ""}

        ${data.certifications && data.certifications.length > 0 ? `
        <div style="margin-bottom: 20px; text-align: left;">
          <h2 style="font-family: ${fontCombo.headerFont}; font-size: 12pt; color: ${primaryColor}; border-bottom: 1px solid #D1D5DB; padding-bottom: 2px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Certifications</h2>
          ${renderCertifications()}
        </div>
        ` : ""}

        ${data.languages ? `
        <div style="margin-bottom: 20px; text-align: left;">
          <h2 style="font-family: ${fontCombo.headerFont}; font-size: 12pt; color: ${primaryColor}; border-bottom: 1px solid #D1D5DB; padding-bottom: 2px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Languages</h2>
          <div style="font-size: 9.5pt; color: #374151; line-height: 1.6;">${escapeHtml(data.languages)}</div>
        </div>
        ` : ""}
      </div>
    `;
  }

  if (styles.templateId === "creative-tech") {
    // Creative layout with dynamic header blocks
    return `${fontImports}
      <div style="${baseStyles} padding: ${padding}; box-sizing: border-box; background-color: #ffffff; color: #1F2937; text-align: left; min-height: 100%;">
        <!-- Banner Header -->
        <div style="background-color: ${lightGrey}; border-left: 6px solid ${primaryColor}; padding: 16px 20px; margin-bottom: 24px; border-radius: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
              <h1 style="font-family: ${fontCombo.headerFont}; font-size: 22pt; font-weight: 700; color: ${primaryColor}; margin: 0 0 2px 0;">
                ${escapeHtml(data.basics.name)}
              </h1>
              <div style="font-size: 10.5pt; color: ${secondaryColor}; font-weight: 600;">
                ${escapeHtml(data.basics.label)}
              </div>
            </div>
            <div style="font-size: 9pt; color: ${textMuted}; line-height: 1.4; text-align: right;">
              <div>${iconLocation}${escapeHtml(data.basics.location)}</div>
              <div>${iconPhone}${escapeHtml(data.basics.phone)}</div>
              <div>${iconEmail}<a href="mailto:${data.basics.email}" style="color: ${primaryColor}; text-decoration: none;">${escapeHtml(data.basics.email)}</a></div>
              ${data.basics.url ? `<div>${iconLink}<a href="${safeUrl(data.basics.url)}" target="_blank" style="color: inherit; text-decoration: none;">${escapeHtml(data.basics.url)}</a></div>` : ""}
            </div>
          </div>
        </div>

        <!-- Summary -->
        ${data.basics.summary ? `
        <div style="margin-bottom: 24px;">
          <p style="margin: 0; font-size: 9.5pt; color: #374151; line-height: 1.6;">
            ${escapeHtml(data.basics.summary)}
          </p>
        </div>
        ` : ""}

        <!-- Content Split (Using Table for ContentEditable stability) -->
        <table style="width: 100%; border-collapse: collapse; border: none; margin: 0; padding: 0;">
          <tr>
            <!-- Main Content Left -->
            <td style="width: 65%; padding-right: 20px; text-align: left; vertical-align: top;">
              <div style="margin-bottom: 24px;">
                <h2 style="font-family: ${fontCombo.headerFont}; font-size: 12pt; color: ${primaryColor}; border-bottom: 1.5px solid ${primaryColor}; padding-bottom: 3px; margin: 0 0 12px 0; font-weight: 600;">Work History</h2>
                ${renderWork()}
              </div>

              ${data.projects && data.projects.length > 0 ? `
              <div style="margin-bottom: 24px;">
                <h2 style="font-family: ${fontCombo.headerFont}; font-size: 12pt; color: ${primaryColor}; border-bottom: 1.5px solid ${primaryColor}; padding-bottom: 3px; margin: 0 0 12px 0; font-weight: 600;">Projects</h2>
                ${renderProjects()}
              </div>
              ` : ""}
            </td>

            <!-- Sidebar Right -->
            <td style="width: 35%; text-align: left; vertical-align: top;">
              <div style="margin-bottom: 24px;">
                <h2 style="font-family: ${fontCombo.headerFont}; font-size: 11pt; color: ${primaryColor}; border-bottom: 1.5px solid ${primaryColor}; padding-bottom: 3px; margin: 0 0 12px 0; font-weight: 600;">Skills</h2>
                ${renderSkills(true)}
              </div>

              <div style="margin-bottom: 24px;">
                <h2 style="font-family: ${fontCombo.headerFont}; font-size: 11pt; color: ${primaryColor}; border-bottom: 1.5px solid ${primaryColor}; padding-bottom: 3px; margin: 0 0 12px 0; font-weight: 600;">Education</h2>
                ${renderEducation()}
              </div>

              ${data.certifications && data.certifications.length > 0 ? `
              <div style="margin-bottom: 24px;">
                <h2 style="font-family: ${fontCombo.headerFont}; font-size: 11pt; color: ${primaryColor}; border-bottom: 1.5px solid ${primaryColor}; padding-bottom: 3px; margin: 0 0 12px 0; font-weight: 600;">Certificates</h2>
                <div style="font-size: 9pt; color: #374151;">
                  ${data.certifications.map(c => `
                    <div style="margin-bottom: 6px;">
                      <div style="font-weight: 600; color: #111827;">${escapeHtml(c.name)}</div>
                      <div style="color: ${textMuted}; font-size: 8.5pt;">${escapeHtml(c.issuer)} (${escapeHtml(c.date)})</div>
                    </div>
                  `).join("")}
                </div>
              </div>
              ` : ""}

              ${data.languages ? `
              <div>
                <h2 style="font-family: ${fontCombo.headerFont}; font-size: 11pt; color: ${primaryColor}; border-bottom: 1.5px solid ${primaryColor}; padding-bottom: 3px; margin: 0 0 12px 0; font-weight: 600;">Languages</h2>
                <div style="font-size: 9.5pt; color: #374151; line-height: 1.4;">${escapeHtml(data.languages)}</div>
              </div>
              ` : ""}
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  if (styles.templateId === "minimalist") {
    // Minimalist layout
    return `${fontImports}
      <div style="${baseStyles} padding: ${padding}; box-sizing: border-box; background-color: #ffffff; color: #1F2937; text-align: left; min-height: 100%;">
        <div style="margin-bottom: 20px;">
          <h1 style="font-family: ${fontCombo.headerFont}; font-size: 22pt; font-weight: 600; color: ${primaryColor}; margin: 0 0 4px 0;">
            ${escapeHtml(data.basics.name)}
          </h1>
          <div style="font-size: 11pt; color: ${secondaryColor}; font-weight: 500; margin-bottom: 12px;">
            ${escapeHtml(data.basics.label)}
          </div>
          <div style="font-size: 9pt; color: ${textMuted}; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; font-family: ${fontCombo.bodyFont}; line-height: 1.4; margin-top: 4px;">
            <span>${iconLocation}${escapeHtml(data.basics.location)}</span> &nbsp;·&nbsp;
            <span>${iconPhone}${escapeHtml(data.basics.phone)}</span> &nbsp;·&nbsp;
            <span>${iconEmail}<a href="mailto:${data.basics.email}" style="color: inherit; text-decoration: none;">${escapeHtml(data.basics.email)}</a></span>
            ${data.basics.url ? ` &nbsp;·&nbsp; <span>${iconLink}<a href="https://${data.basics.url}" target="_blank" style="color: inherit; text-decoration: none;">${escapeHtml(data.basics.url)}</a></span>` : ""}
          </div>
        </div>

        ${data.basics.summary ? `
        <div style="margin-bottom: 20px; font-size: 9.5pt; color: #374151; line-height: 1.5;">
          ${escapeHtml(data.basics.summary)}
        </div>
        ` : ""}

        <div style="margin-bottom: 20px;">
          <h2 style="font-family: ${fontCombo.headerFont}; font-size: 11pt; color: ${primaryColor}; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Experience</h2>
          ${renderWork()}
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="font-family: ${fontCombo.headerFont}; font-size: 11pt; color: ${primaryColor}; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Education</h2>
          ${renderEducation()}
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="font-family: ${fontCombo.headerFont}; font-size: 11pt; color: ${primaryColor}; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Skills</h2>
          ${renderSkills(false)}
        </div>

        ${data.projects && data.projects.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-family: ${fontCombo.headerFont}; font-size: 11pt; color: ${primaryColor}; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Projects</h2>
          ${renderProjects()}
        </div>
        ` : ""}

        ${data.certifications && data.certifications.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h2 style="font-family: ${fontCombo.headerFont}; font-size: 11pt; color: ${primaryColor}; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Certifications</h2>
          ${renderCertifications()}
        </div>
        ` : ""}
      </div>
    `;
  }

  // DEFAULT: Traditional layout
  return `${fontImports}
    <div style="${baseStyles} padding: ${padding}; box-sizing: border-box; background-color: #ffffff; color: #1F2937; text-align: left; min-height: 100%;">
      <!-- Header (Using Table for ContentEditable stability) -->
      <table style="width: 100%; border-collapse: collapse; border: none; margin: 0; padding: 0; margin-bottom: 20px; border-bottom: 3px solid ${primaryColor};">
        <tr>
          <td style="text-align: left; vertical-align: bottom; padding: 0; padding-bottom: 8px; width: 65%;">
            <h1 style="font-family: ${fontCombo.headerFont}; font-size: 24pt; font-weight: 700; color: ${primaryColor}; margin: 0 0 2px 0; line-height: 1.1;">
              ${escapeHtml(data.basics.name)}
            </h1>
            <div style="font-size: 11pt; color: ${secondaryColor}; font-weight: 600;">
              ${escapeHtml(data.basics.label)}
            </div>
          </td>
          <td style="text-align: right; vertical-align: bottom; padding: 0; padding-bottom: 8px; font-size: 9pt; color: ${textMuted}; line-height: 1.4; width: 35%;">
            <div>${iconLocation}${escapeHtml(data.basics.location)}</div>
            <div>${iconPhone}${escapeHtml(data.basics.phone)}</div>
            <div>${iconEmail}<a href="mailto:${data.basics.email}" style="color: inherit; text-decoration: none;">${escapeHtml(data.basics.email)}</a></div>
            ${data.basics.url ? `<div>${iconLink}<a href="https://${data.basics.url}" target="_blank" style="color: inherit; text-decoration: none;">${escapeHtml(data.basics.url)}</a></div>` : ""}
          </td>
        </tr>
      </table>

      <!-- Summary -->
      ${data.basics.summary ? `
      <div style="margin-bottom: 22px;">
        <p style="margin: 0; font-size: 9.5pt; color: #374151; line-height: 1.5; text-align: justify;">
          ${escapeHtml(data.basics.summary)}
        </p>
      </div>
      ` : ""}

      <!-- Work Experience -->
      ${data.work && data.work.length > 0 ? `
      <div style="margin-bottom: 22px;">
        <h2 style="font-family: ${fontCombo.headerFont}; font-size: 12pt; color: ${primaryColor}; border-bottom: 1px solid #D1D5DB; padding-bottom: 2px; margin: 0 0 10px 0; text-transform: uppercase; font-weight: 600;">Work Experience</h2>
        ${renderWork()}
      </div>
      ` : ""}

      <!-- Education -->
      ${data.education && data.education.length > 0 ? `
      <div style="margin-bottom: 22px;">
        <h2 style="font-family: ${fontCombo.headerFont}; font-size: 12pt; color: ${primaryColor}; border-bottom: 1px solid #D1D5DB; padding-bottom: 2px; margin: 0 0 10px 0; text-transform: uppercase; font-weight: 600;">Education</h2>
        ${renderEducation()}
      </div>
      ` : ""}

      <!-- Skills -->
      ${data.skills && data.skills.length > 0 ? `
      <div style="margin-bottom: 22px;">
        <h2 style="font-family: ${fontCombo.headerFont}; font-size: 12pt; color: ${primaryColor}; border-bottom: 1px solid #D1D5DB; padding-bottom: 2px; margin: 0 0 10px 0; text-transform: uppercase; font-weight: 600;">Skills</h2>
        ${renderSkills(false)}
      </div>
      ` : ""}

      <!-- Projects -->
      ${data.projects && data.projects.length > 0 ? `
      <div style="margin-bottom: 22px;">
        <h2 style="font-family: ${fontCombo.headerFont}; font-size: 12pt; color: ${primaryColor}; border-bottom: 1px solid #D1D5DB; padding-bottom: 2px; margin: 0 0 10px 0; text-transform: uppercase; font-weight: 600;">Key Projects</h2>
        ${renderProjects()}
      </div>
      ` : ""}

      <!-- Certifications -->
      ${data.certifications && data.certifications.length > 0 ? `
      <div style="margin-bottom: 22px;">
        <h2 style="font-family: ${fontCombo.headerFont}; font-size: 12pt; color: ${primaryColor}; border-bottom: 1px solid #D1D5DB; padding-bottom: 2px; margin: 0 0 10px 0; text-transform: uppercase; font-weight: 600;">Certifications & Affiliations</h2>
        ${renderCertifications()}
      </div>
      ` : ""}

      <!-- Languages -->
      ${data.languages ? `
      <div style="margin-bottom: 22px;">
        <h2 style="font-family: ${fontCombo.headerFont}; font-size: 12pt; color: ${primaryColor}; border-bottom: 1px solid #D1D5DB; padding-bottom: 2px; margin: 0 0 10px 0; text-transform: uppercase; font-weight: 600;">Languages</h2>
        <div style="font-size: 9.5pt; color: #374151; line-height: 1.6;">${escapeHtml(data.languages)}</div>
      </div>
      ` : ""}
    </div>
  `;
}

// Simple HTML escaping helper to prevent script injection in generated HTML
function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ── DYNAMIC EXPORT: Mutate TEMPLATES list at initialization so custom layouts are registerable ──
if (typeof window !== "undefined") {
  const syncCustomTemplates = () => {
    try {
      const raw = localStorage.getItem("pdfmount_custom_templates");
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.forEach((t: any) => {
          // If active, add to TEMPLATES list so users can select it
          if (t.status === "Active" && !TEMPLATES.some(existing => existing.id === t.id)) {
            TEMPLATES.push({
              id: t.id,
              name: t.name,
              description: t.description,
              category: "ats"
            });
          }
        });
      }
    } catch (e) {
      console.error("Failed to sync custom templates to TEMPLATES list", e);
    }
  };

  syncCustomTemplates();
  // Listen for admin changes to dynamically update in the same session
  window.addEventListener("pdfmount_templates_updated", syncCustomTemplates);
}


