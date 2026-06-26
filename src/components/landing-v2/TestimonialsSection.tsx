import React from "react";

// 1. People Trust Us Icon
const PeopleIllustration = () => (
  <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: "8px" }}>
    <circle cx="20" cy="24" r="8" fill="#CBD5E1" opacity="0.6" />
    <path d="M8 44c0-6.6 5.4-12 12-12s12 5.4 12 12v4H8v-4z" fill="#CBD5E1" opacity="0.6" />
    <circle cx="44" cy="24" r="8" fill="#CBD5E1" opacity="0.6" />
    <path d="M32 44c0-6.6 5.4-12 12-12s12 5.4 12 12v4H32v-4z" fill="#CBD5E1" opacity="0.6" />
    <circle cx="32" cy="20" r="10" fill="#CBD5E1" />
    <path d="M17 40c0-8.3 6.7-15 15-15s15 6.7 15 15v4H17v-4z" fill="#94A3B8" />
    <rect x="14" y="44" width="36" height="10" rx="5" fill="#EF4444" />
    <text x="32" y="49.5" fill="#FFFFFF" fontSize="5.5px" fontWeight="900" fontFamily="'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif" textAnchor="middle" dominantBaseline="central">100% FREE</text>
  </svg>
);

// 2. Businesses Trust Us Icon
const BusinessIllustration = () => (
  <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: "8px" }}>
    <rect x="6" y="24" width="10" height="26" rx="2" fill="#E2E8F0" />
    <rect x="20" y="14" width="10" height="36" rx="2" fill="#CBD5E1" />
    <rect x="34" y="6" width="10" height="44" rx="2" fill="#2563EB" opacity="0.15" />
    <path d="M11 20l14-7 14-4 14 7" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M53 16l-5-2v5" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <g fill="#F59E0B">
      <path d="M12 54l1.2 2.4 2.6.4-1.9 1.8.4 2.6-2.3-1.2-2.3 1.2.4-2.6-1.9-1.8 2.6-.4z" />
      <path d="M22 54l1.2 2.4 2.6.4-1.9 1.8.4 2.6-2.3-1.2-2.3 1.2.4-2.6-1.9-1.8 2.6-.4z" />
      <path d="M32 54l1.2 2.4 2.6.4-1.9 1.8.4 2.6-2.3-1.2-2.3 1.2.4-2.6-1.9-1.8 2.6-.4z" />
      <path d="M42 54l1.2 2.4 2.6.4-1.9 1.8.4 2.6-2.3-1.2-2.3 1.2.4-2.6-1.9-1.8 2.6-.4z" />
      <path d="M52 54l1.2 2.4 2.6.4-1.9 1.8.4 2.6-2.3-1.2-2.3 1.2.4-2.6-1.9-1.8 2.6-.4z" />
    </g>
  </svg>
);

// 3. Partners Trust Us Icon
const PartnerIllustration = () => (
  <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: "8px" }}>
    <circle cx="16" cy="32" r="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
    <path d="M16 22a10 10 0 0110 10h-10v-10z" fill="#EF4444" />
    <path d="M26 32a10 10 0 01-10 10v-10h10z" fill="#10B981" />
    <path d="M16 42a10 10 0 01-10-10h10v10z" fill="#F59E0B" />
    <path d="M6 32a10 10 0 0110-10v10H6z" fill="#3B82F6" />
    <circle cx="16" cy="32" r="4" fill="#FFFFFF" />
    <circle cx="44" cy="20" r="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
    <path d="M38 20l6-6 6 6-6 6-6-6z" fill="#3B82F6" />
    <path d="M38 20v6h6v-6h-6z" fill="#1E3A8A" opacity="0.35" />
    <circle cx="34" cy="44" r="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
    <path d="M34 36l6 11H28l6-11z" fill="#10B981" />
    <path d="M34 36l3 5.5H31l3-5.5z" fill="#3B82F6" />
  </svg>
);

