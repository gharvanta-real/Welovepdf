import React from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

interface AboutPageProps {
  onBack: () => void;
  onViewChange: (view: any) => void;
}

export function AboutPage({ onBack, onViewChange }: AboutPageProps) {
  const teamMembers = [
    {
      name: "Marcus Thorne",
      role: "Founder & CEO",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWOSg1e6bZE0N9ygVsRToKJL6pKAK9Mhn4HJOygDizT-z7S1yt3VRdzi9GpXVkaHAfzXNXYDfIFANcNISjnU_miX3iHBYvJDQQat10kywSrRe8beLj3YHw_rYdZMzYgftil7U75xV4xh4jllHrcbDK8VxKfeVRbaa-axY9YzQRdpPWMX8_bfC0UvEZJtu-UtkaTZlzuWCAnbVg_Es7dKp0_Bld53ZO5AHkbOy49ATC3BJBkBEAXHVX42SIFKQwJKqUpFGGvqtx__8"
    },
    {
      name: "Elena Rodriguez",
      role: "Head of Engineering",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJWMQjue6mQEHNaFiXdysHzGdWE7dXF2XzhmIjzp295Bh8OJzgWQ1BoZq8DENvQRA8d2Z8oQoziY1ZzfdizpOOq3WVNv4xXriHb_Rpzd-wPlBXwWZsdujyZVN9JcES9Up1l09JFfjAQI0FiXfjouKZ1js7FqH6cn1OucsuOc_hYvMnzfe9m1fH1qBvsNaG19WLm5G_P75GtdOTGFLxDTVfF8YScs4lX8C20BS9ryAVAy-xYiMMezYgnvved1VxiI-PtS-eGizFhHM"
    },
    {
      name: "Julian Chen",
      role: "Design Director",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDMFVXcoWI2_G_KNrTlGR_r2nnpkMfJZ0pJgw3lfuTeCGZiUqub8LoLofwjmXxuKBuZk3upjGNYtguRaVQKbooZNBHjVA_pOo0CbcAg3MhIBgaOSKFLhObd6b3jJPg3Q-16sxAk6evcP69BzSXpMzlr4qlA0z4GBXOw4QjupcHtjidz5v_tqZSYuyoDV_7CTOBO0C_LzZsyGNW0juZ1hi_drqmPDIQT7jr77ufoYIIB0afJa6V9IUQ6N7IBInqDdnqU84C2Pk7-kuA"
    },
    {
      name: "Sarah Vance",
      role: "Operations",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCrZW3aK10Fpnmwyk8FAuKcoiOtJuTxwMvmQvBwPtNjTngtWsWRrFGBId-HOSx8F3P8CctwMdvHgfiHIl3K3lDD1qXkcO-Jn9Anc0o9Y7pS-mOxRX_7JW_1dKObVr7bo6AeIDg6SqdjcmpHS63Rk4ttTaP-lbmwZSs_CCOiGEGXvvQ7P0mksDm3QwcoCLLXylhIitUk9l8k4ujE6lOn3UuLA0S9tUDBxMSSFbGlLSMeFAA0_xbi2-A7fdNSH2DmifHo4AbH2cHEW0"
    }
  ];

  return (
    <div className="stitch-landing" style={{ width: "100%", minHeight: "100vh", backgroundColor: "var(--s-background, #f9f9f9)", paddingBottom: "120px" }}>
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
          <ArrowLeft size={16} /> Back
        </button>
 
        {/* Identity Hero */}
        <div style={{ marginBottom: "64px", maxWidth: "900px" }}>
          <span className="eyebrow" style={{ color: "var(--s-secondary)", textTransform: "uppercase", fontSize: "14px", letterSpacing: "1px", display: "block", marginBottom: "16px" }}>
            Our Identity
          </span>
          <h1 style={{ fontSize: "clamp(36px, 7vw, 76px)", fontWeight: 340, letterSpacing: "-1.50px", lineHeight: 1.05, marginBottom: "24px", color: "var(--s-primary)" }}>
            Redefining the document <span style={{ fontStyle: "italic" }}>interface.</span>
          </h1>
        </div>
 
        {/* The Mission Navy Block */}
        <div 
          style={{ 
            backgroundColor: "var(--s-block-navy, #10162F)", 
            color: "#ffffff", 
            borderRadius: "24px", 
            padding: "clamp(32px, 5vw, 64px)", 
            display: "flex", 
            flexDirection: "row", 
            flexWrap: "wrap", 
            gap: "48px", 
            alignItems: "center", 
            justifyContent: "space-between", 
            minHeight: "500px", 
            position: "relative", 
            overflow: "hidden", 
            marginBottom: "64px" 
          }}
        >
          <div style={{ flex: "1 1 400px", zIndex: 2, display: "flex", flexDirection: "column", gap: "24px" }}>
            <h2 style={{ fontSize: "clamp(32px, 4.5vw, 54px)", fontWeight: 340, letterSpacing: "-0.96px", margin: 0 }}>The Mission</h2>
            <p style={{ fontSize: "20px", fontWeight: 330, opacity: 0.8, lineHeight: 1.5, margin: 0, maxWidth: "480px" }}>
              We believe that static documents shouldn't hold back dynamic ideas. Pdfmount.com was founded to bridge the gap between fixed-format reliability and fluid creative potential.
            </p>
            <div>
              <button 
                onClick={() => {
                  document.getElementById("stitch-values-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="stitch-pill-outline" 
                style={{ backgroundColor: "#ffffff", color: "#10162F", border: "none", display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 28px", fontSize: "15px", fontWeight: "600" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--s-block-mint)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#ffffff"}
              >
                Learn our Story <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
          
          <div 
            style={{ 
              flex: "1 1 350px", 
              height: "350px", 
              borderRadius: "16px", 
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCqQEQkrvObfS0sYSTybtbXgOOAIsxTbuS2QSAL5zT67P8PqV5Sp4xsrkWxcDP1L7NmMhpBd27-c0wuJjZlbcoH9nZgTsk080VjU6Omcdllga2MahdkhdNFOKNfqwGu-mClV0plQhT42xlp0xP5gK2blNw1gMA66Hcr2AJ61_XEw9UfekihF4iFI7MWPOZX3ZGqBB8DYY2gT7yxtLj0J0TMZbyLczJifEO_BSa6n24oiEFp1DQPsTQ_fgjFWxOyzOfIAuj9JycZouU')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.85,
              zIndex: 1
            }}
          ></div>
        </div>
 
        {/* Brand Values Block */}
        <div id="stitch-values-section" style={{ backgroundColor: "var(--s-surface-soft)", borderRadius: "24px", padding: "48px", border: "1px solid var(--s-hairline)", marginBottom: "64px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "48px" }}>
            <div>
              <span className="eyebrow" style={{ fontSize: "12px", color: "var(--s-secondary)" }}>01 / UTILITY</span>
              <h3 style={{ fontSize: "20px", fontWeight: 540, marginTop: "16px", marginBottom: "12px", color: "var(--s-primary)" }}>Precision First</h3>
              <p style={{ fontSize: "16px", fontWeight: 320, color: "var(--s-on-surface-variant)", lineHeight: 1.5, margin: 0 }}>Our tools are built for professionals who demand pixel-perfect control. No compromises on quality, ever.</p>
            </div>
            <div>
              <span className="eyebrow" style={{ fontSize: "12px", color: "var(--s-secondary)" }}>02 / VISION</span>
              <h3 style={{ fontSize: "20px", fontWeight: 540, marginTop: "16px", marginBottom: "12px", color: "var(--s-primary)" }}>Future Proof</h3>
              <p style={{ fontSize: "16px", fontWeight: 320, color: "var(--s-on-surface-variant)", lineHeight: 1.5, margin: 0 }}>We leverage AI and next-gen rendering to ensure your documents scale with your growing ambitions.</p>
            </div>
            <div>
              <span className="eyebrow" style={{ fontSize: "12px", color: "var(--s-secondary)" }}>03 / EMPATHY</span>
              <h3 style={{ fontSize: "20px", fontWeight: 540, marginTop: "16px", marginBottom: "12px", color: "var(--s-primary)" }}>User Centered</h3>
              <p style={{ fontSize: "16px", fontWeight: 320, color: "var(--s-on-surface-variant)", lineHeight: 1.5, margin: 0 }}>Technology should fade into the background. We design interfaces that let your work shine brighter.</p>
            </div>
          </div>
        </div>
 
        {/* Team Section */}
        <div style={{ marginBottom: "80px" }}>
          <div style={{ marginBottom: "48px" }}>
            <span className="eyebrow" style={{ color: "var(--s-secondary)", textTransform: "uppercase", fontSize: "12px", display: "block", marginBottom: "8px" }}>
              The Architects
            </span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 540, letterSpacing: "-0.5px", margin: 0 }}>The Team</h2>
            <p style={{ color: "var(--s-on-surface-variant)", fontSize: "18px", fontWeight: 320, maxWidth: "600px", marginTop: "16px" }}>
              A diverse group of engineers, designers, and document enthusiasts working to rebuild the standard of digital communication.
            </p>
          </div>
 
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "32px" }}>
            {teamMembers.map((member, idx) => (
              <div 
                key={member.name} 
                style={{ 
                  cursor: "pointer", 
                  marginTop: idx % 2 === 1 ? "32px" : "0px",
                  transition: "transform 0.3s"
                }}
                onMouseEnter={(e) => {
                  const imgEl = e.currentTarget.querySelector("img");
                  if (imgEl) {
                    imgEl.style.transform = "scale(1.05)";
                    imgEl.style.filter = "none";
                  }
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  const imgEl = e.currentTarget.querySelector("img");
                  if (imgEl) {
                    imgEl.style.transform = "scale(1)";
                    imgEl.style.filter = "grayscale(100%)";
                  }
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ aspectRatio: "4/5", overflow: "hidden", borderRadius: "12px", backgroundColor: "var(--s-surface-low)", marginBottom: "20px" }}>
                  <img 
                    src={member.img} 
                    alt={member.name} 
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      objectFit: "cover", 
                      filter: "grayscale(100%)", 
                      transition: "transform 0.5s, filter 0.5s" 
                    }} 
                  />
                </div>
                <h4 style={{ fontSize: "20px", fontWeight: 540, color: "var(--s-primary)", margin: "0 0 4px 0" }}>{member.name}</h4>
                <p className="eyebrow" style={{ fontSize: "12px", color: "var(--s-secondary)", textTransform: "uppercase", margin: 0 }}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
 
        {/* Ready to edit future CTA */}
        <div 
          style={{ 
            backgroundColor: "var(--s-primary)", 
            color: "var(--s-on-primary)", 
            borderRadius: "24px", 
            padding: "clamp(32px, 6vw, 64px)", 
            textAlign: "center" 
          }}
        >
          <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 540, letterSpacing: "-0.5px", marginBottom: "32px" }}>
            Ready to edit the future?
          </h2>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <button 
              onClick={() => onViewChange("home")}
              className="stitch-pill-outline" 
              style={{ backgroundColor: "#ffffff", borderColor: "#ffffff", color: "var(--s-primary)", padding: "14px 32px", fontSize: "15px" }}
            >
              Get Started Free
            </button>
            <button 
              onClick={() => {
                alert("We are always looking for passionate document engineers! Please let us know your profile details using this contact form.");
                onViewChange("contact");
              }}
              className="stitch-pill-outline" 
              style={{ borderColor: "rgba(255,255,255,0.3)", color: "#ffffff", padding: "14px 32px", fontSize: "15px" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              View Careers
            </button>
          </div>
        </div>
 
      </div>
    </div>
  );
}
