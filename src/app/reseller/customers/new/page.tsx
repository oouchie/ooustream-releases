"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResellerNewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service_type: "Cable",
    status: "Active",
    username_1: "",
    password_1: "",
    username_2: "",
    password_2: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reseller/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/reseller/customers/${data.id}`);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create customer");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/reseller/customers"
          className="p-2 text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#334155] rounded transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Add New Customer</h1>
      </div>

      {error && (
        <div className="p-4 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg text-[#ef4444]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Basic Info */}
        <div>
          <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">Basic Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="input w-full"
              />
            </div>
            <div>
              <label className="label">Service Type *</label>
              <select
                name="service_type"
                value={form.service_type}
                onChange={handleChange}
                className="input w-full"
                required
              >
                <option value="Cable">Cable</option>
                <option value="Plex">Plex</option>
                <option value="Cable/Plex">Cable/Plex</option>
              </select>
            </div>
            <div>
              <label className="label">Status *</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="input w-full"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Credentials */}
        <div>
          <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">Login Credentials</h2>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Username 1 *</label>
                <input
                  type="text"
                  name="username_1"
                  value={form.username_1}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="label">Password 1 *</label>
                <input
                  type="text"
                  name="password_1"
                  value={form.password_1}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Username 2</label>
                <input
                  type="text"
                  name="username_2"
                  value={form.username_2}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">Password 2</label>
                <input
                  type="text"
                  name="password_2"
                  value={form.password_2}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className="input w-full"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex-1"
          >
            {loading ? <span className="spinner" /> : "Create Customer"}
          </button>
          <Link href="/reseller/customers" className="btn bg-[#334155] hover:bg-[#475569] text-[#f1f5f9]">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
