import React, { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Briefcase, GraduationCap, Code, FolderGit, Award, Globe, User } from "lucide-react";
import { ResumeData, WorkExperience, EducationItem, SkillItem, ProjectItem, CertificationItem } from "./types";

interface ResumeFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export function ResumeForm({ data, onChange }: ResumeFormProps) {
  const [activeSection, setActiveSection] = useState<string>("basics");

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? "" : section);
  };

  // Helper to update specific nested keys in the state
  const handleBasicsChange = (key: string, value: string) => {
    onChange({
      ...data,
      basics: {
        ...data.basics,
        [key]: value,
      },
    });
  };

  const handleArrayChange = <T extends { id: string }>(
    section: "work" | "education" | "skills" | "projects" | "certifications",
    id: string,
    field: string,
    value: any
  ) => {
    const updatedArray = data[section].map((item: any) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });

    onChange({
      ...data,
      [section]: updatedArray,
    });
  };

  // Work experience specific handlers
  const addWork = () => {
    const newWork: WorkExperience = {
      id: "w_" + Date.now(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      location: "",
      highlights: [""],
    };
    onChange({
      ...data,
      work: [...data.work, newWork],
    });
  };

  const removeWork = (id: string) => {
    onChange({
      ...data,
      work: data.work.filter((w) => w.id !== id),
    });
  };

  const addHighlight = (workId: string) => {
    const updatedWork = data.work.map((w) => {
      if (w.id === workId) {
        return { ...w, highlights: [...w.highlights, ""] };
      }
      return w;
    });
    onChange({ ...data, work: updatedWork });
  };

  const updateHighlight = (workId: string, index: number, value: string) => {
    const updatedWork = data.work.map((w) => {
      if (w.id === workId) {
        const newHighlights = [...w.highlights];
        newHighlights[index] = value;
        return { ...w, highlights: newHighlights };
      }
      return w;
    });
    onChange({ ...data, work: updatedWork });
  };

  const removeHighlight = (workId: string, index: number) => {
    const updatedWork = data.work.map((w) => {
      if (w.id === workId) {
        return { ...w, highlights: w.highlights.filter((_, idx) => idx !== index) };
      }
      return w;
    });
    onChange({ ...data, work: updatedWork });
  };

  // Education handlers
  const addEducation = () => {
    const newEdu: EducationItem = {
      id: "e_" + Date.now(),
      institution: "",
      area: "",
      studyType: "",
      startDate: "",
      endDate: "",
      gpa: "",
    };
    onChange({
      ...data,
      education: [...data.education, newEdu],
    });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...data,
      education: data.education.filter((e) => e.id !== id),
    });
  };

  // Skills handlers
  const addSkill = () => {
    const newSkill: SkillItem = {
      id: "s_" + Date.now(),
      name: "",
      level: "",
    };
    onChange({
      ...data,
      skills: [...data.skills, newSkill],
    });
  };

  const removeSkill = (id: string) => {
    onChange({
      ...data,
      skills: data.skills.filter((s) => s.id !== id),
    });
  };

  // Projects handlers
  const addProject = () => {
    const newProject: ProjectItem = {
      id: "p_" + Date.now(),
      name: "",
      role: "",
      description: "",
      url: "",
    };
    onChange({
      ...data,
      projects: [...data.projects, newProject],
    });
  };

  const removeProject = (id: string) => {
    onChange({
      ...data,
      projects: data.projects.filter((p) => p.id !== id),
    });
  };

  // Certifications handlers
  const addCertification = () => {
    const newCert: CertificationItem = {
      id: "c_" + Date.now(),
      name: "",
      issuer: "",
      date: "",
    };
    onChange({
      ...data,
      certifications: [...data.certifications, newCert],
    });
  };

  const removeCertification = (id: string) => {
    onChange({
      ...data,
      certifications: data.certifications.filter((c) => c.id !== id),
    });
  };

  return (
    <div className="rb-form-panel">
      {/* 1. BASICS PANEL */}
      <div className={`rb-accordion-section ${activeSection === "basics" ? "open" : ""}`}>
        <button className="rb-accordion-header" onClick={() => toggleSection("basics")}>
          <span className="rb-accordion-title">
            <User size={18} className="rb-header-icon" /> Personal Details
          </span>
          {activeSection === "basics" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {activeSection === "basics" && (
          <div className="rb-accordion-body">
            <div className="rb-form-grid">
              <div className="rb-form-group">
                <label className="rb-input-label">Full Name</label>
                <input
                  type="text"
                  className="rb-form-input"
                  placeholder="e.g. Aman Sharma"
                  value={data.basics.name}
                  onChange={(e) => handleBasicsChange("name", e.target.value)}
                />
              </div>
              <div className="rb-form-group">
                <label className="rb-input-label">Job Title</label>
                <input
                  type="text"
                  className="rb-form-input"
                  placeholder="e.g. Software Engineer"
                  value={data.basics.label}
                  onChange={(e) => handleBasicsChange("label", e.target.value)}
                />
              </div>
              <div className="rb-form-group">
                <label className="rb-input-label">Email Address</label>
                <input
                  type="email"
                  className="rb-form-input"
                  placeholder="e.g. you@email.com"
                  value={data.basics.email}
                  onChange={(e) => handleBasicsChange("email", e.target.value)}
                />
              </div>
              <div className="rb-form-group">
                <label className="rb-input-label">Phone Number</label>
                <input
                  type="text"
                  className="rb-form-input"
                  placeholder="e.g. +91 98765 43210"
                  value={data.basics.phone}
                  onChange={(e) => handleBasicsChange("phone", e.target.value)}
                />
              </div>
              <div className="rb-form-group">
                <label className="rb-input-label">Location (City, State/Country)</label>
                <input
                  type="text"
                  className="rb-form-input"
                  value={data.basics.location}
                  onChange={(e) => handleBasicsChange("location", e.target.value)}
                />
              </div>
              <div className="rb-form-group">
                <label className="rb-input-label">LinkedIn / Website Link</label>
                <input
                  type="text"
                  className="rb-form-input"
                  value={data.basics.url}
                  onChange={(e) => handleBasicsChange("url", e.target.value)}
                />
              </div>
              <div className="rb-form-group span-2">
                <label className="rb-input-label">Professional Summary</label>
                <textarea
                  className="rb-form-textarea"
                  rows={4}
                  value={data.basics.summary}
                  onChange={(e) => handleBasicsChange("summary", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. WORK EXPERIENCE */}
      <div className={`rb-accordion-section ${activeSection === "work" ? "open" : ""}`}>
        <button className="rb-accordion-header" onClick={() => toggleSection("work")}>
          <span className="rb-accordion-title">
            <Briefcase size={18} className="rb-header-icon" /> Work Experience
            {data.work.length > 0 && <span className="rb-section-count">{data.work.length}</span>}
          </span>
          {activeSection === "work" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {activeSection === "work" && (
          <div className="rb-accordion-body">
            {data.work.map((w, index) => (
              <div key={w.id} className="rb-item-card">
                <div className="rb-card-header">
                  <span>Job Role #{index + 1}</span>
                  <button className="rb-delete-btn" onClick={() => removeWork(w.id)}>
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
                <div className="rb-form-grid">
                  <div className="rb-form-group">
                    <label className="rb-input-label">Company Name</label>
                    <input
                      type="text"
                      className="rb-form-input"
                      value={w.company}
                      onChange={(e) => handleArrayChange("work", w.id, "company", e.target.value)}
                    />
                  </div>
                  <div className="rb-form-group">
                    <label className="rb-input-label">Job Title</label>
                    <input
                      type="text"
                      className="rb-form-input"
                      value={w.position}
                      onChange={(e) => handleArrayChange("work", w.id, "position", e.target.value)}
                    />
                  </div>
                  <div className="rb-form-group">
                    <label className="rb-input-label">Start Date (e.g. 2021-01)</label>
                    <input
                      type="text"
                      className="rb-form-input"
                      value={w.startDate}
                      onChange={(e) => handleArrayChange("work", w.id, "startDate", e.target.value)}
                    />
                  </div>
                  <div className="rb-form-group">
                    <label className="rb-input-label">End Date (e.g. Present)</label>
                    <input
                      type="text"
                      className="rb-form-input"
                      value={w.endDate}
                      onChange={(e) => handleArrayChange("work", w.id, "endDate", e.target.value)}
                    />
                  </div>
                  <div className="rb-form-group span-2">
                    <label className="rb-input-label">Location (City, Country)</label>
                    <input
                      type="text"
                      className="rb-form-input"
                      value={w.location}
                      onChange={(e) => handleArrayChange("work", w.id, "location", e.target.value)}
                    />
                  </div>
                  
                  {/* Highlights/Achievements List */}
                  <div className="rb-form-group span-2">
                    <label className="rb-input-label">Key Highlights / Achievements</label>
                    {w.highlights.map((h, hIdx) => (
                      <div key={hIdx} className="rb-highlight-row">
                        <input
                          type="text"
                          className="rb-form-input rb-highlight-input"
                          value={h}
                          placeholder="Describe a key achievement..."
                          onChange={(e) => updateHighlight(w.id, hIdx, e.target.value)}
                        />
                        <button className="rb-trash-btn-only" onClick={() => removeHighlight(w.id, hIdx)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button className="rb-add-sub-btn" onClick={() => addHighlight(w.id)}>
                      <Plus size={14} /> Add Highlight
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button className="rb-add-item-btn" onClick={addWork}>
              <Plus size={16} /> Add Work Experience
            </button>
          </div>
        )}
      </div>

      {/* 3. EDUCATION */}
      <div className={`rb-accordion-section ${activeSection === "education" ? "open" : ""}`}>
        <button className="rb-accordion-header" onClick={() => toggleSection("education")}>
          <span className="rb-accordion-title">
            <GraduationCap size={18} className="rb-header-icon" /> Education
            {data.education.length > 0 && <span className="rb-section-count">{data.education.length}</span>}
          </span>
          {activeSection === "education" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {activeSection === "education" && (
          <div className="rb-accordion-body">
            {data.education.map((edu, index) => (
              <div key={edu.id} className="rb-item-card">
                <div className="rb-card-header">
                  <span>Education #{index + 1}</span>
                  <button className="rb-delete-btn" onClick={() => removeEducation(edu.id)}>
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
                <div className="rb-form-grid">
                  <div className="rb-form-group">
                    <label className="rb-input-label">School / University</label>
                    <input
                      type="text"
                      className="rb-form-input"
                      value={edu.institution}
                      onChange={(e) => handleArrayChange("education", edu.id, "institution", e.target.value)}
                    />
                  </div>
                  <div className="rb-form-group">
                    <label className="rb-input-label">Field of Study / Major</label>
                    <input
                      type="text"
                      className="rb-form-input"
                      value={edu.area}
                      onChange={(e) => handleArrayChange("education", edu.id, "area", e.target.value)}
                    />
                  </div>
                  <div className="rb-form-group">
                    <label className="rb-input-label">Degree (e.g. Bachelor of Science)</label>
                    <input
                      type="text"
                      className="rb-form-input"
                      value={edu.studyType}
                      onChange={(e) => handleArrayChange("education", edu.id, "studyType", e.target.value)}
                    />
                  </div>
                  <div className="rb-form-group">
                    <label className="rb-input-label">Start Date (e.g. 2018-08)</label>
                    <input
                      type="text"
                      className="rb-form-input"
                      placeholder="e.g. 2018-08"
                      value={edu.startDate}
                      onChange={(e) => handleArrayChange("education", edu.id, "startDate", e.target.value)}
                    />
                  </div>
                  <div className="rb-form-group">
                    <label className="rb-input-label">End Date (or Expected)</label>
                    <input
                      type="text"
                      className="rb-form-input"
                      value={edu.endDate}
                      onChange={(e) => handleArrayChange("education", edu.id, "endDate", e.target.value)}
                    />
                  </div>
                  <div className="rb-form-group">
                    <label className="rb-input-label">GPA / Score (Optional)</label>
                    <input
                      type="text"
                      className="rb-form-input"
                      value={edu.gpa}
                      onChange={(e) => handleArrayChange("education", edu.id, "gpa", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button className="rb-add-item-btn" onClick={addEducation}>
              <Plus size={16} /> Add Education Item
            </button>
          </div>
        )}
      </div>

      {/* 4. SKILLS */}
      <div className={`rb-accordion-section ${activeSection === "skills" ? "open" : ""}`}>
        <button className="rb-accordion-header" onClick={() => toggleSection("skills")}>
          <span className="rb-accordion-title">
            <Code size={18} className="rb-header-icon" /> Skills
            {data.skills.length > 0 && <span className="rb-section-count">{data.skills.length}</span>}
          </span>
          {activeSection === "skills" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {activeSection === "skills" && (
          <div className="rb-accordion-body">
            <div className="rb-skills-form-grid">
              {data.skills.map((s) => (
                <div key={s.id} className="rb-skill-row">
                  <input
                    type="text"
                    className="rb-form-input rb-skill-name-input"
                    value={s.name}
                    placeholder="e.g. React.js, Python"
                    onChange={(e) => handleArrayChange("skills", s.id, "name", e.target.value)}
                  />
                  <select
                    className="rb-form-select"
                    value={s.level}
                    onChange={(e) => handleArrayChange("skills", s.id, "level", e.target.value)}
                  >
                    <option value="">No Level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <button className="rb-trash-btn-only" onClick={() => removeSkill(s.id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <button className="rb-add-item-btn" onClick={addSkill} style={{ marginTop: "12px" }}>
              <Plus size={16} /> Add Skill Tag
            </button>
          </div>
        )}
      </div>

      {/* 5. PROJECTS */}
      <div className={`rb-accordion-section ${activeSection === "projects" ? "open" : ""}`}>
        <button className="rb-accordion-header" onClick={() => toggleSection("projects")}>
          <span className="rb-accordion-title">
            <FolderGit size={18} className="rb-header-icon" /> Projects
            {data.projects.length > 0 && <span className="rb-section-count">{data.projects.length}</span>}
          </span>
          {activeSection === "projects" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {activeSection === "projects" && (
          <div className="rb-accordion-body">
            {data.projects.map((p, index) => (
              <div key={p.id} className="rb-item-card">
                <div className="rb-card-header">
                  <span>Project #{index + 1}</span>
                  <button className="rb-delete-btn" onClick={() => removeProject(p.id)}>
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
                <div className="rb-form-grid">
                  <div className="rb-form-group">
                    <label className="rb-input-label">Project Name</label>
                    <input
                      type="text"
                      className="rb-form-input"
                      value={p.name}
                      onChange={(e) => handleArrayChange("projects", p.id, "name", e.target.value)}
                    />
                  </div>
                  <div className="rb-form-group">
                    <label className="rb-input-label">Project URL / Link</label>
                    <input
                      type="text"
                      className="rb-form-input"
                      placeholder="e.g. github.com/username/project"
                      value={p.url}
                      onChange={(e) => handleArrayChange("projects", p.id, "url", e.target.value)}
                    />
                  </div>
                  <div className="rb-form-group span-2">
                    <label className="rb-input-label">Your Role / Technology Used</label>
                    <input
                      type="text"
                      className="rb-form-input"
                      placeholder="e.g. Frontend Developer (React, TailwindCSS)"
                      value={p.role}
                      onChange={(e) => handleArrayChange("projects", p.id, "role", e.target.value)}
                    />
                  </div>
                  <div className="rb-form-group span-2">
                    <label className="rb-input-label">Description</label>
                    <textarea
                      className="rb-form-textarea"
                      rows={3}
                      value={p.description}
                      onChange={(e) => handleArrayChange("projects", p.id, "description", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button className="rb-add-item-btn" onClick={addProject}>
              <Plus size={16} /> Add Project Card
            </button>
          </div>
        )}
      </div>

      {/* 6. CERTIFICATIONS */}
      <div className={`rb-accordion-section ${activeSection === "certifications" ? "open" : ""}`}>
        <button className="rb-accordion-header" onClick={() => toggleSection("certifications")}>
          <span className="rb-accordion-title">
            <Award size={18} className="rb-header-icon" /> Certifications
            {data.certifications.length > 0 && <span className="rb-section-count">{data.certifications.length}</span>}
          </span>
          {activeSection === "certifications" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {activeSection === "certifications" && (
          <div className="rb-accordion-body">
            {data.certifications.map((c, index) => (
              <div key={c.id} className="rb-item-card">
                <div className="rb-card-header">
                  <span>Certification #{index + 1}</span>
                  <button className="rb-delete-btn" onClick={() => removeCertification(c.id)}>
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
                <div className="rb-form-grid">
                  <div className="rb-form-group">
                    <label className="rb-input-label">Certification Name</label>
                    <input
                      type="text"
                      className="rb-form-input"
                      value={c.name}
                      onChange={(e) => handleArrayChange("certifications", c.id, "name", e.target.value)}
                    />
                  </div>
                  <div className="rb-form-group">
                    <label className="rb-input-label">Issuing Authority</label>
                    <input
                      type="text"
                      className="rb-form-input"
                      value={c.issuer}
                      onChange={(e) => handleArrayChange("certifications", c.id, "issuer", e.target.value)}
                    />
                  </div>
                  <div className="rb-form-group">
                    <label className="rb-input-label">Date Earned (e.g. 2024-02)</label>
                    <input
                      type="text"
                      className="rb-form-input"
                      value={c.date}
                      onChange={(e) => handleArrayChange("certifications", c.id, "date", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button className="rb-add-item-btn" onClick={addCertification}>
              <Plus size={16} /> Add Certification
            </button>
          </div>
        )}
      </div>

      {/* 7. LANGUAGES */}
      <div className={`rb-accordion-section ${activeSection === "languages" ? "open" : ""}`}>
        <button className="rb-accordion-header" onClick={() => toggleSection("languages")}>
          <span className="rb-accordion-title">
            <Globe size={18} className="rb-header-icon" /> Languages
          </span>
          {activeSection === "languages" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {activeSection === "languages" && (
          <div className="rb-accordion-body">
            <div className="rb-form-group">
              <label className="rb-input-label">Languages Known (comma separated)</label>
              <input
                type="text"
                className="rb-form-input"
                placeholder="e.g. English (Fluent), Hindi (Native)"
                value={data.languages}
                onChange={(e) => onChange({ ...data, languages: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
