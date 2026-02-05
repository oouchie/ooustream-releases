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
    expiry_date: "",
    billing_type: "manual",
    billing_period: "monthly",
    custom_price_monthly: "",
    custom_price_6month: "",
    custom_price_yearly: "",
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
          expiry_date: data.expiry_date || "",
          billing_type: data.billing_type || "manual",
          billing_period: data.billing_period || "monthly",
          custom_price_monthly: data.custom_price_monthly ? String(data.custom_price_monthly / 100) : "",
          custom_price_6month: data.custom_price_6month ? String(data.custom_price_6month / 100) : "",
          custom_price_yearly: data.custom_price_yearly ? String(data.custom_price_yearly / 100) : "",
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

    // Convert prices from dollars to cents
    const submitData = {
      ...form,
      custom_price_monthly: form.custom_price_monthly ? Math.round(parseFloat(form.custom_price_monthly) * 100) : null,
      custom_price_6month: form.custom_price_6month ? Math.round(parseFloat(form.custom_price_6month) * 100) : null,
      custom_price_yearly: form.custom_price_yearly ? Math.round(parseFloat(form.custom_price_yearly) * 100) : null,
      expiry_date: form.expiry_date || null,
    };

    try {
      const res = await fetch(`/api/reseller/customers/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
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

        {/* Billing Settings */}
        <div>
          <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">Billing Settings</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Expiry Date</label>
              <input
                type="date"
                name="expiry_date"
                value={form.expiry_date}
                onChange={handleChange}
                className="input w-full"
              />
            </div>
            <div>
              <label className="label">Billing Type</label>
              <select
                name="billing_type"
                value={form.billing_type}
                onChange={handleChange}
                className="input w-full"
              >
                <option value="manual">Manual (Pay when expiring)</option>
                <option value="auto">Auto-Renew (Stripe subscription)</option>
              </select>
            </div>
            <div>
              <label className="label">Billing Period</label>
              <select
                name="billing_period"
                value={form.billing_period}
                onChange={handleChange}
                className="input w-full"
              >
                <option value="monthly">Monthly ($20)</option>
                <option value="6month">6 Months ($90)</option>
                <option value="yearly">Yearly ($170)</option>
              </select>
            </div>
          </div>

          {/* Custom Pricing */}
          <div className="mt-4 p-4 bg-[#0f172a] rounded-lg">
            <p className="text-sm text-[#94a3b8] mb-3">
              Custom pricing (leave blank for standard rates). Enter amounts in dollars.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="label">Monthly Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">$</span>
                  <input
                    type="number"
                    name="custom_price_monthly"
                    value={form.custom_price_monthly}
                    onChange={handleChange}
                    placeholder="20.00"
                    step="0.01"
                    min="0"
                    className="input w-full pl-7"
                  />
                </div>
              </div>
              <div>
                <label className="label">6-Month Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">$</span>
                  <input
                    type="number"
                    name="custom_price_6month"
                    value={form.custom_price_6month}
                    onChange={handleChange}
                    placeholder="90.00"
                    step="0.01"
                    min="0"
                    className="input w-full pl-7"
                  />
                </div>
              </div>
              <div>
                <label className="label">Yearly Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">$</span>
                  <input
                    type="number"
                    name="custom_price_yearly"
                    value={form.custom_price_yearly}
                    onChange={handleChange}
                    placeholder="170.00"
                    step="0.01"
                    min="0"
                    className="input w-full pl-7"
                  />
                </div>
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
