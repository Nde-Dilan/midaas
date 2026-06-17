"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { campaignProvider, type PortfolioItem } from "@/api/campaigns";
import {
  Loader,
  AlertCircle,
  Briefcase,
  TrendingUp,
  ArrowUpRight,
  Wallet,
  PieChart,
} from "lucide-react";

const formatCurrency = (amount: number, currency = "XOF") =>
  `${new Intl.NumberFormat("en-US").format(amount)} ${currency}`;

const statusColor = (status?: string) => {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    funded: "bg-blue-100 text-blue-800",
    completed: "bg-emerald-100 text-emerald-800",
    pending: "bg-amber-100 text-amber-800",
    blocked: "bg-red-100 text-red-800",
    draft: "bg-gray-100 text-gray-600",
  };
  return colors[status ?? ""] ?? "bg-gray-100 text-gray-600";
};

export default function PortfolioPage() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<{
    total_value: number;
    currency: string;
    investments: PortfolioItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error: fetchError } = await campaignProvider.getPortfolio();
      if (data) {
        setPortfolio(data);
      } else {
        setError(fetchError ?? "Failed to load portfolio");
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-[#00CCC0]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-sm text-[#00CCC0] hover:underline font-MontserratSemiBold"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const investments = portfolio?.investments ?? [];
  const totalValue = portfolio?.total_value ?? 0;
  const currency = portfolio?.currency ?? "XOF";
  const projectCount = new Set(investments.map((i) => i.project_id)).size;

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-MontserratSemiBold text-foreground">
          My Portfolio
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your investments and portfolio performance across all projects.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#00CCC0]/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-[#00CCC0]" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Total Invested
            </span>
          </div>
          <span className="text-2xl font-mono font-bold text-foreground">
            {formatCurrency(totalValue, currency)}
          </span>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Projects
            </span>
          </div>
          <span className="text-2xl font-mono font-bold text-foreground">
            {projectCount}
          </span>
          <span className="text-xs text-muted-foreground block mt-0.5">
            Active investments
          </span>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Investments
            </span>
          </div>
          <span className="text-2xl font-mono font-bold text-foreground">
            {investments.length}
          </span>
          <span className="text-xs text-muted-foreground block mt-0.5">
            Total deposits made
          </span>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <PieChart className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Avg per Project
            </span>
          </div>
          <span className="text-2xl font-mono font-bold text-foreground">
            {projectCount > 0
              ? formatCurrency(Math.round(totalValue / projectCount), currency)
              : formatCurrency(0, currency)}
          </span>
        </div>
      </div>

      {/* Investment list */}
      {investments.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center shadow-sm">
          <Briefcase className="w-12 h-12 mx-auto text-gray-200 mb-4" />
          <h3 className="text-base font-MontserratSemiBold text-gray-900 mb-1">
            No investments yet
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start exploring projects and make your first investment.
          </p>
          <button
            onClick={() => router.push("/admin/projects")}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-MontserratSemiBold text-white bg-[#00CCC0] rounded-xl hover:bg-[#00c800] transition-colors"
          >
            Explore Projects
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {investments.map((inv) => (
            <div
              key={inv.investment_id}
              onClick={() =>
                inv.project_id &&
                router.push(`/admin/projects/${inv.project_id}`)
              }
              className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#00CCC0]/20 transition-all cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left: project info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00CCC0]/10 to-[#00CCC0]/20 flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-[#00CCC0]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-MontserratSemiBold text-foreground truncate">
                        {inv.project_title ?? "Unknown Project"}
                      </h3>
                      {inv.company_name && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {inv.company_name}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        {inv.project_status && (
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColor(inv.project_status)}`}
                          >
                            {inv.project_status}
                          </span>
                        )}
                        {inv.project_created && (
                          <span className="text-[10px] text-gray-400">
                            Since{" "}
                            {new Date(inv.project_created).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: financial data */}
                <div className="flex items-center gap-6 sm:text-right pl-13 sm:pl-0">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                      Invested
                    </span>
                    <span className="text-sm font-mono font-bold text-foreground">
                      {formatCurrency(
                        inv.amount ?? 0,
                        inv.currency ?? currency,
                      )}
                    </span>
                  </div>
                  {inv.ownership_pct != null && (
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                        Ownership
                      </span>
                      <span className="inline-block px-2 py-0.5 text-[11px] font-MontserratSemiBold bg-[#00CCC0]/10 text-[#00CCC0] rounded-full">
                        {inv.ownership_pct.toFixed(2)}%
                      </span>
                    </div>
                  )}
                  <ArrowUpRight className="w-4 h-4 text-gray-300 shrink-0 hidden sm:block" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
