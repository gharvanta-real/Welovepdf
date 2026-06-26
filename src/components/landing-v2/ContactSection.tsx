import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export function ContactSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [sent, setSent] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Auto-collapse when user scrolls away
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setIsOpen(false);
        }
      },
      { threshold: 0.05 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setFormData({ name: "", email: "", message: "" });
      }, 3000);
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="v2-contact"
      style={{
        padding: isOpen ? "80px 0" : "24px 0",
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div className="v2-container">
        {/* Clickable Header for default / mini state */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            padding: "8px 0",
            userSelect: "none"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div>
              <h2 style={{ 
                margin: 0, 
                fontSize: "22px", 
                fontWeight: 700,
                color: "var(--v2-text-main, #1e293b)",
                letterSpacing: "-0.5px"
              }}>
                Ask a question
              </h2>
              {!isOpen && (
                <span style={{ 
                  fontSize: "13px", 
                  color: "var(--v2-text-muted, #64748b)",
                  display: "block",
                  marginTop: "2px"
                }}>
                  Have questions about enterprise plans, security integrations, or custom tools? Click to expand.
                </span>
              )}
            </div>
          </div>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: isOpen ? "var(--v2-primary, #2563eb)" : "rgba(0, 0, 0, 0.05)",
            color: isOpen ? "#ffffff" : "var(--v2-text-main, #1e293b)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          }}>
            <ChevronDown size={18} />
          </div>
        </div>

        {/* Expandable Body Container */}
        <div style={{
          maxHeight: isOpen ? "1000px" : "0px",
          opacity: isOpen ? 1 : 0,
          overflow: "hidden",
          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          marginTop: isOpen ? "32px" : "0px",
          pointerEvents: isOpen ? "auto" : "none"
        }}>
          <div className="v2-contact-inner" style={{ 
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "64px",
            alignItems: "center",
            display: "grid"
          }}>
            <div className="v2-contact-form-wrap">
              <form className="v2-form" onSubmit={handleSubmit}>
                <div className="v2-form-row">
                  <div className="v2-input-group">
                    <label htmlFor="v2-name">Full Name</label>
                    <input
                      type="text"
                      id="v2-name"
                      className="v2-input"
                      placeholder="Enter name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="v2-input-group">
                    <label htmlFor="v2-email">Email Address</label>
                    <input
                      type="email"
                      id="v2-email"
                      className="v2-input"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="v2-input-group">
                  <label htmlFor="v2-message">Message</label>
                  <textarea
                    id="v2-message"
                    className="v2-textarea"
                    placeholder="Write a message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    style={{ minHeight: "120px" }}
                  />
                </div>

                <button type="submit" className="v2-pill-primary" style={{ alignSelf: "flex-start", marginTop: "8px" }}>
                  {sent ? "Message Sent!" : "Send Message"}
                </button>
              </form>
            </div>

            <div className="v2-hero-illustration" style={{ display: "flex", justifyContent: "center" }}>
              <img
                src="/v2_contact.png"
                alt="Contact Illustration"
                style={{ width: "100%", maxWidth: "400px", height: "auto" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
