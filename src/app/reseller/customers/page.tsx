"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service_type: string;
  status: string;
  username_1: string;
  created_at: string;
}

export default function ResellerCustomersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);

      const res = await fetch(`/api/reseller/customers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchCustomers]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Customers</h1>
          <p className="text-[#94a3b8] mt-1">{total} customers total</p>
        </div>
        <Link href="/reseller/customers/new" className="btn btn-primary">
          Add Customer
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or username..."
              className="input w-full"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input md:w-40"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Customer List */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner" />
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#94a3b8]">No customers found</p>
            <Link href="/reseller/customers/new" className="btn btn-primary mt-4">
              Add Your First Customer
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1e293b]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#94a3b8] uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#94a3b8] uppercase">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#94a3b8] uppercase">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#94a3b8] uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#94a3b8] uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-[#1e293b]/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-[#f1f5f9]">{customer.name}</p>
                        <p className="text-sm text-[#94a3b8]">{customer.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#94a3b8]">
                      {customer.username_1}
                    </td>
                    <td className="px-6 py-4 text-[#94a3b8]">
                      {customer.service_type}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => router.push(`/reseller/customers/${customer.id}`)}
                          className="p-2 text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#334155] rounded transition-colors"
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => router.push(`/reseller/customers/${customer.id}/edit`)}
                          className="p-2 text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#334155] rounded transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
