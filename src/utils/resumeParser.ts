/**
 * resumeParser.ts
 * 
 * Smart text-based resume parser — extracts structured ResumeData from
 * raw resume text (extracted from PDF or pasted plain text).
 * 
 * Approach: section-boundary detection → field regex extraction.
 * No external NLP library needed.
 */

import { ResumeData, WorkExperience, EducationItem, SkillItem, ProjectItem } from "../components/resume-builder/types";

// ── Unique ID helper ──────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

// ── Section header keywords ───────────────────────────────────────────────────
const SECTION_PATTERNS = {
  work:           /\b(work|experience|employment|professional\s+experience|career|work\s+history|job)\b/i,
  education:      /\b(education|academic|qualification|degree|university|college|schooling)\b/i,
  skills:         /\b(skills?|technologies|technical\s+skills?|competencies|expertise|proficiencies|tech\s+stack)\b/i,
  projects:       /\b(projects?|portfolio|side\s+projects?|personal\s+projects?|key\s+projects?)\b/i,
  certifications: /\b(certifications?|certificates?|licenses?|accreditations?)\b/i,
  languages:      /\b(languages?|language\s+skills?)\b/i,
  summary:        /\b(summary|profile|objective|about|introduction|about\s+me)\b/i,
};

// ── Contact field patterns ────────────────────────────────────────────────────
const EMAIL_RE    = /[\w.+-]+@[\w-]+\.[\w.]{2,}/i;
const PHONE_RE    = /(?:\+?[\d\s\-().]{7,17})/;
const LINKEDIN_RE = /(?:linkedin\.com\/in\/[\w-]+|linkedin\.com\/pub\/[\w-]+)/i;
const GITHUB_RE   = /(?:github\.com\/[\w-]+)/i;
const URL_RE      = /(?:https?:\/\/[\w./-]+|www\.[\w./-]+|[\w-]+\.(?:com|io|dev|me|co|in|net)\/[\w/-]+)/i;

// Common date formats: "Jan 2020", "2020-03", "March 2021 – Present", "2019"
const DATE_RE = /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{4}|\d{4}[-/]\d{2}|\d{4}/gi;

// ── Split text into labelled sections ────────────────────────────────────────
function splitIntoSections(text: string): Record<string, string> {
  const lines = text.split(/\r?\n/);
  const sections: Record<string, string> = { header: "" };
  let currentSection = "header";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect section heading: short line (< 50 chars), possibly all-caps or followed by underline
    if (trimmed.length < 55 && trimmed.length > 2) {
      let matched = false;
      for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
        if (pattern.test(trimmed)) {
          currentSection = key;
          sections[currentSection] = sections[currentSection] || "";
          matched = true;
          break;
        }
      }
      if (matched) continue;
    }

    sections[currentSection] = (sections[currentSection] || "") + "\n" + line;
  }

  return sections;
}

// ── Parse contact/header section ─────────────────────────────────────────────
function parseHeader(headerText: string): Partial<ResumeData["basics"]> {
  const lines = headerText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  const email   = (headerText.match(EMAIL_RE)    || [])[0] || "";
  const phone   = (headerText.match(PHONE_RE)    || [])[0] || "";
  const linkedin = (headerText.match(LINKEDIN_RE) || [])[0] || "";
  const github   = (headerText.match(GITHUB_RE)   || [])[0] || "";
  const url     = linkedin || github || (headerText.match(URL_RE) || [])[0] || "";

  // Name: typically first non-empty line that is NOT an email/phone/url
  const nameLine = lines.find(l =>
    l.length > 1 && l.length < 60 &&
    !EMAIL_RE.test(l) &&
    !PHONE_RE.test(l.replace(/\D/g, "").slice(0, 7) + "x") &&
    !URL_RE.test(l)
  ) || "";

  // Title / label: line after name that is typically a job title
  const nameIdx = lines.indexOf(nameLine);
  const titleLine = lines.find((l, i) =>
    i > nameIdx &&
    i <= nameIdx + 4 &&
    l.length < 80 &&
    !EMAIL_RE.test(l) &&
    !PHONE_RE.test(l) &&
    !URL_RE.test(l)
  ) || "";

  // Location: look for city, state or country patterns
  const locationMatch = headerText.match(/([A-Z][a-zA-Z\s]+,\s*(?:[A-Z]{2}|[A-Za-z\s]+))/);
  const location = locationMatch ? locationMatch[1].trim() : "";

  return {
    name:     nameLine,
    label:    titleLine,
    email:    email.trim(),
    phone:    phone.trim(),
    url:      url.trim(),
    location: location,
    summary:  "",
  };
}

