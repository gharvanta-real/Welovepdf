import React from "react";

interface TranslateSettingsProps {
  translateLang: string;
  setTranslateLang: (val: string) => void;
}

export function TranslateSettings({
  translateLang,
  setTranslateLang,
}: TranslateSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Target Language</label>
      <select
        className="options-select"
        value={translateLang}
        onChange={(e) => setTranslateLang(e.target.value)}
        style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--c-bg)", color: "var(--c-text)", marginTop: "4px" }}
      >
        <option value="hi">Hindi (हिन्दी)</option>
        <option value="es">Spanish (Español)</option>
        <option value="fr">French (Français)</option>
        <option value="de">German (Deutsch)</option>
      </select>
    </div>
  );
}
