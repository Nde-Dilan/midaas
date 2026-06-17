"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { campaignProvider } from "@/api/campaigns";
import { useCampaignsStore } from "@/store/campaigns";
import { useCompanyStore } from "@/store/company";
import useGetCompanies from "@/hooks/useCompanies";
import Project from "@/entities/project/project";
import type {
  MilestoneBatchDto,
  RiskZoneDto,
  UseOfFundDto,
} from "@/api/campaigns/dto";
import { Button } from "@/components/atoms/button";
import { MUIInput, MUITextarea } from "@/components/atoms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { DatePicker } from "@/components/molecules/date-picker";
import { toast } from "react-toastify";
import {
  Loader,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  FileText,
  TrendingUp,
  AlertTriangle,
  Send,
  Layers,
  Target,
  BookOpen,
  ListChecks,
  Image,
} from "lucide-react";

/* ───────────────────────────────────────────────
   Types
   ─────────────────────────────────────────────── */
interface MilestoneItem {
  title: string;
  description: string;
  fundAllocation: string;
  dueDate: Date;
}

interface RiskZoneItem {
  description: string;
  severity: string;
  mitigation: string;
}

interface UseOfFundItem {
  category: string;
  amount: string;
  percentage: string;
  details: string;
}

interface FormState {
  // Step 1: Basic Info
  title: string;
  description: string;
  category: string;
  currency: string;
  companyId: string;
  coverImageUrl: string;

  // Step 2: Funding & ROI
  fundingGoal: string;
  startDate: Date;
  endDate: Date;
  shortTermRoi: string;
  shortTermMonths: string;
  mediumTermRoi: string;
  mediumTermMonths: string;
  longTermRoi: string;
  longTermMonths: string;
  breakEvenMonths: string;

  // Step 3: Risk & Fund Allocation
  riskZones: RiskZoneItem[];
  useOfFunds: UseOfFundItem[];

  // Step 4: Documents & Analysis
  businessPlanDocs: string;
  financialProjections: string;
  marketAnalysis: string;
  competitiveAdvantage: string;
  teamBackground: string;

  // Step 5: Milestones
  milestones: MilestoneItem[];
}

/* ───────────────────────────────────────────────
   Step definitions
   ─────────────────────────────────────────────── */
