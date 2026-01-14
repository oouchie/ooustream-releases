"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { TICKET_CATEGORIES, TicketCategory } from "@/types";

const deviceTypes = [
  "Firestick",
  "Android Box",
  "Android Phone/Tablet",
  "iPhone/iPad",
  "Smart TV",
  "Roku",
  "Computer",
  "Other",
];

export default function NewTicketPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    category: "" as TicketCategory | "",
    device_type: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to create ticket");
        return;
      }

      toast.success("Ticket created successfully!");
      router.push(`/support/${data.ticket.id}`);
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Create New Ticket</h1>
        <p className="text-[#94a3b8] mt-1">
          Describe your issue and we&apos;ll get back to you as soon as possible
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Category */}
        <div>
          <label className="label">Category *</label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value as TicketCategory })
            }
            className="input"
            required
          >
            <option value="">Select a category</option>
            {Object.entries(TICKET_CATEGORIES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="label">Subject *</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            placeholder="Brief description of your issue"
            className="input"
            required
            maxLength={100}
          />
        </div>

        {/* Device Type */}
        <div>
          <label className="label">Device Type</label>
          <select
            value={formData.device_type}
            onChange={(e) =>
              setFormData({ ...formData, device_type: e.target.value })
            }
            className="input"
          >
            <option value="">Select device (optional)</option>
            {deviceTypes.map((device) => (
              <option key={device} value={device}>
                {device}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="label">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Please describe your issue in detail. Include any error messages, what you've already tried, and when the issue started."
            className="input min-h-[150px] resize-y"
            required
            rows={6}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex-1"
          >
            {loading ? <span className="spinner" /> : "Submit Ticket"}
          </button>
        </div>
      </form>

      {/* Tips */}
      <div className="card bg-[#6366f1]/10 border-[#6366f1]/30">
        <h3 className="font-medium text-[#f1f5f9] mb-2">Tips for faster help</h3>
        <ul className="text-sm text-[#94a3b8] space-y-1 list-disc list-inside">
          <li>Include the exact error message if you see one</li>
          <li>Mention when the issue started</li>
          <li>List what you&apos;ve already tried to fix it</li>
          <li>Include your device type and app name</li>
        </ul>
      </div>
    </div>
  );
}
