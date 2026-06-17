"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  adminProvider,
  type AdminCompanyItem,
  type AdminCompanyDetail,
} from "@/api/admin";
import { useAdminStore } from "@/store/admin";
import { Button } from "@/components/atoms/button";
import { MUITextarea } from "@/components/atoms/input";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  User,
  MapPin,
  FileText,
  Globe,
  ChevronLeft,
  ChevronRight,
  Loader,
  AlertTriangle,
  Mail,
  Calendar,
  Tag,
  Hash,
  Users,
  Divide,
  Upload,
  ExternalLink,
  Percent,
  Briefcase,
  Banknote,
  Landmark,
  FileImage,
} from "lucide-react";

const statusMeta: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "En attente",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Clock className="w-4 h-4" />,
  },
  reverify_requested: {
    label: "Re-vérification demandée",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    icon: <Shield className="w-4 h-4" />,
  },
  approved: {
    label: "Approuvé",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  rejected: {
    label: "Rejeté",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: <XCircle className="w-4 h-4" />,
  },
};

/* ─── Steps mirroring the creation form ─────── */
const VERIFICATION_STEPS = [
  {
    id: "identity",
    label: "Identité",
    icon: Building2,
    description: "Informations générales de l'entreprise",
  },
  {
    id: "legal",
    label: "Documents légaux",
    icon: FileText,
    description: "RCCM, NIU, Statuts, local",
  },
  {
    id: "owners",
    label: "Actionnaires",
    icon: Users,
    description: "Bénéficiaires effectifs",
  },
  {
    id: "management",
    label: "Direction",
    icon: Briefcase,
    description: "Équipe de gestion",
  },
  {
    id: "financial",
    label: "Finances",
    icon: Banknote,
    description: "Informations financières",
  },
  {
    id: "documents",
    label: "Pièces jointes",
    icon: Upload,
    description: "Documents supplémentaires",
  },
  {
    id: "decision",
    label: "Décision",
    icon: CheckCircle2,
    description: "Approuver ou rejeter",
  },
] as const;

type StepId = (typeof VERIFICATION_STEPS)[number]["id"];

