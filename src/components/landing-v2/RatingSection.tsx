import React, { useState } from "react";

export function RatingSection() {
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleRating = (value: number) => {
    setRating(value);
    setSubmitted(true);
    // Simulating sending rating to backend or telemetry
    console.log(`User rated PDFMount: ${value} stars`);
  };

  return (
    <section className="v2-rating-section">
      <div className="v2-container">
        <div className="v2-rating-card">
          {!submitted ? (
            <div className="v2-rating-content">
              <h3>Enjoying PDFMount? Rate your experience</h3>
              <div className="v2-rating-stars-wrap">
                <div className="v2-rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`v2-rating-star-btn ${
                        star <= (hoverRating ?? rating ?? 0) ? "active" : ""
                      }`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => handleRating(star)}
                      aria-label={`Rate ${star} stars`}
                    >
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="v2-star-icon"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <span className="v2-rating-summary">
                  Average <strong>4.9/5</strong> stars from 12,500+ users
                </span>
              </div>
            </div>
          ) : (
            <div className="v2-rating-success">
              <div className="v2-success-icon-wrap">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="v2-success-text">
                <h3>Thank you for your rating!</h3>
                <p>
                  {rating && rating >= 4
                    ? "We're glad you love using PDFMount. We'll continue keeping it free and fast!"
                    : "Thanks for your feedback! We will use it to improve our tools."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default RatingSection;
