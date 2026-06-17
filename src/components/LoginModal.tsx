import { useState, useEffect } from "react";
import { X, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

type AuthMode = "login" | "signup" | "forgot";

type SimulationMode = 
  | "success"
  | "bad_password"
  | "user_not_found"
  | "weak_password"
  | "network_error"
  | "suspended"
  | "social_cancelled";

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
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
  
  // Simulation config state
  const [simMode, setSimMode] = useState<SimulationMode>("success");

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
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEmailAuthSubmit = (e: React.FormEvent) => {
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
    } else if (authMode === "forgot") {
      // Forgot password handling
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        if (simMode === "network_error") {
          setErrorMsg("Network timeout: Unable to send reset email.");
        } else if (simMode === "user_not_found") {
          setErrorMsg("No account found with this email address.");
        } else {
          setSuccessMsg("Password reset link has been sent to your email!");
        }
      }, 1200);
      return;
    }

    // Process simulated states
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      
      switch (simMode) {
        case "success":
          onLoginSuccess({
            name: authMode === "signup" ? name : email.split("@")[0],
            email: email
          });
          onClose();
          break;
        case "bad_password":
          setErrorMsg("Incorrect email or password. Please try again.");
          break;
        case "user_not_found":
          setErrorMsg("No account exists with this email address.");
          break;
        case "weak_password":
          setErrorMsg("Password must contain at least 1 number and 1 capital letter.");
          break;
        case "network_error":
          setErrorMsg("Connection timed out. Please check your internet connection and try again.");
          break;
        case "suspended":
          setErrorMsg("Access denied: This account has been temporarily suspended.");
          break;
        default:
          setErrorMsg("An unexpected error occurred. Please try again.");
      }
    }, 1200);
  };

  const handleSocialAuth = (provider: "google" | "apple") => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (simMode === "success") {
        onLoginSuccess({
          name: provider === "google" ? "Google User" : "Apple User",
          email: `${provider.toLowerCase()}.user@example.com`
        });
        onClose();
      } else if (simMode === "social_cancelled") {
        setErrorMsg(`${provider === "google" ? "Google" : "Apple"} sign-in was cancelled by the user.`);
      } else if (simMode === "network_error") {
        setErrorMsg("Network timeout: Authentication server unreachable.");
      } else if (simMode === "suspended") {
        setErrorMsg("This social login is associated with a suspended account.");
      } else {
        // Fallback successful login for testing
        onLoginSuccess({
          name: provider === "google" ? "Google User" : "Apple User",
          email: `${provider.toLowerCase()}.user@example.com`
        });
        onClose();
      }
    }, 1000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="modal-header-section">
          <h2 className="modal-title">
            {authMode === "login" && "Log in to WeLovePDF"}
            {authMode === "signup" && "Create your account"}
            {authMode === "forgot" && "Reset your password"}
          </h2>
        </div>

        {/* Social Logins (only on Login/Signup modes) */}
        {authMode !== "forgot" && (
          <div className="social-auth-container">
            <button 
              className="social-btn google" 
              onClick={() => handleSocialAuth("google")}
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <button 
              className="social-btn apple" 
              onClick={() => handleSocialAuth("apple")}
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.13 1.83-.99 2.94.99.08 2.13-.52 2.82-1.33z"/>
              </svg>
              <span>Continue with Apple</span>
            </button>

            <div className="divider-row">
              <span className="divider-line"></span>
              <span className="divider-text">or</span>
              <span className="divider-line"></span>
            </div>
          </div>
        )}

        {/* Error Banners */}
        {errorMsg && (
          <div className="error-banner animate-shake">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Banners */}
        {successMsg && (
          <div className="success-banner animate-fade-in">
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleEmailAuthSubmit} className="auth-form">
          {authMode === "signup" && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name">Full Name</label>
              <input 
                type="text" 
                id="auth-name"
                className="form-input" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email Address</label>
            <input 
              type="email" 
              id="auth-email"
              className="form-input" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {authMode !== "forgot" && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-password">Password</label>
              <input 
                type="password" 
                id="auth-password"
                className="form-input" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {authMode === "signup" && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-confirm-password">Confirm Password</label>
              <input 
                type="password" 
                id="auth-confirm-password"
                className="form-input" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {/* Form Actions (Forgot Password) */}
          {authMode === "login" && (
            <div className="form-actions-row" style={{ justifyContent: "flex-end" }}>
              <button 
                type="button" 
                className="forgot-pass-btn" 
                onClick={() => setAuthMode("forgot")}
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Primary Submit Button */}
          <button 
            type="submit" 
            className="primary-button submit-auth-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border"></span>
            ) : (
              <>
                {authMode === "login" && "Sign In"}
                {authMode === "signup" && "Create Account"}
                {authMode === "forgot" && "Send Password Reset"}
              </>
            )}
          </button>
        </form>

        {/* Auth Mode Toggles */}
        <div className="auth-mode-toggle-footer">
          {authMode === "login" && (
            <span>
              Don't have an account?{" "}
              <button className="toggle-mode-btn" onClick={() => setAuthMode("signup")}>
                Sign Up
              </button>
            </span>
          )}
          {authMode === "signup" && (
            <span>
              Already have an account?{" "}
              <button className="toggle-mode-btn" onClick={() => setAuthMode("login")}>
                Log In
              </button>
            </span>
          )}
          {authMode === "forgot" && (
            <button className="toggle-mode-btn back-to-login" onClick={() => setAuthMode("login")}>
              Back to Login
            </button>
          )}
        </div>

        {/* 🧪 Simulation & Testing panel */}
        <div className="simulation-control-panel">
          <label className="sim-dropdown-label">
            <span>🧪 Auth outcome simulation</span>
            <select 
              className="sim-dropdown-select"
              value={simMode} 
              onChange={(e) => setSimMode(e.target.value as any)}
            >
              <option value="success">🟢 Success</option>
              <option value="bad_password">🔴 Incorrect Password</option>
              <option value="user_not_found">🔴 No User Found</option>
              <option value="weak_password">🔴 Weak Password</option>
              <option value="network_error">🔴 Network Error</option>
              <option value="suspended">🔴 Suspended Account</option>
              <option value="social_cancelled">🔴 Cancelled Social Auth</option>
            </select>
          </label>
        </div>

      </div>
    </div>
  );
}