const STEPS = [
  { id: "basic", label: "Basic Info", icon: FileText },
  { id: "funding", label: "Funding & ROI", icon: TrendingUp },
  { id: "risk", label: "Risk & Allocation", icon: AlertTriangle },
  { id: "docs", label: "Documents & Analysis", icon: BookOpen },
  { id: "milestones", label: "Milestones", icon: ListChecks },
  { id: "review", label: "Review & Submit", icon: Send },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const CAMPAIGN_CATEGORIES = [
  "Agriculture",
  "Technology",
  "Art & Culture",
  "Education",
  "Healthcare",
  "Environment",
  "Commerce",
  "Crafts",
  "Real Estate",
  "Transport",
  "Food",
  "Other",
];

const SEVERITY_OPTIONS = ["Low", "Medium", "High", "Critical"];

/* ───────────────────────────────────────────────
   Props
   ─────────────────────────────────────────────── */
interface Props {
  campaign?: Project; // if provided → edit mode
  onComplete: () => void;
}

/* ───────────────────────────────────────────────
   Component
   ─────────────────────────────────────────────── */
export default function CampaignCreationForm({ campaign, onComplete }: Props) {
  const isEditMode = !!campaign;
  const { addCampaign, updateCampaignInList } = useCampaignsStore();
  const { companies } = useCompanyStore();
  useGetCompanies();

  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  /* ── Form state ────────────────────────────── */
  const [form, setForm] = useState<FormState>({
    title: campaign?.title ?? "",
    description: campaign?.description ?? "",
    category: campaign?.category ?? "",
    currency: campaign?.currency ?? "XOF",
    companyId: campaign?.companyId ?? "",
    coverImageUrl: campaign?.coverImageUrl ?? "",
    fundingGoal: campaign ? String(campaign.fundingGoal) : "",
    startDate: campaign?.startDate ?? new Date(),
    endDate: campaign?.endDate ?? new Date(),
    shortTermRoi: campaign?.shortTermRoi ? String(campaign.shortTermRoi) : "",
    shortTermMonths: campaign?.shortTermMonths
      ? String(campaign.shortTermMonths)
      : "",
    mediumTermRoi: campaign?.mediumTermRoi
      ? String(campaign.mediumTermRoi)
      : "",
    mediumTermMonths: campaign?.mediumTermMonths
      ? String(campaign.mediumTermMonths)
      : "",
    longTermRoi: campaign?.longTermRoi ? String(campaign.longTermRoi) : "",
    longTermMonths: campaign?.longTermMonths
      ? String(campaign.longTermMonths)
      : "",
    breakEvenMonths: campaign?.breakEvenMonths
      ? String(campaign.breakEvenMonths)
      : "",
    riskZones: campaign?.riskZones?.map((rz) => ({
      description: rz.description,
      severity: rz.severity,
      mitigation: rz.mitigation,
    })) ?? [{ description: "", severity: "", mitigation: "" }],
    useOfFunds: campaign?.useOfFunds?.map((uf) => ({
      category: uf.category,
      amount: String(uf.amount),
      percentage: String(uf.percentage),
      details: uf.details,
    })) ?? [{ category: "", amount: "", percentage: "", details: "" }],
    businessPlanDocs: campaign?.businessPlanDocs?.join(", ") ?? "",
    financialProjections: campaign?.financialProjections?.join(", ") ?? "",
    marketAnalysis: campaign?.marketAnalysis ?? "",
    competitiveAdvantage: campaign?.competitiveAdvantage ?? "",
    teamBackground: campaign?.teamBackground ?? "",
    milestones: campaign?.milestones?.map((m) => ({
      title: m.title,
      description: m.description,
      fundAllocation: String(m.fundAllocation),
      dueDate: m.dueDate ?? new Date(),
    })) ?? [
      { title: "", description: "", fundAllocation: "", dueDate: new Date() },
    ],
  });

  const formRef = useRef(form);
  formRef.current = form;

  /* ── Generic updater ───────────────────────── */
  const updateField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  /* ── Risk zone handlers ───────────────────── */
  const addRiskZone = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      riskZones: [
        ...prev.riskZones,
        { description: "", severity: "", mitigation: "" },
      ],
    }));
  }, []);

  const updateRiskZone = useCallback(
    (index: number, key: keyof RiskZoneItem, value: string) => {
      setForm((prev) => {
        const items = [...prev.riskZones];
        items[index] = { ...items[index], [key]: value };
        return { ...prev, riskZones: items };
      });
    },
    [],
  );

  const removeRiskZone = useCallback((index: number) => {
    setForm((prev) => {
      const items = prev.riskZones.filter((_, i) => i !== index);
      return {
        ...prev,
        riskZones: items.length
          ? items
          : [{ description: "", severity: "", mitigation: "" }],
      };
    });
  }, []);

  /* ── Use of funds handlers ────────────────── */
  const addUseOfFund = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      useOfFunds: [
        ...prev.useOfFunds,
        { category: "", amount: "", percentage: "", details: "" },
      ],
    }));
  }, []);

  const updateUseOfFund = useCallback(
    (index: number, key: keyof UseOfFundItem, value: string) => {
      setForm((prev) => {
        const items = [...prev.useOfFunds];
        items[index] = { ...items[index], [key]: value };
        return { ...prev, useOfFunds: items };
      });
    },
    [],
  );

  const removeUseOfFund = useCallback((index: number) => {
    setForm((prev) => {
      const items = prev.useOfFunds.filter((_, i) => i !== index);
      return {
        ...prev,
        useOfFunds: items.length
          ? items
          : [{ category: "", amount: "", percentage: "", details: "" }],
      };
    });
  }, []);

  /* ── Milestone handlers ───────────────────── */
  const addMilestone = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        { title: "", description: "", fundAllocation: "", dueDate: new Date() },
      ],
    }));
  }, []);

  const updateMilestone = useCallback(
    (index: number, key: keyof MilestoneItem, value: any) => {
      setForm((prev) => {
        const items = [...prev.milestones];
        items[index] = { ...items[index], [key]: value };
        return { ...prev, milestones: items };
      });
    },
    [],
  );

  const removeMilestone = useCallback((index: number) => {
    setForm((prev) => {
      const items = prev.milestones.filter((_, i) => i !== index);
      return {
        ...prev,
        milestones: items.length
          ? items
          : [
              {
                title: "",
                description: "",
                fundAllocation: "",
                dueDate: new Date(),
              },
            ],
      };
    });
  }, []);

  /* ── Validation ────────────────────────────── */
  const stepErrors = useMemo((): Record<StepId, string[]> => {
    const errors: Record<string, string[]> = {
      basic: [],
      funding: [],
      risk: [],
      docs: [],
      milestones: [],
      review: [],
    };

    if (!form.title.trim()) errors.basic.push("Campaign title is required");
    if (!form.description.trim()) errors.basic.push("Description is required");
    if (!form.companyId) errors.basic.push("Please select a company");

    if (!form.fundingGoal || parseFloat(form.fundingGoal) <= 0) {
      errors.funding.push("Funding goal must be greater than 0");
    }

    return errors;
  }, [form]);

  const canProceed = useMemo(() => {
    return stepErrors[STEPS[currentStep].id].length === 0;
  }, [currentStep, stepErrors]);

  /* ── Submit ────────────────────────────────── */
  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    const currentForm = formRef.current;

    try {
      // Parse numeric / array fields
      const parsePercent = (v: string) => {
        const n = parseFloat(v);
        return isNaN(n) ? undefined : n;
      };
      const parseIntOrUndef = (v: string) => {
        const n = parseInt(v, 10);
        return isNaN(n) ? undefined : n;
      };

      const payload: Record<string, any> = {
        title: currentForm.title,
        description: currentForm.description,
        funding_goal: parseFloat(currentForm.fundingGoal),
        company_id: currentForm.companyId,
        currency: currentForm.currency,
        category: currentForm.category || undefined,
        cover_image_url: currentForm.coverImageUrl || undefined,
        start_date: currentForm.startDate.toISOString().split("T")[0],
        end_date: currentForm.endDate.toISOString().split("T")[0],
      };

      // ROI
      if (parsePercent(currentForm.shortTermRoi) !== undefined) {
        payload.short_term_roi = parsePercent(currentForm.shortTermRoi);
        payload.short_term_months = parseIntOrUndef(
          currentForm.shortTermMonths,
        );
      }
      if (parsePercent(currentForm.mediumTermRoi) !== undefined) {
        payload.medium_term_roi = parsePercent(currentForm.mediumTermRoi);
        payload.medium_term_months = parseIntOrUndef(
          currentForm.mediumTermMonths,
        );
      }
      if (parsePercent(currentForm.longTermRoi) !== undefined) {
        payload.long_term_roi = parsePercent(currentForm.longTermRoi);
        payload.long_term_months = parseIntOrUndef(currentForm.longTermMonths);
      }
      if (parseIntOrUndef(currentForm.breakEvenMonths) !== undefined) {
        payload.break_even_months = parseIntOrUndef(
          currentForm.breakEvenMonths,
        );
      }

      // Risk zones
      const validRiskZones = currentForm.riskZones.filter((rz) =>
        rz.description.trim(),
      );
      if (validRiskZones.length > 0) {
        payload.risk_zones = validRiskZones.map((rz) => ({
          description: rz.description.trim(),
          severity: rz.severity,
          mitigation: rz.mitigation.trim(),
        }));
      }

      // Use of funds
      const validFunds = currentForm.useOfFunds.filter((uf) =>
        uf.category.trim(),
      );
      if (validFunds.length > 0) {
        payload.use_of_funds = validFunds.map((uf) => ({
          category: uf.category.trim(),
          amount: parseFloat(uf.amount) || 0,
          percentage: parseFloat(uf.percentage) || 0,
          details: uf.details.trim(),
        }));
      }

      // Documents
      payload.business_plan_docs = currentForm.businessPlanDocs
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      payload.financial_projections = currentForm.financialProjections
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // Analysis
      if (currentForm.marketAnalysis.trim())
        payload.market_analysis = currentForm.marketAnalysis.trim();
      if (currentForm.competitiveAdvantage.trim())
        payload.competitive_advantage = currentForm.competitiveAdvantage.trim();
      if (currentForm.teamBackground.trim())
        payload.team_background = currentForm.teamBackground.trim();

      // Milestones
      const validMilestones = currentForm.milestones.filter((m) =>
        m.title.trim(),
      );
      if (validMilestones.length > 0) {
        payload.milestones = validMilestones.map((m, i) => ({
          title: m.title.trim(),
          description: m.description.trim(),
          order_num: i + 1,
          fund_allocation: parseFloat(m.fundAllocation) || 0,
          due_date: m.dueDate?.toISOString().split("T")[0],
        }));
      }

      if (isEditMode && campaign) {
        const { data, error } = await campaignProvider.update(
          campaign.id,
          payload,
        );

        if (data?.project) {
          toast.success("Campaign updated successfully");
          updateCampaignInList(data.project);
          onComplete();
        } else {
          toast.error(error || "Failed to update campaign");
        }
      } else {
        const { data, error } = await campaignProvider.create(payload);

        if (data?.project) {
          const created = data.project;
          addCampaign(created);

          // Auto-submit for validation (draft → pending)
          const { error: submitError } =
            await campaignProvider.submitForValidation(created.id);

          if (submitError) {
            toast.warning(
              "Campaign created but auto-submission failed — you can submit it manually from the campaigns list.",
            );
          } else {
            toast.success("Campaign created and submitted for validation!");
          }

          onComplete();
        } else {
          toast.error(error || "Failed to create campaign");
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    }

    setSubmitting(false);
  }, [campaign, isEditMode, addCampaign, updateCampaignInList, onComplete]);

  /* ── Quick fill (dev-only) ─────────────────── */
  const quickFillForm = useCallback(() => {
    const firstCompany = companies[0];

    setForm({
      title: "AgriTech Innovation Fund",
      description:
        "A transformative agricultural technology initiative aimed at equipping smallholder farmers across West Africa with smart irrigation systems, drone-based crop monitoring, and direct-to-market digital platforms. The project targets a 40% yield increase within 18 months and creates a sustainable supply chain from farm to table.",
      category: "Agriculture",
      currency: "XOF",
      companyId: firstCompany?.id ?? "",
      coverImageUrl: "https://picsum.photos/seed/agritech/800/400",
      fundingGoal: "25000000",
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)),
      shortTermRoi: "8",
      shortTermMonths: "6",
      mediumTermRoi: "22",
      mediumTermMonths: "18",
      longTermRoi: "45",
      longTermMonths: "36",
      breakEvenMonths: "14",
      riskZones: [
        {
          description:
            "Weather dependency and climate variability affecting crop yields",
          severity: "High",
          mitigation: "Diversified crop portfolio + weather insurance",
        },
        {
          description: "Delayed technology adoption among target farmers",
          severity: "Medium",
          mitigation: "Community-led training programs and free trial periods",
        },
        {
          description: "Supply chain infrastructure gaps in rural areas",
          severity: "Low",
          mitigation: "Partnership with last-mile logistics providers",
        },
      ],
      useOfFunds: [
        {
          category: "Equipment & Infrastructure",
          amount: "12000000",
          percentage: "48",
          details: "Irrigation systems, drones, sensors",
        },
        {
          category: "Technology Development",
          amount: "6000000",
          percentage: "24",
          details: "Mobile app & monitoring platform",
        },
        {
          category: "Training & Support",
          amount: "4000000",
          percentage: "16",
          details: "Farmer training programs",
        },
        {
          category: "Marketing & Outreach",
          amount: "2000000",
          percentage: "8",
          details: "Awareness campaigns",
        },
        {
          category: "Operations & Contingency",
          amount: "1000000",
          percentage: "4",
          details: "Admin & buffer",
        },
      ],
      businessPlanDocs: "https://example.com/business-plan.pdf",
      financialProjections: "https://example.com/financials.xlsx",
      marketAnalysis:
        "The West African agritech market is projected to grow at 12.5% CAGR over the next 5 years, driven by increasing mobile penetration, climate adaptation needs, and government support for food security initiatives. Over 60% of smallholder farmers in the target regions lack access to modern farming tools, representing a substantial addressable market.",
      competitiveAdvantage:
        "Proprietary AI-driven crop advisory system integrated with satellite imagery analysis, combined with an existing network of 200+ trained field agents across 3 countries. First-mover advantage in the sub-region for integrated agritech solutions.",
      teamBackground:
        "Led by a team of agronomists, software engineers, and supply chain experts with combined 40+ years experience in West African agriculture and technology deployment. Previous ventures include a successful micro-loan platform reaching 50,000 farmers.",
      milestones: [
        {
          title: "Pilot Program Launch",
          description:
            "Deploy irrigation systems across 50 farms and onboard first cohort of 200 farmers to the digital platform",
          fundAllocation: "5000000",
          dueDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        },
        {
          title: "Platform Beta & Training",
          description:
            "Complete mobile app beta with crop monitoring, complete training for all enrolled farmers",
          fundAllocation: "7000000",
          dueDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
        },
        {
          title: "Full Scale Rollout",
          description:
            "Expand to 500 farms, integrate drone monitoring, launch direct-to-market sales channel",
          fundAllocation: "8000000",
          dueDate: new Date(new Date().setMonth(new Date().getMonth() + 9)),
        },
        {
          title: "Impact Assessment & Growth",
          description:
            "Complete impact assessment, publish yield data, prepare Series A fundraising round",
          fundAllocation: "5000000",
          dueDate: new Date(new Date().setMonth(new Date().getMonth() + 12)),
        },
      ],
    });
    setCurrentStep(0);
    toast.success("Form filled with sample campaign data");
  }, [companies]);

  /* ── Navigation ────────────────────────────── */
  const currentStepId = STEPS[currentStep].id;
  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;
  const errors = stepErrors[currentStepId];

  /* ── Render helpers ────────────────────────── */
  const renderStepContent = () => {
    switch (currentStepId) {
      /* ═══════ Step 1: Basic Info ═══════ */
      case "basic":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Define the core details of your campaign.
              </p>
            </div>
            <MUIInput
              label="Campaign Title"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="pl-4"
              required
            />
            <MUITextarea
              label="Description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="min-h-[100px]"
              placeholder=" "
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select
                  value={form.category}
                  onValueChange={(v) => updateField("category", v)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={form.currency}
                  onValueChange={(v) => updateField("currency", v)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XOF">XOF (CFA Franc)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              {companies.length > 0 ? (
                <Select
                  value={form.companyId}
                  onValueChange={(v) => updateField("companyId", v)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.displayName} ({c.corporateForm})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-12 flex items-center px-3 rounded-md border border-input bg-white text-sm text-gray-400 cursor-not-allowed">
                  No company available — create one first
                </div>
              )}
            </div>
            <MUIInput
              label="Cover Image URL"
              value={form.coverImageUrl}
              onChange={(e) => updateField("coverImageUrl", e.target.value)}
              className="pl-4"
              placeholder="https://..."
            />
          </div>
        );

      /* ═══════ Step 2: Funding & ROI ═══════ */
      case "funding":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Funding & ROI Projections
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Set your funding target and projected returns.
              </p>
            </div>
            <MUIInput
              label="Funding Goal"
              type="number"
              value={form.fundingGoal}
              onChange={(e) => updateField("fundingGoal", e.target.value)}
              className="pl-4"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <DatePicker
                label="Start Date"
                value={form.startDate}
                onChange={(d) => d && updateField("startDate", d)}
              />
              <DatePicker
                label="End Date"
                value={form.endDate}
                onChange={(d) => d && updateField("endDate", d)}
              />
            </div>
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">
                Return on Investment (ROI)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-semibold text-blue-700">
                    Short Term
                  </p>
                  <MUIInput
                    label="ROI (%)"
                    type="number"
                    value={form.shortTermRoi}
                    onChange={(e) =>
                      updateField("shortTermRoi", e.target.value)
                    }
                    className="pl-4"
                  />
                  <MUIInput
                    label="Months"
                    type="number"
                    value={form.shortTermMonths}
                    onChange={(e) =>
                      updateField("shortTermMonths", e.target.value)
                    }
                    className="pl-4"
                  />
                </div>
                <div className="space-y-2 p-3 bg-amber-50 rounded-lg">
                  <p className="text-xs font-semibold text-amber-700">
                    Medium Term
                  </p>
                  <MUIInput
                    label="ROI (%)"
                    type="number"
                    value={form.mediumTermRoi}
                    onChange={(e) =>
                      updateField("mediumTermRoi", e.target.value)
                    }
                    className="pl-4"
                  />
                  <MUIInput
                    label="Months"
                    type="number"
                    value={form.mediumTermMonths}
                    onChange={(e) =>
                      updateField("mediumTermMonths", e.target.value)
                    }
                    className="pl-4"
                  />
                </div>
                <div className="space-y-2 p-3 bg-emerald-50 rounded-lg">
                  <p className="text-xs font-semibold text-emerald-700">
                    Long Term
                  </p>
                  <MUIInput
                    label="ROI (%)"
                    type="number"
                    value={form.longTermRoi}
                    onChange={(e) => updateField("longTermRoi", e.target.value)}
                    className="pl-4"
                  />
                  <MUIInput
                    label="Months"
                    type="number"
                    value={form.longTermMonths}
                    onChange={(e) =>
                      updateField("longTermMonths", e.target.value)
                    }
                    className="pl-4"
                  />
                </div>
              </div>
            </div>
            <MUIInput
              label="Break-even (months)"
              type="number"
              value={form.breakEvenMonths}
              onChange={(e) => updateField("breakEvenMonths", e.target.value)}
              className="pl-4"
            />
          </div>
        );

      /* ═══════ Step 3: Risk & Allocation ═══════ */
      case "risk":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Risk Assessment & Fund Allocation
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Identify potential risks and how funds will be used.
              </p>
            </div>

            {/* Risk Zones */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700">
                  Risk Zones
                </h4>
                <button
                  type="button"
                  onClick={addRiskZone}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add risk
                </button>
              </div>
              <div className="space-y-3">
                {form.riskZones.map((rz, i) => (
                  <div
                    key={i}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">
                        Risk #{i + 1}
                      </span>
                      {form.riskZones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRiskZone(i)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <MUIInput
                      label="Description"
                      value={rz.description}
                      onChange={(e) =>
                        updateRiskZone(i, "description", e.target.value)
                      }
                      className="pl-4"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Select
                        value={rz.severity}
                        onValueChange={(v) => updateRiskZone(i, "severity", v)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Severity" />
                        </SelectTrigger>
                        <SelectContent>
                          {SEVERITY_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <MUIInput
                        label="Mitigation"
                        value={rz.mitigation}
                        onChange={(e) =>
                          updateRiskZone(i, "mitigation", e.target.value)
                        }
                        className="pl-4"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Use of Funds */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700">
                  Use of Funds
                </h4>
                <button
                  type="button"
                  onClick={addUseOfFund}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add category
                </button>
              </div>
              <div className="space-y-3">
                {form.useOfFunds.map((uf, i) => (
                  <div
                    key={i}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">
                        Allocation #{i + 1}
                      </span>
                      {form.useOfFunds.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeUseOfFund(i)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <MUIInput
                        label="Category"
                        value={uf.category}
                        onChange={(e) =>
                          updateUseOfFund(i, "category", e.target.value)
                        }
                        className="pl-4"
                      />
                      <MUIInput
                        label="Amount"
                        type="number"
                        value={uf.amount}
                        onChange={(e) =>
                          updateUseOfFund(i, "amount", e.target.value)
                        }
                        className="pl-4"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <MUIInput
                        label="Percentage (%)"
                        type="number"
                        value={uf.percentage}
                        onChange={(e) =>
                          updateUseOfFund(i, "percentage", e.target.value)
                        }
                        className="pl-4"
                      />
                      <MUIInput
                        label="Details"
                        value={uf.details}
                        onChange={(e) =>
                          updateUseOfFund(i, "details", e.target.value)
                        }
                        className="pl-4"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      /* ═══════ Step 4: Documents & Analysis ═══════ */
      case "docs":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Documents & Analysis
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Support your campaign with documents and strategic analysis.
              </p>
            </div>
            <MUIInput
              label="Business Plan Docs (comma-separated URLs)"
              value={form.businessPlanDocs}
              onChange={(e) => updateField("businessPlanDocs", e.target.value)}
              className="pl-4"
              placeholder="https://..."
            />
            <MUIInput
              label="Financial Projections (comma-separated URLs)"
              value={form.financialProjections}
              onChange={(e) =>
                updateField("financialProjections", e.target.value)
              }
              className="pl-4"
              placeholder="https://..."
            />
            <MUITextarea
              label="Market Analysis"
              value={form.marketAnalysis}
              onChange={(e) => updateField("marketAnalysis", e.target.value)}
              className="min-h-[80px]"
              placeholder="Describe your target market..."
            />
            <MUITextarea
              label="Competitive Advantage"
              value={form.competitiveAdvantage}
              onChange={(e) =>
                updateField("competitiveAdvantage", e.target.value)
              }
              className="min-h-[80px]"
              placeholder="What sets you apart?"
            />
            <MUITextarea
              label="Team Background"
              value={form.teamBackground}
              onChange={(e) => updateField("teamBackground", e.target.value)}
              className="min-h-[80px]"
              placeholder="Describe your team's experience..."
            />
          </div>
        );

      /* ═══════ Step 5: Milestones ═══════ */
      case "milestones":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Milestones
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Define the key milestones for fund release. Funds are released
                progressively as each milestone is completed and verified.
              </p>
            </div>
            {form.milestones.map((m, i) => (
              <div
                key={i}
                className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Milestone #{i + 1}
                  </span>
                  {form.milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMilestone(i)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <MUIInput
                  label="Title"
                  value={m.title}
                  onChange={(e) => updateMilestone(i, "title", e.target.value)}
                  className="pl-4"
                />
                <MUITextarea
                  label="Description"
                  value={m.description}
                  onChange={(e) =>
                    updateMilestone(i, "description", e.target.value)
                  }
                  className="min-h-[60px]"
                  placeholder=" "
                />
                <div className="grid grid-cols-2 gap-3">
                  <MUIInput
                    label="Fund Allocation"
                    type="number"
                    value={m.fundAllocation}
                    onChange={(e) =>
                      updateMilestone(i, "fundAllocation", e.target.value)
                    }
                    className="pl-4"
                  />
                  <DatePicker
                    label="Due Date"
                    value={m.dueDate}
                    onChange={(d) => d && updateMilestone(i, "dueDate", d)}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addMilestone}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Plus className="w-4 h-4" /> Add another milestone
            </button>
          </div>
        );

      /* ═══════ Step 6: Review & Submit ═══════ */
      case "review":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Review & Submit
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Review all information before submitting.
              </p>
            </div>

            {/* Summary cards */}
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-gray-900">
                    Basic Info
                  </h4>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    Title:{" "}
                    <span className="font-medium">{form.title || "—"}</span>
                  </p>
                  <p>
                    Category:{" "}
                    <span className="font-medium">{form.category || "—"}</span>
                  </p>
                  <p>
                    Currency:{" "}
                    <span className="font-medium">{form.currency}</span>
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-gray-900">
                    Funding & ROI
                  </h4>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    Goal:{" "}
                    <span className="font-medium">
                      {form.fundingGoal || "—"} {form.currency}
                    </span>
                  </p>
                  {form.shortTermRoi && (
                    <p>
                      Short-term ROI: {form.shortTermRoi}% (
                      {form.shortTermMonths || "?"} months)
                    </p>
                  )}
                  {form.mediumTermRoi && (
                    <p>
                      Medium-term ROI: {form.mediumTermRoi}% (
                      {form.mediumTermMonths || "?"} months)
                    </p>
                  )}
                  {form.longTermRoi && (
                    <p>
                      Long-term ROI: {form.longTermRoi}% (
                      {form.longTermMonths || "?"} months)
                    </p>
                  )}
                  {form.breakEvenMonths && (
                    <p>Break-even: {form.breakEvenMonths} months</p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-gray-900">
                    Milestones
                  </h4>
                </div>
                <p className="text-sm text-gray-600">
                  {form.milestones.filter((m) => m.title.trim()).length}{" "}
                  milestone(s) defined
                </p>
              </div>
            </div>

            {/* Validation warnings */}
            {Object.values(stepErrors).some((errs) => errs.length > 0) && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Some required fields are missing
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {Object.entries(stepErrors).map(([step, errs]) =>
                      errs.map((err, i) => (
                        <li
                          key={`${step}-${i}`}
                          className="text-xs text-amber-700"
                        >
                          • {err}
                        </li>
                      )),
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      {/* Progress header */}
      <div className="px-6 py-5 border-b border-border bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-MontserratBold text-gray-900">
            {isEditMode ? "Edit Campaign" : "New Campaign"}
          </h2>
          <div className="flex items-center gap-3">
            {!isEditMode && (
              <button
                type="button"
                onClick={quickFillForm}
                className="text-xs text-gray-400 hover:text-primary border border-dashed border-gray-300 hover:border-primary px-2.5 py-1 rounded-full transition-colors"
                title="Fill all fields with sample data for quick testing"
              >
                ⚡ Quick fill test data
              </button>
            )}
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {STEPS.map((step, i) => {
            const StepIcon = step.icon;
            const isActive = i === currentStep;
            const isCompleted = i < currentStep;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : isCompleted
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                }`}
              >
                <StepIcon className="w-3 h-3" />
                <span className="hidden sm:inline">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step body */}
      <div className="p-6 max-h-[600px] overflow-y-auto">
        {renderStepContent()}
      </div>

      {/* Error banner */}
      {errors.length > 0 && currentStepId !== "review" && (
        <div className="px-6 py-2 bg-amber-50 border-t border-amber-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            {errors[0]}
            {errors.length > 1 && ` (+${errors.length - 1} more)`}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border bg-gray-50 flex items-center justify-between">
        <div>
          {!isFirstStep && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isLastStep ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="gap-2 min-w-[200px]"
            >
              {submitting ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {submitting
                ? "Submitting..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Campaign"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() =>
                setCurrentStep((p) => Math.min(STEPS.length - 1, p + 1))
              }
              disabled={!canProceed}
              className="gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
