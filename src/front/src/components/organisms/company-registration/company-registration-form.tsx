"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { companyProvider } from "@/api/company";
import Company from "@/entities/company/company";
import { Button } from "@/components/atoms/button";
import { MUIInput, MUITextarea } from "@/components/atoms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { toast } from "react-toastify";
import {
  Loader,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Upload,
  Plus,
  Trash2,
  FileText,
  Users,
  Building2,
  Divide,
  AlertCircle,
  Send,
  X,
} from "lucide-react";

/* ───────────────────────────────────────────────
   Types
   ─────────────────────────────────────────────── */
interface BeneficialOwner {
  fullName: string;
  equityPercentage: string;
}

interface Manager {
  fullName: string;
  role: string;
}

interface UploadedFile {
  file: File;
  name: string;
  uploaded: boolean;
  url?: string;
}

interface FormState {
  // Step 1: Legal Documents
  rccmNumber: string;
  rccmDocs: UploadedFile[];
  niuDocs: UploadedFile[];
  statutsDocs: UploadedFile[];
  premisesDocs: UploadedFile[];

  // Step 2: Beneficial Owners
  beneficialOwners: BeneficialOwner[];

  // Step 3: Management
  managers: Manager[];

  // Step 4: Financial Information
  dsfYears: string;
  bankStatements: UploadedFile[];
  momoStatements: UploadedFile[];

  // Step 5: Additional Documents
  sectorPermits: UploadedFile[];
  collateralDocs: UploadedFile[];
  identityDocs: UploadedFile[];
}

/* ───────────────────────────────────────────────
   Step definitions
   ─────────────────────────────────────────────── */
const STEPS = [
  { id: "legal", label: "Legal Documents", icon: FileText },
  { id: "owners", label: "Beneficial Owners", icon: Users },
  { id: "management", label: "Management", icon: Building2 },
  { id: "financial", label: "Financial Info", icon: Divide },
  { id: "documents", label: "Additional Docs", icon: Upload },
  { id: "review", label: "Review & Submit", icon: CheckCircle2 },
] as const;

type StepId = (typeof STEPS)[number]["id"];

/**
 * Maps form-state field keys → API document categories.
 * Used by handleSubmit to upload all pending files before submission.
 */
const DOCUMENT_FIELD_TO_CATEGORY: Record<keyof FormState, string> = {
  rccmDocs: "rccm",
  niuDocs: "niu",
  statutsDocs: "statuts",
  premisesDocs: "premises",
  bankStatements: "bank_statements",
  momoStatements: "momo_statements",
  sectorPermits: "sector_permits",
  collateralDocs: "collateral",
  identityDocs: "identity",
  // Non-file fields are ignored during upload iteration
  rccmNumber: "",
  beneficialOwners: "",
  managers: "",
  dsfYears: "",
};

const MANAGER_ROLES = [
  "CEO / General Manager",
  "CFO / Financial Director",
  "COO / Operations Director",
  "CTO / Technical Director",
  "Sales Director",
  "HR Director",
  "Legal Counsel",
  "Other",
];

/* ───────────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────────── */
const createEmptyFile = (): UploadedFile => ({
  file: new File([], ""),
  name: "",
  uploaded: false,
});

/* ───────────────────────────────────────────────
   Props
   ─────────────────────────────────────────────── */
interface Props {
  company: Company;
  onComplete: () => void;
}

/* ───────────────────────────────────────────────
   Component
   ─────────────────────────────────────────────── */
