import { X, LogOut, Shield, HardDrive, Settings, HelpCircle, UserCheck } from "lucide-react";
import { useEffect } from "react";

interface AccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { name: string; email: string; plan?: string } | null;
  onLogout: () => void;
  theme: "white" | "light" | "dark";
  setTheme: (theme: "white" | "light" | "dark") => void;
  onSettingsClick: () => void;
}

export function AccountDrawer({ isOpen, onClose, currentUser, onLogout, theme, setTheme, onSettingsClick }: AccountDrawerProps) {
  
  // Close on ESC key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !currentUser) return null;

  const storagePercentage = 12; // 1.2 GB of 10 GB

  return (
    <>
      {/* Backdrop */}
      <div className="drawer-backdrop" onClick={onClose}></div>

      {/* Drawer Box */}
      <div className="account-drawer">
        {/* Header Section */}
        <div className="drawer-header">
          <h3 className="drawer-header-title">Account Details</h3>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="drawer-user-card">
          <div className="drawer-avatar" style={{ backgroundColor: "#0074f0" }}>
            {currentUser.name ? currentUser.name[0].toUpperCase() : currentUser.email[0].toUpperCase()}
          </div>
          <div className="drawer-user-meta">
            <strong className="drawer-user-name">{currentUser.name || currentUser.email.split("@")[0]}</strong>
            <span className="drawer-user-email">{currentUser.email}</span>
            {currentUser.plan && currentUser.plan !== "Free" ? (
              <span className="pro-badge">
                <UserCheck size={12} /> {currentUser.plan.toUpperCase()}
              </span>
            ) : (
              <span className="free-badge" style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-muted)', background: 'var(--border)', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', width: 'fit-content', marginTop: '4px' }}>
                FREE MEMBER
              </span>
            )}
          </div>
        </div>

        {/* Services & Storage Details */}
        <div className="drawer-section">
          <div className="section-header">
            <HardDrive size={16} className="section-icon" />
            <span>Cloud Storage & Services</span>
          </div>
          
          <div className="storage-status-box">
            <div className="storage-labels">
              <span>Storage Used</span>
              <strong>1.2 GB / 10 GB</strong>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${storagePercentage}%` }}></div>
            </div>
            <span className="storage-subtext">Automatic files auto-delete: 7 days backup active.</span>
          </div>

          <ul className="services-list">
            <li className="service-item">
              <span>High-Speed Conversion</span>
              <span className="status-dot green">Active</span>
            </li>
            <li className="service-item">
              <span>Unlimited PDF OCR</span>
              <span className="status-dot green">Active</span>
            </li>
            <li className="service-item">
              <span>AI Document Copilot</span>
              <span className="status-dot green">Active</span>
            </li>
          </ul>
        </div>

        {/* Settings Details */}
        <div className="drawer-section">
          <div className="section-header">
            <Settings size={16} className="section-icon" />
            <span>Preferences & Settings</span>
          </div>

          <div className="theme-toggle-group">
            <span className="theme-label">Appearance</span>
            <div className="theme-segment-buttons">
              <button 
                className={`theme-seg-btn ${theme === "white" ? "active" : ""}`}
                onClick={() => setTheme("white")}
              >
                White
              </button>
              <button 
                className={`theme-seg-btn ${theme === "light" ? "active" : ""}`}
                onClick={() => setTheme("light")}
              >
                Light
              </button>
              <button 
                className={`theme-seg-btn ${theme === "dark" ? "active" : ""}`}
                onClick={() => setTheme("dark")}
              >
                Dark
              </button>
            </div>
          </div>

          <ul className="settings-options-list">
            <li className="settings-option-item" onClick={onSettingsClick}>
              <Shield size={15} />
              <span>Security & Password</span>
            </li>
            <li className="settings-option-item" onClick={() => alert("Support ticket pipeline opened!")}>
              <HelpCircle size={15} />
              <span>Get Support</span>
            </li>
          </ul>
        </div>

        {/* Footer Section */}
        <div className="drawer-footer">
          <button className="logout-drawer-btn" onClick={() => { onLogout(); onClose(); }}>
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>

      </div>
    </>
  );
}
