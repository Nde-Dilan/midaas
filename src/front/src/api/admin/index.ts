import { withErrorHandling } from "@/api/api-wrapper-utility";
import instance from "..";
import { AdminLoginDto } from "./dto/admin-login.dto";
import { Storage, StorageKeys } from "@/api/auth/storage";

/* ───────────────────────────────────────────────
   Admin-specific storage keys
   ─────────────────────────────────────────────── */
export const AdminStorageKeys = {
  adminAccess: "midaas-admin-access",
  adminId: "midaas-admin-id",
} as const;

const getAdminAuthHeader = () => {
  const token = Storage.getItem(AdminStorageKeys.adminAccess);
  if (!token) return undefined;
  return { Authorization: `Bearer ${token}` };
};

/* ───────────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────────── */
const unwrapEnvelope = (raw: any) => {
  if (raw && typeof raw === "object" && "success" in raw && "data" in raw) {
    return raw.data;
  }
  return raw;
};

const toArray = (payload: any): any[] => {
  const p = unwrapEnvelope(payload);
  if (Array.isArray(p)) return p;
  if (p?.data && Array.isArray(p.data)) return p.data;
  if (Array.isArray(p?.Data)) return p.Data;
  return [];
};

const toObject = (payload: any): Record<string, any> | null => {
  const p = unwrapEnvelope(payload);
  if (p && typeof p === "object") return p;
  return null;
};

/* ───────────────────────────────────────────────
   Types
   ─────────────────────────────────────────────── */
export interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface AdminCompanyItem {
  id: string;
  entrepreneur_id: string;
  status: string;
  legal_name: string;
  trade_name?: string;
  corporate_form: string;
  industry_sector?: string;
  gps_coordinates?: string;
  physical_address?: string;
  created_at?: string;
  updated_at?: string;
  entrepreneur?: {
    id: string;
    user?: {
      full_name?: string;
      email?: string;
    };
  };
}

/**
 * Full company detail returned by GET /companies/{id}.
 * Mirrors the fields from the creation form (CompanyRegistrationForm).
 */
export interface AdminCompanyDetail {
  id: string;
  entrepreneur_id: string;
  status: string;
  legal_name: string;
  trade_name?: string;
  corporate_form: string;
  industry_sector?: string;
  gps_coordinates?: string;
  physical_address?: string;
  created_at?: string;
  updated_at?: string;

  /** Legal documents block — mirrors domain.CompanyLegalDocs */
  legal_docs?: {
    rccm_number?: string;
    rccm_expiry_date?: string;
    rccm_docs?: string[];
    niu_number?: string;
    niu_doc_url?: string;
    statuts_docs?: string[];
    localisation_doc_url?: string;
    premises_photos?: string[];
    sector_permits?: string[];
  };

  /** Financial information block — mirrors domain.CompanyFinancials */
  financials?: {
    dsf_years?: number[];
    dsf_stamped_docs?: string[];
    anr_issue_date?: string;
    anr_expiry_date?: string;
    anr_doc_url?: string;
    cnps_clearance_url?: string;
    bank_statements?: string[];
    momo_statements?: string[];
  };

  /** Operations block — mirrors domain.CompanyOperations */
  operations?: {
    collateral_type?: string;
    collateral_proof_docs?: string[];
    continuity_infrastructure?: string;
  };

  /** Beneficial owners */
  beneficial_owners?: {
    full_name: string;
    equity_percentage: number;
    identity_docs?: string[];
  }[];

  /** Management team */
  managers?: {
    full_name: string;
    role: string;
    identity_docs?: string[];
    cv_url?: string;
    casier_judiciaire_url?: string;
  }[];

  entrepreneur?: {
    id: string;
    user?: {
      id: string;
      full_name?: string;
      email?: string;
      phone_number?: string;
    };
  };
}

export interface AdminEntrepreneurItem {
  id: string;
  user_id: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
    phone_number?: string;
  };
}

export interface AdminUserItem {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  id_card_url?: string;
  id_card_back_url?: string;
  id_card_number?: string;
  created_at?: string;
  updated_at?: string;
  is_entrepreneur?: boolean;
  entrepreneur_status?: string;
}

/* ═══════════════════════════════════════════════
   Project / Campaign types
   ═══════════════════════════════════════════════ */

