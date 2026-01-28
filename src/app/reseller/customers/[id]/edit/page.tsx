"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function ResellerEditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    username_3: "",
    password_3: "",
    username_4: "",
    password_4: "",
    notes: "",
  });

  useEffect(() => {
    fetchCustomer();
  }, [params.id]);

  const fetchCustomer = async () => {
    try {
      const res = await fetch(`/api/reseller/customers/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          service_type: data.service_type || "Cable",
          status: data.status || "Active",
          username_1: data.username_1 || "",
          password_1: data.password_1 || "",
          username_2: data.username_2 || "",
          password_2: data.password_2 || "",
          username_3: data.username_3 || "",
          password_3: data.password_3 || "",
          username_4: data.username_4 || "",
          password_4: data.password_4 || "",
          notes: data.notes || "",
        });
      } else {
        router.push("/reseller/customers");
      }
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      router.push("/reseller/customers");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/reseller/customers/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push(`/reseller/customers/${params.id}`);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update customer");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/reseller/customers/${params.id}`}
          className="p-2 text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#334155] rounded transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Edit Customer</h1>
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
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Username 3</label>
                <input
                  type="text"
                  name="username_3"
                  value={form.username_3}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">Password 3</label>
                <input
                  type="text"
                  name="password_3"
                  value={form.password_3}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Username 4</label>
                <input
                  type="text"
                  name="username_4"
                  value={form.username_4}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="label">Password 4</label>
                <input
                  type="text"
                  name="password_4"
                  value={form.password_4}
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
            disabled={saving}
            className="btn btn-primary flex-1"
          >
            {saving ? <span className="spinner" /> : "Save Changes"}
          </button>
          <Link
            href={`/reseller/customers/${params.id}`}
            className="btn bg-[#334155] hover:bg-[#475569] text-[#f1f5f9]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