export default function CompanyRegistrationForm({
  company,
  onComplete,
}: Props) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  /* ── Form state ────────────────────────────── */
  const [form, setForm] = useState<FormState>({
    rccmNumber: "",
    rccmDocs: [],
    niuDocs: [],
    statutsDocs: [],
    premisesDocs: [],
    beneficialOwners: [{ fullName: "", equityPercentage: "" }],
    managers: [{ fullName: "", role: "" }],
    dsfYears: "",
    bankStatements: [],
    momoStatements: [],
    sectorPermits: [],
    collateralDocs: [],
    identityDocs: [],
  });

  /* ── File input refs ───────────────────────── */
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  /* ── Generic updater ───────────────────────── */
  const updateField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  /* ── File handlers ─────────────────────────── */
  const handleFileSelect = useCallback(
    (field: keyof FormState, category: string) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;

        const items: UploadedFile[] = files.map((f) => ({
          file: f,
          name: f.name,
          uploaded: false,
        }));

        setForm((prev) => {
          const existing = prev[field] as UploadedFile[];
          return { ...prev, [field]: [...existing, ...items] };
        });

        // Reset input so same file can be re-selected
        if (fileInputs.current[category]) {
          fileInputs.current[category]!.value = "";
        }
      },
    [],
  );

  const removeFile = useCallback((field: keyof FormState, index: number) => {
    setForm((prev) => {
      const items = [...(prev[field] as UploadedFile[])];
      items.splice(index, 1);
      return { ...prev, [field]: items };
    });
  }, []);

  const uploadFileItem = useCallback(
    async (field: keyof FormState, index: number, category: string) => {
      const items = form[field] as UploadedFile[];
      const item = items[index];
      if (!item || item.file.size === 0) return;

      const uploadKey = `${category}-${index}`;
      setUploading((prev) => ({ ...prev, [uploadKey]: true }));

      const { data, error } = await companyProvider.uploadDocuments(
        company.id,
        [item.file],
        category,
      );

      if (data) {
        setForm((prev) => {
          const updated = [...(prev[field] as UploadedFile[])];
          updated[index] = {
            ...updated[index],
            uploaded: true,
            url: data.urls[0],
          };
          return { ...prev, [field]: updated };
        });
      } else {
        toast.error(error || `Failed to upload ${item.name}`);
      }

      setUploading((prev) => ({ ...prev, [uploadKey]: false }));
    },
    [form, company.id],
  );

  const uploadAllForCategory = useCallback(
    async (field: keyof FormState, category: string) => {
      const items = form[field] as UploadedFile[];
      const pending = items.filter((i) => !i.uploaded && i.file.size > 0);
      if (pending.length === 0) return;

      setUploading((prev) => ({ ...prev, [category]: true }));

      const results = await Promise.allSettled(
        pending.map((item) =>
          companyProvider.uploadDocuments(company.id, [item.file], category),
        ),
      );

      const updated = [...items];
      results.forEach((result, i) => {
        const idx = items.indexOf(pending[i]);
        if (result.status === "fulfilled" && result.value.data) {
          updated[idx] = {
            ...updated[idx],
            uploaded: true,
            url: result.value.data.urls[0],
          };
        } else if (result.status === "rejected") {
          toast.error(`Failed to upload ${pending[i].name}`);
        }
      });

      setForm((prev) => ({ ...prev, [field]: updated }));
      setUploading((prev) => ({ ...prev, [category]: false }));
    },
    [form, company.id],
  );

  /* ── Owner / Manager handlers ──────────────── */
  const addOwner = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      beneficialOwners: [
        ...prev.beneficialOwners,
        { fullName: "", equityPercentage: "" },
      ],
    }));
  }, []);

  const removeOwner = useCallback((index: number) => {
    setForm((prev) => {
      const items = prev.beneficialOwners.filter((_, i) => i !== index);
      return {
        ...prev,
        beneficialOwners: items.length
          ? items
          : [{ fullName: "", equityPercentage: "" }],
      };
    });
  }, []);

  const updateOwner = useCallback(
    (index: number, key: keyof BeneficialOwner, value: string) => {
      setForm((prev) => {
        const items = [...prev.beneficialOwners];
        items[index] = { ...items[index], [key]: value };
        return { ...prev, beneficialOwners: items };
      });
    },
    [],
  );

  const addManager = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      managers: [...prev.managers, { fullName: "", role: "" }],
    }));
  }, []);

  const removeManager = useCallback((index: number) => {
    setForm((prev) => {
      const items = prev.managers.filter((_, i) => i !== index);
      return {
        ...prev,
        managers: items.length ? items : [{ fullName: "", role: "" }],
      };
    });
  }, []);

  const updateManager = useCallback(
    (index: number, key: keyof Manager, value: string) => {
      setForm((prev) => {
        const items = [...prev.managers];
        items[index] = { ...items[index], [key]: value };
        return { ...prev, managers: items };
      });
    },
    [],
  );

  /* ── Validation ────────────────────────────── */
  const stepErrors = useMemo((): Record<StepId, string[]> => {
    const errors: Record<string, string[]> = {
      legal: [],
      owners: [],
      management: [],
      financial: [],
      documents: [],
      review: [],
    };

    // Step 1
    if (!form.rccmNumber.trim()) errors.legal.push("RCCM number is required");
    if (form.rccmDocs.length === 0)
      errors.legal.push("At least one RCCM document is required");

    // Step 2
    const validOwners = form.beneficialOwners.filter(
      (o) => o.fullName.trim() && o.equityPercentage.trim(),
    );
    if (validOwners.length === 0)
      errors.owners.push("At least one beneficial owner is required");

    // Step 3
    const validManagers = form.managers.filter(
      (m) => m.fullName.trim() && m.role.trim(),
    );
    if (validManagers.length === 0)
      errors.management.push("At least one manager is required");

    return errors;
  }, [form]);

  const canProceed = useMemo(() => {
    const stepId = STEPS[currentStep].id;
    return stepErrors[stepId].length === 0;
  }, [currentStep, stepErrors]);

  /* ── Submit ────────────────────────────────── */
  const handleSubmit = useCallback(async () => {
    setSubmitting(true);

    // 1. Upload all pending documents in parallel and collect URLs
    const docUrls: Record<string, string[]> = {};

    const uploadTasks = (
      Object.entries(DOCUMENT_FIELD_TO_CATEGORY) as [keyof FormState, string][]
    )
      .filter(([, category]) => category)
      .map(async ([field, category]) => {
        const files = form[field] as UploadedFile[] | undefined;
        if (!files) return;
        const pending = files.filter((f) => !f.uploaded && f.file.size > 0);
        if (pending.length === 0) {
          // Already uploaded – collect existing URLs
          docUrls[category] = files
            .filter((f) => f.uploaded && f.url)
            .map((f) => f.url!);
          return;
        }
        // Upload pending files for this category
        const { data, error } = await companyProvider.uploadDocuments(
          company.id,
          pending.map((f) => f.file),
          category,
        );
        if (data) {
          docUrls[category] = data.urls;
          // Mark them uploaded in local state
          setForm((prev) => {
            const updated = [...(prev[field] as UploadedFile[])];
            let urlIdx = 0;
            updated.forEach((f, i) => {
              if (!f.uploaded && f.file.size > 0) {
                updated[i] = {
                  ...updated[i],
                  uploaded: true,
                  url: data.urls[urlIdx++],
                };
              }
            });
            return { ...prev, [field]: updated };
          });
        } else {
          throw new Error(error || `Failed to upload ${category} files`);
        }
      });

    try {
      await Promise.all(uploadTasks);

      // 2. Save legal documents
      const legalPayload: Record<string, any> = {};
      if (form.rccmNumber) legalPayload.rccm_number = form.rccmNumber;
      if (docUrls.rccm?.length) legalPayload.rccm_docs = docUrls.rccm;
      if (docUrls.niu?.length) legalPayload.niu_doc_url = docUrls.niu[0];
      if (docUrls.statuts?.length) legalPayload.statuts_docs = docUrls.statuts;
      if (docUrls.premises?.length)
        legalPayload.premises_photos = docUrls.premises;
      if (docUrls.sector_permits?.length)
        legalPayload.sector_permits = docUrls.sector_permits;

      if (Object.keys(legalPayload).length > 0) {
        const { error: legalErr } = await companyProvider.saveLegalDocs(
          company.id,
          legalPayload,
        );
        if (legalErr) throw new Error(legalErr);
      }

      // 3. Save financial information
      const financialPayload: Record<string, any> = {};
      if (form.dsfYears.trim()) {
        financialPayload.dsf_years = form.dsfYears
          .split(",")
          .map((y) => parseInt(y.trim(), 10))
          .filter((n) => !isNaN(n));
      }
      if (docUrls.bank_statements?.length)
        financialPayload.bank_statements = docUrls.bank_statements;
      if (docUrls.momo_statements?.length)
        financialPayload.momo_statements = docUrls.momo_statements;

      if (Object.keys(financialPayload).length > 0) {
        const { error: finErr } = await companyProvider.saveFinancials(
          company.id,
          financialPayload,
        );
        if (finErr) throw new Error(finErr);
      }

      // 4. Add beneficial owners
      const validOwners = form.beneficialOwners.filter(
        (o) => o.fullName.trim() && o.equityPercentage.trim(),
      );
      for (const owner of validOwners) {
        const { error: ownerErr } = await companyProvider.addBeneficialOwner(
          company.id,
          {
            full_name: owner.fullName.trim(),
            equity_percentage: parseFloat(owner.equityPercentage),
          },
        );
        if (ownerErr) throw new Error(ownerErr);
      }

      // 5. Add managers
      const validManagers = form.managers.filter(
        (m) => m.fullName.trim() && m.role.trim(),
      );
      for (const manager of validManagers) {
        const { error: mgrErr } = await companyProvider.addManager(
          company.id,
          {
            full_name: manager.fullName.trim(),
            role: manager.role.trim(),
          },
        );
        if (mgrErr) throw new Error(mgrErr);
      }

      // 6. Submit company for validation
      const { data, error } = await companyProvider.submitForValidation(
        company.id,
      );

      if (data) {
        toast.success("Company submitted for validation successfully!");
        onComplete();
      } else {
        throw new Error(error || "Failed to submit company");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred during submission");
    }

    setSubmitting(false);
  }, [form, company.id, onComplete]);

  /* ── Navigation ────────────────────────────── */
  const nextStep = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  /* ── Render helpers ────────────────────────── */
  const renderFileUploadArea = (
    field: keyof FormState,
    category: string,
    label: string,
    accept = ".pdf,.jpg,.jpeg,.png",
    multiple = true,
  ) => {
    const items = form[field] as UploadedFile[];
    const isUploading = uploading[category] ?? false;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">{label}</p>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => uploadAllForCategory(field, category)}
              disabled={isUploading}
              className="text-xs text-primary hover:underline disabled:opacity-50 flex items-center gap-1"
            >
              {isUploading ? (
                <Loader className="w-3 h-3 animate-spin" />
              ) : (
                <Upload className="w-3 h-3" />
              )}
              Upload all
            </button>
          )}
        </div>

        {/* File list */}
        {items.length > 0 && (
          <div className="space-y-2">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.uploaded ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => uploadFileItem(field, i, category)}
                        disabled={!!uploading[`${category}-${i}`]}
                        className="text-xs text-primary hover:underline disabled:opacity-50"
                      >
                        {uploading[`${category}-${i}`] ? (
                          <Loader className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          "Upload"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFile(field, i)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add button */}
        <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
          <Upload className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">Add files</span>
          <input
            ref={(el) => {
              fileInputs.current[category] = el;
            }}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileSelect(field, category)}
            className="hidden"
          />
        </label>
      </div>
    );
  };

  const renderStepContent = () => {
    const stepId = STEPS[currentStep].id;
    const errors = stepErrors[stepId];

    switch (stepId) {
      /* ═══════ Step 1: Legal Documents ═══════ */
      case "legal":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Legal Documents & Registration
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Provide the legal registration details and supporting documents
                for your business.
              </p>
            </div>

            <MUIInput
              label="RCCM Number"
              value={form.rccmNumber}
              onChange={(e) => updateField("rccmNumber", e.target.value)}
              //   placeholder="e.g. RCCM-2024-001"
              className="pl-4"
              required
            />

            <div className="border-t border-gray-100 pt-4 space-y-4">
              <h4 className="text-sm font-semibold text-gray-700">
                Supporting Documents
              </h4>
              {renderFileUploadArea("rccmDocs", "rccm", "RCCM Documents")}
              {renderFileUploadArea("niuDocs", "niu", "NIU (Tax ID) Document")}
              {renderFileUploadArea(
                "statutsDocs",
                "statuts",
                "Company Statutes",
              )}
              {renderFileUploadArea(
                "premisesDocs",
                "premises",
                "Premises Documents",
              )}
            </div>
          </div>
        );

      /* ═══════ Step 2: Beneficial Owners ═══════ */
      case "owners":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Beneficial Owners
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                List all individuals who own or control more than 25% of the
                business.
              </p>
            </div>

            {form.beneficialOwners.map((owner, i) => (
              <div
                key={i}
                className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Owner #{i + 1}
                  </span>
                  {form.beneficialOwners.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOwner(i)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <MUIInput
                  label="Full name"
                  value={owner.fullName}
                  onChange={(e) => updateOwner(i, "fullName", e.target.value)}
                  //   placeholder="e.g. Jean Dupont"
                  className="pl-4"
                />

                <MUIInput
                  label="Equity percentage (%)"
                  type="number"
                  value={owner.equityPercentage}
                  onChange={(e) =>
                    updateOwner(i, "equityPercentage", e.target.value)
                  }
                  //   placeholder="e.g. 60"
                  className="pl-4"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={addOwner}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Plus className="w-4 h-4" />
              Add another owner
            </button>
          </div>
        );

      /* ═══════ Step 3: Management ═══════ */
      case "management":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Management Team
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                List the key management personnel of your business.
              </p>
            </div>

            {form.managers.map((manager, i) => (
              <div
                key={i}
                className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Manager #{i + 1}
                  </span>
                  {form.managers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeManager(i)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <MUIInput
                  label="Full name"
                  value={manager.fullName}
                  onChange={(e) => updateManager(i, "fullName", e.target.value)}
                  //   placeholder="e.g. Marie Curie"
                  className="pl-4"
                />

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Role
                  </label>
                  <select
                    value={manager.role}
                    onChange={(e) => updateManager(i, "role", e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="">Select a role...</option>
                    {MANAGER_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addManager}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Plus className="w-4 h-4" />
              Add another manager
            </button>
          </div>
        );

      /* ═══════ Step 4: Financial Info ═══════ */
      case "financial":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Financial Information
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Provide financial records and statements for your business.
              </p>
            </div>

            <MUIInput
              label="DSF Fiscal Years"
              value={form.dsfYears}
              onChange={(e) => updateField("dsfYears", e.target.value)}
              //   placeholder="e.g. 2023, 2024, 2025"
              className="pl-4"
            />

            <div className="border-t border-gray-100 pt-4 space-y-4">
              <h4 className="text-sm font-semibold text-gray-700">
                Financial Documents
              </h4>
              {renderFileUploadArea(
                "bankStatements",
                "bank_statements",
                "Bank Statements",
              )}
              {renderFileUploadArea(
                "momoStatements",
                "momo_statements",
                "Mobile Money Statements",
              )}
            </div>
          </div>
        );

      /* ═══════ Step 5: Additional Docs ═══════ */
      case "documents":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Additional Documents
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Upload any additional supporting documents for your business.
              </p>
            </div>

            <div className="space-y-4">
              {renderFileUploadArea(
                "sectorPermits",
                "sector_permits",
                "Sector Permits & Licenses",
              )}
              {renderFileUploadArea(
                "collateralDocs",
                "collateral",
                "Collateral Documents",
              )}
              {renderFileUploadArea(
                "identityDocs",
                "identity",
                "Identity Documents (Passport/ID)",
              )}
            </div>
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
                Please review all information before submitting for validation.
              </p>
            </div>

            {/* Summary cards */}
            <div className="space-y-4">
              {/* Legal */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-gray-900">
                    Legal Documents
                  </h4>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    RCCM Number:{" "}
                    <span className="font-medium">
                      {form.rccmNumber || "—"}
                    </span>
                  </p>
                  <p>
                    RCCM Docs: {form.rccmDocs.filter((d) => d.uploaded).length}{" "}
                    uploaded
                    {form.rccmDocs.filter((d) => !d.uploaded).length > 0 &&
                      `, ${form.rccmDocs.filter((d) => !d.uploaded).length} pending`}
                  </p>
                  <p>
                    Other docs:{" "}
                    {[form.niuDocs, form.statutsDocs, form.premisesDocs].reduce(
                      (sum, arr) => sum + arr.length,
                      0,
                    )}{" "}
                    files
                  </p>
                </div>
              </div>

              {/* Owners */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-gray-900">
                    Beneficial Owners
                  </h4>
                </div>
                {form.beneficialOwners.filter((o) => o.fullName).length > 0 ? (
                  <ul className="space-y-1 text-sm text-gray-600">
                    {form.beneficialOwners
                      .filter((o) => o.fullName)
                      .map((o, i) => (
                        <li key={i}>
                          {o.fullName} — {o.equityPercentage || "?"}%
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">None added</p>
                )}
              </div>

              {/* Management */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-gray-900">
                    Management
                  </h4>
                </div>
                {form.managers.filter((m) => m.fullName).length > 0 ? (
                  <ul className="space-y-1 text-sm text-gray-600">
                    {form.managers
                      .filter((m) => m.fullName)
                      .map((m, i) => (
                        <li key={i}>
                          {m.fullName} — {m.role || "?"}
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">None added</p>
                )}
              </div>

              {/* Financial */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Divide className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-gray-900">
                    Financial Info
                  </h4>
                </div>
                <p className="text-sm text-gray-600">
                  DSF Years:{" "}
                  <span className="font-medium">{form.dsfYears || "—"}</span>
                </p>
              </div>
            </div>

            {/* Validation warnings */}
            {Object.values(stepErrors).some((errs) => errs.length > 0) && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
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

  /* ── Quick fill (dev-only) ─────────────────── */
  const quickFillForm = useCallback(async () => {
    // Fetch the sample PDF from public directory
    const makeFile = async (name: string): Promise<UploadedFile> => {
      try {
        const res = await fetch("/files/file.pdf");
        const blob = await res.blob();
        const file = new File([blob], name, { type: "application/pdf" });
        return { file, name, uploaded: false };
      } catch {
        return {
          file: new File([], ""),
          name: `${name} (fetch failed)`,
          uploaded: false,
        };
      }
    };

    const [
      rccm,
      niu,
      statuts,
      premises,
      bank,
      momo,
      sector,
      collateral,
      identity,
    ] = await Promise.all([
      makeFile("rccm_document.pdf"),
      makeFile("niu_document.pdf"),
      makeFile("statuts_document.pdf"),
      makeFile("premises_document.pdf"),
      makeFile("bank_statement_2024.pdf"),
      makeFile("momo_statement_2024.pdf"),
      makeFile("sector_permit.pdf"),
      makeFile("collateral_document.pdf"),
      makeFile("identity_document.pdf"),
    ]);

    setForm({
      rccmNumber: "RCCM-CM-2024-001234",
      rccmDocs: [rccm],
      niuDocs: [niu],
      statutsDocs: [statuts],
      premisesDocs: [premises],
      beneficialOwners: [
        { fullName: "Jean Dupont", equityPercentage: "60" },
        { fullName: "Marie Camara", equityPercentage: "40" },
      ],
      managers: [
        { fullName: "Jean Dupont", role: "CEO / General Manager" },
        { fullName: "Amadou Diallo", role: "CFO / Financial Director" },
      ],
      dsfYears: "2022, 2023, 2024",
      bankStatements: [bank],
      momoStatements: [momo],
      sectorPermits: [sector],
      collateralDocs: [collateral],
      identityDocs: [identity],
    });
    setCurrentStep(0);
    toast.success(
      "Form filled with test data — all documents pre-loaded from file.pdf",
    );
  }, []);

  /* ── Render ────────────────────────────────── */
  const currentStepId = STEPS[currentStep].id;
  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;
  const errors = stepErrors[currentStepId];

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      {/* Progress header */}
      <div className="px-6 py-5 border-b border-border bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-MontserratBold text-gray-900">
            Complete Company Registration
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={quickFillForm}
              className="text-xs text-gray-400 hover:text-primary border border-dashed border-gray-300 hover:border-primary px-2.5 py-1 rounded-full transition-colors"
              title="Fill all fields with test data for quick testing"
            >
              ⚡ Quick fill test data
            </button>
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </div>
        </div>

        {/* Step indicators */}
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
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
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
              onClick={prevStep}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
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
              {submitting ? "Submitting..." : "Submit for Validation"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={nextStep}
              disabled={!canProceed}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
