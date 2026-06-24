import React, { useState } from "react";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [sent, setSent] = useState(false);

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
    <section className="v2-contact">
      <div className="v2-container v2-contact-inner">
        <div className="v2-contact-form-wrap">
          <h2>Ask a question</h2>
          <p>Have questions about enterprise plans, security integrations, or custom tools? Drop us a message.</p>

          <form className="v2-form" onSubmit={handleSubmit}>
            <div className="v2-form-row">
              <div className="v2-input-group">
                <label htmlFor="v2-name">Full Name label</label>
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
                <label htmlFor="v2-email">Email Address label</label>
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
              <label htmlFor="v2-message">Message label</label>
              <textarea
                id="v2-message"
                className="v2-textarea"
                placeholder="Write a message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="v2-pill-primary" style={{ alignSelf: "flex-start" }}>
              {sent ? "Message Sent!" : "Send Message"}
            </button>
          </form>
        </div>

        <div className="v2-hero-illustration">
          <img
            src="/v2_contact.png"
            alt="Contact Illustration"
            style={{ width: "100%", maxWidth: "460px", height: "auto" }}
          />
        </div>
      </div>
    </section>
  );
}
