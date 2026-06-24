import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, User, Shield, CreditCard, Bell, LogOut, CheckCircle2, Key, ToggleLeft, ToggleRight, Smartphone, Laptop, Crown, Tag } from "lucide-react";

interface AccountSettingsPageProps {
  onBack: () => void;
  currentUser: { name: string; email: string; plan?: string } | null;
  onLogout: () => void;
  onUpdateUser?: (user: { name: string; email: string; plan?: string }) => void;
  onPricingClick?: () => void;
}

type SettingsTab = "profile" | "billing" | "security" | "notifications";

export function AccountSettingsPage({ onBack, currentUser, onLogout, onUpdateUser, onPricingClick }: AccountSettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => localStorage.getItem("userAvatar"));
  const [toastMsg, setToastMsg] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Profile Fields
  const [firstName, setFirstName] = useState(currentUser?.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(currentUser?.name?.split(" ").slice(1).join(" ") || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  
  // Security Fields
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  
  // Real-world 2FA states
  const [twoFaActive, setTwoFaActive] = useState(() => {
    return localStorage.getItem(`mock_2fa_enabled_${currentUser?.email}`) === "true";
  });
  const [show2FaSetup, setShow2FaSetup] = useState(false);
  const [twoFaCodeInput, setTwoFaCodeInput] = useState("");
  const [twoFaError, setTwoFaError] = useState("");
  
  // Active Sessions State
  const [sessions, setSessions] = useState([
    { id: 1, device: "Chrome on macOS", location: "San Francisco, CA • 192.168.1.1", isCurrent: true, icon: Laptop },
    { id: 2, device: "Safari on iPhone 15", location: "San Francisco, CA • 192.168.1.4", isCurrent: false, icon: Smartphone }
  ]);

  // Plan info from backend
  const [planInfo, setPlanInfo] = useState<{ plan: string; expires_at: string | null; activated_at: string | null } | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [downgradeLoading, setDowngradeLoading] = useState(false);

  function formatDate(iso: string | null): string {
    if (!iso) return "";
    try { return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }); }
    catch { return iso; }
  }

  // Fetch real plan info
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token || !currentUser) return;
    setPlanLoading(true);
    fetch("/api/user/plan", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setPlanInfo(data); })
      .catch(() => {})
      .finally(() => setPlanLoading(false));
  }, [currentUser]);

  async function handleDowngrade() {
    if (!window.confirm("Downgrade to Free plan? Your Pro access will end immediately.")) return;
    const token = localStorage.getItem("authToken");
    if (!token) return;
    setDowngradeLoading(true);
    try {
      const res = await fetch("/api/user/downgrade", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setPlanInfo(data);
        if (onUpdateUser && currentUser) onUpdateUser({ ...currentUser, plan: "Free" });
        showToast("Downgraded to Free plan.");
      } else {
        showToast("Failed to downgrade. Please try again.");
      }
    } catch {
      showToast("Network error.");
    } finally {
      setDowngradeLoading(false);
    }
  }

  const effectivePlan = planInfo?.plan || currentUser?.plan || "Free";
  const isProActive = effectivePlan === "Pro";

  // Notifications State
  const [notifs, setNotifs] = useState<{ security: boolean; updates: boolean; newsletter: boolean }>(() => {
    const saved = localStorage.getItem("user_notifs");
    if (saved) {
      try { return JSON.parse(saved); }
      catch (e) { console.error(e); }
    }
    return { security: true, updates: true, newsletter: false };
  });

  useEffect(() => {
    localStorage.setItem("user_notifs", JSON.stringify(notifs));
  }, [notifs]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    if (!token) {
      showToast("Error: You must be logged in to update your profile.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email: email
        })
      });
      
      if (res.ok) {
        showToast("Profile changes saved successfully!");
        if (onUpdateUser) {
          onUpdateUser({
            name: `${firstName} ${lastName}`.trim(),
            email: email,
            plan: currentUser?.plan || "Free"
          });
        }
      } else {
        const errMsg = await res.text();
        showToast(`Error: ${errMsg || "Failed to update profile"}`);
      }
    } catch (err) {
      console.error(err);
      showToast("Network error: Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass || newPass !== confirmPass) {
      showToast("Error: Passwords do not match or are empty.");
      return;
    }
    if (newPass.length < 6) {
      showToast("Error: New password must be at least 6 characters.");
      return;
    }
    
    const token = localStorage.getItem("authToken");
    if (!token) {
      showToast("Error: You must be logged in to update password.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPass,
          new_password: newPass
        })
      });
      
      if (res.ok) {
        showToast("Password updated successfully!");
        setCurrentPass("");
        setNewPass("");
        setConfirmPass("");
      } else {
        const errMsg = await res.text();
        showToast(`Error: ${errMsg || "Failed to update password"}`);
      }
    } catch (err) {
      console.error(err);
      showToast("Network error: Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutSession = (id: number) => {
    const sessionToLog = sessions.find(s => s.id === id);
    if (sessionToLog?.isCurrent) {
      onLogout();
      onBack();
    } else {
      setSessions(prev => prev.filter(s => s.id !== id));
      showToast("Session logged out.");
    }
  };

  return (
    <div className="stitch-landing-v2 theme-blue" style={{ width: "100%", minHeight: "100vh", backgroundColor: "#ffffff", color: "var(--v2-text-main)", fontFamily: "var(--v2-font-sans)", paddingBottom: "100px" }}>
      <div className="v2-container" style={{ paddingTop: "64px", maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Back Button */}
        <button 
          onClick={onBack} 
          className="v2-pill-outline"
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            padding: "8px 20px", 
            fontSize: "14px", 
            marginBottom: "24px"
          }}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div style={{ marginBottom: "40px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--v2-primary)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
            Preferences & Account Settings
          </span>
          <h1 style={{ fontSize: "clamp(26px, 3.5vw, 34px)", fontWeight: 600, letterSpacing: "-0.6px", margin: "8px 0 0 0", color: "var(--v2-text-main)", lineHeight: 1.15 }}>Settings</h1>
        </div>

        {/* Settings Canvas Split Layout */}
        <div className="v2-settings-split" style={{ display: "flex", gap: "48px", alignItems: "flex-start", flexWrap: "wrap" }}>
          
          {/* Sidebar Navigation */}
          <aside style={{ flex: "0 0 240px", display: "flex", flexDirection: "column", gap: "8px", position: "sticky", top: "120px" }}>
            {[
              { id: "profile", label: "Profile", icon: User },
              { id: "billing", label: "Plan & Billing", icon: CreditCard },
              { id: "security", label: "Security", icon: Shield },
              { id: "notifications", label: "Notifications", icon: Bell }
            ].map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    width: "100%",
                    padding: "12px 18px",
                    borderRadius: "8px",
                    border: "none",
                    background: isActive ? "var(--v2-primary-soft)" : "transparent",
                    color: isActive ? "var(--v2-primary)" : "var(--v2-text-muted)",
                    fontWeight: isActive ? "600" : "500",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "var(--v2-border-light)";
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <TabIcon size={18} />
                  <span style={{ fontSize: "14px" }}>{tab.label}</span>
                </button>
              );
            })}
            
            <div style={{ borderTop: "1px solid var(--v2-border-light)", marginTop: "24px", paddingTop: "24px" }}>
              <button
                onClick={() => {
                  onLogout();
                  onBack();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "12px 18px",
                  borderRadius: "8px",
                  border: "none",
                  background: "transparent",
                  color: "var(--v2-text-muted)",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--v2-text-muted)"}
              >
                <LogOut size={18} />
                <span style={{ fontSize: "14px" }}>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Active Canvas Section */}
          <section style={{ flex: "1 1 500px", minWidth: "280px" }}>
            
            {activeTab === "profile" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "var(--v2-text-light)", letterSpacing: "1px" }}>PERSONAL INFORMATION</span>
                  <h2 style={{ fontSize: "24px", fontWeight: 600, margin: "8px 0 0 0", color: "var(--v2-text-main)" }}>Profile Details</h2>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "24px", paddingBottom: "24px", borderBottom: "1px solid var(--v2-border-light)" }}>
                  <div style={{ position: "relative" }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" style={{ width: "96px", height: "96px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--v2-border-light)" }} />
                    ) : (
                      <div className="dynamic-avatar-gradient" style={{ width: "96px", height: "96px", borderRadius: "50%", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "50%", height: "50%" }}>
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      accept="image/*" 
                      style={{ display: "none" }} 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const base64String = reader.result as string;
                            localStorage.setItem("userAvatar", base64String);
                            setAvatarUrl(base64String);
                            showToast("Profile picture updated!");
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ position: "absolute", bottom: 0, right: 0, backgroundColor: "var(--v2-primary)", color: "var(--v2-text-on-primary)", border: "none", borderRadius: "50%", padding: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px" }}
                    >
                      <span style={{ fontSize: "12px", lineHeight: 1 }}>✎</span>
                    </button>
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 4px 0", color: "var(--v2-text-main)" }}>{firstName} {lastName}</h3>
                    <p style={{ fontSize: "14px", color: "var(--v2-text-muted)", margin: 0 }}>
                      {effectivePlan === "Pro" ? "Pro Plan Active Member" : "Free Plan Member"}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "var(--v2-text-muted)", letterSpacing: "0.5px" }}>First Name</label>
                      <input 
                        type="text" 
                        value={firstName} 
                        onChange={e => setFirstName(e.target.value)}
                        className="v2-settings-input"
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "var(--v2-text-muted)", letterSpacing: "0.5px" }}>Last Name</label>
                      <input 
                        type="text" 
                        value={lastName} 
                        onChange={e => setLastName(e.target.value)}
                        className="v2-settings-input"
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "var(--v2-text-muted)", letterSpacing: "0.5px" }}>Email Address</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      className="v2-settings-input"
                    />
                  </div>

                  <div style={{ marginTop: "10px" }}>
                    <button type="submit" className="v2-pill-primary" disabled={loading} style={{ padding: "12px 32px", fontSize: "15px" }}>
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "billing" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "var(--v2-text-light)", letterSpacing: "1px" }}>SUBSCRIPTIONS</span>
                  <h2 style={{ fontSize: "24px", fontWeight: 600, margin: "8px 0 0 0", color: "var(--v2-text-main)" }}>Plan & Billing</h2>
                </div>

                {planLoading ? (
                  <div style={{ padding: "40px", textAlign: "center", color: "var(--v2-text-muted)", fontSize: "14px" }}>Loading plan info...</div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>

                    {/* Current Plan Card */}
                    {isProActive ? (
                      <div style={{ background: "linear-gradient(135deg, var(--v2-primary) 0%, #10b981 100%)", color: "#ffffff", padding: "28px", borderRadius: "12px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "220px", border: "none" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Crown size={16} color="#fff" />
                            <span style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>PRO PLAN</span>
                          </div>
                          <span style={{ fontSize: "26px", fontWeight: "700" }}>$19<span style={{ fontSize: "13px", opacity: 0.65 }}>/mo</span></span>
                        </div>
                        <p style={{ fontSize: "13px", opacity: 0.85, lineHeight: 1.5, margin: "0 0 8px" }}>500 MB files · 100 jobs/day · Priority processing · Priority support</p>
                        {planInfo?.expires_at && (
                          <p style={{ fontSize: "12px", opacity: 0.7, margin: "0 0 20px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <Tag size={11} /> Active until {formatDate(planInfo.expires_at)}
                          </p>
                        )}
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <button
                            onClick={downgradeLoading ? undefined : handleDowngrade}
                            disabled={downgradeLoading}
                            style={{ padding: "8px 16px", backgroundColor: "rgba(255,255,255,0.15)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "8px", fontSize: "12px", cursor: downgradeLoading ? "not-allowed" : "pointer", opacity: downgradeLoading ? 0.6 : 1, fontWeight: "600" }}
                          >
                            {downgradeLoading ? "Downgrading..." : "Downgrade to Free"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ border: "1px solid var(--v2-border)", backgroundColor: "#ffffff", padding: "28px", borderRadius: "12px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "220px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                          <span style={{ backgroundColor: "var(--v2-border-light)", color: "var(--v2-primary)", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>FREE PLAN</span>
                          <span style={{ fontSize: "26px", fontWeight: "700", color: "var(--v2-text-main)" }}>$0<span style={{ fontSize: "13px", opacity: 0.55 }}>/mo</span></span>
                        </div>
                        <p style={{ fontSize: "13px", color: "var(--v2-text-muted)", lineHeight: 1.5, margin: "0 0 20px" }}>50 MB file limit · 10 jobs/day. Upgrade to Pro for 500MB, 100 jobs/day, and priority processing.</p>
                        <button
                          onClick={() => onPricingClick ? onPricingClick() : onBack()}
                          className="v2-pill-primary"
                          style={{ padding: "10px 20px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "8px", alignSelf: "flex-start" }}
                        >
                          <Crown size={14} /> Upgrade to Pro — $19/mo
                        </button>
                      </div>
                    )}

                    {/* Pro Features Summary */}
                    <div style={{ border: "1px solid var(--v2-border-light)", padding: "28px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "var(--v2-bg-page)" }}>
                      <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "var(--v2-text-muted)", display: "block" }}>WHAT YOU GET</span>
                      {isProActive ? (
                        ["500 MB per file", "100 jobs per day", "Priority processing queue", "Priority support (24/5)", "1 year subscription"].map(f => (
                          <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "var(--v2-text-main)" }}>
                            <CheckCircle2 size={14} style={{ color: "#10b981", flexShrink: 0 }} />{f}
                          </div>
                        ))
                      ) : (
                        ["50 MB per file", "10 jobs per day", "Standard processing", "Community support"].map(f => (
                          <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "var(--v2-text-muted)" }}>
                            <CheckCircle2 size={14} style={{ color: "#d1d5db", flexShrink: 0 }} />{f}
                          </div>
                        ))
                      )}
                    </div>

                  </div>
                )}

                {/* Invoices */}
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "var(--v2-text-main)" }}>Invoices</h3>
                  <div style={{ border: "1px dashed var(--v2-border)", padding: "32px", borderRadius: "12px", textAlign: "center", color: "var(--v2-text-muted)" }}>
                    <CreditCard size={28} style={{ color: "var(--v2-border)", marginBottom: "12px" }} />
                    <p style={{ margin: 0, fontSize: "14px" }}>
                      {isProActive
                        ? "Invoice history will appear here once payment gateway is integrated."
                        : "Upgrade to Pro to see billing history."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "var(--v2-text-light)", letterSpacing: "1px" }}>ACCESS CONTROL</span>
                  <h2 style={{ fontSize: "24px", fontWeight: 600, margin: "8px 0 0 0", color: "var(--v2-text-main)" }}>Security Settings</h2>
                </div>

                {/* Password Update Form */}
                <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", borderBottom: "1px solid var(--v2-border-light)", paddingBottom: "32px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", margin: 0, color: "var(--v2-text-main)" }}>Password</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <input 
                      type="password" 
                      placeholder="Current Password" 
                      value={currentPass} 
                      onChange={e => setCurrentPass(e.target.value)}
                      className="v2-settings-input"
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <input 
                        type="password" 
                        placeholder="New Password" 
                        value={newPass} 
                        onChange={e => setNewPass(e.target.value)}
                        className="v2-settings-input"
                      />
                      <input 
                        type="password" 
                        placeholder="Confirm New Password" 
                        value={confirmPass} 
                        onChange={e => setConfirmPass(e.target.value)}
                        className="v2-settings-input"
                      />
                    </div>
                  </div>
                  <div>
                    <button type="submit" className="v2-pill-primary" disabled={loading} style={{ padding: "10px 24px", fontSize: "14px" }}>
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>

                {/* 2FA Switch */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "var(--v2-bg-page)", padding: "24px", borderRadius: "12px", border: "1px solid var(--v2-border-light)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ maxWidth: "75%" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", margin: "0 0 6px 0", color: "var(--v2-text-main)" }}>
                        Two-Factor Authentication (2FA)
                        <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: twoFaActive ? "#10b981" : "var(--v2-text-light)" }}></span>
                      </h3>
                      <p style={{ fontSize: "13px", color: "var(--v2-text-muted)", lineHeight: 1.4, margin: 0 }}>Secure your account by requiring an additional verification code from your authenticator app during login.</p>
                    </div>
                    <button 
                      onClick={() => {
                        if (twoFaActive) {
                          if (window.confirm("Disable Two-Factor Authentication? This will reduce your account security.")) {
                            setTwoFaActive(false);
                            localStorage.removeItem(`mock_2fa_enabled_${currentUser?.email}`);
                            showToast("Two-Factor Authentication disabled.");
                          }
                        } else {
                          setShow2FaSetup(true);
                          setTwoFaCodeInput("");
                          setTwoFaError("");
                        }
                      }}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      {twoFaActive ? <ToggleRight size={32} style={{ color: "var(--v2-primary)" }} /> : <ToggleLeft size={32} style={{ color: "var(--v2-text-light)" }} />}
                    </button>
                  </div>

                  {/* 2FA Setup Flow */}
                  {show2FaSetup && !twoFaActive && (
                    <div style={{ borderTop: "1px solid var(--v2-border-light)", paddingTop: "20px", marginTop: "4px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <h4 style={{ fontSize: "14px", fontWeight: 600, margin: 0, color: "var(--v2-text-main)" }}>Configure Authenticator App</h4>
                      <p style={{ fontSize: "12px", color: "var(--v2-text-muted)", margin: 0 }}>Scan this QR code with Google Authenticator, Authy, or Microsoft Authenticator, and enter the generated 6-digit verification code below.</p>
                      
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center", justifyContent: "center", padding: "12px 0" }}>
                        {/* Mock QR Code in SVG */}
                        <svg viewBox="0 0 100 100" style={{ width: "130px", height: "130px", background: "white", padding: "8px", borderRadius: "8px", border: "1px solid var(--v2-border-light)" }}>
                          <rect width="100" height="100" fill="white" />
                          <rect x="5" y="5" width="25" height="25" fill="#18181b" />
                          <rect x="9" y="9" width="17" height="17" fill="white" />
                          <rect x="13" y="13" width="9" height="9" fill="#18181b" />

                          <rect x="70" y="5" width="25" height="25" fill="#18181b" />
                          <rect x="74" y="9" width="17" height="17" fill="white" />
                          <rect x="78" y="13" width="9" height="9" fill="#18181b" />

                          <rect x="5" y="70" width="25" height="25" fill="#18181b" />
                          <rect x="9" y="74" width="17" height="17" fill="white" />
                          <rect x="13" y="78" width="9" height="9" fill="#18181b" />

                          <rect x="35" y="5" width="5" height="10" fill="#18181b" />
                          <rect x="45" y="15" width="10" height="5" fill="#18181b" />
                          <rect x="60" y="10" width="5" height="5" fill="#18181b" />
                          <rect x="35" y="25" width="15" height="5" fill="#18181b" />

                          <rect x="5" y="35" width="10" height="5" fill="#18181b" />
                          <rect x="20" y="45" width="5" height="10" fill="#18181b" />
                          <rect x="15" y="60" width="10" height="5" fill="#18181b" />

                          <rect x="35" y="35" width="25" height="25" fill="#18181b" />
                          <rect x="40" y="40" width="15" height="15" fill="white" />
                          <rect x="45" y="45" width="5" height="5" fill="#18181b" />

                          <rect x="65" y="35" width="15" height="5" fill="#18181b" />
                          <rect x="80" y="45" width="5" height="15" fill="#18181b" />
                          <rect x="70" y="65" width="25" height="5" fill="#18181b" />
                          <rect x="75" y="75" width="10" height="10" fill="#18181b" />

                          <rect x="35" y="70" width="5" height="15" fill="#18181b" />
                          <rect x="45" y="85" width="20" height="5" fill="#18181b" />
                          <rect x="55" y="75" width="10" height="5" fill="#18181b" />
                        </svg>

                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <span style={{ fontSize: "11px", color: "var(--v2-text-light)", fontWeight: 500 }}>Secret Setup Key:</span>
                          <code style={{ fontSize: "13px", padding: "6px 12px", backgroundColor: "#ffffff", border: "1px solid var(--v2-border-light)", borderRadius: "6px", fontFamily: "monospace", display: "inline-block", color: "var(--v2-text-main)" }}>JBSW Y3DP EHPK 3PXP</code>
                          <span style={{ fontSize: "10px", color: "var(--v2-text-light)" }}>Time-based (TOTP) account setup</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "300px" }}>
                        <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--v2-text-main)" }}>Enter 6-digit Code:</label>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input 
                            type="text" 
                            maxLength={6} 
                            placeholder="000 000"
                            value={twoFaCodeInput}
                            onChange={(e) => setTwoFaCodeInput(e.target.value.replace(/\D/g, ""))}
                            className="v2-settings-input"
                            style={{ flex: 1, textAlign: "center", letterSpacing: "2px", fontWeight: "600" }}
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              if (twoFaCodeInput.length !== 6) {
                                setTwoFaError("Please enter a valid 6-digit code.");
                                return;
                              }
                              setTwoFaActive(true);
                              setShow2FaSetup(false);
                              localStorage.setItem(`mock_2fa_enabled_${currentUser?.email}`, "true");
                              showToast("Two-Factor Authentication successfully activated!");
                            }}
                            className="v2-pill-primary" 
                            style={{ padding: "8px 20px", fontSize: "12px" }}
                          >
                            Verify
                          </button>
                        </div>
                        {twoFaError && <span style={{ fontSize: "11px", color: "#ef4444" }}>{twoFaError}</span>}
                      </div>

                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button 
                          type="button"
                          onClick={() => setShow2FaSetup(false)} 
                          style={{ fontSize: "13px", color: "var(--v2-text-muted)", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Active Sessions */}
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "var(--v2-text-main)" }}>Active Sessions</h3>
                  <div style={{ border: "1px solid var(--v2-border-light)", borderRadius: "12px" }}>
                    {sessions.map((sess, idx) => {
                      const SessIcon = sess.icon;
                      return (
                        <div 
                          key={sess.id} 
                          style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center", 
                            padding: "20px 24px",
                            borderBottom: idx === sessions.length - 1 ? "none" : "1px solid var(--v2-border-light)" 
                          }}
                        >
                          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                            <div style={{ color: "var(--v2-text-light)" }}>
                              <SessIcon size={24} />
                            </div>
                            <div>
                              <strong style={{ fontSize: "15px", display: "flex", alignItems: "center", gap: "8px", color: "var(--v2-text-main)" }}>
                                {sess.device}
                                {sess.isCurrent && (
                                  <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", backgroundColor: "var(--v2-badge)", color: "var(--v2-primary)", padding: "2px 8px", borderRadius: "4px" }}>Current</span>
                                )}
                              </strong>
                              <span style={{ fontSize: "12px", color: "var(--v2-text-muted)" }}>{sess.location}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleLogoutSession(sess.id)}
                            style={{ border: "none", background: "none", color: "var(--v2-text-muted)", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                            onMouseLeave={e => e.currentTarget.style.color = "var(--v2-text-muted)"}
                          >
                            Log Out
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "var(--v2-text-light)", letterSpacing: "1px" }}>ALERT PREFERENCES</span>
                  <h2 style={{ fontSize: "24px", fontWeight: 600, margin: "8px 0 0 0", color: "var(--v2-text-main)" }}>Notifications</h2>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {[
                    { id: "security", title: "Security Alerts", desc: "Get notified immediately of new logins and password updates." },
                    { id: "updates", title: "Product & Tool Updates", desc: "Weekly release logs of new PDF editing functions and capabilities." },
                    { id: "newsletter", title: "Monthly Newsletter", desc: "Tips, tutorials, and general document management strategies." }
                  ].map(notifItem => {
                    const activeVal = notifs[notifItem.id as keyof typeof notifs];
                    return (
                      <div 
                        key={notifItem.id}
                        style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center",
                          padding: "16px 0",
                          borderBottom: "1px solid var(--v2-border-light)" 
                        }}
                      >
                        <div style={{ maxWidth: "80%" }}>
                          <h4 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 4px 0", color: "var(--v2-text-main)" }}>{notifItem.title}</h4>
                          <p style={{ fontSize: "13px", color: "var(--v2-text-muted)", margin: 0, lineHeight: 1.4 }}>{notifItem.desc}</p>
                        </div>
                        <button
                          onClick={() => {
                            setNotifs(prev => ({ ...prev, [notifItem.id]: !activeVal }));
                            showToast(`Notification preference for ${notifItem.title} updated.`);
                          }}
                          style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }}
                        >
                          {activeVal ? <ToggleRight size={32} style={{ color: "var(--v2-primary)" }} /> : <ToggleLeft size={32} style={{ color: "var(--v2-text-light)" }} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </section>

        </div>
      </div>
      
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          backgroundColor: "var(--v2-primary)",
          color: "var(--v2-text-on-primary)",
          padding: "16px 24px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          boxShadow: "var(--v2-shadow-lg)",
          animation: "slideUp 0.3s ease-out"
        }}>
          <CheckCircle2 size={16} style={{ color: "#10b981" }} />
          <span style={{ fontSize: "14px", fontWeight: "600" }}>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
