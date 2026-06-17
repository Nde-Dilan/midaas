"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { adminProvider, type AdminTransactionItem } from "@/api/admin";
import { useAdminStore } from "@/store/admin";
import { getUserInfo } from "@/api/admin/user-lookup";
import { Button } from "@/components/atoms/button";
import {
  RefreshCw,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  Loader,
  ExternalLink,
  Banknote,
} from "lucide-react";
import { toast } from "react-toastify";

const typeColors: Record<string, string> = {
  investment: "bg-blue-100 text-blue-800 border-blue-200",
  fee: "bg-amber-100 text-amber-800 border-amber-200",
  refund: "bg-purple-100 text-purple-800 border-purple-200",
  payout: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const statusColors: Record<string, string> = {
  accepted: "bg-emerald-100 text-emerald-800",
  completed: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-800",
  rejected: "bg-red-100 text-red-800",
  refunded: "bg-purple-100 text-purple-800",
};

export default function AdminTransactionsPage() {
  const { transactions, setTransactions, setTransactionsLoading } =
    useAdminStore();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  const fetchTransactions = async () => {
    setLoading(true);
    setTransactionsLoading(true);
    const { data, error } = await adminProvider.getTransactions();

    if (data) {
      // Enrich transactions with user info from user cache
      const enriched = await Promise.all(
        data.map(async (tx) => {
          // If the nested user object is missing but user_id exists, look it up
          if (tx.user_id && (!tx.user || !tx.user.email)) {
            const info = await getUserInfo(tx.user_id);
            if (info.email || info.full_name) {
              return {
                ...tx,
                user: {
                  id: tx.user_id,
                  email: info.email || tx.user?.email,
                  full_name: info.full_name || tx.user?.full_name,
                  phone_number: info.phone_number || tx.user?.phone_number,
                },
              };
            }
          }
          return tx;
        }),
      );
      setTransactions(enriched);
    } else {
      toast.error(error || "Failed to load transactions");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (transactions.length === 0) fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    let items = [...transactions];

    // Filter by type
    if (typeFilter !== "all") {
      items = items.filter((t) => t.type === typeFilter);
    }

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.type?.toLowerCase().includes(q) ||
          t.status?.toLowerCase().includes(q) ||
          t.provider?.toLowerCase().includes(q) ||
          t.phone_number?.toLowerCase().includes(q) ||
          t.deposit_id?.toLowerCase().includes(q) ||
          t.user?.email?.toLowerCase().includes(q) ||
          t.user?.full_name?.toLowerCase().includes(q),
      );
    }

    // Sort
    items.sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortDir === "desc" ? db - da : da - db;
    });

    return items;
  }, [transactions, typeFilter, searchQuery, sortDir]);

  const stats = useMemo(() => {
    const total = transactions.length;
    const totalAmount = transactions.reduce(
      (s, t) => s + (t.amount ?? 0),
      0,
    );
    const investments = transactions.filter((t) => t.type === "investment").length;
    const payouts = transactions.filter((t) => t.type === "payout").length;
    const pending = transactions.filter(
      (t) => t.status === "pending",
    ).length;
    return { total, totalAmount, investments, payouts, pending };
  }, [transactions]);

  return (
    <section className="p-6">
      <div className="max-w-[1400px] mx-auto mt-8 space-y-6">
        {/* ─── Header ─────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-MontserratBold text-gray-900">
              Transactions
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Monitor all platform transactions in real-time
            </p>
          </div>
          <Button
            onClick={fetchTransactions}
            variant="outline"
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* ─── Stats ───────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <StatCard label="Total" value={stats.total} icon={Wallet} color="gray" />
          <StatCard
            label="Volume"
            value={`${stats.totalAmount.toLocaleString()} XOF`}
            icon={Banknote}
            color="blue"
          />
          <StatCard label="Investments" value={stats.investments} icon={ArrowDown} color="emerald" />
          <StatCard label="Payouts" value={stats.payouts} icon={ArrowUp} color="purple" />
          <StatCard label="Pending" value={stats.pending} icon={Clock} color="amber" />
        </div>

        {/* ─── Filters ─────────────────────────────── */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative max-w-xs flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, email, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00de00]/20 focus:border-[#00de00] transition-all"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00de00]/20"
          >
            <option value="all">All types</option>
            <option value="investment">Investment</option>
            <option value="fee">Fee</option>
            <option value="refund">Refund</option>
            <option value="payout">Payout</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
            className="gap-1.5"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortDir === "desc" ? "Newest" : "Oldest"}
          </Button>
        </div>

        {/* ─── Table ────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {loading && transactions.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="w-8 h-8 animate-spin text-gray-300" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Wallet className="w-16 h-16 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-MontserratSemiBold text-lg">
                No transactions found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <Th>ID</Th>
                    <Th>Type</Th>
                    <Th>Amount</Th>
                    <Th>Status</Th>
                    <Th>Currency</Th>
                    <Th>User</Th>
                    <Th>Date</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <span className="text-xs font-mono text-gray-500">
                          {tx.id.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            typeColors[tx.type ?? ""] ??
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {tx.type === "investment" && <ArrowDown className="w-3 h-3" />}
                          {tx.type === "payout" && <ArrowUp className="w-3 h-3" />}
                          {tx.type ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-MontserratSemiBold text-gray-900">
                          {tx.amount?.toLocaleString() ?? "—"}{" "}
                          <span className="text-xs text-gray-400">
                            {tx.currency || "XOF"}
                          </span>
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            statusColors[tx.status ?? ""] ?? "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {tx.status === "accepted" || tx.status === "completed" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : tx.status === "failed" || tx.status === "rejected" ? (
                            <XCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {tx.status ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-MontserratSemiBold text-gray-900">
                          {tx.currency || "XOF"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm">
                          {tx.user?.email ? (
                            <div>
                              <span className="font-mono text-gray-700">
                                {tx.user.email}
                              </span>
                              {tx.user.full_name && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {tx.user.full_name}
                                  {tx.user.phone_number && ` · ${tx.user.phone_number}`}
                                </p>
                              )}
                            </div>
                          ) : tx.user?.full_name ? (
                            <div>
                              <span className="font-MontserratSemiBold text-gray-900">
                                {tx.user.full_name}
                              </span>
                              {tx.user.phone_number && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {tx.user.phone_number}
                                </p>
                              )}
                            </div>
                          ) : tx.user?.phone_number || tx.phone_number ? (
                            <span className="font-mono text-gray-500">
                              {tx.user?.phone_number || tx.phone_number}
                            </span>
                          ) : tx.user_id ? (
                            <span className="text-xs font-mono text-gray-400">
                              {tx.user_id.slice(0, 8)}...
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {tx.created_at
                          ? new Date(tx.created_at).toLocaleString("en-US", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── Shared helpers ───────────────────── */

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-5 py-3.5 text-xs font-MontserratSemiBold text-gray-500 uppercase tracking-wider">
      {children}
    </th>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.FC<{ className?: string }>;
  color: string;
}) {
  const colors: Record<string, string> = {
    gray: "bg-gray-50 text-gray-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500">{label}</p>
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors[color]}`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-lg font-MontserratBold text-gray-900 truncate">
        {value}
      </p>
    </div>
  );
}
