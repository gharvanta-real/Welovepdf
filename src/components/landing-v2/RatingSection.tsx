import React, { useState, useEffect } from "react";

export function RatingSection() {
  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [stats, setStats] = useState({ avg_rating: 4.9, total_ratings: 12500 });

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/public-stats");
      if (res.ok) {
        const data = await res.json();
        setStats({
          avg_rating: data.avg_rating,
          total_ratings: data.total_ratings,
        });
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRating = async (value: number) => {
    setRating(value);
    setSubmitted(true);
    try {
      await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: value }),
      });
      fetchStats(); // Update stats after submitting
    } catch (err) {
      console.error("Error submitting rating:", err);
    }
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
                  Average <strong>{stats.avg_rating.toFixed(1)}/5</strong> stars from {stats.total_ratings.toLocaleString()}+ users
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
