// ── Allowed literal union types for template/color/font IDs ──
export type TemplateId = "traditional" | "modern-split" | "executive" | "creative-tech" | "minimalist";
export type ColorSchemeId = "navy" | "emerald" | "slate" | "burgundy" | "royal" | "teal" | "minimal-black";
export type FontFamilyId = "modern" | "classic" | "academic" | "tech" | "creative";
export type SkillLevel = "" | "Beginner" | "Intermediate" | "Expert";

export interface Basics {
  name: string;
  label: string;
  email: string;
  phone: string;
  url: string;
  summary: string;
  location: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  location: string;
  highlights: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  area: string;
  studyType: string;
  startDate: string;  // enrollment / start year
  endDate: string;    // graduation / end year
  gpa: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level: SkillLevel;
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  description: string;
  url: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface ResumeData {
  basics: Basics;
  work: WorkExperience[];
  education: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  languages: string; // comma-separated plain text (e.g. "English (Fluent), Hindi (Native)")
}

export type SpacingMode = "compact" | "normal" | "spacious";

export interface ResumeStyles {
  templateId: TemplateId;
  colorScheme: ColorSchemeId | "custom";
  customColor?: string;
  fontFamily: FontFamilyId | "custom";
  customFontFamily?: string;
  spacing: SpacingMode;
  showIcons: boolean;
  fontSize: "compact" | "normal" | "spacious";
  titleWork?: string;
  titleEducation?: string;
  titleSkills?: string;
  titleProjects?: string;
  titleCertifications?: string;
}

export interface OnboardingState {
  hasExistingResume: boolean | null;
  position: string;
  focus: "recruiters" | "ats" | null;
  selectedTemplateId: TemplateId | null;
}
