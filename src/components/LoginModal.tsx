import { useState, useEffect } from "react";
import { X, Mail, Lock, User, AlertCircle, CheckCircle, Shield } from "lucide-react";

import { supabase } from "../utils/supabase";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string; plan?: string }) => void;
  /** When true, the modal cannot be closed — user MUST log in (e.g. limit hit) */
  isRequired?: boolean;
}

type AuthMode = "login" | "signup" | "forgot";

export function LoginModal({ isOpen, onClose, onLoginSuccess, isRequired = false }: LoginModalProps) {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 2FA states
  const [showMfaChallenge, setShowMfaChallenge] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [tempAuthData, setTempAuthData] = useState<any>(null);

  // Reset modal states when opened/closed
  useEffect(() => {
    if (isOpen) {
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setErrorMsg(null);
      setSuccessMsg(null);
      setLoading(false);
      setShowMfaChallenge(false);
      setMfaCode("");
      setMfaError(null);
      setTempAuthData(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Client-side validations
    if (!email) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (authMode === "login") {
      if (!password) {
        setErrorMsg("Please enter your password.");
        return;
      }
    } else if (authMode === "signup") {
      if (!name) {
        setErrorMsg("Please enter your full name.");
        return;
      }
      if (!password) {
        setErrorMsg("Please choose a password.");
        return;
      }
      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    try {
      if (authMode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setSuccessMsg("Password reset email sent successfully! Please check your inbox.");
      } else if (authMode === "signup") {
        // Sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        });
        if (error) throw error;
        if (!data.user) throw new Error("Signup failed. Please try again.");

        // Sync with local backend
        const syncResponse = await fetch("/api/auth/supabase-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            name: name,
          }),
        });
        if (!syncResponse.ok) {
          throw new Error("Signup succeeded in Auth system, but sync failed. Please try logging in.");
        }

        const authData = await syncResponse.json();
        localStorage.setItem("authToken", authData.token);
        onLoginSuccess(authData.user);
        onClose();
      } else {
        let authData;
        const isAdminUser = email === "anshubhati190@gmail.com";

        if (isAdminUser) {
          // Verify hardcoded admin credentials
          if (password !== "Anshu@2065") {
            throw new Error("Invalid password for admin user.");
          }

          // Sync directly with local SQLite DB using static info (bypassing Supabase login)
          const syncResponse = await fetch("/api/auth/supabase-sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: "admin-id-anshu",
              email: "anshubhati190@gmail.com",
              name: "Anshu Bhati",
            }),
          });
          if (!syncResponse.ok) {
            throw new Error("Credentials verified, but session sync failed.");
          }
          authData = await syncResponse.json();
        } else {
          // Login with Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          if (!data.user) throw new Error("Login failed.");

          // Sync with local backend
          const syncResponse = await fetch("/api/auth/supabase-sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name || name || email.split("@")[0],
            }),
          });
          if (!syncResponse.ok) {
            throw new Error("Credentials verified, but session sync failed.");
          }
          authData = await syncResponse.json();
        }

        // Check if mock 2FA or real Supabase MFA is enabled
        const isMock2Fa = localStorage.getItem(`mock_2fa_enabled_${email}`) === "true";
        
        let hasRealMfa = false;
        let totpFactorId = "";
        if (!isAdminUser) {
          try {
            const { data: factors, error: factorsErr } = await supabase.auth.mfa.listFactors();
            if (!factorsErr && factors) {
              const totpFactor = factors.all.find(f => f.factor_type === 'totp' && f.status === 'verified');
              if (totpFactor) {
                hasRealMfa = true;
                totpFactorId = totpFactor.id;
              }
            }
          } catch (e) {
            console.error("Error listing Supabase MFA factors:", e);
          }
        }

        if (isMock2Fa || hasRealMfa) {
          setTempAuthData({
            authData,
            totpFactorId,
            hasRealMfa,
            email
          });
          setShowMfaChallenge(true);
          setMfaCode("");
          setMfaError(null);
        } else {
          localStorage.setItem("authToken", authData.token);
          onLoginSuccess(authData.user);
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempAuthData) return;
    setMfaError(null);
    setLoading(true);

    try {
      if (tempAuthData.hasRealMfa) {
        const challenge = await supabase.auth.mfa.challenge({ factorId: tempAuthData.totpFactorId });
        if (challenge.error) throw challenge.error;
        
        const verify = await supabase.auth.mfa.verify({
          factorId: tempAuthData.totpFactorId,
          challengeId: challenge.data.id,
          code: mfaCode
        });
        if (verify.error) throw verify.error;
      } else {
        // Mock verification validation - check for code "123456"
        if (mfaCode !== "123456") {
          throw new Error("Invalid verification code. Use code '123456' for verification.");
        }
      }

      // Successful verification
      localStorage.setItem("authToken", tempAuthData.authData.token);
      onLoginSuccess(tempAuthData.authData.user);
      onClose();
    } catch (err: any) {
      setMfaError(err.message || "2FA verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: "google" | "apple") => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    // Determine the correct redirect URL.
    // On localhost (dev), Supabase must redirect back to the production URL
    // because Google OAuth only allows registered origins.
    // We always redirect to the canonical production URL so Supabase's
    // allow-list check passes and users don't see "localhost" in the redirect.
    const redirectUrl = window.location.origin;

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || "Social login failed.");
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={isRequired ? undefined : onClose}
      style={{ cursor: isRequired ? "default" : undefined }}
    >
      <div
        className="modal-box"
        style={{ maxWidth: "860px", padding: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Required-login banner — shown when user hit a usage limit */}
        {isRequired && (
          <div style={{
            background: "linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)",
            color: "#ffffff",
            padding: "10px 24px",
            fontSize: "13px",
            fontWeight: 600,
            textAlign: "center",
            letterSpacing: "0.1px",
            borderRadius: "16px 16px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}>
            <span>🔒</span>
            <span>You've reached your daily free limit — Sign up free to continue (200 MB · 50 uses/day per tool)</span>
          </div>
        )}
        
        {/* Left Side: Interactive Branding / Blue V2 Inspired Color Block */}
        <div className="auth-branding-panel">
          <div style={{ position: "relative", zIndex: 10 }}>
            <h1 
              style={{ 
                fontFamily: "'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif", 
                fontSize: "clamp(26px, 3.5vw, 36px)", 
                fontWeight: 700, 
                letterSpacing: "-1px", 
                lineHeight: 1.15, 
                marginBottom: "16px",
                color: "#1B1B1B"
              }}
            >
              All your PDF tools, in one place.
            </h1>
            <p 
              style={{ 
                fontFamily: "'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif", 
                fontSize: "14.5px", 
                fontWeight: 450, 
                lineHeight: 1.45, 
                color: "#1B1B1B",
                maxWidth: "280px",
                margin: 0
              }}
            >
              Log in to view your recent files and resume editing your documents.
            </p>
          </div>
          
          {/* Custom vector illustration matching V2 design */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", marginTop: "24px", position: "relative", zIndex: 5 }}>
            <img 
              src="/v2_login.png" 
              alt="Secure Authentication" 
              style={{ width: "100%", maxHeight: "250px", objectFit: "contain", borderRadius: "8px" }} 
            />
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="auth-form-panel">
          {/* Close Button — hidden when login is required (limit hit) */}
          {!isRequired && (
            <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
              <X size={20} />
            </button>
          )}

          {showMfaChallenge ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
              <div style={{ textAlign: "center", marginBottom: "12px" }}>
                <div style={{ display: "inline-flex", padding: "16px", borderRadius: "50%", backgroundColor: "#f4f4f4", border: "none", color: "var(--s-primary)", marginBottom: "16px" }}>
                  <Shield size={36} />
                </div>
                <h2 
                  style={{ 
                    fontFamily: "'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif", 
                    fontSize: "24px", 
                    fontWeight: 540, 
                    letterSpacing: "-0.5px", 
                    marginBottom: "6px",
                    color: "#1B1B1B"
                  }}
                >
                  Two-Factor Verification
                </h2>
                <p style={{ fontSize: "14px", fontWeight: 320, color: "#1B1B1B", margin: 0, lineHeight: 1.4 }}>
                  Enter the 6-digit verification code from your authenticator app to secure and complete your login.
                </p>
              </div>

              {mfaError && (
                <div className="error-banner animate-shake" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", borderRadius: "8px", backgroundColor: "#fef2f2", border: "1px solid #fee2e2", color: "#b91c1c", fontSize: "13px" }}>
                  <AlertCircle size={16} />
                  <span>{mfaError}</span>
                </div>
              )}

              <form onSubmit={handleMfaVerify} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
                  <label htmlFor="mfa-code" style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", color: "#1B1B1B" }}>
                    6-Digit Code
                  </label>
                  <input 
                    type="text" 
                    id="mfa-code"
                    maxLength={6} 
                    placeholder="000000"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                    disabled={loading}
                    style={{ 
                      width: "100%", 
                      maxWidth: "240px",
                      padding: "12px 18px", 
                      borderRadius: "8px", 
                      border: "1px solid var(--s-hairline)", 
                      backgroundColor: "#ffffff", 
                      color: "var(--s-on-surface)", 
                      fontSize: "20px", 
                      fontWeight: "600",
                      textAlign: "center",
                      letterSpacing: "4px",
                      outline: "none",
                      fontFamily: "monospace"
                    }}
                    autoFocus
                  />
                </div>

                <button 
                  type="submit" 
                  className="stitch-pill-primary"
                  disabled={loading || mfaCode.length !== 6}
                  style={{ 
                    width: "100%", 
                    padding: "12px 24px", 
                    fontSize: "15px", 
                    marginTop: "10px",
                    borderRadius: "8px"
                  }}
                >
                  {loading ? "Verifying..." : "Verify & Log In"}
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    setShowMfaChallenge(false);
                    setTempAuthData(null);
                    setMfaCode("");
                    setMfaError(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--s-secondary)",
                    textDecoration: "underline",
                    cursor: "pointer",
                    textAlign: "center",
                    marginTop: "8px"
                  }}
                >
                  Cancel and Go Back
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Modal Header */}
              <div style={{ marginBottom: "28px" }}>
                <h2 
                  style={{ 
                    fontFamily: "'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif", 
                    fontSize: "clamp(24px, 3vw, 32px)", 
                    fontWeight: 540, 
                    letterSpacing: "-0.5px", 
                    marginBottom: "6px",
                    color: "#1B1B1B"
                  }}
                >
                  {authMode === "login" && "Welcome back"}
                  {authMode === "signup" && "Create account"}
                  {authMode === "forgot" && "Reset password"}
                </h2>
                <p style={{ fontSize: "14px", fontWeight: 320, color: "#1B1B1B", margin: 0 }}>
                  {authMode === "login" && (
                    <>
                      New to Pdfmount.online?{" "}
                      <button 
                        onClick={() => { setErrorMsg(null); setAuthMode("signup"); }}
                        style={{ background: "none", border: "none", padding: 0, fontWeight: "600", textDecoration: "underline", color: "var(--s-primary)", cursor: "pointer" }}
                      >
                        Create an account
                      </button>
                    </>
                  )}
                  {authMode === "signup" && (
                    <>
                      Already have an account?{" "}
                      <button 
                        onClick={() => { setErrorMsg(null); setAuthMode("login"); }}
                        style={{ background: "none", border: "none", padding: 0, fontWeight: "600", textDecoration: "underline", color: "var(--s-primary)", cursor: "pointer" }}
                      >
                        Log In
                      </button>
                    </>
                  )}
                  {authMode === "forgot" && "Go back to start login or registration."}
                </p>
              </div>

              {/* Social Logins (only on Login/Signup modes) */}
              {authMode !== "forgot" && (
                <div className="social-auth-container" style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                  <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                    <button 
                      className="social-btn google" 
                      onClick={() => handleSocialAuth("google")}
                      disabled={loading}
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        gap: "10px", 
                        flex: 1, 
                        padding: "12px 18px", 
                        border: "none", 
                        borderRadius: "8px", 
                        backgroundColor: "#f4f4f4", 
                        color: "var(--s-on-surface)",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                        fontFamily: "'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif"
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                      </svg>
                      <span>Google</span>
                    </button>

                    <button 
                      className="social-btn apple" 
                      onClick={() => handleSocialAuth("apple")}
                      disabled={loading}
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        gap: "10px", 
                        flex: 1, 
                        padding: "12px 18px", 
                        border: "none", 
                        borderRadius: "8px", 
                        backgroundColor: "#f4f4f4", 
                        color: "var(--s-on-surface)",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                        fontFamily: "'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif"
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.13 1.83-.99 2.94.99.08 2.13-.52 2.82-1.33z"/>
                      </svg>
                      <span>Apple</span>
                    </button>
                  </div>

                  <div className="divider-row" style={{ display: "flex", alignItems: "center", gap: "10px", margin: "14px 0" }}>
                    <span className="divider-line" style={{ flex: 1, height: "1px", backgroundColor: "var(--s-hairline)" }}></span>
                    <span className="divider-text" style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "#1B1B1B", fontFamily: "'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif" }}>or use email</span>
                    <span className="divider-line" style={{ flex: 1, height: "1px", backgroundColor: "var(--s-hairline)" }}></span>
                  </div>
                </div>
              )}

              {/* Error Banners */}
              {errorMsg && (
                <div className="error-banner animate-shake" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", borderRadius: "8px", backgroundColor: "#fef2f2", border: "1px solid #fee2e2", color: "#b91c1c", fontSize: "13px", marginBottom: "16px" }}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Banners */}
              {successMsg && (
                <div className="success-banner animate-fade-in" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", borderRadius: "8px", backgroundColor: "#f0fdf4", border: "1px solid #dcfce7", color: "#15803d", fontSize: "13px", marginBottom: "16px" }}>
                  <CheckCircle size={16} />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form Fields */}
              <form onSubmit={handleEmailAuthSubmit} className="auth-form" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {authMode === "signup" && (
                  <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label className="form-label" htmlFor="auth-name" style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", color: "#1B1B1B" }}>Full Name</label>
                    <input 
                      type="text" 
                      id="auth-name"
                      className="form-input" 
                      placeholder="John Doe" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                      style={{ 
                        width: "100%", 
                        padding: "10px 18px", 
                        borderRadius: "8px", 
                        border: "1px solid var(--s-hairline)", 
                        backgroundColor: "#ffffff", 
                        color: "var(--s-on-surface)", 
                        fontSize: "14px", 
                        outline: "none",
                        fontFamily: "inherit"
                      }}
                    />
                  </div>
                )}

                <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label className="form-label" htmlFor="auth-email" style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", color: "#1B1B1B" }}>Email address</label>
                  <input 
                    type="email" 
                    id="auth-email"
                    className="form-input" 
                    placeholder="name@company.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    style={{ 
                      width: "100%", 
                      padding: "10px 18px", 
                      borderRadius: "8px", 
                      border: "1px solid var(--s-hairline)", 
                      backgroundColor: "#ffffff", 
                      color: "var(--s-on-surface)", 
                      fontSize: "14px", 
                      outline: "none",
                      fontFamily: "inherit"
                    }}
                  />
                </div>

                {authMode !== "forgot" && (
                  <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label className="form-label" htmlFor="auth-password" style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", color: "#1B1B1B" }}>Password</label>
                      {authMode === "login" && (
                        <button 
                          type="button" 
                          onClick={() => setAuthMode("forgot")}
                          style={{ background: "none", border: "none", padding: 0, fontSize: "12px", color: "var(--s-primary)", textDecoration: "underline", cursor: "pointer", fontWeight: "500", fontFamily: "'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif" }}
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <input 
                      type="password" 
                      id="auth-password"
                      className="form-input" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      style={{ 
                        width: "100%", 
                        padding: "10px 18px", 
                        borderRadius: "8px", 
                        border: "1px solid var(--s-hairline)", 
                        backgroundColor: "#ffffff", 
                        color: "var(--s-on-surface)", 
                        fontSize: "14px", 
                        outline: "none",
                        fontFamily: "inherit"
                      }}
                    />
                  </div>
                )}

                {authMode === "signup" && (
                  <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label className="form-label" htmlFor="auth-confirm-password" style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", color: "#1B1B1B" }}>Confirm Password</label>
                    <input 
                      type="password" 
                      id="auth-confirm-password"
                      className="form-input" 
                      placeholder="••••••••" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      style={{ 
                        width: "100%", 
                        padding: "10px 18px", 
                        borderRadius: "8px", 
                        border: "1px solid var(--s-hairline)", 
                        backgroundColor: "#ffffff", 
                        color: "var(--s-on-surface)", 
                        fontSize: "14px", 
                        outline: "none",
                        fontFamily: "inherit"
                      }}
                    />
                  </div>
                )}

                {/* Primary Submit Button */}
                <button 
                  type="submit" 
                  className="stitch-pill-primary"
                  disabled={loading}
                  style={{ 
                    width: "100%", 
                    padding: "12px 24px", 
                    fontSize: "15px", 
                    marginTop: "10px",
                    borderRadius: "8px"
                  }}
                >
                  {loading ? (
                    "Processing..."
                  ) : (
                    <>
                      {authMode === "login" && "Continue"}
                      {authMode === "signup" && "Create Account"}
                      {authMode === "forgot" && "Send Reset Link"}
                    </>
                  )}
                </button>
              </form>

              {/* Toggle back to login (only on forgot mode) */}
              {authMode === "forgot" && (
                <div style={{ textAlign: "center", marginTop: "16px" }}>
                  <button 
                    onClick={() => setAuthMode("login")}
                    style={{ background: "none", border: "none", padding: 0, fontSize: "14px", color: "var(--s-primary)", textDecoration: "underline", cursor: "pointer", fontWeight: "600", fontFamily: "'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif" }}
                  >
                    Back to Log In
                  </button>
                </div>
              )}

              {/* Legal / TOS notice */}
              <div style={{ textAlign: "center", marginTop: "24px" }}>
                <p style={{ fontSize: "12px", color: "#1B1B1B", lineHeight: 1.4, margin: 0 }}>
                  By continuing, you agree to our <a href="#terms" style={{ color: "var(--s-primary)", textDecoration: "underline" }}>Terms of Service</a> and <a href="#privacy" style={{ color: "var(--s-primary)", textDecoration: "underline" }}>Privacy Policy</a>.
                </p>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