export default function AdminCompanyReviewPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const { pendingCompanies } = useAdminStore();
  const [company, setCompany] = useState<AdminCompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [detailLoading, setDetailLoading] = useState(false);

  // Queue navigation
  const currentIndex = pendingCompanies.findIndex((c) => c.id === companyId);
  const prevCompany =
    currentIndex > 0 ? pendingCompanies[currentIndex - 1] : null;
  const nextCompany =
    currentIndex < pendingCompanies.length - 1
      ? pendingCompanies[currentIndex + 1]
      : null;
  const totalPending = pendingCompanies.length;

  // Fetch FULL company detail
  useEffect(() => {
    if (!companyId) return;

    (async () => {
      setLoading(true);
      setDetailLoading(true);

      // Fetch the full detail
      const { data, error } = await adminProvider.getCompanyDetail(companyId);

      if (data) {
        setCompany(data);
      } else {
        // Fallback: at least get basic info from pending list
        const found = pendingCompanies.find((c) => c.id === companyId);
        if (found) {
          setCompany(found as AdminCompanyDetail);
        } else {
          toast.error(error || "Impossible de charger les détails");
        }
      }
      setLoading(false);
      setDetailLoading(false);
    })();
  }, [companyId, pendingCompanies]);

  const handleApprove = useCallback(async () => {
    if (!company) return;
    setActionLoading(true);
    const { data, error } = await adminProvider.approveCompany(company.id);
    if (data) {
      useAdminStore.getState().updateCompanyStatus(company.id, "approved");
      setCompany((prev) => (prev ? { ...prev, status: "approved" } : prev));
      toast.success(`"${company.legal_name}" approuvée avec succès`);
    } else {
      toast.error(error || "Erreur lors de l'approbation");
    }
    setActionLoading(false);
  }, [company]);

  const handleReject = useCallback(async () => {
    if (!company) return;
    setActionLoading(true);
    const { data, error } = await adminProvider.rejectCompany(
      company.id,
      rejectReason,
    );
    if (data) {
      useAdminStore.getState().updateCompanyStatus(company.id, "rejected");
      setCompany((prev) => (prev ? { ...prev, status: "rejected" } : prev));
      toast.success(`"${company.legal_name}" rejetée`);
      setShowRejectForm(false);
    } else {
      toast.error(error || "Erreur lors du rejet");
    }
    setActionLoading(false);
  }, [company, rejectReason]);

  const step = VERIFICATION_STEPS[currentStep];
  const stepId = step?.id as StepId | undefined;
  const meta = statusMeta[company?.status ?? ""] || statusMeta.pending;
  const isTreated =
    company?.status === "approved" || company?.status === "rejected";
  const isLastStep = currentStep === VERIFICATION_STEPS.length - 1;

  // Loading
  if (loading) {
    return (
      <section className="p-6">
        <div className="max-w-5xl mx-auto mt-8 flex items-center justify-center min-h-[500px]">
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-10 h-10 animate-spin text-gray-300" />
            <p className="text-gray-400 text-sm">Chargement des données...</p>
          </div>
        </div>
      </section>
    );
  }

  // Not found
  if (!company) {
    return (
      <section className="p-6">
        <div className="max-w-5xl mx-auto mt-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/companies/pending")}
            className="gap-2 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </Button>
          <div className="text-center py-20 bg-white rounded-2xl border border-border">
            <AlertTriangle className="w-16 h-16 text-amber-300 mx-auto mb-4" />
            <h2 className="text-xl font-MontserratBold text-gray-900 mb-2">
              Entreprise introuvable
            </h2>
            <p className="text-gray-500 text-sm">
              Cette entreprise n&apos;existe pas ou a déjà été traitée.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="p-6">
      <div className="max-w-5xl mx-auto mt-8 space-y-6">
        {/* ─── Top Bar: Back + Queue Nav ──────────────────────────── */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/companies/pending")}
            className="gap-2 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 font-MontserratSemiBold">
              {totalPending > 0 ? `${currentIndex + 1} / ${totalPending}` : "—"}
            </span>
            <div className="flex gap-1">
              <Link
                href={
                  prevCompany
                    ? `/admin/companies/pending/${prevCompany.id}`
                    : "#"
                }
              >
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!prevCompany}
                  className="px-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </Link>
              <Link
                href={
                  nextCompany
                    ? `/admin/companies/pending/${nextCompany.id}`
                    : "#"
                }
              >
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!nextCompany}
                  className="px-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Header Banner ──────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/10">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-MontserratBold">
                  {company.trade_name || company.legal_name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${meta.color}`}
                >
                  {meta.icon}
                  {meta.label}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-1.5">
                {company.legal_name} · {company.corporate_form}
                {company.industry_sector && ` · ${company.industry_sector}`}
              </p>
              {isTreated && (
                <p className="text-xs text-gray-500 mt-2 italic">
                  Cette demande a déjà été traitée
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ─── Step Progress ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
            {VERIFICATION_STEPS.map((s, i) => {
              const StepIcon = s.icon;
              const isActive = i === currentStep;
              const isDone = i < currentStep;
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentStep(i)}
                  className={`flex flex-col items-center gap-1.5 min-w-[72px] transition-all ${
                    isActive
                      ? "opacity-100"
                      : isDone
                        ? "opacity-70"
                        : "opacity-40"
                  }`}
                >
                  <span
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-MontserratBold transition-all ${
                      isActive
                        ? "bg-[#00de00] text-white shadow-lg shadow-[#00de00]/20"
                        : isDone
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </span>
                  <span
                    className={`text-[10px] font-MontserratSemiBold whitespace-nowrap ${
                      isActive ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Step Content ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
          {detailLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="w-8 h-8 animate-spin text-gray-300" />
            </div>
          ) : (
            <>
              {/* Step header */}
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
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              </div>

              {/* Dynamic step renderer */}
              {stepId === "identity" && <StepIdentity company={company} />}
              {stepId === "legal" && <StepLegal company={company} />}
              {stepId === "owners" && <StepOwners company={company} />}
              {stepId === "management" && <StepManagement company={company} />}
              {stepId === "financial" && <StepFinancial company={company} />}
              {stepId === "documents" && <StepDocuments company={company} />}
              {stepId === "decision" && (
                <StepDecision
                  company={company}
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
            </>
          )}
        </div>

        {/* ─── Step Navigation ────────────────────────────────────── */}
        {!isTreated && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Étape précédente
            </Button>

            {!isLastStep ? (
              <Button
                onClick={() =>
                  setCurrentStep((p) =>
                    Math.min(VERIFICATION_STEPS.length - 1, p + 1),
                  )
                }
                className="gap-2"
              >
                Étape suivante
                <ChevronRight className="w-4 h-4" />
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

/* ═══════════════════════════════════════════════
   STEP 1 — Identity (Company basic info + entrepreneur)
   ═══════════════════════════════════════════════ */
function StepIdentity({ company }: { company: AdminCompanyDetail }) {
  return (
    <div className="space-y-8">
      {/* Company identity */}
      <div>
        <h3 className="text-base font-MontserratSemiBold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          Informations générales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            icon={FileText}
            label="Raison sociale"
            value={company.legal_name}
          />
          <Field
            icon={Tag}
            label="Nom commercial"
            value={company.trade_name || "—"}
          />
          <Field
            icon={Building2}
            label="Forme juridique"
            value={
              {
                ETS: "Établissement (ETS)",
                SARL: "SARL",
                SA: "SA",
                SAS: "SAS",
              }[company.corporate_form] || company.corporate_form
            }
          />
          <Field
            icon={Globe}
            label="Secteur d'activité"
            value={company.industry_sector || "Non spécifié"}
          />
          <Field
            icon={MapPin}
            label="Adresse physique"
            value={company.physical_address || "Non renseignée"}
          />
          <Field
            icon={Globe}
            label="Coordonnées GPS"
            value={company.gps_coordinates || "Non renseignées"}
          />
        </div>
      </div>

      {/* Entrepreneur */}
      {company.entrepreneur && (
        <div>
          <h3 className="text-base font-MontserratSemiBold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            Porteur du projet
          </h3>
          <div className="p-5 bg-gray-50 rounded-xl border border-border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                <User className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-MontserratSemiBold text-gray-900">
                  {company.entrepreneur.user?.full_name || "Inconnu"}
                </p>
                {company.entrepreneur.user?.email && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {company.entrepreneur.user.email}
                  </p>
                )}
                {company.entrepreneur.user?.phone_number && (
                  <p className="text-sm text-gray-400 mt-0.5">
                    {company.entrepreneur.user.phone_number}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field
          icon={Calendar}
          label="Créée le"
          value={formatDate(company.created_at)}
        />
        <Field
          icon={Hash}
          label="ID entreprise"
          value={company.id.slice(0, 8) + "..."}
          muted
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   STEP 2 — Legal Documents
   ═══════════════════════════════════════════════ */
function StepLegal({ company }: { company: AdminCompanyDetail }) {
  const docs = company.legal_docs;
  return (
    <div className="space-y-6">
      <Field
        icon={FileText}
        label="Numéro RCCM"
        value={docs?.rccm_number || "—"}
      />

      <h4 className="text-sm font-MontserratSemiBold text-gray-700 mt-6 mb-3">
        Documents fournis
      </h4>

      <div className="space-y-3">
        <DocRow label="Document RCCM" urls={docs?.rccm_docs} />
        <DocRow
          label="NIU (Identifiant fiscal)"
          urls={docs?.niu_doc_url ? [docs.niu_doc_url] : undefined}
        />
        <DocRow label="Statuts de l'entreprise" urls={docs?.statuts_docs} />
        <DocRow
          label="Photos des locaux (premises)"
          urls={docs?.premises_photos}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   STEP 3 — Beneficial Owners
   ═══════════════════════════════════════════════ */
function StepOwners({ company }: { company: AdminCompanyDetail }) {
  const owners = company.beneficial_owners;
  if (!owners || owners.length === 0) {
    return (
      <EmptyState
        icon={Users}
        message="Aucun bénéficiaire effectif renseigné"
      />
    );
  }
  return (
    <div className="space-y-4">
      {owners.map((o, i) => (
        <div key={i} className="p-5 bg-gray-50 rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-MontserratSemiBold text-gray-900">
                  {o.full_name}
                </p>
                <p className="text-sm text-gray-500">Actionnaire #{i + 1}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-MontserratBold text-emerald-600">
                {o.equity_percentage}%
              </p>
              <p className="text-xs text-gray-400">Parts</p>
            </div>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full"
              style={{ width: `${Math.min(o.equity_percentage, 100)}%` }}
            />
          </div>
        </div>
      ))}
      <div className="p-4 bg-gray-50 rounded-xl border border-border text-sm text-gray-500 text-center">
        Total : {owners.reduce((s, o) => s + o.equity_percentage, 0)}%
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   STEP 4 — Management Team
   ═══════════════════════════════════════════════ */
function StepManagement({ company }: { company: AdminCompanyDetail }) {
  const managers = company.managers;
  if (!managers || managers.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        message="Aucun membre de direction renseigné"
      />
    );
  }
  return (
    <div className="space-y-4">
      {managers.map((m, i) => (
        <div key={i} className="p-5 bg-gray-50 rounded-xl border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-MontserratSemiBold text-gray-900">
                {m.full_name}
              </p>
              <p className="text-sm text-gray-500">{m.role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   STEP 5 — Financial Information
   ═══════════════════════════════════════════════ */
function StepFinancial({ company }: { company: AdminCompanyDetail }) {
  const fin = company.financials;
  return (
    <div className="space-y-6">
      <Field
        icon={Calendar}
        label="Exercices fiscaux (DSF)"
        value={fin?.dsf_years?.length ? fin.dsf_years.join(", ") : "—"}
      />

      <h4 className="text-sm font-MontserratSemiBold text-gray-700 mt-6 mb-3">
        Relevés financiers
      </h4>
      <div className="space-y-3">
        <DocRow label="Relevés bancaires" urls={fin?.bank_statements} />
        <DocRow label="Relevés Mobile Money" urls={fin?.momo_statements} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   STEP 6 — Additional Documents
   ═══════════════════════════════════════════════ */
function StepDocuments({ company }: { company: AdminCompanyDetail }) {
  return (
    <div className="space-y-4">
      <DocRow
        label="Permis et licences sectoriels"
        urls={company.legal_docs?.sector_permits}
      />
      <DocRow
        label="Documents de garantie (collatéral)"
        urls={
          (company as any).operations?.collateral_proof_docs
        }
      />
      <DocRow label="Pièces d'identité" urls={undefined} />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   STEP 7 — Decision
   ═══════════════════════════════════════════════ */
function StepDecision({
  company,
  isTreated,
  actionLoading,
  showRejectForm,
  rejectReason,
  onSetRejectReason,
  onShowRejectForm,
  onApprove,
  onReject,
}: {
  company: AdminCompanyDetail;
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
    const isApproved = company.status === "approved";
    return (
      <div
        className={`text-center py-10 px-6 rounded-2xl border ${isApproved ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}
      >
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isApproved ? "bg-emerald-100" : "bg-red-100"}`}
        >
          {isApproved ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600" />
          )}
        </div>
        <h3 className="text-xl font-MontserratBold text-gray-900 mb-2">
          {isApproved ? "Entreprise approuvée" : "Entreprise rejetée"}
        </h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          {isApproved
            ? "Cette entreprise a été validée et peut désormais lancer des campagnes."
            : "Cette entreprise a été rejetée. L'entrepreneur sera notifié."}
        </p>
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
          Prêt à statuer ?
        </h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Vous avez examiné toutes les informations. Confirmez votre décision
          pour cette entreprise.
        </p>
      </div>

      <div className="max-w-sm mx-auto space-y-3">
        <Button
          onClick={onApprove}
          disabled={actionLoading}
          className="w-full h-12 gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          {actionLoading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-5 h-5" />
          )}
          Approuver l&apos;entreprise
        </Button>

        {!showRejectForm ? (
          <Button
            onClick={() => onShowRejectForm(true)}
            variant="destructive"
            disabled={actionLoading}
            className="w-full h-12 gap-2"
          >
            <XCircle className="w-5 h-5" />
            Rejeter l&apos;entreprise
          </Button>
        ) : (
          <div className="space-y-3 p-4 rounded-xl bg-red-50 border border-red-200">
            <label className="block text-sm font-MontserratSemiBold text-red-800">
              Motif du rejet
            </label>
            <MUITextarea
              value={rejectReason}
              onChange={(e) => onSetRejectReason(e.target.value)}
              placeholder="Expliquez pourquoi cette demande est rejetée..."
              label=""
              rows={3}
              className="w-full text-sm bg-white border-red-200 focus:border-red-400"
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
                Annuler
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
                  "Confirmer le rejet"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Shared helpers
   ═══════════════════════════════════════════════ */

function Field({
  icon: Icon,
  label,
  value,
  muted = false,
}: {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>
      <p
        className={`text-sm font-MontserratSemiBold truncate ${muted ? "text-gray-400" : "text-gray-900"}`}
      >
        {value}
      </p>
    </div>
  );
}

function DocRow({ label, urls }: { label: string; urls?: string[] }) {
  const docs = urls ?? [];
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-border">
      <div className="flex items-center gap-2 min-w-0">
        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="text-sm text-gray-700 truncate">{label}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {docs.length === 0 ? (
          <span className="text-xs text-gray-400">Aucun fichier</span>
        ) : (
          <>
            <span className="text-xs text-gray-500">
              {docs.length} fichier(s)
            </span>
            {docs.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-white border border-border hover:bg-gray-100 transition-colors"
                title={`Voir ${label} #${i + 1}`}
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              </a>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  message,
}: {
  icon: React.FC<{ className?: string }>;
  message: string;
}) {
  return (
    <div className="text-center py-10">
      <Icon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}

function formatDate(date?: string): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