export interface AdminMilestoneItem {
  id: string;
  project_id?: string;
  title: string;
  description?: string;
  order_num?: number;
  fund_allocation?: number;
  status?: string;
  due_date?: string;
  notes?: string;
  proof_urls?: string[];
  feedback?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminProjectItem {
  id: string;
  title: string;
  description?: string;
  funding_goal: number;
  funding_raised?: number;
  currency?: string;
  status?: string;
  category?: string;
  cover_image_url?: string;
  company_id?: string;
  entrepreneur_id?: string;
  short_term_roi?: number;
  short_term_months?: number;
  medium_term_roi?: number;
  medium_term_months?: number;
  long_term_roi?: number;
  long_term_months?: number;
  break_even_months?: number;
  risk_zones?: { description: string; severity: string; mitigation: string }[];
  use_of_funds?: { category: string; amount: number; percentage: number; details: string }[];
  business_plan_docs?: string[];
  financial_projections?: string[];
  market_analysis?: string;
  competitive_advantage?: string;
  team_background?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
  milestones?: AdminMilestoneItem[];
  company?: {
    id: string;
    legal_name: string;
    trade_name?: string;
    corporate_form: string;
    industry_sector?: string;
    physical_address?: string;
    status?: string;
    entrepreneur?: { id: string; user?: { full_name?: string; email?: string } };
  };
  investor_count?: number;
}

/* ═══════════════════════════════════════════════
   Transaction types
   ═══════════════════════════════════════════════ */

export interface AdminTransactionItem {
  id: string;
  user_id?: string;
  project_id?: string;
  type?: string;
  amount?: number;
  currency?: string;
  status?: string;
  provider?: string;
  pawapay_status?: string;
  deposit_id?: string;
  phone_number?: string;
  user?: {
    id: string;
    email?: string;
    full_name?: string;
    phone_number?: string;
  };
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

/* ───────────────────────────────────────────────
   Admin API Provider
   ─────────────────────────────────────────────── */
export const adminProvider = {
  /**
   * POST /admin/login
   * Authenticate as an admin and receive a JWT token.
   */
  async login({ email, password }: AdminLoginDto) {
    return await withErrorHandling<{
      admin: AdminProfile;
      token: string;
    }>(
      async () => {
        const response = await instance.post("/admin/login", {
          email,
          password,
        });

        if (response.status === 200) {
          const body = unwrapEnvelope(response.data);
          const { admin, token } = body;

          if (token) {
            Storage.setItem(AdminStorageKeys.adminAccess, token);
          }
          if (admin?.id) {
            Storage.setItem(AdminStorageKeys.adminId, admin.id);
          }

          return {
            status: response.status,
            data: { admin, token },
          };
        }

        return response;
      },
      "Erreur lors de la connexion administrateur",
      "Connexion administrateur réussie",
    );
  },

  /**
   * GET /admin/me
   * Get the authenticated admin profile.
   */
  async getMe() {
    return await withErrorHandling<{ admin: AdminProfile }>(
      async () => {
        const response = await instance.get("/admin/me", {
          headers: getAdminAuthHeader(),
        });

        if (response.status === 200) {
          const body = unwrapEnvelope(response.data);
          return {
            status: response.status,
            data: { admin: body.admin ?? body },
          };
        }

        return response;
      },
      "Impossible de récupérer le profil administrateur",
      "Profil administrateur récupéré",
    );
  },

  /**
   * GET /companies/{id}
   * Fetch the FULL detail of a company including all nested fields
   * (legal_docs, financials, beneficial_owners, managers, documents, entrepreneur).
   * Uses the regular auth header which carries the admin token.
   */
  async getCompanyDetail(id: string) {
    return await withErrorHandling<AdminCompanyDetail>(async () => {
      const response = await instance.get(`/companies/${id}`, {
        headers: getAdminAuthHeader(),
      });

      if (response.status === 200) {
        const detail = toObject(response.data);
        return {
          status: response.status,
          data: (detail ?? {}) as AdminCompanyDetail,
        };
      }

      return response;
    }, "Impossible de récupérer les détails complets de l'entreprise");
  },

  /**
   * GET /admin/companies/pending
   * List all companies with pending or reverify_requested status.
   */
  async getPendingCompanies() {
    return await withErrorHandling<AdminCompanyItem[]>(async () => {
      const response = await instance.get("/admin/companies/pending", {
        headers: getAdminAuthHeader(),
      });

      if (response.status === 200) {
        return {
          status: response.status,
          data: toArray(response.data),
        };
      }

      return response;
    }, "Impossible de récupérer les entreprises en attente");
  },

  /**
   * POST /admin/companies/{id}/approve
   * Approve a company (changes status to approved).
   */
  async approveCompany(id: string) {
    return await withErrorHandling<{ id: string; status: string }>(
      async () => {
        const response = await instance.post(
          `/admin/companies/${id}/approve`,
          {},
          { headers: getAdminAuthHeader() },
        );

        if (response.status === 200) {
          const body = toObject(response.data);
          return {
            status: response.status,
            data: body ?? { id, status: "approved" },
          };
        }

        return response;
      },
      "Erreur lors de l'approbation de l'entreprise",
      "Entreprise approuvée avec succès",
    );
  },

  /**
   * POST /admin/companies/{id}/reject
   * Reject a company with an optional reason.
   */
  async rejectCompany(id: string, reason?: string) {
    return await withErrorHandling<{ id: string; status: string }>(
      async () => {
        const payload: Record<string, string> = {};
        if (reason) payload.reason = reason;

        const response = await instance.post(
          `/admin/companies/${id}/reject`,
          payload,
          { headers: getAdminAuthHeader() },
        );

        if (response.status === 200) {
          const body = toObject(response.data);
          return {
            status: response.status,
            data: body ?? { id, status: "rejected" },
          };
        }

        return response;
      },
      "Erreur lors du rejet de l'entreprise",
      "Entreprise rejetée",
    );
  },

  /**
   * GET /admin/entrepreneurs
   * List all entrepreneurs.
   */
  async getEntrepreneurs() {
    return await withErrorHandling<AdminEntrepreneurItem[]>(async () => {
      const response = await instance.get("/admin/entrepreneurs", {
        headers: getAdminAuthHeader(),
      });

      if (response.status === 200) {
        return {
          status: response.status,
          data: toArray(response.data),
        };
      }

      return response;
    }, "Impossible de récupérer la liste des entrepreneurs");
  },

  /**
   * POST /admin/entrepreneurs/{id}/suspend
   * Suspend an entrepreneur.
   */
  async suspendEntrepreneur(id: string) {
    return await withErrorHandling<{ id: string; status: string }>(
      async () => {
        const response = await instance.post(
          `/admin/entrepreneurs/${id}/suspend`,
          {},
          { headers: getAdminAuthHeader() },
        );

        if (response.status === 200) {
          const body = toObject(response.data);
          return {
            status: response.status,
            data: body ?? { id, status: "suspended" },
          };
        }

        return response;
      },
      "Erreur lors de la suspension de l'entrepreneur",
      "Entrepreneur suspendu",
    );
  },

  /**
   * POST /admin/entrepreneurs/{id}/activate
   * Activate an entrepreneur.
   */
  async activateEntrepreneur(id: string) {
    return await withErrorHandling<{ id: string; status: string }>(
      async () => {
        const response = await instance.post(
          `/admin/entrepreneurs/${id}/activate`,
          {},
          { headers: getAdminAuthHeader() },
        );

        if (response.status === 200) {
          const body = toObject(response.data);
          return {
            status: response.status,
            data: body ?? { id, status: "active" },
          };
        }

        return response;
      },
      "Erreur lors de l'activation de l'entrepreneur",
      "Entrepreneur activé",
    );
  },

  /* ═══════════════════════════════════════════════
     Projects / Campaigns
     ═══════════════════════════════════════════════ */

  /**
   * GET /admin/projects/pending
   * List all projects with full details (milestones, investments, company).
   */
  async getPendingProjects() {
    return await withErrorHandling<AdminProjectItem[]>(async () => {
      const response = await instance.get("/admin/projects/pending", {
        headers: getAdminAuthHeader(),
      });

      if (response.status === 200) {
        return {
          status: response.status,
          data: toArray(response.data),
        };
      }

      return response;
    }, "Failed to load pending projects");
  },

  /**
   * GET /projects/{id}
   * Fetch full project details including milestones, investments, company.
   */
  async getProjectDetail(id: string) {
    return await withErrorHandling<AdminProjectItem>(async () => {
      const response = await instance.get(`/projects/${id}`, {
        headers: getAdminAuthHeader(),
      });

      if (response.status === 200) {
        const detail = toObject(response.data);
        return {
          status: response.status,
          data: (detail ?? {}) as AdminProjectItem,
        };
      }

      return response;
    }, "Failed to load project details");
  },

  /**
   * POST /admin/projects/{id}/approve
   * Approve a project → active.
   */
  async approveProject(id: string) {
    return await withErrorHandling<{ id: string; status: string }>(
      async () => {
        const response = await instance.post(
          `/admin/projects/${id}/approve`,
          {},
          { headers: getAdminAuthHeader() },
        );
        if (response.status === 200) {
          const body = toObject(response.data);
          return { status: response.status, data: body ?? { id, status: "active" } };
        }
        return response;
      },
      "Failed to approve project",
      "Project approved successfully",
    );
  },

  /**
   * POST /admin/projects/{id}/reject
   * Reject a project.
   */
  async rejectProject(id: string, reason?: string) {
    return await withErrorHandling<{ id: string; status: string }>(
      async () => {
        const payload: Record<string, string> = {};
        if (reason) payload.reason = reason;
        const response = await instance.post(
          `/admin/projects/${id}/reject`,
          payload,
          { headers: getAdminAuthHeader() },
        );
        if (response.status === 200) {
          const body = toObject(response.data);
          return { status: response.status, data: body ?? { id, status: "rejected" } };
        }
        return response;
      },
      "Failed to reject project",
      "Project rejected",
    );
  },

  /* ═══════════════════════════════════════════════
     Milestones
     ═══════════════════════════════════════════════ */

  /**
   * GET /admin/milestones/pending
   * List all milestones pending review (under_review).
   */
  async getPendingMilestones() {
    return await withErrorHandling<AdminMilestoneItem[]>(async () => {
      const response = await instance.get("/admin/milestones/pending", {
        headers: getAdminAuthHeader(),
      });

      if (response.status === 200) {
        return {
          status: response.status,
          data: toArray(response.data),
        };
      }

      return response;
    }, "Failed to load pending milestones");
  },

  /**
   * POST /admin/milestones/{id}/approve
   * Approve a milestone + send investor emails with proofs.
   */
  async approveMilestone(id: string) {
    return await withErrorHandling<{ id: string; status: string }>(
      async () => {
        const response = await instance.post(
          `/admin/milestones/${id}/approve`,
          {},
          { headers: getAdminAuthHeader() },
        );
        if (response.status === 200) {
          const body = toObject(response.data);
          return { status: response.status, data: body ?? { id, status: "approved" } };
        }
        return response;
      },
      "Failed to approve milestone",
      "Milestone approved, investors notified",
    );
  },

  /**
   * POST /admin/milestones/{id}/reject
   * Reject a milestone with feedback.
   */
  async rejectMilestone(id: string, feedback?: string) {
    return await withErrorHandling<{ id: string; status: string }>(
      async () => {
        const payload: Record<string, string> = {};
        if (feedback) payload.feedback = feedback;
        const response = await instance.post(
          `/admin/milestones/${id}/reject`,
          payload,
          { headers: getAdminAuthHeader() },
        );
        if (response.status === 200) {
          const body = toObject(response.data);
          return { status: response.status, data: body ?? { id, status: "rejected" } };
        }
        return response;
      },
      "Failed to reject milestone",
      "Milestone rejected, feedback sent",
    );
  },

  /* ═══════════════════════════════════════════════
     Transactions
     ═══════════════════════════════════════════════ */

  /**
   * GET /admin/transactions
   * List all platform transactions (investments, fees, refunds, payouts).
   */
  async getTransactions() {
    return await withErrorHandling<AdminTransactionItem[]>(async () => {
      const response = await instance.get("/admin/transactions", {
        headers: getAdminAuthHeader(),
      });

      if (response.status === 200) {
        return {
          status: response.status,
          data: toArray(response.data),
        };
      }

      return response;
    }, "Failed to load transactions");
  },

  /**
   * GET /admin/users
   * List all users.
   */
  async getUsers() {
    return await withErrorHandling<AdminUserItem[]>(async () => {
      const response = await instance.get("/admin/users", {
        headers: getAdminAuthHeader(),
      });

      if (response.status === 200) {
        return {
          status: response.status,
          data: toArray(response.data),
        };
      }

      return response;
    }, "Impossible de récupérer la liste des utilisateurs");
  },

  /**
   * Client-side logout — clears admin storage.
   */
  async logout() {
    return await withErrorHandling<{ message: string }>(
      async () => {
        Storage.removeItem(AdminStorageKeys.adminAccess);
        Storage.removeItem(AdminStorageKeys.adminId);
        return {
          status: 200,
          data: { message: "Déconnexion administrateur réussie" },
        };
      },
      "Erreur lors de la déconnexion",
      "Déconnexion réussie",
    );
  },
};
