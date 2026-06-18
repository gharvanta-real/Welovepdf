import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, Tag, X, Loader2, Crown, Zap } from "lucide-react";

interface PricingPageProps {
  currentUser: { name: string; email: string; plan?: string } | null;
  onUpgradeSuccess: (planName: string) => void;
  onLoginRequired: () => void;
  onBack: () => void;
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

export function PricingPage({ currentUser, onUpgradeSuccess, onLoginRequired, onBack }: PricingPageProps) {
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [planLoading, setPlanLoading] = useState(false);

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
      color: "#000000",
      isCurrent: !isProActive,
      featured: false,
      features: [
        "5 jobs per day",
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
      color: "#10b981",
      isCurrent: isProActive,
      featured: true,
      features: [
        "100 jobs per day",
        "500 MB file size limit",
        "All core PDF tools",
        "Priority processing",
        "Advanced annotations & editor",
        "Priority support (24/5)",
        "Plan active for 1 full year",
      ],
      cta: isProActive ? "✓ Current Plan" : "Activate with Promo Code",
      ctaAction: handleOpenPromo,
    },
    {
      name: "Enterprise",
      price: "Custom",
      sub: "",
      desc: "For teams requiring control and scale.",
      color: "#6366f1",
      isCurrent: false,
      featured: false,
      features: [
        "Unlimited daily jobs",
        "Unlimited file size",
        "Dedicated processing servers",
        "SSO & Advanced Security",
        "Admin dashboard",
        "Unlimited storage",
        "24/7 VIP dedicated support",
        "Custom API integration",
      ],
      cta: "Contact Sales",
      ctaAction: () => onBack(),
    },
  ];

  const comparisonRows = [
    { feature: "Jobs per day", starter: "5", pro: "100", enterprise: "Unlimited" },
    { feature: "Max file size", starter: "50 MB", pro: "500 MB", enterprise: "Unlimited" },
    { feature: "All PDF Tools", starter: "✓", pro: "✓", enterprise: "✓" },
    { feature: "Priority Processing", starter: "—", pro: "✓", enterprise: "✓" },
    { feature: "Annotations & Editor", starter: "Basic", pro: "Full", enterprise: "Full" },
    { feature: "Plan Duration", starter: "Permanent", pro: "1 year / code", enterprise: "Custom" },
    { feature: "API Access", starter: "—", pro: "Add-on", enterprise: "✓" },
    { feature: "SSO / Security", starter: "—", pro: "—", enterprise: "✓" },
    { feature: "Support", starter: "Community", pro: "24/5 Priority", enterprise: "24/7 VIP" },
  ];

