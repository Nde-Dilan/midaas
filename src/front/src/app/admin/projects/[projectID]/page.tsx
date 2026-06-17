"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { campaignProvider, type InvestorItem } from "@/api/campaigns";
import { useModalStore, ModalNames } from "@/store/modal";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/atoms/button";
import {
  Loader,
  ArrowLeft,
  Heart,
  Share2,
  AlertCircle,
  Users,
} from "lucide-react";
import Project from "@/entities/project/project";

type TabType = "description" | "milestones" | "financials" | "investors";

const TABS: { key: TabType; label: string }[] = [
  { key: "description", label: "Description" },
  { key: "milestones", label: "Milestones" },
  { key: "financials", label: "ROI & Financials" },
  { key: "investors", label: "Investors" },
];

const formatCurrency = (amount: number, currency = "XOF") =>
  `${new Intl.NumberFormat("en-US").format(amount)} ${currency}`;

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectID = params?.projectID as string;
  const { openModal } = useModalStore();

  const { user } = useAuthStore();
  const isEntrepreneur = user?.isEntrepreneur ?? false;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("description");
  const [isFavorited, setIsFavorited] = useState(false);

  const backLink = isEntrepreneur ? "/admin/my-campaigns" : "/admin/projects";

  // Investors
  const [investors, setInvestors] = useState<InvestorItem[]>([]);
  const [investorsLoading, setInvestorsLoading] = useState(false);
  const [investorsLoaded, setInvestorsLoaded] = useState(false);

  useEffect(() => {
    if (!projectID) return;

    (async () => {
      setLoading(true);
      const { data, error: fetchError } =
        await campaignProvider.getById(projectID);

      if (data) {
        setProject(data);
      } else {
        setError(fetchError ?? "Project not found");
      }
      setLoading(false);
    })();
  }, [projectID]);

  // Fetch investors when the investors tab is activated
  useEffect(() => {
    if (!projectID || activeTab !== "investors" || investorsLoaded) return;

    (async () => {
      setInvestorsLoading(true);
      const { data, error: invError } =
        await campaignProvider.getInvestors(projectID);
      if (data) {
        // Aggregate by user_id (or full_name fallback): sum amounts & ownership
        const grouped = new Map<
          string,
          InvestorItem & { investment_count: number }
        >();
        for (const inv of data) {
          const key = inv.user_id ?? inv.full_name ?? "anonymous";
          const existing = grouped.get(key);
          if (existing) {
            existing.amount = (existing.amount ?? 0) + (inv.amount ?? 0);
            existing.ownership_pct =
              (existing.ownership_pct ?? 0) + (inv.ownership_pct ?? 0);
            existing.investment_count += 1;
            // Keep the most recent investment date
            if (
              inv.invested_at &&
              (!existing.invested_at || inv.invested_at > existing.invested_at)
            ) {
              existing.invested_at = inv.invested_at;
            }
          } else {
            grouped.set(key, { ...inv, investment_count: 1 });
          }
        }
        // Sort by total amount descending
        const sorted = Array.from(grouped.values()).sort(
          (a, b) => (b.amount ?? 0) - (a.amount ?? 0),
        );
        setInvestors(sorted);
      }
      if (invError) console.warn("Failed to load investors:", invError);
      setInvestorsLoading(false);
      setInvestorsLoaded(true);
    })();
  }, [projectID, activeTab, investorsLoaded]);

  const progress = useCallback(
    () =>
      project?.fundingGoal && project.fundingGoal > 0
        ? Math.round(((project.fundingRaised ?? 0) / project.fundingGoal) * 100)
        : 0,
    [project],
  );

  const handleInvest = () => {
    if (!project) return;
    openModal({
      name: ModalNames.INVEST_MODAL,
      data: {
        projectId: project.id,
        projectTitle: project.title,
        fundingGoal: project.fundingGoal,
        fundingRaised: project.fundingRaised,
        currency: project.currency,
      },
    });
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-[#00de00]" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6 min-h-screen">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-gray-500 text-sm">
            {error ?? "Project not found"}
          </p>
          <button
            onClick={() => router.push(backLink)}
            className="mt-4 text-sm text-[#00de00] hover:underline font-MontserratSemiBold"
          >
            {isEntrepreneur ? "Back to My Campaigns" : "Back to projects"}
          </button>
        </div>
      </div>
    );
  }

  const pct = progress();
  const canInvest =
    !isEntrepreneur &&
    project.status === "active" &&
    project.fundingRaised < project.fundingGoal;

  return (
    <div className="p-6 bg-background min-h-screen max-w-7xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.push(backLink)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        {isEntrepreneur ? "Back to My Campaigns" : "Back to Projects"}
      </button>

      {/* ─── 1. PRIMARY CARD ──────────────────────── */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Cover image */}
          <div className="w-full lg:w-1/3 aspect-[4/3] bg-gradient-to-br from-[#00de00]/5 to-[#00de00]/20 rounded-xl relative flex items-center justify-center overflow-hidden border border-slate-100">
            {project.coverImageUrl ? (
              <img
                src={project.coverImageUrl}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(0,222,0,0.3)"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            )}
            {project.category && (
              <span className="absolute top-3 left-3 px-3 py-1 text-[10px] font-bold uppercase bg-white/90 backdrop-blur-sm rounded-full text-gray-700">
                {project.category}
              </span>
            )}
          </div>

          {/* Project info */}
          <div className="flex-1 space-y-4 w-full">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl lg:text-2xl font-MontserratSemiBold text-foreground tracking-tight">
                  {project.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span
                    className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                      project.status === "active"
                        ? "bg-green-100 text-green-800"
                        : project.status === "funded"
                          ? "bg-blue-100 text-blue-800"
                          : project.status === "draft"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {project.statusLabel}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {project.category}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isFavorited
                      ? "bg-red-50 border-red-200 text-red-500"
                      : "bg-white border-border text-gray-400 hover:text-gray-600"
                  }`}
                  title={
                    isFavorited ? "Remove from watchlist" : "Add to watchlist"
                  }
                >
                  <Heart
                    className="w-4 h-4"
                    fill={isFavorited ? "currentColor" : "none"}
                  />
                </button>
                <button
                  className="p-2.5 rounded-xl border border-border bg-white text-gray-400 hover:text-gray-600 transition-all"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {project.description}
            </p>

            {/* CTA - Invest button */}
            <div className="flex items-center gap-4 pt-2">
              <Button
                onClick={handleInvest}
                disabled={!canInvest}
                className="bg-[#00de00] hover:bg-[#00c800] text-white px-8 py-6 text-base font-MontserratSemiBold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {canInvest
                  ? "Invest Now"
                  : project.status === "funded"
                    ? "Fully Funded"
                    : "Not Available"}
              </Button>
              {!canInvest && project.status === "active" && (
                <p className="text-xs text-amber-600">
                  This project has reached its funding goal
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. METRICS BAR ─────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Funding progress */}
        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
            Funding Progress
          </span>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-2xl font-mono font-bold text-foreground">
              {formatCurrency(project.fundingRaised, project.currency)}
            </span>
            <span className="text-xs text-muted-foreground">
              of {formatCurrency(project.fundingGoal, project.currency)}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                pct >= 100
                  ? "bg-green-500"
                  : pct >= 50
                    ? "bg-blue-500"
                    : "bg-amber-500"
              }`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-foreground mt-1 block">
            {pct}% Funded
          </span>
        </div>

        {/* ROI - Short term */}
        {project.shortTermRoi && (
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Short-Term ROI
            </span>
            <span className="text-2xl font-mono font-bold text-emerald-600 block">
              {project.shortTermRoi}%
            </span>
            <span className="text-xs text-muted-foreground block mt-1">
              {project.shortTermMonths
                ? `~${project.shortTermMonths} months`
                : "Short term"}
            </span>
          </div>
        )}

        {/* ROI - Medium term */}
        {project.mediumTermRoi && (
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Medium-Term ROI
            </span>
            <span className="text-2xl font-mono font-bold text-blue-600 block">
              {project.mediumTermRoi}%
            </span>
            <span className="text-xs text-muted-foreground block mt-1">
              {project.mediumTermMonths
                ? `~${project.mediumTermMonths} months`
                : "Medium term"}
            </span>
          </div>
        )}

        {/* Break-even */}
        {project.breakEvenMonths && (
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Break-Even
            </span>
            <span className="text-2xl font-mono font-bold text-foreground block">
              ~{project.breakEvenMonths} mo
            </span>
            <span className="text-xs text-muted-foreground block mt-1">
              Estimated break-even point
            </span>
          </div>
        )}

        {/* Long-term ROI (if no medium) */}
        {!project.mediumTermRoi && project.longTermRoi && (
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Long-Term ROI
            </span>
            <span className="text-2xl font-mono font-bold text-purple-600 block">
              {project.longTermRoi}%
            </span>
            <span className="text-xs text-muted-foreground block mt-1">
              {project.longTermMonths
                ? `~${project.longTermMonths} months`
                : "Long term"}
            </span>
          </div>
        )}
      </div>

      {/* ─── 3. TABS ────────────────────────────── */}
      <div className="space-y-6">
        <div className="flex border-b border-border gap-6 overflow-x-auto">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`pb-3 text-sm font-medium tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === key
                  ? "border-[#00de00] text-foreground font-MontserratSemiBold"
                  : "border-transparent text-muted-foreground hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm min-h-[250px]">
          {/* ── Description Tab ───────────────── */}
          {activeTab === "description" && (
            <div className="space-y-6 max-w-4xl animate-fadeIn">
              <div>
                <h3 className="text-lg font-MontserratSemiBold text-foreground mb-2">
                  Project Overview
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>

              {project.marketAnalysis && (
                <div>
                  <h4 className="text-sm font-MontserratSemiBold text-foreground mb-1">
                    Market Analysis
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                    {project.marketAnalysis}
                  </p>
                </div>
              )}

              {project.competitiveAdvantage && (
                <div>
                  <h4 className="text-sm font-MontserratSemiBold text-foreground mb-1">
                    Competitive Advantage
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                    {project.competitiveAdvantage}
                  </p>
                </div>
              )}

              {project.teamBackground && (
                <div>
                  <h4 className="text-sm font-MontserratSemiBold text-foreground mb-1">
                    Team Background
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                    {project.teamBackground}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Milestones Tab ──────────────── */}
          {activeTab === "milestones" && (
            <div className="space-y-6 max-w-3xl animate-fadeIn">
              {project.milestones.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No milestones defined yet.
                </p>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">
                    Capital is released progressively upon verified milestone
                    completion.
                  </p>
                  <div className="relative border-l-2 border-gray-100 pl-6 ml-3 space-y-8">
                    {project.milestones.map((milestone, idx) => (
                      <div key={milestone.id} className="relative">
                        <span
                          className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 bg-white ${
                            milestone.status === "completed" ||
                            milestone.status === "approved"
                              ? "border-green-500 bg-green-50"
                              : milestone.status === "in_progress" ||
                                  milestone.status === "under_review"
                                ? "border-amber-500 bg-amber-50 animate-pulse"
                                : "border-gray-300"
                          }`}
                        />
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono font-bold bg-gray-200 px-1.5 py-0.5 rounded text-gray-600">
                              STEP {idx + 1}
                            </span>
                            <span
                              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                                milestone.status === "completed" ||
                                milestone.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : milestone.status === "in_progress" ||
                                      milestone.status === "under_review"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-gray-200 text-gray-500"
                              }`}
                            >
                              {milestone.statusLabel}
                            </span>
                          </div>
                          <h4 className="text-sm font-MontserratSemiBold text-foreground">
                            {milestone.title}
                          </h4>
                          {milestone.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {milestone.description}
                            </p>
                          )}
                          <div className="mt-2 text-xs text-gray-500">
                            Fund allocation: {milestone.fundAllocation}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Financials Tab ──────────────── */}
          {activeTab === "financials" && (
            <div className="space-y-6 max-w-4xl animate-fadeIn">
              {/* ROI cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {project.shortTermRoi && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                      Short-Term
                    </span>
                    <p className="text-2xl font-mono font-bold text-emerald-700 mt-1">
                      {project.shortTermRoi}%
                    </p>
                    <p className="text-xs text-emerald-600 mt-1">
                      {project.shortTermMonths
                        ? `${project.shortTermMonths} months`
                        : "Estimated"}
                    </p>
                  </div>
                )}
                {project.mediumTermRoi && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      Medium-Term
                    </span>
                    <p className="text-2xl font-mono font-bold text-blue-700 mt-1">
                      {project.mediumTermRoi}%
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {project.mediumTermMonths
                        ? `${project.mediumTermMonths} months`
                        : "Estimated"}
                    </p>
                  </div>
                )}
                {project.longTermRoi && (
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                      Long-Term
                    </span>
                    <p className="text-2xl font-mono font-bold text-purple-700 mt-1">
                      {project.longTermRoi}%
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      {project.longTermMonths
                        ? `${project.longTermMonths} months`
                        : "Estimated"}
                    </p>
                  </div>
                )}
              </div>

              {/* Break-even */}
              {project.breakEvenMonths && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Break-Even Point
                  </span>
                  <p className="text-xl font-mono font-bold text-foreground mt-1">
                    ~{project.breakEvenMonths} months
                  </p>
                </div>
              )}

              {/* Use of Funds */}
              {project.useOfFunds.length > 0 && (
                <div>
                  <h4 className="text-sm font-MontserratSemiBold text-foreground mb-3">
                    Use of Funds
                  </h4>
                  <div className="space-y-3">
                    {project.useOfFunds.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {item.category}
                          </p>
                          {item.details && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.details}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono font-bold text-foreground">
                            {formatCurrency(item.amount, project.currency)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.percentage}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk zones */}
              {project.riskZones.length > 0 && (
                <div>
                  <h4 className="text-sm font-MontserratSemiBold text-foreground mb-3">
                    Risk Assessment
                  </h4>
                  <div className="space-y-3">
                    {project.riskZones.map((risk, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-red-50 border border-red-100 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-red-800">
                            {risk.description}
                          </p>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              risk.severity === "high"
                                ? "bg-red-200 text-red-900"
                                : risk.severity === "medium"
                                  ? "bg-amber-200 text-amber-900"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {risk.severity}
                          </span>
                        </div>
                        {risk.mitigation && (
                          <p className="text-xs text-red-600 mt-1">
                            Mitigation: {risk.mitigation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Investors Tab ──────────────── */}
          {activeTab === "investors" && (
            <div className="space-y-4 max-w-3xl animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-MontserratSemiBold text-foreground">
                    Capital Ledger
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Investors who have committed capital to this project.
                  </p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                  {investors.length} investor{investors.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="border border-border rounded-xl overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-12 bg-gray-50 border-b border-border px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-1">#</div>
                  <div className="col-span-4">Investor</div>
                  <div className="col-span-4 text-right">Total Amount</div>
                  <div className="col-span-3 text-right">Ownership</div>
                </div>

                {/* Loading state */}
                {investorsLoading && (
                  <div className="p-8 text-center">
                    <Loader className="w-5 h-5 animate-spin mx-auto text-gray-300" />
                  </div>
                )}

                {/* Empty state */}
                {!investorsLoading && investors.length === 0 && (
                  <div className="p-8 text-center">
                    <Users className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No investors yet. Be the first to invest!
                    </p>
                  </div>
                )}

                {/* Investor rows */}
                {!investorsLoading &&
                  investors.length > 0 &&
                  investors.map((investor, idx) => {
                    const rank = idx + 1;
                    const isTop3 = rank <= 3;
                    const count = (investor as any).investment_count ?? 1;

                    return (
                      <div
                        key={`${investor.user_id ?? investor.full_name ?? "anonymous"}-${idx}`}
                        className={`grid grid-cols-12 items-center px-5 py-4 text-sm border-b border-border last:border-0 transition-colors hover:bg-gray-50/50 ${
                          isTop3 ? "bg-amber-50/30" : ""
                        }`}
                      >
                        {/* Rank */}
                        <div className="col-span-1">
                          {isTop3 ? (
                            <span className="text-sm">
                              {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                            </span>
                          ) : (
                            <span className="font-mono text-xs text-gray-400">
                              #{rank}
                            </span>
                          )}
                        </div>

                        {/* Name */}
                        <div className="col-span-4 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#00de00]/10 flex items-center justify-center text-[10px] font-MontserratSemiBold text-[#00de00] shrink-0">
                            {(investor.full_name ?? "A")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-foreground truncate block">
                              {investor.full_name ?? "Anonymous"}
                            </span>
                            {count > 1 && (
                              <span className="text-[10px] text-muted-foreground">
                                {count} investments
                              </span>
                            )}
                          </div>
                          {isTop3 && (
                            <span className="text-[10px] text-amber-600 font-medium shrink-0 ml-auto">
                              Top {rank}
                            </span>
                          )}
                        </div>

                        {/* Total Amount */}
                        <div className="col-span-4 text-right">
                          <span className="font-mono font-semibold text-foreground">
                            {investor.amount != null
                              ? formatCurrency(
                                  investor.amount,
                                  investor.currency ?? project.currency,
                                )
                              : "-"}
                          </span>
                        </div>

                        {/* Ownership */}
                        <div className="col-span-3 text-right">
                          {investor.ownership_pct != null ? (
                            <span className="inline-block px-2 py-0.5 text-[11px] font-MontserratSemiBold bg-[#00de00]/10 text-[#00de00] rounded-full">
                              {investor.ownership_pct.toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              -
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {investors.length > 0 && (
                <p className="text-[10px] text-muted-foreground text-center">
                  🏆 Top 3 investors are highlighted
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── 4. STICKY INVEST CTA (mobile) ─────── */}
      {canInvest && !isEntrepreneur && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-border p-4 shadow-lg z-40">
          <Button
            onClick={handleInvest}
            className="w-full bg-[#00de00] hover:bg-[#00c800] text-white py-6 text-base font-MontserratSemiBold rounded-xl"
          >
            Invest in {project.title}
          </Button>
        </div>
      )}
    </div>
  );
}
