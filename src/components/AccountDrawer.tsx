import { X, LogOut, Shield, HardDrive, Settings, HelpCircle, UserCheck } from "lucide-react";
import { useEffect } from "react";

interface AccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { name: string; email: string; plan?: string } | null;
  onLogout: () => void;
  onSettingsClick: () => void;
}

export function AccountDrawer({ isOpen, onClose, currentUser, onLogout, onSettingsClick }: AccountDrawerProps) {
  
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
            <X size={18} />
          </button>
        </div>

        {/* User Card */}
        <div className="drawer-user-card">
          <div className="drawer-avatar dynamic-avatar-gradient" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "55%", height: "55%" }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="drawer-user-meta">
            <strong className="drawer-user-name">{currentUser.name || currentUser.email.split("@")[0]}</strong>
            <span className="drawer-user-email">{currentUser.email}</span>
            {currentUser.plan && currentUser.plan !== "Free" ? (
              <span className="pro-badge">
                <UserCheck size={12} /> {currentUser.plan.toUpperCase()}
              </span>
            ) : (
              <span className="free-badge">
                FREE MEMBER
              </span>
            )}
          </div>
        </div>

        {/* Services & Storage Details */}
        <div className="drawer-section">
          <div className="section-header">
            <div className="settings-icon-wrapper storage-color">
              <HardDrive size={14} />
            </div>
            <span>Cloud Storage & Services</span>
          </div>
          
          <div className="storage-status-box">
            <div className="storage-labels">
              <span>Storage Used</span>
              <strong>1.2 GB / 10 GB</strong>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill dynamic-progress-gradient" style={{ width: `${storagePercentage}%` }}></div>
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
          </ul>
        </div>

        {/* Settings Details */}
        <div className="drawer-section">
          <div className="section-header">
            <div className="settings-icon-wrapper preferences-color">
              <Settings size={14} />
            </div>
            <span>Preferences & Settings</span>
          </div>


          <ul className="settings-options-list">
            <li className="settings-option-item" onClick={onSettingsClick}>
              <div className="settings-icon-wrapper security-color">
                <Shield size={14} />
              </div>
              <span>Security & Password</span>
            </li>
            <li className="settings-option-item" onClick={() => alert("Support ticket pipeline opened!")}>
              <div className="settings-icon-wrapper support-color">
                <HelpCircle size={14} />
              </div>
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

