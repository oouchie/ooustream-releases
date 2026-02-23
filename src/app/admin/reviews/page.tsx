"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface ReviewWithCustomer {
  id: string;
  customer_id: string;
  rating: number;
  review_text: string;
  display_name: string;
  is_approved: boolean;
  created_at: string;
  customer: { id: string; name: string; email: string; status: string } | null;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`w-4 h-4 ${filled ? "text-[#fbbf24]" : "text-[#334155]"}`}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      if (data.reviews) setReviews(data.reviews);
    } catch {
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (id: string, currentApproved: boolean) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_approved: !currentApproved }),
      });
      if (res.ok) {
        toast.success(
          currentApproved ? "Review hidden from public" : "Review approved!"
        );
        fetchReviews();
      } else {
        toast.error("Failed to update review");
      }
    } catch {
      toast.error("Failed to update review");
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Review deleted");
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } else {
        toast.error("Failed to delete review");
      }
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const filtered = reviews.filter((r) => {
    if (filter === "pending") return !r.is_approved;
    if (filter === "approved") return r.is_approved;
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.is_approved).length;
  const approvedCount = reviews.filter((r) => r.is_approved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">
          Customer Reviews
        </h1>
        <p className="text-[#94a3b8] mt-1">
          Manage customer reviews that appear on the landing page
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(
          [
            { key: "all", label: `All (${reviews.length})` },
            { key: "pending", label: `Pending (${pendingCount})` },
            { key: "approved", label: `Approved (${approvedCount})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-[#6366f1] text-white"
                : "bg-[#1e293b] text-[#94a3b8] hover:text-[#f1f5f9]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#64748b]">
            {filter === "all"
              ? "No reviews yet"
              : `No ${filter} reviews`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <div
              key={review.id}
              className="card"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Stars + Status */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          filled={star <= review.rating}
                        />
                      ))}
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        review.is_approved
                          ? "bg-[#22c55e]/15 text-[#22c55e]"
                          : "bg-[#f59e0b]/15 text-[#f59e0b]"
                      }`}
                    >
                      {review.is_approved ? "Approved" : "Pending"}
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-[#cbd5e1] text-sm leading-relaxed mb-2">
                    &ldquo;{review.review_text}&rdquo;
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center gap-2 text-xs text-[#64748b]">
                    <span className="font-medium text-[#94a3b8]">
                      {review.display_name}
                    </span>
                    <span>·</span>
                    {review.customer && (
                      <>
                        <span>
                          {review.customer.name} ({review.customer.email})
                        </span>
                        <span>·</span>
                      </>
                    )}
                    <span>
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() =>
                      toggleApproval(review.id, review.is_approved)
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      review.is_approved
                        ? "bg-[#f59e0b]/15 text-[#f59e0b] hover:bg-[#f59e0b]/25"
                        : "bg-[#22c55e]/15 text-[#22c55e] hover:bg-[#22c55e]/25"
                    }`}
                  >
                    {review.is_approved ? "Hide" : "Approve"}
                  </button>
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#ef4444]/15 text-[#ef4444] hover:bg-[#ef4444]/25 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
