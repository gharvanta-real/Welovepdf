import React from "react";

interface EditMetadataSettingsProps {
  metadataTitle: string;
  setMetadataTitle: (val: string) => void;
  metadataAuthor: string;
  setMetadataAuthor: (val: string) => void;
  metadataSubject: string;
  setMetadataSubject: (val: string) => void;
  metadataKeywords: string;
  setMetadataKeywords: (val: string) => void;
}

export function EditMetadataSettings({
  metadataTitle,
  setMetadataTitle,
  metadataAuthor,
  setMetadataAuthor,
  metadataSubject,
  setMetadataSubject,
  metadataKeywords,
  setMetadataKeywords,
}: EditMetadataSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Document Title</label>
      <input
        type="text"
        className="options-input"
        value={metadataTitle}
        onChange={(e) => setMetadataTitle(e.target.value)}
        placeholder="Enter PDF Title..."
        style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
      />
      
      <label className="options-label" style={{ marginTop: "14px", display: "block" }}>Author / Creator</label>
      <input
        type="text"
        className="options-input"
        value={metadataAuthor}
        onChange={(e) => setMetadataAuthor(e.target.value)}
        placeholder="Enter Author Name..."
        style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
      />

      <label className="options-label" style={{ marginTop: "14px", display: "block" }}>Subject</label>
      <input
        type="text"
        className="options-input"
        value={metadataSubject}
        onChange={(e) => setMetadataSubject(e.target.value)}
        placeholder="Enter Subject..."
        style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
      />

      <label className="options-label" style={{ marginTop: "14px", display: "block" }}>Keywords (comma separated)</label>
      <input
        type="text"
        className="options-input"
        value={metadataKeywords}
        onChange={(e) => setMetadataKeywords(e.target.value)}
        placeholder="pdf, docs, report..."
        style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
      />
    </div>
  );
}
