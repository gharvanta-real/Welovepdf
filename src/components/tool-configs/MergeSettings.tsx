import React from "react";

interface MergeSettingsProps {
  fileNameStamps: boolean;
  setFileNameStamps: (val: boolean) => void;
  includeTOC: boolean;
  setIncludeTOC: (val: boolean) => void;
}

export function MergeSettings({
  fileNameStamps,
  setFileNameStamps,
  includeTOC,
  setIncludeTOC,
}: MergeSettingsProps) {
  return (
    <div className="options-group">
      <label className="options-label">Merge Options</label>
      <div className="options-checkbox-list">
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={fileNameStamps}
            onChange={(e) => setFileNameStamps(e.target.checked)}
          />
          <span>Add filename stamps to page corners</span>
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={includeTOC}
            onChange={(e) => setIncludeTOC(e.target.checked)}
          />
          <span>Include a table of contents page</span>
        </label>
      </div>
    </div>
  );
}