  return (
    <div className="stitch-landing" style={{ width: "100%", minHeight: "100vh", backgroundColor: "#ffffff", color: "#1b1b1b", paddingBottom: "120px" }}>

      {/* Promo Code Modal */}
      {showPromoModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "20px", padding: "40px", maxWidth: "440px", width: "100%", position: "relative", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
            <button onClick={() => setShowPromoModal(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
              <X size={20} />
            </button>

            {promoSuccess ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg,#000,#10b981)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <Crown size={24} color="#fff" />
                </div>
                <h3 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>Pro Activated! 🎉</h3>
                <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
                  Your Pro plan is active until {formatDate(planInfo?.expires_at || null)}.
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg,#000,#10b981)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Tag size={20} color="#fff" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 2px" }}>Enter Promo Code</h3>
                    <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>Activate Pro for 1 full year</p>
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
                      padding: "14px 18px",
                      borderRadius: "12px",
                      border: promoError ? "1.5px solid #ef4444" : "1.5px solid #e5e7eb",
                      outline: "none",
                      fontSize: "16px",
                      fontFamily: "JetBrains Mono, monospace",
                      fontWeight: 600,
                      letterSpacing: "1px",
                      transition: "border-color 0.2s",
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
                    style={{
                      padding: "14px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg,#000 0%,#10b981 100%)",
                      color: "#fff",
                      border: "none",
                      fontSize: "15px",
                      fontWeight: 600,
                      cursor: promoLoading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      opacity: promoLoading ? 0.75 : 1,
                      transition: "opacity 0.2s",
                    }}
                  >
                    {promoLoading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Activating...</> : <><Zap size={16} /> Activate Pro Plan</>}
                  </button>

                  <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af", textAlign: "center", lineHeight: 1.5 }}>
                    Activating a code gives you 1 full year of Pro access.<br />
                    100 jobs/day · 500 MB files · Priority processing.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="stitch-container" style={{ paddingTop: "60px" }}>

        {/* Back */}
        <button onClick={onBack} className="stitch-pill-outline" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 20px", fontSize: "14px", marginBottom: "40px" }}>
          <ArrowLeft size={16} /> Back to Tools
        </button>

        {/* Hero Section */}
        <section style={{ backgroundColor: "var(--s-block-lime, #D3F57B)", borderRadius: "16px", padding: "80px 48px 100px", overflow: "hidden", marginBottom: "80px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "64px" }}>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "13px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.8px", color: "rgba(0,0,0,0.5)", display: "block", marginBottom: "24px" }}>
                Transparent Pricing
              </span>
              <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "clamp(36px,6vw,72px)", lineHeight: 1.05, fontWeight: 340, color: "#000", letterSpacing: "-1.5px", marginBottom: "20px", maxWidth: "800px" }}>
                Plans for every workflow.
              </h1>
              <p style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "18px", lineHeight: "1.55", color: "rgba(0,0,0,0.65)", maxWidth: "600px", fontWeight: 320, margin: "0 auto" }}>
                Start free, upgrade with a promo code. No credit card required.
              </p>
              {currentUser && isProActive && planInfo?.expires_at && (
                <div style={{ marginTop: "24px", background: "rgba(0,0,0,0.08)", borderRadius: "9999px", padding: "8px 20px", fontSize: "13px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <Crown size={14} /> Pro active · Expires {formatDate(planInfo.expires_at)}
                </div>
              )}
            </div>

            {/* Pricing Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: "24px", alignItems: "stretch" }}>
              {tiers.map((tier) => (
                <div key={tier.name} style={{
                  backgroundColor: tier.featured ? "#000000" : "#ffffff",
                  color: tier.featured ? "#ffffff" : "#1b1b1b",
                  padding: "32px",
                  borderRadius: "16px",
                  border: tier.isCurrent ? `2px solid ${tier.color}` : tier.featured ? "1px solid #000" : "1px solid var(--s-hairline)",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  position: "relative",
                  boxShadow: tier.featured ? "0 20px 40px rgba(0,0,0,0.18)" : "none",
                  transform: tier.featured ? "scale(1.02)" : "none",
                  zIndex: tier.featured ? 2 : 1,
                  transition: "box-shadow 0.2s",
                }}>
                  {tier.featured && (
                    <div style={{ position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#10b981", color: "#fff", padding: "4px 16px", borderRadius: "9999px", fontSize: "11px", fontWeight: 600, fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", letterSpacing: "0.8px", whiteSpace: "nowrap" }}>
                      Most Popular
                    </div>
                  )}
                  {tier.isCurrent && !tier.featured && (
                    <div style={{ position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)", backgroundColor: tier.color, color: "#fff", padding: "4px 16px", borderRadius: "9999px", fontSize: "11px", fontWeight: 600, fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", letterSpacing: "0.8px", whiteSpace: "nowrap" }}>
                      Current Plan
                    </div>
                  )}

                  <div style={{ marginBottom: "24px" }}>
                    <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "22px", fontWeight: 540, marginBottom: "6px", color: tier.featured ? "#fff" : "#000" }}>{tier.name}</h3>
                    <p style={{ fontSize: "14px", color: tier.featured ? "rgba(255,255,255,0.65)" : "var(--s-secondary)", margin: 0 }}>{tier.desc}</p>
                  </div>

                  <div style={{ marginBottom: "28px" }}>
                    <span style={{ fontSize: "48px", fontWeight: 340, color: tier.featured ? "#fff" : "#000" }}>{tier.price}</span>
                    {tier.sub && <span style={{ fontSize: "14px", color: tier.featured ? "rgba(255,255,255,0.6)" : "var(--s-secondary)" }}>{tier.sub}</span>}
                    {tier.name === "Pro" && (
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: "4px 0 0" }}>Billed via promo code activation</p>
                    )}
                  </div>

                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 auto 0", display: "flex", flexDirection: "column", gap: "13px", flexGrow: 1, marginBottom: "32px" }}>
                    {tier.features.map(f => (
                      <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px", color: tier.featured ? "rgba(255,255,255,0.9)" : "#374151" }}>
                        <CheckCircle2 size={15} style={{ color: tier.isCurrent && !tier.featured ? tier.color : tier.featured ? "#10b981" : "#000", flexShrink: 0, marginTop: "1px" }} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={tier.ctaAction}
                    disabled={tier.isCurrent && tier.name !== "Starter"}
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: "9999px",
                      border: "none",
                      fontSize: "15px",
                      fontWeight: 600,
                      cursor: (tier.isCurrent && tier.name !== "Starter") ? "default" : "pointer",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      backgroundColor: tier.featured
                        ? (tier.isCurrent ? "rgba(255,255,255,0.15)" : "#ffffff")
                        : tier.isCurrent ? "#f3f4f6" : "#000000",
                      color: tier.featured
                        ? (tier.isCurrent ? "rgba(255,255,255,0.7)" : "#000000")
                        : tier.isCurrent ? "#9ca3af" : "#ffffff",
                      opacity: (tier.isCurrent && tier.name !== "Starter") ? 0.7 : 1,
                      transition: "opacity 0.15s",
                    }}
                  >
                    {planLoading && tier.name === "Pro" ? "Loading..." : tier.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section style={{ marginBottom: "80px" }}>
          <div style={{ marginBottom: "48px" }}>
            <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 540, letterSpacing: "-0.5px", margin: "0 0 8px" }}>Compare Plans</h2>
            <p style={{ fontSize: "16px", color: "var(--s-secondary)", margin: 0 }}>Exact limits enforced on every request.</p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #000" }}>
                  <th style={{ padding: "16px 12px", fontSize: "15px", fontWeight: 600, width: "38%" }}>Feature</th>
                  <th style={{ padding: "16px 12px", fontSize: "15px", fontWeight: 500, textAlign: "center", color: "var(--s-secondary)" }}>Starter</th>
                  <th style={{ padding: "16px 12px", fontSize: "15px", fontWeight: 700, textAlign: "center", color: "#10b981", background: "#f0fdf4", borderRadius: "8px" }}>Pro ★</th>
                  <th style={{ padding: "16px 12px", fontSize: "15px", fontWeight: 500, textAlign: "center", color: "var(--s-secondary)" }}>Enterprise</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "14px" }}>
                {comparisonRows.map((row, i) => (
                  <tr key={row.feature} style={{ borderBottom: "1px solid var(--s-hairline-soft)", backgroundColor: i % 2 === 0 ? "transparent" : "#fafafa" }}>
                    <td style={{ padding: "16px 12px", fontWeight: 500 }}>{row.feature}</td>
                    <td style={{ padding: "16px 12px", textAlign: "center", color: row.starter === "—" ? "#d1d5db" : "#374151" }}>{row.starter}</td>
                    <td style={{ padding: "16px 12px", textAlign: "center", fontWeight: 600, color: "#10b981", background: "#f0fdf4" }}>{row.pro}</td>
                    <td style={{ padding: "16px 12px", textAlign: "center", color: row.enterprise === "—" ? "#d1d5db" : "#374151" }}>{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Promo Code CTA Banner */}
        <section style={{ background: "linear-gradient(135deg, #000 0%, #10b981 100%)", borderRadius: "20px", padding: "64px 40px", textAlign: "center", color: "#fff" }}>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "16px" }}>
            Get Pro Access
          </span>
          <h2 style={{ fontSize: "clamp(28px,5vw,46px)", fontWeight: 340, letterSpacing: "-0.8px", margin: "0 0 12px", color: "#fff" }}>
            Have a promo code?
          </h2>
          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.7)", margin: "0 0 36px", fontWeight: 320 }}>
            Enter your code to unlock Pro for a full year — 500MB files, 100 jobs/day, priority support.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={handleOpenPromo} style={{ padding: "16px 40px", borderRadius: "9999px", background: "#fff", color: "#000", border: "none", fontSize: "16px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              <Tag size={18} /> Enter Promo Code
            </button>
            <button onClick={onBack} style={{ padding: "16px 40px", borderRadius: "9999px", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", fontSize: "16px", cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              Explore Free Tools
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
