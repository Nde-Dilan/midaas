"use client";

import { useEffect, useState } from "react";
import { adminProvider } from "@/api/admin";
import { useAdminStore } from "@/store/admin";
import { Button } from "@/components/atoms/button";
import Link from "next/link";
import {
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Shield,
  User,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  reverify_requested: {
    label: "Re-verification",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  approved: {
    label: "Approved",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800 border-red-200",
  },
  draft: {
    label: "Draft",
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

export default function AdminPendingCompaniesPage() {
  const { pendingCompanies, setPendingCompanies, setPendingCompaniesLoading } =
    useAdminStore();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCompanies = async () => {
    setLoading(true);
    setPendingCompaniesLoading(true);
    const { data, error } = await adminProvider.getPendingCompanies();
    if (data) {
      setPendingCompanies(data);
    } else {
      toast.error(error || "Failed to load companies");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (pendingCompanies.length === 0) {
      fetchCompanies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = pendingCompanies.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.legal_name?.toLowerCase().includes(q) ||
      c.trade_name?.toLowerCase().includes(q) ||
      c.entrepreneur?.user?.full_name?.toLowerCase().includes(q) ||
      c.corporate_form?.toLowerCase().includes(q)
    );
  });

  const pendingCount = pendingCompanies.filter(
    (c) => c.status === "pending",
  ).length;
  const reverifyCount = pendingCompanies.filter(
    (c) => c.status === "reverify_requested",
  ).length;
  const treatedCount = pendingCompanies.filter(
    (c) => c.status === "approved" || c.status === "rejected",
  ).length;

  return (
    <section className="p-6">
      <div className="max-w-[1400px] mx-auto mt-8 space-y-6">
        {/* ─── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-MontserratBold text-gray-900">
              Review Queue
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Browse the queue and review each request before making a decision
            </p>
          </div>
          <Button
            onClick={fetchCompanies}
            variant="outline"
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* ─── Search ─────────────────────────────────────────────── */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00de00]/20 focus:border-[#00de00] transition-all"
          />
        </div>

        {/* ─── Stats cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Pending</p>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Re-verification</p>
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Shield className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{reverifyCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Reviewed</p>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2 text-emerald-600">
              {treatedCount}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Total</p>
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-gray-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{pendingCompanies.length}</p>
          </div>
        </div>

        {/* ─── Review Queue ───────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {loading && pendingCompanies.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-300" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="flex flex-col items-center gap-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-200" />
                <p className="text-gray-500 font-MontserratSemiBold text-lg">
                  No companies pending
                </p>
                <p className="text-gray-400 text-sm max-w-md">
                  All registration requests have been processed. Check back
                  later or refresh the page.
                </p>
              </div>
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50/50 border-b border-border text-xs font-MontserratSemiBold text-gray-500 uppercase tracking-wider">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-3">Company</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Owner</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Action</div>
              </div>

              <div className="divide-y divide-border">
                {filtered.map((company, idx) => {
                  const statusInfo =
                    statusConfig[company.status] || statusConfig.pending;
                  const isDone =
                    company.status === "approved" ||
                    company.status === "rejected";

                  return (
                    <Link
                      key={company.id}
                      href={`/admin/companies/pending/${company.id}`}
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 px-5 py-4 hover:bg-gray-50/50 transition-colors items-center"
                    >
                      {/* Index badge */}
                      <div className="col-span-1 hidden md:flex justify-center">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-MontserratBold ${
                            isDone
                              ? company.status === "approved"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {isDone ? (
                            company.status === "approved" ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )
                          ) : (
                            idx + 1
                          )}
                        </span>
                      </div>

                      {/* Company info */}
                      <div className="col-span-3 flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 border border-border">
                          <Building2 className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-MontserratSemiBold text-gray-900 text-sm truncate">
                            {company.trade_name || company.legal_name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {company.legal_name}
                          </p>
                        </div>
                      </div>

                      {/* Corporate form + sector */}
                      <div className="col-span-2 hidden md:block">
                        <span className="text-sm text-gray-600">
                          {company.corporate_form}
                        </span>
                        {company.industry_sector && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {company.industry_sector}
                          </p>
                        )}
                      </div>

                      {/* Entrepreneur */}
                      <div className="col-span-2 hidden md:flex items-center gap-2 min-w-0">
                        {company.entrepreneur?.user ? (
                          <>
                            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600 truncate">
                              {company.entrepreneur.user.full_name}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </div>

                      {/* Status badge */}
                      <div className="col-span-2 hidden md:block">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}
                        >
                          {company.status === "reverify_requested" && (
                            <Shield className="w-3 h-3" />
                          )}
                          {statusInfo.label}
                        </span>
                      </div>

                      {/* CTA */}
                      <div className="col-span-2 hidden md:flex justify-end">
                        <span className="inline-flex items-center gap-1 text-sm font-MontserratSemiBold text-[#00de00]">
                          {isDone ? "View" : "Review"}
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>

                      {/* Mobile row */}
                      <div className="col-span-12 flex md:hidden items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                          <span className="text-xs text-gray-400">
                            {company.corporate_form}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
