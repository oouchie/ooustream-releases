"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

type Announcement = {
  id: string;
  title: string;
  content: string;
  type: "maintenance" | "outage" | "update" | "promo";
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
};

const typeLabels = {
  maintenance: "Maintenance",
  outage: "Outage",
  update: "Update",
  promo: "Promotion",
};

const typeColors = {
  maintenance: "bg-[#f59e0b]/20 text-[#f59e0b]",
  outage: "bg-[#ef4444]/20 text-[#ef4444]",
  update: "bg-[#6366f1]/20 text-[#6366f1]",
  promo: "bg-[#22c55e]/20 text-[#22c55e]",
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    type: "maintenance" | "outage" | "update" | "promo";
    is_active: boolean;
  }>({
    title: "",
    content: "",
    type: "update",
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/admin/announcements");
      const data = await response.json();
      if (data.announcements) {
        setAnnouncements(data.announcements);
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Announcement created!");
        setShowForm(false);
        setFormData({ title: "", content: "", type: "update", is_active: true });
        fetchAnnouncements();
      } else {
        toast.error("Failed to create announcement");
      }
    } catch {
      toast.error("Failed to create announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentActive }),
      });

      if (response.ok) {
        toast.success(currentActive ? "Announcement hidden" : "Announcement published");
        fetchAnnouncements();
      }
    } catch {
      toast.error("Failed to update announcement");
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Announcement deleted");
        fetchAnnouncements();
      }
    } catch {
      toast.error("Failed to delete announcement");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Announcements</h1>
          <p className="text-[#94a3b8] mt-1">
            Manage service announcements shown to customers
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? "Cancel" : "New Announcement"}
        </button>
      </div>

      {/* New Announcement Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="input min-h-[100px]"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as Announcement["type"] })
                }
                className="input"
              >
                <option value="update">Update</option>
                <option value="maintenance">Maintenance</option>
                <option value="outage">Outage</option>
                <option value="promo">Promotion</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select
                value={formData.is_active ? "active" : "inactive"}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.value === "active" })
                }
                className="input"
              >
                <option value="active">Active (Visible)</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? <span className="spinner" /> : "Create Announcement"}
            </button>
          </div>
        </form>
      )}

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-[#94a3b8]">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[announcement.type]}`}>
                      {typeLabels[announcement.type]}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        announcement.is_active
                          ? "bg-[#22c55e]/20 text-[#22c55e]"
                          : "bg-[#94a3b8]/20 text-[#94a3b8]"
                      }`}
                    >
                      {announcement.is_active ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#f1f5f9]">
                    {announcement.title}
                  </h3>
                  <p className="text-[#94a3b8] mt-1">{announcement.content}</p>
                  <p className="text-xs text-[#64748b] mt-2">
                    Created {new Date(announcement.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(announcement.id, announcement.is_active)}
                    className="btn btn-secondary text-sm"
                  >
                    {announcement.is_active ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(announcement.id)}
                    className="btn bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30 text-sm"
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