// 4. 24/7 Support Icon
const SupportIllustration = () => (
  <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: "8px" }}>
    <rect x="8" y="14" width="36" height="26" rx="6" fill="#f4f4f4" stroke="#CBD5E1" strokeWidth="2" />
    <rect x="26" y="24" width="30" height="24" rx="6" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" />
    <path d="M20 40l-4 6v-6h4z" fill="#CBD5E1" />
    <path d="M44 48l4 6v-6h-4z" fill="#3B82F6" />
    <rect x="32" y="32" width="18" height="8" rx="4" fill="#2563EB" />
    <text x="41" y="36.5" fill="#FFFFFF" fontSize="5.5px" fontWeight="900" fontFamily="'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif" textAnchor="middle" dominantBaseline="central">24/7</text>
    <circle cx="18" cy="24" r="2" fill="#CBD5E1" />
    <circle cx="24" cy="24" r="2" fill="#CBD5E1" />
    <circle cx="30" cy="24" r="2" fill="#CBD5E1" />
  </svg>
);

// 5. 256-Bit TLS Encryption Icon
const EncryptionIllustration = () => (
  <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: "8px" }}>
    <rect x="10" y="18" width="44" height="32" rx="6" fill="#EBF2FF" stroke="#2563EB" strokeWidth="2" />
    <circle cx="32" cy="34" r="8" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
    <rect x="29" y="32" width="6" height="5" rx="1" fill="#2563EB" />
    <path d="M26 18V11c0-3.3 2.7-6 6-6s6 2.7 6 6v7" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 6. Strict Privacy Standards Icon
const PrivacyIllustration = () => (
  <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: "8px" }}>
    <circle cx="32" cy="32" r="24" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="3 3" />
    <circle cx="32" cy="32" r="20" fill="#EBF2FF" stroke="#2563EB" strokeWidth="2" />
    <path d="M25 32l5 5 10-10" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <text x="32" y="44" fill="#1E3A8A" fontSize="4.5px" fontWeight="900" fontFamily="'Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', sans-serif" textAnchor="middle">ISO 27001</text>
  </svg>
);

export function TestimonialsSection() {
  const chooseItems = [
    {
      Illustration: PrivacyIllustration,
      title: "Privacy by Design",
      description: "We never store your files. Documents are processed in isolated, transient sandboxes and purged from our memory after 60 minutes with zero logs."
    },
    {
      Illustration: EncryptionIllustration,
      title: "Military-Grade Security",
      description: "All file transfers are protected with end-to-end 256-bit SSL/TLS encryption. Your sensitive information is safe and secure."
    },
    {
      Illustration: PeopleIllustration,
      title: "Zero Sign-Ups Required",
      description: "Start using all premium PDF tools immediately. We don't lock basic features behind forced accounts or collection forms."
    },
    {
      Illustration: BusinessIllustration,
      title: "Loved by Millions",
      description: "Trusted by students, designers, and business professionals worldwide for light-weight, high-fidelity, and secure PDF tools."
    },
    {
      Illustration: PartnerIllustration,
      title: "Seamless Cloud Sync",
      description: "Import and save documents directly to your favorite platforms, including Google Drive, Dropbox, and major web browsers."
    },
    {
      Illustration: SupportIllustration,
      title: "Round-the-Clock Help",
      description: "Our dedicated support team is available 24/7 to help you resolve document issues, configure tools, or guide your workflow."
    }
  ];

  return (
    <section className="v2-testimonials">
      <div className="v2-container">
        <div className="v2-testimonials-header">
          <h2>Why Choose PDFMount?</h2>
          <p>Trusted by millions - built for privacy, speed, and simplicity.</p>
        </div>
        <div className="v2-why-grid">
          {chooseItems.map((item, idx) => {
            const SvgIcon = item.Illustration;
            return (
              <div className="v2-why-card" key={idx}>
                <SvgIcon />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
export default TestimonialsSection;

