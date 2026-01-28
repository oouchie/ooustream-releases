"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service_type: string;
  status: string;
  username_1: string;
  password_1: string;
  username_2: string | null;
  password_2: string | null;
  username_3: string | null;
  password_3: string | null;
  username_4: string | null;
  password_4: string | null;
  notes: string | null;
  created_at: string;
}

export default function ResellerCustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchCustomer();
  }, [params.id]);

  const fetchCustomer = async () => {
    try {
      const res = await fetch(`/api/reseller/customers/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setCustomer(data);
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

  const sendCredentials = async () => {
    setSending("credentials");
    setMessage(null);
    try {
      const res = await fetch(`/api/reseller/customers/${params.id}/send-credentials`, {
        method: "POST",
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Credentials sent successfully!" });
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to send credentials" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to send credentials" });
    } finally {
      setSending(null);
    }
  };

  const sendPortalAccess = async () => {
    setSending("portal");
    setMessage(null);
    try {
      const res = await fetch(`/api/reseller/customers/${params.id}/send-portal-access`, {
        method: "POST",
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Portal access link sent successfully!" });
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to send portal access" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to send portal access" });
    } finally {
      setSending(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#22c55e]/20 text-[#22c55e]";
      case "Inactive":
        return "bg-[#f59e0b]/20 text-[#f59e0b]";
      case "Expired":
        return "bg-[#ef4444]/20 text-[#ef4444]";
      default:
        return "bg-[#94a3b8]/20 text-[#94a3b8]";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner" />
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  const credentials = [
    { username: customer.username_1, password: customer.password_1 },
    { username: customer.username_2, password: customer.password_2 },
    { username: customer.username_3, password: customer.password_3 },
    { username: customer.username_4, password: customer.password_4 },
  ].filter((c) => c.username && c.password);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/reseller/customers"
            className="p-2 text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#334155] rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#f1f5f9]">{customer.name}</h1>
            <p className="text-[#94a3b8]">{customer.email}</p>
          </div>
        </div>
        <Link
          href={`/reseller/customers/${customer.id}/edit`}
          className="btn btn-primary"
        >
          Edit Customer
        </Link>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e]"
              : "bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444]"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer Info */}
        <div className="card">
          <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">Customer Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Status</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(customer.status)}`}>
                {customer.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Service Type</span>
              <span className="text-[#f1f5f9]">{customer.service_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Phone</span>
              <span className="text-[#f1f5f9]">{customer.phone || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94a3b8]">Created</span>
              <span className="text-[#f1f5f9]">
                {new Date(customer.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">Actions</h2>
          <div className="space-y-3">
            <button
              onClick={sendCredentials}
              disabled={sending !== null || !customer.email}
              className="w-full btn btn-primary justify-center"
            >
              {sending === "credentials" ? (
                <span className="spinner" />
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Send Credentials
                </>
              )}
            </button>
            <button
              onClick={sendPortalAccess}
              disabled={sending !== null || !customer.email}
              className="w-full btn bg-[#8b5cf6] hover:bg-[#7c3aed] text-white justify-center"
            >
              {sending === "portal" ? (
                <span className="spinner" />
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Send Portal Access
                </>
              )}
            </button>
            {!customer.email && (
              <p className="text-sm text-[#f59e0b] text-center">
                Customer has no email address
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Credentials */}
      <div className="card">
        <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">Login Credentials</h2>
        {credentials.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {credentials.map((cred, i) => (
              <div key={i} className="bg-[#1e293b] p-4 rounded-lg">
                <p className="text-sm text-[#94a3b8] mb-2">Account {i + 1}</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#94a3b8]">Username:</span>
                    <span className="text-[#f1f5f9] font-mono">{cred.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94a3b8]">Password:</span>
                    <span className="text-[#f1f5f9] font-mono">{cred.password}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#94a3b8]">No credentials set</p>
        )}
      </div>

      {/* Notes */}
      {customer.notes && (
        <div className="card">
          <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">Notes</h2>
          <p className="text-[#94a3b8] whitespace-pre-wrap">{customer.notes}</p>
        </div>
      )}
    </div>
  );
}