// ── Parse summary section ─────────────────────────────────────────────────────
function parseSummary(text: string): string {
  return text
    .replace(/summary|profile|objective|about me|introduction/gi, "")
    .replace(/[\r\n]+/g, " ")
    .trim()
    .slice(0, 800);
}

// ── Parse work experience section ─────────────────────────────────────────────
function parseWork(text: string): WorkExperience[] {
  const entries: WorkExperience[] = [];
  
  // Split by date patterns or common entry separators
  const blocks = text
    .split(/\n(?=[A-Z][^\n]{5,60}\n|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4}))/g)
    .filter(b => b.trim().length > 20);

  for (const block of blocks) {
    const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    // Dates
    const dates = block.match(DATE_RE) || [];
    const startDate = dates[0] || "";
    const endDate   = dates[1] || (block.match(/present|current|ongoing/i) ? "Present" : "");

    // Company + Position: first 2 meaningful lines
    const metaLines = lines.filter(l => !l.startsWith("•") && !l.startsWith("-") && l.length > 2);
    const company  = metaLines[0] || "";
    const position = metaLines[1] && metaLines[1] !== startDate ? metaLines[1] : "";

    // Highlights: bullet points
    const highlights = lines
      .filter(l => l.startsWith("•") || l.startsWith("-") || l.startsWith("*") || l.match(/^\d+\./))
      .map(l => l.replace(/^[•\-*\d.]+\s*/, "").trim())
      .filter(l => l.length > 10)
      .slice(0, 5);

    if (company.length > 1) {
      entries.push({
        id:         uid(),
        company:    company.slice(0, 80),
        position:   position.slice(0, 80),
        startDate:  formatDate(startDate),
        endDate:    endDate.match(/present/i) ? "Present" : formatDate(endDate),
        location:   "",
        highlights: highlights.length ? highlights : [""],
      });
    }
  }

  return entries.slice(0, 6);
}

// ── Parse education section ───────────────────────────────────────────────────
function parseEducation(text: string): EducationItem[] {
  const entries: EducationItem[] = [];
  const blocks = text.split(/\n\n+/).filter(b => b.trim().length > 15);

  for (const block of blocks) {
    const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const dates = block.match(DATE_RE) || [];

    const institution = lines[0] || "";
    const degreeRaw   = lines[1] || "";

    // Extract GPA
    const gpaMatch = block.match(/(?:gpa|cgpa|score)[:\s]+(\d[\d.]+(?:\s*\/\s*\d[\d.]+)?)/i);
    const gpa = gpaMatch ? gpaMatch[1].trim() : "";

    // Extract degree type
    const degreeTypeMatch = degreeRaw.match(/\b(bachelor|master|b\.?tech|m\.?tech|b\.?sc|m\.?sc|b\.?e|mba|phd|diploma|associate)\b/i);
    const studyType = degreeTypeMatch ? degreeTypeMatch[0] : degreeRaw.split(/\s+in\s+/i)[0] || "";
    const area = degreeRaw.includes(" in ") ? degreeRaw.split(/\s+in\s+/i)[1] || "" : "";

    if (institution.length > 3) {
      entries.push({
        id:          uid(),
        institution: institution.slice(0, 100),
        area:        area.slice(0, 80),
        studyType:   studyType.slice(0, 60),
        startDate:   formatDate(dates[0] || ""),
        endDate:     formatDate(dates[1] || dates[0] || ""),
        gpa:         gpa,
      });
    }
  }

  return entries.slice(0, 4);
}

// ── Parse skills section ──────────────────────────────────────────────────────
function parseSkills(text: string): SkillItem[] {
  // Remove section header words
  const cleaned = text
    .replace(/skills?|technologies|tech\s+stack|competencies/gi, "")
    .replace(/[\r\n]+/g, ", ");

  // Split by common delimiters
  const raw = cleaned.split(/[,|•·\t]+/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 40);

  // Deduplicate
  const seen = new Set<string>();
  const skills: SkillItem[] = [];
  for (const name of raw) {
    const key = name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      skills.push({ id: uid(), name, level: "" });
    }
  }

  return skills.slice(0, 20);
}

