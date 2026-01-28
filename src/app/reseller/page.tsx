"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  total: number;
  active: number;
  inactive: number;
  expired: number;
  cable: number;
  plex: number;
  both: number;
}

export default function ResellerDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/reseller/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Dashboard</h1>
        <p className="text-[#94a3b8] mt-1">Overview of your customers</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Customers"
          value={stats?.total || 0}
          color="text-blue-500"
        />
        <StatCard
          title="Active"
          value={stats?.active || 0}
          color="text-green-500"
        />
        <StatCard
          title="Inactive"
          value={stats?.inactive || 0}
          color="text-yellow-500"
        />
        <StatCard
          title="Expired"
          value={stats?.expired || 0}
          color="text-red-500"
        />
      </div>

      {/* Service Type Stats */}
      <div>
        <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">By Service Type</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Cable"
            value={stats?.cable || 0}
            color="text-purple-500"
          />
          <StatCard
            title="Plex"
            value={stats?.plex || 0}
            color="text-orange-500"
          />
          <StatCard
            title="Cable + Plex"
            value={stats?.both || 0}
            color="text-cyan-500"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/reseller/customers/new"
            className="card card-hover flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-[#22c55e]/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-[#f1f5f9]">Add Customer</h3>
              <p className="text-sm text-[#94a3b8]">Create a new customer account</p>
            </div>
          </Link>

          <Link
            href="/reseller/customers"
            className="card card-hover flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-[#6366f1]/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#6366f1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-[#f1f5f9]">View Customers</h3>
              <p className="text-sm text-[#94a3b8]">Manage your customer list</p>
            </div>
          </Link>

          <Link
            href="/reseller/customers?status=Expired"
            className="card card-hover flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-[#ef4444]/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-[#f1f5f9]">Expired Customers</h3>
              <p className="text-sm text-[#94a3b8]">View customers needing renewal</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="card">
      <p className="text-sm text-[#94a3b8]">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
