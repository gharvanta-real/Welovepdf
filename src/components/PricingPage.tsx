import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, Tag, X, Loader2, Crown, Zap } from "lucide-react";


interface PricingPageProps {
  currentUser: { name: string; email: string; plan?: string } | null;
  onUpgradeSuccess: (planName: string) => void;
  onLoginRequired: () => void;
  onBack: () => void;
  onToolSelect: (toolName: string) => void;
  onViewChange: (view: any) => void;
}

interface PlanInfo {
  plan: string;
  expires_at: string | null;
  activated_at: string | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

export function PricingPage({ currentUser, onUpgradeSuccess, onLoginRequired, onBack, onToolSelect, onViewChange }: PricingPageProps) {
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const effectivePlan = planInfo?.plan || currentUser?.plan || "Free";
  const isProActive = effectivePlan === "Pro";

  // Fetch real plan info from backend if user is logged in
  useEffect(() => {
    if (!currentUser) return;
    const token = localStorage.getItem("authToken");
    if (!token) return;
    setPlanLoading(true);
    fetch("/api/user/plan", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setPlanInfo(data); })
      .catch(() => {})
      .finally(() => setPlanLoading(false));
  }, [currentUser, promoSuccess]);

  const handleOpenPromo = () => {
    if (!currentUser) { onLoginRequired(); return; }
    setPromoCode("");
    setPromoError("");
    setPromoSuccess(false);
    setShowPromoModal(true);
  };

