import { groups, tools, type ToolGroup } from "../data/tools";
import { getToolColor } from "./ToolIcon";

type ToolGridProps = {
  activeGroup: ToolGroup | "All";
  onGroupChange: (group: ToolGroup | "All") => void;
  onToolSelect: (toolName: string) => void;
};

export function ToolGrid({ activeGroup, onGroupChange, onToolSelect }: ToolGridProps) {
  const visibleTools = activeGroup === "All" ? tools : tools.filter((tool) => tool.group === activeGroup);

  return (
    <section className="panel" id="tools">
      <div className="panel-head">
        <div>
          <p className="eyebrow">PDF tools</p>
          <h2>Everything starts from one clean dashboard</h2>
        </div>
        <div className="segmented" aria-label="Tool filters">
          {["All", ...groups].map((group) => (
            <button className={activeGroup === group ? "is-active" : ""} key={group} onClick={() => onGroupChange(group as ToolGroup | "All")}>
              {group}
            </button>
          ))}
        </div>
      </div>
      <div className="tool-grid">
        {visibleTools.map((tool) => {
          const Icon = tool.icon;
          const toolColor = getToolColor(tool.name);
          return (
            <button 
              className="tool-card" 
              key={tool.id} 
              onClick={() => onToolSelect(tool.name)}
              style={{ "--tool-color": toolColor } as React.CSSProperties}
            >
              <span className="tool-icon"><Icon size={21} /></span>
              <strong>{tool.name}</strong>
              <span>{tool.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

