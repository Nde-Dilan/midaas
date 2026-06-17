"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminProvider, type AdminProjectItem } from "@/api/admin";
import { useAdminStore } from "@/store/admin";
import { Button } from "@/components/atoms/button";
import { MUITextarea } from "@/components/atoms/input";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader,
  AlertTriangle,
  User,
  Calendar,
  Hash,
  DollarSign,
  TrendingUp,
  FileText,
  Target,
  Users,
  Shield,
  Percent,
  ExternalLink,
  Briefcase,
} from "lucide-react";

/* ─── Steps for campaign review ───────────── */
const STEPS = [
  { id: "overview", label: "Overview", icon: Layers },
  { id: "company", label: "Company", icon: Briefcase },
  { id: "financials", label: "Financials", icon: DollarSign },
  { id: "milestones", label: "Milestones", icon: Target },
  { id: "decision", label: "Decision", icon: CheckCircle2 },
] as const;

type StepId = (typeof STEPS)[number]["id"];

export default function AdminCampaignReviewPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { pendingProjects } = useAdminStore();
  const [project, setProject] = useState<AdminProjectItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const currentIndex = pendingProjects.findIndex((p) => p.id === projectId);

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      setLoading(true);
      const { data, error } = await adminProvider.getProjectDetail(projectId);
      if (data) {
        setProject(data);
      } else {
        // Fallback — use list data
        const found = pendingProjects.find((p) => p.id === projectId);
        if (found) setProject(found);
        else toast.error(error || "Failed to load project");
      }
      setLoading(false);
    })();
  }, [projectId, pendingProjects]);

  const handleApprove = useCallback(async () => {
    if (!project) return;
    setActionLoading(true);
    const { data, error } = await adminProvider.approveProject(project.id);
    if (data) {
      useAdminStore.getState().updateProjectStatus(project.id, "active");
      setProject((p) => (p ? { ...p, status: "active" } : p));
      toast.success(`"${project.title}" approved`);
    } else toast.error(error || "Failed to approve");
    setActionLoading(false);
  }, [project]);

  const handleReject = useCallback(async () => {
    if (!project) return;
    setActionLoading(true);
    const { data, error } = await adminProvider.rejectProject(
      project.id,
      rejectReason,
    );
    if (data) {
      useAdminStore.getState().updateProjectStatus(project.id, "rejected");
      setProject((p) => (p ? { ...p, status: "rejected" } : p));
      toast.success(`"${project.title}" rejected`);
      setShowRejectForm(false);
    } else toast.error(error || "Failed to reject");
    setActionLoading(false);
  }, [project, rejectReason]);

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;
  const isTreated =
    project?.status === "active" || project?.status === "rejected";
  const prev = currentIndex > 0 ? pendingProjects[currentIndex - 1] : null;
  const next =
    currentIndex < pendingProjects.length - 1
      ? pendingProjects[currentIndex + 1]
      : null;

  if (loading) {
    return (
      <section className="p-6">
        <div className="max-w-5xl mx-auto mt-8 flex items-center justify-center min-h-[500px]">
          <Loader className="w-10 h-10 animate-spin text-gray-300" />
        </div>
      </section>
    );
  }

  if (!project) {
    return (
      <section className="p-6">
        <div className="max-w-5xl mx-auto mt-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/campaigns/pending")}
            className="gap-2 mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to queue
          </Button>
          <div className="text-center py-20 bg-white rounded-2xl border border-border">
            <AlertTriangle className="w-16 h-16 text-amber-300 mx-auto mb-4" />
            <h2 className="text-xl font-MontserratBold text-gray-900 mb-2">
              Project not found
            </h2>
          </div>
        </div>
      </section>
    );
  }

  const progress =
    project.funding_goal > 0
      ? Math.round(((project.funding_raised ?? 0) / project.funding_goal) * 100)
      : 0;

  return (
    <section className="p-6">
      <div className="max-w-5xl mx-auto mt-8 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/campaigns/pending")}
            className="gap-2 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to queue
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 font-MontserratSemiBold">
              {pendingProjects.length > 0
                ? `${currentIndex + 1} / ${pendingProjects.length}`
                : "—"}
            </span>
            <div className="flex gap-1">
              <Link href={prev ? `/admin/campaigns/pending/${prev.id}` : "#"}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!prev}
                  className="px-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </Link>
              <Link href={next ? `/admin/campaigns/pending/${next.id}` : "#"}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!next}
                  className="px-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Header banner */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/10">
              <Layers className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-MontserratBold">
                  {project.title}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50/20 text-amber-200 border border-amber-200/30">
                  {project.status || "pending"}
                </span>
              </div>
              <p className="text-blue-200 text-sm mt-1.5">
                {project.company?.legal_name}
                {project.company?.corporate_form
                  ? ` · ${project.company.corporate_form}`
                  : ""}
                {project.category ? ` · ${project.category}` : ""}
              </p>
              {isTreated && (
                <p className="text-xs text-blue-300 mt-2 italic">
                  This campaign has already been reviewed
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Step progress */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between gap-2 overflow-x-auto">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i === currentStep;
              const done = i < currentStep;
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentStep(i)}
                  className={`flex flex-col items-center gap-1.5 min-w-[80px] transition-all ${active ? "opacity-100" : done ? "opacity-70" : "opacity-40"}`}
                >
                  <span
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-MontserratBold transition-all ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : done ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}
                  >
                    {done ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </span>
                  <span
                    className={`text-[10px] font-MontserratSemiBold whitespace-nowrap ${active ? "text-gray-900" : "text-gray-400"}`}
                  >
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              {(() => {
                const Icon = step.icon;
                return <Icon className="w-5 h-5 text-gray-600" />;
              })()}
            </div>
            <div>
              <h2 className="text-lg font-MontserratBold text-gray-900">
                {step.label}
              </h2>
            </div>
          </div>

          {step.id === "overview" && (
            <StepOverview project={project} progress={progress} />
          )}
          {step.id === "company" && <StepCompany project={project} />}
          {step.id === "financials" && <StepFinancials project={project} />}
          {step.id === "milestones" && <StepMilestones project={project} />}
          {step.id === "decision" && (
            <StepDecision
              project={project}
              isTreated={isTreated}
              actionLoading={actionLoading}
              showRejectForm={showRejectForm}
              rejectReason={rejectReason}
              onSetRejectReason={setRejectReason}
              onShowRejectForm={setShowRejectForm}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}
        </div>

        {/* Step nav */}
        {!isTreated && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            {!isLast ? (
              <Button
                onClick={() =>
                  setCurrentStep((p) => Math.min(STEPS.length - 1, p + 1))
                }
                className="gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <div />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════ Step 1 — Overview ═══════ */
function StepOverview({
  project,
  progress,
}: {
  project: AdminProjectItem;
  progress: number;
}) {
  return (
    <div className="space-y-6">
      <Field icon={FileText} label="Title" value={project.title} />
      <Field icon={Layers} label="Category" value={project.category || "—"} />
      {project.description && (
        <div>
          <p className="text-xs text-gray-400 mb-1 font-MontserratSemiBold">
            Description
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {project.description}
          </p>
        </div>
      )}

      <hr className="border-border" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded-xl border border-border">
          <p className="text-xs text-gray-400 mb-1">Funding Goal</p>
          <p className="text-lg font-MontserratBold text-gray-900">
            {project.funding_goal?.toLocaleString()} {project.currency || "XOF"}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-border">
          <p className="text-xs text-gray-400 mb-1">Raised So Far</p>
          <p className="text-lg font-MontserratBold text-emerald-600">
            {project.funding_raised?.toLocaleString() ?? 0}{" "}
            {project.currency || "XOF"}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-border">
          <p className="text-xs text-gray-400 mb-1">Investors</p>
          <p className="text-lg font-MontserratBold text-blue-600">
            {project.investor_count ?? 0}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-400 mb-1.5">Progress</p>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${progress >= 100 ? "bg-emerald-500" : progress >= 50 ? "bg-blue-500" : "bg-amber-500"}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-right text-xs text-gray-400 mt-1">{progress}%</p>
      </div>

      {/* ROI */}
      {(project.short_term_roi ||
        project.medium_term_roi ||
        project.long_term_roi) && (
        <div>
          <p className="text-xs text-gray-400 mb-2 font-MontserratSemiBold">
            Projected ROI
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {project.short_term_roi && (
              <RoiCard
                label="Short Term"
                value={`${project.short_term_roi}%`}
                months={project.short_term_months}
                color="emerald"
              />
            )}
            {project.medium_term_roi && (
              <RoiCard
                label="Medium Term"
                value={`${project.medium_term_roi}%`}
                months={project.medium_term_months}
                color="blue"
              />
            )}
            {project.long_term_roi && (
              <RoiCard
                label="Long Term"
                value={`${project.long_term_roi}%`}
                months={project.long_term_months}
                color="purple"
              />
            )}
          </div>
        </div>
      )}

      {project.break_even_months && (
        <Field
          icon={TrendingUp}
          label="Break-even (months)"
          value={String(project.break_even_months)}
        />
      )}
    </div>
  );
}

/* ═══════ Step 2 — Company ═══════ */
function StepCompany({ project }: { project: AdminProjectItem }) {
  const c = project.company;
  if (!c) return <p className="text-sm text-gray-400">No company linked</p>;

  return (
    <div className="space-y-6">
      <Field icon={FileText} label="Legal Name" value={c.legal_name} />
      <Field icon={FileText} label="Trade Name" value={c.trade_name || "—"} />
      <Field icon={Briefcase} label="Corporate Form" value={c.corporate_form} />
      <Field
        icon={Layers}
        label="Industry Sector"
        value={c.industry_sector || "—"}
      />
      <Field
        icon={FileText}
        label="Physical Address"
        value={c.physical_address || "—"}
      />

      {c.entrepreneur && (
        <>
          <hr className="border-border" />
          <h3 className="text-sm font-MontserratSemiBold text-gray-700">
            Entrepreneur
          </h3>
          <Field
            icon={User}
            label="Name"
            value={c.entrepreneur.user?.full_name || "—"}
          />
          {c.entrepreneur.user?.email && (
            <Field
              icon={FileText}
              label="Email"
              value={c.entrepreneur.user.email}
            />
          )}
        </>
      )}
    </div>
  );
}

/* ═══════ Step 3 — Financials ═══════ */
function StepFinancials({ project }: { project: AdminProjectItem }) {
  return (
    <div className="space-y-6">
      {/* Use of funds */}
      {project.use_of_funds && project.use_of_funds.length > 0 && (
        <div>
          <h3 className="text-sm font-MontserratSemiBold text-gray-700 mb-3">
            Use of Funds
          </h3>
          <div className="space-y-3">
            {project.use_of_funds.map((item, i) => (
              <div
                key={i}
                className="p-4 bg-gray-50 rounded-xl border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-MontserratSemiBold text-gray-900">
                    {item.category}
                  </span>
                  <span className="text-sm font-MontserratBold text-blue-600">
                    {item.percentage}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-1">
                  {item.amount.toLocaleString()} {project.currency || "XOF"}
                </p>
                {item.details && (
                  <p className="text-xs text-gray-400">{item.details}</p>
                )}
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk zones */}
      {project.risk_zones && project.risk_zones.length > 0 && (
        <div>
          <h3 className="text-sm font-MontserratSemiBold text-gray-700 mb-3">
            Risk Zones
          </h3>
          <div className="space-y-3">
            {project.risk_zones.map((risk, i) => (
              <div
                key={i}
                className="p-4 bg-red-50 rounded-xl border border-red-200"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Shield
                    className={`w-4 h-4 ${risk.severity === "high" ? "text-red-500" : risk.severity === "medium" ? "text-amber-500" : "text-blue-500"}`}
                  />
                  <span className="text-sm font-MontserratSemiBold text-gray-900">
                    {risk.description}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Severity:{" "}
                  <span className="font-semibold uppercase">
                    {risk.severity}
                  </span>
                  {risk.mitigation && ` · Mitigation: ${risk.mitigation}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market analysis */}
      {project.market_analysis && (
        <div>
          <h3 className="text-sm font-MontserratSemiBold text-gray-700 mb-2">
            Market Analysis
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {project.market_analysis}
          </p>
        </div>
      )}

      {project.competitive_advantage && (
        <div>
          <h3 className="text-sm font-MontserratSemiBold text-gray-700 mb-2">
            Competitive Advantage
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {project.competitive_advantage}
          </p>
        </div>
      )}

      {project.team_background && (
        <div>
          <h3 className="text-sm font-MontserratSemiBold text-gray-700 mb-2">
            Team Background
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {project.team_background}
          </p>
        </div>
      )}

      {/* Docs */}
      <DocSection label="Business Plan" urls={project.business_plan_docs} />
      <DocSection
        label="Financial Projections"
        urls={project.financial_projections}
      />
    </div>
  );
}

/* ═══════ Step 4 — Milestones ═══════ */
function StepMilestones({ project }: { project: AdminProjectItem }) {
  const ms = project.milestones;
  if (!ms || ms.length === 0)
    return <p className="text-sm text-gray-400">No milestones defined</p>;

  const totalAlloc = ms.reduce((s, m) => s + (m.fund_allocation ?? 0), 0);

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">
        {ms.length} milestone(s) · {totalAlloc.toLocaleString()}{" "}
        {project.currency || "XOF"} total allocation
      </p>
      {ms
        .sort((a, b) => (a.order_num ?? 0) - (b.order_num ?? 0))
        .map((m, i) => (
          <div
            key={m.id}
            className="p-5 bg-gray-50 rounded-xl border border-border"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-MontserratBold flex-shrink-0 mt-0.5">
                  {m.order_num ?? i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-MontserratSemiBold text-gray-900">
                    {m.title}
                  </p>
                  {m.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {m.description}
                    </p>
                  )}
                  {m.due_date && (
                    <p className="text-xs text-gray-400 mt-1">
                      Due:{" "}
                      {new Date(m.due_date).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-MontserratBold text-emerald-600">
                  {m.fund_allocation?.toLocaleString()} XOF
                </p>
                <p className="text-[10px] text-gray-400">
                  {totalAlloc > 0
                    ? Math.round(((m.fund_allocation ?? 0) / totalAlloc) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>
            {m.proof_urls && m.proof_urls.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {m.proof_urls.map((url, j) => (
                  <a
                    key={j}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] bg-white border border-border rounded-lg hover:bg-gray-100"
                  >
                    <ExternalLink className="w-3 h-3" /> Proof {j + 1}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
    </div>
  );
}

/* ═══════ Step 5 — Decision ═══════ */
function StepDecision({
  project,
  isTreated,
  actionLoading,
  showRejectForm,
  rejectReason,
  onSetRejectReason,
  onShowRejectForm,
  onApprove,
  onReject,
}: {
  project: AdminProjectItem;
  isTreated: boolean;
  actionLoading: boolean;
  showRejectForm: boolean;
  rejectReason: string;
  onSetRejectReason: (v: string) => void;
  onShowRejectForm: (v: boolean) => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  if (isTreated) {
    const ok = project.status === "active";
    return (
      <div
        className={`text-center py-10 px-6 rounded-2xl border ${ok ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}
      >
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${ok ? "bg-emerald-100" : "bg-red-100"}`}
        >
          {ok ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600" />
          )}
        </div>
        <h3 className="text-xl font-MontserratBold text-gray-900 mb-2">
          {ok ? "Campaign approved" : "Campaign rejected"}
        </h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-xl font-MontserratBold text-gray-900 mb-2">
          Ready to decide?
        </h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Review completed. Confirm your decision for this campaign.
        </p>
      </div>
      <div className="max-w-sm mx-auto space-y-3">
        <Button
          onClick={onApprove}
          disabled={actionLoading}
          className="w-full h-12 gap-2 bg-blue-600 hover:bg-blue-500 text-white"
        >
          {actionLoading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-5 h-5" />
          )}
          Approve Campaign
        </Button>
        {!showRejectForm ? (
          <Button
            onClick={() => onShowRejectForm(true)}
            variant="destructive"
            disabled={actionLoading}
            className="w-full h-12 gap-2"
          >
            <XCircle className="w-5 h-5" /> Reject Campaign
          </Button>
        ) : (
          <div className="space-y-3 p-4 rounded-xl bg-red-50 border border-red-200">
            <label className="block text-sm font-MontserratSemiBold text-red-800">
              Reason for rejection
            </label>
            <MUITextarea
              value={rejectReason}
              onChange={(e) => onSetRejectReason(e.target.value)}
              placeholder="Explain why this campaign is rejected..."
              label=""
              rows={3}
              className="w-full text-sm"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  onShowRejectForm(false);
                  onSetRejectReason("");
                }}
                variant="outline"
                className="flex-1 h-10 text-xs"
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={onReject}
                variant="destructive"
                className="flex-1 h-10 text-xs"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirm Rejection"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Shared helpers ──────────────── */
function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>
      <p className="text-sm font-MontserratSemiBold text-gray-900 truncate">
        {value}
      </p>
    </div>
  );
}

function RoiCard({
  label,
  value,
  months,
  color,
}: {
  label: string;
  value: string;
  months?: number;
  color: string;
}) {
  const bg =
    {
      emerald: "bg-emerald-50 border-emerald-200",
      blue: "bg-blue-50 border-blue-200",
      purple: "bg-purple-50 border-purple-200",
    }[color] ?? "bg-gray-50";
  const txt =
    {
      emerald: "text-emerald-600",
      blue: "text-blue-600",
      purple: "text-purple-600",
    }[color] ?? "text-gray-600";
  return (
    <div className={`p-4 rounded-xl border ${bg}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-xl font-MontserratBold ${txt}`}>{value}</p>
      {months && <p className="text-xs text-gray-400">{months} months</p>}
    </div>
  );
}

function DocSection({ label, urls }: { label: string; urls?: string[] }) {
  if (!urls || urls.length === 0) return null;
  return (
    <div>
      <p className="text-sm font-MontserratSemiBold text-gray-700 mb-2">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {urls.map((url, i) => (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-white border border-border rounded-lg hover:bg-gray-50"
          >
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            Document {i + 1}
            <ExternalLink className="w-3 h-3 text-blue-500" />
          </a>
        ))}
      </div>
    </div>
  );
}