// ── Parse projects section ────────────────────────────────────────────────────
function parseProjects(text: string): ProjectItem[] {
  const entries: ProjectItem[] = [];
  const blocks = text.split(/\n\n+/).filter(b => b.trim().length > 15);

  for (const block of blocks) {
    const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const name = lines[0] || "";
    const urlMatch = block.match(URL_RE);
    const description = lines.slice(1).join(" ").replace(/•|-|\*/g, "").trim().slice(0, 300);

    if (name.length > 2) {
      entries.push({
        id:          uid(),
        name:        name.slice(0, 80),
        role:        "",
        description: description,
        url:         urlMatch ? urlMatch[0] : "",
      });
    }
  }

  return entries.slice(0, 5);
}

// ── Parse certifications ──────────────────────────────────────────────────────
function parseCertifications(text: string) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  return lines.slice(0, 5).map(l => {
    const dates = l.match(DATE_RE);
    return {
      id:     uid(),
      name:   l.replace(DATE_RE, "").trim().slice(0, 100),
      issuer: "",
      date:   dates ? formatDate(dates[0]) : "",
    };
  });
}

// ── Parse languages ───────────────────────────────────────────────────────────
function parseLanguages(text: string): string {
  return text
    .replace(/languages?(\s+skills?)?/gi, "")
    .replace(/[\r\n]+/g, ", ")
    .replace(/,\s*,/g, ",")
    .trim()
    .slice(0, 200);
}

// ── Date formatter ────────────────────────────────────────────────────────────
function formatDate(raw: string): string {
  if (!raw) return "";
  const monthMap: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  };

  // Already in YYYY-MM format
  if (/^\d{4}-\d{2}$/.test(raw)) return raw;

  // "Month YYYY" format
  const monthYearMatch = raw.match(/([A-Za-z]+)\s+(\d{4})/);
  if (monthYearMatch) {
    const month = monthMap[monthYearMatch[1].slice(0, 3).toLowerCase()];
    if (month) return `${monthYearMatch[2]}-${month}`;
  }

  // Just a year
  if (/^\d{4}$/.test(raw.trim())) return raw.trim();

  return raw.slice(0, 10);
}

// ── Main export: parse raw text → ResumeData ──────────────────────────────────
export function parseResumeText(rawText: string): ResumeData {
  const sections = splitIntoSections(rawText);

  const basics = parseHeader(sections.header || "");

  // Summary can be in header section or dedicated summary section
  const summaryText = sections.summary || "";
  const summary     = parseSummary(summaryText) || basics.summary || "";

  const work           = parseWork(sections.work || "");
  const education      = parseEducation(sections.education || "");
  const skills         = parseSkills(sections.skills || "");
  const projects       = parseProjects(sections.projects || "");
  const certifications = parseCertifications(sections.certifications || "");
  const languages      = parseLanguages(sections.languages || "");

  return {
    basics: {
      name:     basics.name     || "",
      label:    basics.label    || "",
      email:    basics.email    || "",
      phone:    basics.phone    || "",
      url:      basics.url      || "",
      location: basics.location || "",
      summary,
    },
    work,
    education,
    skills,
    projects,
    certifications,
    languages,
  };
}

// ── PDF text extraction using pdf.js (already in app) ────────────────────────
export async function extractTextFromPdf(file: File): Promise<string> {
  const { getPdfjsLib } = await import("./pdfjs");
  const pdfjsLib = await getPdfjsLib();

  const arrayBuffer = await file.arrayBuffer();
  const typedArray  = new Uint8Array(arrayBuffer);
  const pdf         = await pdfjsLib.getDocument({ data: typedArray }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page    = await pdf.getPage(i);
    const content = await page.getTextContent();
    // Preserve line breaks by grouping items by Y position
    const items = content.items as Array<{ str: string; transform: number[] }>;
    let lastY = -1;
    for (const item of items) {
      const y = item.transform[5];
      if (lastY !== -1 && Math.abs(y - lastY) > 3) {
        fullText += "\n";
      }
      fullText += item.str;
      lastY = y;
    }
    fullText += "\n\n";
  }

  return fullText;
}
