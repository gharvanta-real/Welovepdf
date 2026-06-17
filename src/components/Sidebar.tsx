import { BarChart3, Files, Home, Settings, Workflow } from "lucide-react";

const navItems = [
  { label: "Home", icon: Home },
  { label: "All Tools", icon: Files },
  { label: "Workflows", icon: Workflow },
  { label: "Usage", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  onNavigate: (view: "home" | "workspace") => void;
};

export function Sidebar({ open, onClose, onNavigate }: SidebarProps) {
  return (
    <>
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <div className="sidebar-title">Workspace</div>
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button 
              className={`side-link ${index === 0 ? "is-active" : ""}`} 
              key={item.label}
              onClick={() => {
                if (item.label === "Home" || item.label === "All Tools") {
                  onNavigate("home");
                }
                onClose();
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </aside>
      {open && <button className="scrim" aria-label="Close navigation" onClick={onClose} />}
    </>
  );
}