  const handleSubscribe = async (planName: string) => {
    if (!currentUser) { onLoginRequired(); return; }
    const token = localStorage.getItem("authToken");
    if (!token) { onLoginRequired(); return; }
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ plan: planName }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error && data.error.toLowerCase().includes("not configured")) {
          alert("Stripe payments are currently under maintenance. Please use the 'Enter Promo Code' button at the bottom of the page to activate your Pro plan trial.");
        } else {
          alert(data.error || "Failed to initiate checkout session.");
        }
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleActivatePromo = async () => {
    if (!promoCode.trim()) { setPromoError("Please enter a promo code."); return; }
    const token = localStorage.getItem("authToken");
    if (!token) { onLoginRequired(); return; }
    setPromoLoading(true);
    setPromoError("");
    try {
      const res = await fetch("/api/user/activate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ promo_code: promoCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPromoError(data.error || "Failed to activate promo code.");
      } else {
        setPromoSuccess(true);
        setPlanInfo(data);
        onUpgradeSuccess("Pro");
        setTimeout(() => setShowPromoModal(false), 2200);
      }
    } catch {
      setPromoError("Network error. Please try again.");
    } finally {
      setPromoLoading(false);
    }
  };

  const tiers = [
    {
      name: "Starter",
      price: "$0",
      sub: "/month",
      desc: "For individuals & light projects.",
      color: "#64748B",
      isCurrent: !isProActive,
      featured: false,
      features: [
        "10 jobs per day",
        "50 MB file size limit",
        "All core PDF tools",
        "Basic annotations",
        "Standard processing speed",
        "Community support",
      ],
      cta: isProActive ? "Downgrade" : "Current Plan",
      ctaAction: () => {},
    },
    {
      name: "Pro",
      price: "$19",
      sub: "/month",
      desc: "For professionals and heavy users.",
      color: "#2563EB",
      isCurrent: isProActive,
      featured: true,
      features: [
        "100 jobs per day",
        "500 MB file size limit",
        "All core PDF tools",
        "Priority processing speed",
        "Advanced annotations & editor",
        "Priority support (24/5)",
        "Billed monthly, cancel anytime",
      ],
      cta: isProActive ? "✓ Current Plan" : "Subscribe Now",
      ctaAction: isProActive ? () => {} : () => handleSubscribe("Pro"),
    },
    {
      name: "Enterprise",
      price: "Custom",
      sub: "",
      desc: "For teams requiring control and scale.",
      color: "#475569",
      isCurrent: false,
      featured: false,
      features: [
        "Unlimited daily jobs",
        "Unlimited file size",
        "Dedicated processing servers",
        "SSO & Advanced Security",
        "Admin dashboard access",
        "Unlimited cloud storage",
        "24/7 VIP dedicated support",
        "Custom API integration",
      ],
      cta: "Contact Sales",
      ctaAction: () => onViewChange("contact"),
    },
  ];

  const comparisonRows = [
    { feature: "Jobs per day", starter: "10", pro: "100", enterprise: "Unlimited" },
    { feature: "Max file size", starter: "50 MB", pro: "500 MB", enterprise: "Unlimited" },
    { feature: "All PDF Tools", starter: "✓", pro: "✓", enterprise: "✓" },
    { feature: "Priority Processing", starter: "—", pro: "✓", enterprise: "✓" },
    { feature: "Annotations & Editor", starter: "Basic", pro: "Full", enterprise: "Full" },
    { feature: "Plan Duration", starter: "Permanent", pro: "Monthly", enterprise: "Custom" },
    { feature: "API Access", starter: "—", pro: "Add-on", enterprise: "✓" },
    { feature: "SSO / Security", starter: "—", pro: "—", enterprise: "✓" },
    { feature: "Support", starter: "Community", pro: "24/5 Priority", enterprise: "24/7 VIP" },
  ];

  return (
    <div className="pricing-page-wrapper" style={{ width: "100%", minHeight: "100vh", color: "#0F172A" }}>
      {/* Scoped CSS Styles */}
      <style>{`
        .pricing-page-wrapper {
          background-color: #FFFFFF;
        }
        .theme-dark .pricing-page-wrapper {
          background-color: #0B0F19;
          color: #F8FAFC !important;
        }
        
        .pricing-hero-sec {
          text-align: left;
          padding: 32px 0 40px 0;
          margin-bottom: 40px;
        }
        .pricing-hero-chip {
          display: inline-block;
          font-family: "JetBrains Mono", monospace;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #2563EB;
          background-color: rgba(37, 99, 235, 0.06);
          padding: 6px 16px;
          border-radius: 9999px;
          margin-bottom: 20px;
        }
        .theme-dark .pricing-hero-chip {
          color: #3B82F6;
          background-color: rgba(59, 130, 246, 0.1);
        }
        .pricing-hero-sec h1 {
          font-family: "Google Sans", "Google Sans Text", "Plus Jakarta Sans", sans-serif;
          font-size: clamp(28px, 3.5vw, 40px);
          font-weight: 700;
          line-height: 1.18;
          letter-spacing: -1px;
          color: #0F172A;
          margin: 0 0 16px;
        }
        .theme-dark .pricing-hero-sec h1 {
          color: #F8FAFC;
        }
        .pricing-hero-sec p {
          font-size: 14px;
          line-height: 1.6;
          color: #64748B;
          max-width: 580px;
          margin: 0;
        }
        .theme-dark .pricing-hero-sec p {
          color: #94A3B8;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
          margin-bottom: 80px;
          align-items: stretch;
        }
        
        .pricing-card {
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 40px 32px;
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .theme-dark .pricing-card {
          background-color: #0F172A;
          border-color: #1E293B;
          box-shadow: none;
        }
        .pricing-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
        }
        .pricing-card.featured {
          border: 2px solid #2563EB;
          box-shadow: 0 8px 30px rgba(37, 99, 235, 0.05);
        }
        .theme-dark .pricing-card.featured {
          border-color: #3B82F6;
        }
        .pricing-card.current-plan-border {
          border: 2px solid #0F172A;
        }
        .theme-dark .pricing-card.current-plan-border {
          border-color: #E2E8F0;
        }
        
        .pricing-card-badge {
          position: absolute;
          top: -14px;
          left: 32px;
          background-color: #2563EB;
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 4px 14px;
          border-radius: 9999px;
        }
        .theme-dark .pricing-card-badge {
          background-color: #3B82F6;
        }
        
        .pricing-card h3 {
          font-family: "Google Sans", "Google Sans Text", "Plus Jakarta Sans", sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 6px 0;
        }
        .theme-dark .pricing-card h3 {
          color: #F8FAFC;
        }
        .pricing-desc {
          font-size: 14px;
          color: #64748B;
          line-height: 1.5;
          margin: 0 0 28px 0;
        }
        .theme-dark .pricing-desc {
          color: #94A3B8;
        }
        
        .price-wrap {
          display: flex;
          align-items: baseline;
          margin-bottom: 28px;
        }
        .price-val {
          font-size: 42px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -1.5px;
        }
        .theme-dark .price-val {
          color: #F8FAFC;
        }
        .price-period {
          font-size: 14px;
          color: #64748B;
          margin-left: 4px;
        }
        .theme-dark .price-period {
          color: #94A3B8;
        }
        
        .features-list {
          list-style: none;
          padding: 0;
          margin: 0 0 36px 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
          flex-grow: 1;
        }
        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 14px;
          color: #334155;
        }
        .theme-dark .feature-item {
          color: #CBD5E1;
        }
        .feature-icon {
          color: #2563EB;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .theme-dark .feature-icon {
          color: #3B82F6;
        }
        
        .pricing-btn {
          width: 100%;
          padding: 13px;
          border-radius: 8px;
          font-size: 14.5px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          font-family: "Google Sans", "Google Sans Text", "Plus Jakarta Sans", sans-serif;
          transition: background-color 0.15s ease, opacity 0.15s ease;
        }
        .pricing-btn-primary {
          background-color: #2563EB;
          color: #FFFFFF;
        }
        .pricing-btn-primary:hover {
          background-color: #1d4ed8;
        }
        .theme-dark .pricing-btn-primary {
          background-color: #3B82F6;
        }
        .theme-dark .pricing-btn-primary:hover {
          background-color: #2563eb;
        }
        .pricing-btn-outline {
          background-color: transparent;
          border: 1px solid #E2E8F0;
          color: #0F172A;
        }
        .theme-dark .pricing-btn-outline {
          border-color: #334155;
          color: #F8FAFC;
        }
        .pricing-btn-outline:hover {
          background-color: #F8FAFC;
        }
        .theme-dark .pricing-btn-outline:hover {
          background-color: #1E293B;
        }
        .pricing-btn-disabled {
          background-color: #F1F5F9;
          color: #94A3B8;
          cursor: default;
        }
        .theme-dark .pricing-btn-disabled {
          background-color: #1E293B;
          color: #64748B;
        }
        
        .comparison-title {
          font-family: "Google Sans", "Google Sans Text", "Plus Jakarta Sans", sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 6px 0;
          letter-spacing: -0.5px;
        }
        .theme-dark .comparison-title {
          color: #F8FAFC;
        }
        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .comparison-table th {
          padding: 16px 12px;
          font-size: 14px;
          font-weight: 600;
          color: #475569;
          border-bottom: 2px solid #E2E8F0;
        }
        .theme-dark .comparison-table th {
          color: #94A3B8;
          border-bottom-color: #334155;
        }
        .comparison-table td {
          padding: 16px 12px;
          font-size: 14px;
          color: #334155;
          border-bottom: 1px solid #F1F5F9;
        }
        .theme-dark .comparison-table td {
          color: #CBD5E1;
          border-bottom-color: #1E293B;
        }
        .comparison-table tr:hover td {
          background-color: #F8FAFC;
        }
        .theme-dark .comparison-table tr:hover td {
          background-color: #0F172A;
        }
        
        .promo-banner {
          background-color: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 60px 40px;
          text-align: center;
          margin-bottom: 64px;
        }
        .theme-dark .promo-banner {
          background-color: #0F172A;
          border-color: #1E293B;
        }
        .promo-banner h2 {
          font-family: "Google Sans", "Google Sans Text", "Plus Jakarta Sans", sans-serif;
          font-size: clamp(26px, 4vw, 36px);
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.8px;
          margin: 0 0 10px;
        }
        .theme-dark .promo-banner h2 {
          color: #F8FAFC;
        }
        .promo-banner p {
          font-size: 15px;
          color: #64748B;
          margin: 0 0 28px;
          max-width: 580px;
          margin-inline: auto;
          line-height: 1.5;
        }
        .theme-dark .promo-banner p {
          color: #94A3B8;
        }
        
        .promo-modal-box {
          background-color: #FFFFFF;
          border-radius: 16px;
          padding: 40px;
          max-width: 440px;
          width: 100%;
          position: relative;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
          border: 1px solid #E2E8F0;
        }
        .theme-dark .promo-modal-box {
          background-color: #0F172A;
          border-color: #1E293B;
          box-shadow: none;
        }
      `}</style>

      {/* Promo Code Modal */}
      {showPromoModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(11,15,25,0.65)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backdropFilter: "blur(4px)" }}>
          <div className="promo-modal-box">
            <button onClick={() => setShowPromoModal(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
              <X size={20} />
            </button>

            {promoSuccess ? (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "rgba(37,99,235,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <Crown size={26} color="#2563EB" />
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>Pro Activated! 🎉</h3>
                <p style={{ color: "#64748B", fontSize: "14px", margin: 0, lineHeight: 1.5 }}>
                  Your Pro plan is active until {formatDate(planInfo?.expires_at || null)}.
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "8px", backgroundColor: "rgba(37,99,235,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Tag size={20} color="#2563EB" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 2px" }}>Enter Promo Code</h3>
                    <p style={{ fontSize: "12.5px", color: "#64748B", margin: 0 }}>Activate Pro for 1 full year</p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleActivatePromo()}
                    placeholder="e.g. PDFMOUNT2025"
                    autoFocus
                    style={{
                      padding: "13px 16px",
                      borderRadius: "8px",
                      border: promoError ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
                      backgroundColor: "transparent",
                      color: "inherit",
                      outline: "none",
                      fontSize: "15px",
                      fontFamily: "JetBrains Mono, monospace",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      transition: "border-color 0.2s"
                    }}
                  />

                  {promoError && (
                    <p style={{ margin: 0, fontSize: "13px", color: "#ef4444", display: "flex", alignItems: "center", gap: "6px" }}>
                      <X size={13} /> {promoError}
                    </p>
                  )}

                  <button
                    onClick={handleActivatePromo}
                    disabled={promoLoading}
                    className="pricing-btn pricing-btn-primary"
                    style={{
                      padding: "13px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      opacity: promoLoading ? 0.75 : 1
                    }}
                  >
                    {promoLoading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Activating...</> : <><Zap size={15} /> Activate Pro Plan</>}
                  </button>

                  <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#94A3B8", textAlign: "center", lineHeight: 1.5 }}>
                    Activating a code gives you 1 full year of Pro access.<br />
                    100 jobs/day · 500 MB files · Priority processing.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="stitch-container" style={{ paddingTop: "32px" }}>

        {/* Hero Section */}
        <div className="pricing-hero-sec">
          <h1>Plans for every workflow.</h1>
          <p>
            Start free, upgrade with a promo code. No credit card required.
          </p>
          {currentUser && isProActive && planInfo?.expires_at && (
            <div style={{ marginTop: "16px", backgroundColor: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: "9999px", padding: "6px 18px", fontSize: "12.5px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px", color: "#2563EB", width: "fit-content" }}>
              <Crown size={13} /> Pro active · Expires {formatDate(planInfo.expires_at)}
            </div>
          )}
        </div>

        {/* Pricing Cards Grid */}
        <div className="pricing-grid">
          {tiers.map((tier) => (
            <div 
              key={tier.name} 
              className={`pricing-card ${tier.featured ? "featured" : ""} ${tier.isCurrent ? "current-plan-border" : ""}`}
            >
              {tier.featured && (
                <div className="pricing-card-badge">
                  Most Popular
                </div>
              )}
              {tier.isCurrent && !tier.featured && (
                <div className="pricing-card-badge" style={{ backgroundColor: "#475569" }}>
                  Current Plan
                </div>
              )}

              <div style={{ marginBottom: "20px" }}>
                <h3>{tier.name}</h3>
                <p className="pricing-desc">{tier.desc}</p>
              </div>

              <div className="price-wrap">
                <span className="price-val">{tier.price}</span>
                {tier.sub && <span className="price-period">{tier.sub}</span>}
              </div>

              <ul className="features-list">
                {tier.features.map(f => (
                  <li key={f} className="feature-item">
                    <CheckCircle2 size={15} className="feature-icon" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={tier.ctaAction}
                disabled={(tier.isCurrent && tier.name !== "Starter") || checkoutLoading}
                className={`pricing-btn ${tier.isCurrent ? "pricing-btn-disabled" : tier.featured ? "pricing-btn-primary" : "pricing-btn-outline"}`}
              >
                {checkoutLoading && tier.name === "Pro"
                  ? "Processing..."
                  : planLoading && tier.name === "Pro"
                  ? "Loading..."
                  : tier.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Comparison Table Section */}
        <section style={{ marginBottom: "80px" }}>
          <div style={{ marginBottom: "36px" }}>
            <h2 className="comparison-title">Compare Plans</h2>
            <p style={{ fontSize: "14.5px", color: "#64748B", margin: 0 }}>Exact limits enforced on every request.</p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th style={{ width: "38%" }}>Feature</th>
                  <th style={{ textAlign: "center" }}>Starter</th>
                  <th style={{ textAlign: "center", color: "#2563EB", fontWeight: 700 }}>Pro</th>
                  <th style={{ textAlign: "center" }}>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature}>
                    <td style={{ fontWeight: 600 }}>{row.feature}</td>
                    <td style={{ textAlign: "center" }}>{row.starter}</td>
                    <td style={{ textAlign: "center", fontWeight: 700, color: "#2563EB" }}>{row.pro}</td>
                    <td style={{ textAlign: "center" }}>{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Promo Code CTA Banner */}
        <section className="promo-banner">
          <h2 className="comparison-title" style={{ fontSize: "28px", marginBottom: "12px" }}>Have a promo code?</h2>
          <p>
            Enter your code to activate a 1-year Pro trial plan — 500MB files, 100 jobs/day, priority support.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={handleOpenPromo} className="pricing-btn pricing-btn-primary" style={{ width: "auto", padding: "14px 32px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <Tag size={16} /> Enter Promo Code
            </button>
            <button onClick={onBack} className="pricing-btn pricing-btn-outline" style={{ width: "auto", padding: "14px 32px" }}>
              Explore Free Tools
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
export default PricingPage;
