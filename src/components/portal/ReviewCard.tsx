"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface ReviewData {
  id: string;
  rating: number;
  review_text: string;
  display_name: string;
  is_approved: boolean;
  created_at: string;
}

function StarIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      className={`w-7 h-7 ${filled ? "text-[#fbbf24]" : "text-[#334155]"} ${className || ""}`}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default function ReviewCard({ customerName }: { customerName: string }) {
  const [review, setReview] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [displayName, setDisplayName] = useState(customerName);

  useEffect(() => {
    fetch("/api/reviews/mine")
      .then((r) => r.json())
      .then((data) => {
        if (data.review) setReview(data.review);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!reviewText.trim()) {
      toast.error("Please write a review");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          review_text: reviewText,
          display_name: displayName,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Review submitted! It will appear on our site once approved.");
        setReview(data.review);
      } else {
        toast.error(data.error || "Failed to submit review");
      }
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-32 bg-[#1e293b] rounded-lg" />
      </div>
    );
  }

  // Already submitted — show existing review
  if (review) {
    return (
      <div className="card">
        <div className="flex items-start justify-between mb-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon key={star} filled={star <= review.rating} />
            ))}
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              review.is_approved
                ? "bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30"
                : "bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30"
            }`}
          >
            {review.is_approved ? "Published" : "Pending Approval"}
          </span>
        </div>
        <p className="text-[#cbd5e1] leading-relaxed mb-3">
          &ldquo;{review.review_text}&rdquo;
        </p>
        <p className="text-sm text-[#64748b]">
          — {review.display_name}
        </p>
      </div>
    );
  }

  // No review yet — show form
  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="block text-sm text-[#94a3b8] mb-2">
            How would you rate Ooustream?
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <StarIcon filled={star <= (hoverRating || rating)} />
              </button>
            ))}
            {rating > 0 && (
              <span className="text-sm text-[#64748b] ml-2 self-center">
                {rating}/5
              </span>
            )}
          </div>
        </div>

        {/* Review Text */}
        <div>
          <label
            htmlFor="review-text"
            className="block text-sm text-[#94a3b8] mb-2"
          >
            Your Review
          </label>
          <textarea
            id="review-text"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Tell us about your experience with Ooustream..."
            maxLength={500}
            rows={3}
            className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-3 text-[#f1f5f9] placeholder-[#4b5563] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff] resize-none text-sm"
          />
          <p className="text-xs text-[#4b5563] mt-1 text-right">
            {reviewText.length}/500
          </p>
        </div>

        {/* Display Name */}
        <div>
          <label
            htmlFor="display-name"
            className="block text-sm text-[#94a3b8] mb-2"
          >
            Display Name{" "}
            <span className="text-[#4b5563]">(shown publicly)</span>
          </label>
          <input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
            className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-3 text-[#f1f5f9] placeholder-[#4b5563] focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff] text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
