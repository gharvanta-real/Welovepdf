import React, { useState } from "react";
import { ArrowLeft, User, Shield, CreditCard, Bell, LogOut, CheckCircle2, Key, ToggleLeft, ToggleRight, Smartphone, Laptop, Download, Edit2 } from "lucide-react";

interface AccountSettingsPageProps {
  onBack: () => void;
  currentUser: { name: string; email: string; plan?: string } | null;
  onLogout: () => void;
}

type SettingsTab = "profile" | "billing" | "security" | "notifications";

export function AccountSettingsPage({ onBack, currentUser, onLogout }: AccountSettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [toastMsg, setToastMsg] = useState("");
  
  // Profile Fields
  const [firstName, setFirstName] = useState(currentUser?.name?.split(" ")[0] || "Julian");
  const [lastName, setLastName] = useState(currentUser?.name?.split(" ")[1] || "Thorne");
  const [email, setEmail] = useState(currentUser?.email || "julian@architype.design");
  
  // Security Fields
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [twoFaActive, setTwoFaActive] = useState(true);
  
  // Active Sessions State
  const [sessions, setSessions] = useState([
    { id: 1, device: "Chrome on macOS", location: "San Francisco, CA • 192.168.1.1", isCurrent: true, icon: Laptop },
    { id: 2, device: "Safari on iPhone 15", location: "San Francisco, CA • 192.168.1.4", isCurrent: false, icon: Smartphone }
  ]);

  // Notifications State
  const [notifs, setNotifs] = useState({
    security: true,
    updates: true,
    newsletter: false
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Profile changes saved successfully!");
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass || newPass !== confirmPass) {
      showToast("Error: Passwords do not match or are empty.");
      return;
    }
    showToast("Password updated successfully!");
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
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
    <div className="stitch-landing" style={{ width: "100%", minHeight: "100vh", backgroundColor: "var(--s-background, #f9f9f9)", paddingBottom: "100px" }}>
      <div className="stitch-container" style={{ paddingTop: "60px" }}>
        
        {/* Back Button */}
        <button 
          onClick={onBack} 
          className="stitch-pill-outline"
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            padding: "8px 20px", 
            fontSize: "14px", 
            marginBottom: "40px"
          }}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px", marginBottom: "32px" }}>
          <span className="eyebrow" style={{ color: "var(--s-secondary)", textTransform: "uppercase", fontSize: "14px", letterSpacing: "1px" }}>
            Preferences & Account Settings
          </span>
          <h1 style={{ fontSize: "clamp(32px, 6vw, 64px)", fontWeight: 340, letterSpacing: "-1px", margin: 0 }}>Settings</h1>
        </div>

        {/* Settings Canvas Split Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "48px", alignItems: "flex-start" }}>
          
          {/* Sidebar Navigation */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "8px", position: "sticky", top: "120px" }}>
            {[
              { id: "profile", label: "Profile", icon: User },
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
                    background: isActive ? "var(--s-surface-low)" : "transparent",
                    color: isActive ? "var(--s-primary)" : "var(--s-secondary)",
                    fontWeight: isActive ? "700" : "400",
                    borderLeft: isActive ? "4px solid var(--s-primary)" : "4px solid transparent",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <TabIcon size={18} />
                  <span style={{ fontSize: "15px" }}>{tab.label}</span>
                </button>
              );
            })}
            
            <div style={{ borderTop: "1px solid var(--s-hairline)", marginTop: "24px", paddingTop: "24px" }}>
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
                  color: "var(--s-outline)",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--s-outline)"}
              >
                <LogOut size={18} />
                <span style={{ fontSize: "15px" }}>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Active Canvas Section */}
          <section style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid var(--s-hairline)", padding: "clamp(24px, 4vw, 48px)", flex: "1 1 500px" }}>
            
            {activeTab === "profile" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                <div>
                  <span className="eyebrow" style={{ fontSize: "11px", color: "var(--s-secondary)" }}>PERSONAL INFORMATION</span>
                  <h2 style={{ fontSize: "28px", fontWeight: "600", margin: "8px 0 0 0" }}>Profile Details</h2>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "24px", paddingBottom: "24px", borderBottom: "1px solid var(--s-hairline)" }}>
                  <div style={{ position: "relative" }}>
                    <div style={{ width: "96px", height: "96px", borderRadius: "50%", backgroundColor: "var(--s-block-lilac)", color: "var(--s-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "700" }}>
                      {firstName[0]?.toUpperCase()}{lastName[0]?.toUpperCase()}
                    </div>
                    <button 
                      onClick={() => alert("Simulation: Select file window opened to change avatar.")}
                      style={{ position: "absolute", bottom: 0, right: 0, backgroundColor: "var(--s-primary)", color: "var(--s-on-primary)", border: "none", borderRadius: "50%", padding: "6px", cursor: "pointer" }}
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 4px 0" }}>{firstName} {lastName}</h3>
                    <p style={{ fontSize: "14px", color: "var(--s-secondary)", margin: 0 }}>Pro Plan Active Member</p>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "var(--s-secondary)" }}>First Name</label>
                      <input 
                        type="text" 
                        value={firstName} 
                        onChange={e => setFirstName(e.target.value)}
                        style={{ padding: "10px 18px", borderRadius: "9999px", border: "1px solid var(--s-hairline)", outline: "none", fontSize: "14px", fontFamily: "inherit" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "var(--s-secondary)" }}>Last Name</label>
                      <input 
                        type="text" 
                        value={lastName} 
                        onChange={e => setLastName(e.target.value)}
                        style={{ padding: "10px 18px", borderRadius: "9999px", border: "1px solid var(--s-hairline)", outline: "none", fontSize: "14px", fontFamily: "inherit" }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "var(--s-secondary)" }}>Email Address</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      style={{ padding: "10px 18px", borderRadius: "9999px", border: "1px solid var(--s-hairline)", outline: "none", fontSize: "14px", fontFamily: "inherit" }}
                    />
                  </div>

                  <div style={{ marginTop: "10px" }}>
                    <button type="submit" className="stitch-pill-primary" style={{ padding: "12px 32px", fontSize: "15px" }}>
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "billing" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                <div>
                  <span className="eyebrow" style={{ fontSize: "11px", color: "var(--s-secondary)" }}>SUBSCRIPTIONS</span>
                  <h2 style={{ fontSize: "28px", fontWeight: "600", margin: "8px 0 0 0" }}>Plan & Billing</h2>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
                  {/* Current Plan Card */}
                  <div style={{ backgroundColor: "var(--s-block-navy)", color: "#ffffff", padding: "28px", borderRadius: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "180px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                      <span style={{ backgroundColor: "var(--s-block-lime)", color: "var(--s-primary)", padding: "4px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>
                        {currentUser?.plan || "PRO PLAN"}
                      </span>
                      <span style={{ fontSize: "28px", fontWeight: "700" }}>$24<span style={{ fontSize: "14px", opacity: 0.6 }}>/mo</span></span>
                    </div>
                    <p style={{ fontSize: "13px", opacity: 0.8, lineHeight: 1.4, margin: "0 0 20px 0" }}>Full access to advanced PDF editing tools, unlimited storage, and priority support.</p>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button onClick={() => alert("Manage Plan Simulator")} style={{ padding: "8px 16px", backgroundColor: "#ffffff", color: "var(--s-primary)", border: "none", borderRadius: "9999px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Manage Plan</button>
                      <button onClick={() => alert("Compare Plans Simulator")} style={{ padding: "8px 16px", backgroundColor: "transparent", color: "#ffffff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "9999px", fontSize: "13px", cursor: "pointer" }}>Compare</button>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div style={{ border: "1px solid var(--s-hairline)", padding: "28px", borderRadius: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "180px" }}>
                    <div>
                      <span className="eyebrow" style={{ fontSize: "11px", color: "var(--s-secondary)", display: "block", marginBottom: "16px" }}>DEFAULT PAYMENT METHOD</span>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <div style={{ width: "44px", height: "32px", backgroundColor: "var(--s-surface-low)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontWeight: "700", fontSize: "11px" }}>VISA</span>
                        </div>
                        <div>
                          <strong style={{ fontSize: "14px", display: "block" }}>Visa ending in 4242</strong>
                          <span style={{ fontSize: "12px", color: "var(--s-secondary)" }}>Expires 12/26</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => alert("Add payment method simulator")} style={{ border: "none", background: "none", color: "var(--s-primary)", fontSize: "13px", fontWeight: "600", textAlign: "left", cursor: "pointer", padding: 0 }}>
                      + Add new method
                    </button>
                  </div>
                </div>

                {/* Invoices List */}
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Recent Invoices</h3>
                  <div style={{ border: "1px solid var(--s-hairline)", borderRadius: "12px", overflow: "hidden" }}>
                    {[
                      { date: "Dec 01, 2024", id: "INV-09823", amt: "$24.00" },
                      { date: "Nov 01, 2024", id: "INV-08711", amt: "$24.00" },
                      { date: "Oct 01, 2024", id: "INV-07654", amt: "$24.00" }
                    ].map((inv, i) => (
                      <div 
                        key={inv.id} 
                        style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center", 
                          padding: "16px 24px", 
                          borderBottom: i === 2 ? "none" : "1px solid var(--s-hairline)",
                          backgroundColor: i % 2 === 0 ? "transparent" : "var(--s-background)" 
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: "14px", display: "block" }}>{inv.date}</strong>
                          <span className="eyebrow" style={{ fontSize: "11px", color: "var(--s-secondary)" }}>{inv.id}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <span style={{ fontSize: "14px", color: "var(--s-secondary)" }}>{inv.amt}</span>
                          <button 
                            onClick={() => alert(`Downloading Invoice ${inv.id}...`)}
                            style={{ border: "none", background: "none", padding: "6px", cursor: "pointer" }}
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                <div>
                  <span className="eyebrow" style={{ fontSize: "11px", color: "var(--s-secondary)" }}>ACCESS CONTROL</span>
                  <h2 style={{ fontSize: "28px", fontWeight: "600", margin: "8px 0 0 0" }}>Security Settings</h2>
                </div>

                {/* Password Update Form */}
                <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", borderBottom: "1px solid var(--s-hairline)", paddingBottom: "32px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Password</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <input 
                      type="password" 
                      placeholder="Current Password" 
                      value={currentPass} 
                      onChange={e => setCurrentPass(e.target.value)}
                      style={{ padding: "10px 18px", borderRadius: "9999px", border: "1px solid var(--s-hairline)", outline: "none", fontSize: "14px", fontFamily: "inherit" }}
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <input 
                        type="password" 
                        placeholder="New Password" 
                        value={newPass} 
                        onChange={e => setNewPass(e.target.value)}
                        style={{ padding: "10px 18px", borderRadius: "9999px", border: "1px solid var(--s-hairline)", outline: "none", fontSize: "14px", fontFamily: "inherit" }}
                      />
                      <input 
                        type="password" 
                        placeholder="Confirm New Password" 
                        value={confirmPass} 
                        onChange={e => setConfirmPass(e.target.value)}
                        style={{ padding: "10px 18px", borderRadius: "9999px", border: "1px solid var(--s-hairline)", outline: "none", fontSize: "14px", fontFamily: "inherit" }}
                      />
                    </div>
                  </div>
                  <div>
                    <button type="submit" className="stitch-pill-primary" style={{ padding: "12px 28px", fontSize: "14px" }}>Update Password</button>
                  </div>
                </form>

                {/* 2FA Switch */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--s-surface-soft)", padding: "24px", borderRadius: "12px", border: "1px solid var(--s-hairline)" }}>
                  <div style={{ maxWidth: "75%" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", margin: "0 0 6px 0" }}>
                      Two-Factor Authentication
                      <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: twoFaActive ? "var(--s-block-lime)" : "var(--s-outline)" }}></span>
                    </h3>
                    <p style={{ fontSize: "13px", color: "var(--s-secondary)", lineHeight: 1.4, margin: 0 }}>Secure your account by requiring an additional verification code from your mobile device.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setTwoFaActive(!twoFaActive);
                      showToast(`Two-Factor Authentication turned ${!twoFaActive ? "on" : "off"}`);
                    }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    {twoFaActive ? <ToggleRight size={48} style={{ color: "var(--s-primary)" }} /> : <ToggleLeft size={48} style={{ color: "var(--s-outline)" }} />}
                  </button>
                </div>

                {/* Active Sessions */}
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Active Sessions</h3>
                  <div style={{ border: "1px solid var(--s-hairline)", borderRadius: "12px" }}>
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
                            borderBottom: idx === sessions.length - 1 ? "none" : "1px solid var(--s-hairline)" 
                          }}
                        >
                          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                            <div style={{ color: "var(--s-secondary)" }}>
                              <SessIcon size={24} />
                            </div>
                            <div>
                              <strong style={{ fontSize: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                                {sess.device}
                                {sess.isCurrent && (
                                  <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", backgroundColor: "var(--s-block-mint)", padding: "2px 8px", borderRadius: "9999px" }}>Current</span>
                                )}
                              </strong>
                              <span style={{ fontSize: "12px", color: "var(--s-secondary)" }}>{sess.location}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleLogoutSession(sess.id)}
                            style={{ border: "none", background: "none", color: "var(--s-secondary)", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                            onMouseLeave={e => e.currentTarget.style.color = "var(--s-secondary)"}
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
                  <span className="eyebrow" style={{ fontSize: "11px", color: "var(--s-secondary)" }}>ALERT PREFERENCES</span>
                  <h2 style={{ fontSize: "28px", fontWeight: "600", margin: "8px 0 0 0" }}>Notifications</h2>
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
                          borderBottom: "1px solid var(--s-hairline-soft)" 
                        }}
                      >
                        <div style={{ maxWidth: "80%" }}>
                          <h4 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 4px 0" }}>{notifItem.title}</h4>
                          <p style={{ fontSize: "13px", color: "var(--s-secondary)", margin: 0, lineHeight: 1.4 }}>{notifItem.desc}</p>
                        </div>
                        <button
                          onClick={() => {
                            setNotifs(prev => ({ ...prev, [notifItem.id]: !activeVal }));
                            showToast(`Notification preference for ${notifItem.title} updated.`);
                          }}
                          style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }}
                        >
                          {activeVal ? <ToggleRight size={44} style={{ color: "var(--s-primary)" }} /> : <ToggleLeft size={44} style={{ color: "var(--s-outline)" }} />}
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
          backgroundColor: "var(--s-primary)",
          color: "var(--s-on-primary)",
          padding: "16px 24px",
          borderRadius: "9999px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          animation: "slideUp 0.3s ease-out"
        }}>
          <CheckCircle2 size={16} style={{ color: "var(--s-block-mint)" }} />
          <span style={{ fontSize: "14px", fontWeight: "600" }}>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
