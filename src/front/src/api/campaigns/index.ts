import { withErrorHandling } from "@/api/api-wrapper-utility";
import instance from "..";
import Project, { IProject } from "@/entities/project/project";
import Milestone, { IMilestone } from "@/entities/project/milestone";
import { CreateCampaignDto, MilestoneBatchDto, UpdateCampaignDto } from "./dto";

const toArray = (payload: any): any[] => {
  if (Array.isArray(payload?.Data)) return payload.Data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results?.Data)) return payload.results.Data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const toObject = (payload: any): Record<string, any> | null => {
  if (payload?.Data && typeof payload.Data === "object") return payload.Data;
  if (payload?.data && typeof payload.data === "object") return payload.data;
  if (payload && typeof payload === "object") return payload;
  return null;
};

/* ─── Types ──────────────────────────────── */

export interface DiscoverProjectItem {
  id: string;
  title: string;
  description?: string;
  funding_goal: number;
  funding_raised?: number;
  currency?: string;
  category?: string;
  cover_image_url?: string;
  status?: string;
  company?: {
    id: string;
    legal_name: string;
    trade_name?: string;
    corporate_form: string;
    industry_sector?: string;
    physical_address?: string;
  };
  short_term_roi?: number;
  short_term_months?: number;
  medium_term_roi?: number;
  medium_term_months?: number;
  long_term_roi?: number;
  long_term_months?: number;
  break_even_months?: number;
  investor_count?: number;
}

export const campaignProvider = {
  // ─── Discover (public) ──────────────────────────────────────────

  /**
   * GET /projects/discover
   * Public — top 10 active projects with summary, company, ROI, investor count.
   */
  async discover() {
    return await withErrorHandling<DiscoverProjectItem[]>(async () => {
      const response = await instance.get("/projects/discover");

      if (response.status === 200) {
        return {
          status: response.status,
          data: toArray(response.data),
        };
      }

      return response;
    }, "Unable to load featured projects");
  },

  // ─── Campaigns / Projects ───────────────────────────────────────

  async getAll() {
    return await withErrorHandling<Project[]>(
      async () => {
        const response = await instance.get("/projects/my");

        if (response.status === 200) {
          const projects = toArray(response.data).map(
            (project: IProject) => new Project(project),
          );

          return {
            status: response.status,
            data: projects,
          };
        }

        return response;
      },
      "Unable to fetch campaign list",
      "Campaign list retrieved successfully",
    );
  },

  async getById(id: string) {
    return await withErrorHandling<Project | null>(
      async () => {
        const response = await instance.get(`/projects/${id}`);

        if (response.status === 200) {
          const detail = toObject(response.data);

          if (!detail) {
            return { status: response.status, data: null };
          }

          return {
            status: response.status,
            data: new Project(detail as IProject),
          };
        }

        if (response.status === 404) {
          return { status: response.status, data: null };
        }

        return response;
      },
      "Unable to fetch campaign details",
      "Campaign details retrieved successfully",
    );
  },

  async create(payload: CreateCampaignDto) {
    return await withErrorHandling<{ message: string; project?: Project }>(
      async () => {
        const response = await instance.post("/projects", payload);

        if (response.status === 200 || response.status === 201) {
          const detail = toObject(response.data);
          let project: Project | undefined;

          if (detail) {
            project = new Project(detail as IProject);
          }

          return {
            status: response.status,
            data: {
              message:
                response.data?.message ?? "Campaign created successfully",
              project,
            },
          };
        }

        return response;
      },
      "An error occurred while creating the campaign",
    );
  },

  async update(id: string, payload: UpdateCampaignDto) {
    return await withErrorHandling<{ message: string; project?: Project }>(
      async () => {
        const response = await instance.put(`/projects/${id}`, payload);

        if (response.status === 200) {
          const detail = toObject(response.data);
          let project: Project | undefined;

          if (detail) {
            project = new Project(detail as IProject);
          }

          return {
            status: response.status,
            data: {
              message:
                response.data?.message ?? "Campaign updated successfully",
              project,
            },
          };
        }

        return response;
      },
      "An error occurred while updating the campaign",
    );
  },

  async remove(id: string) {
    return await withErrorHandling<{ message: string }>(async () => {
      const response = await instance.delete(`/projects/${id}`);

      if (response.status === 200 || response.status === 204) {
        return {
          status: response.status,
          data: {
            message: response.data?.message ?? "Campaign deleted successfully",
          },
        };
      }

      return response;
    }, "Une erreur s'est produite lors de la suppression de la campagne");
  },

  /**
   * GET /companies/:companyId/projects/
   * Get all campaigns belonging to a specific company.
   */
  async getByCompany(companyId: string) {
    return await withErrorHandling<Project[]>(
      async () => {
        const response = await instance.get(`/companies/${companyId}/projects`);

        if (response.status === 200) {
          const projects = toArray(response.data).map(
            (project: IProject) => new Project(project),
          );

          return {
            status: response.status,
            data: projects,
          };
        }

        return response;
      },
      "Unable to fetch campaigns for this company",
      "Company campaigns retrieved successfully",
    );
  },

  // ─── Milestones ─────────────────────────────────────────────────

  async getMilestones(projectId: string) {
    return await withErrorHandling<Milestone[]>(
      async () => {
        const response = await instance.get(
          `/projects/${projectId}/milestones`,
        );

        if (response.status === 200) {
          const milestones = toArray(response.data).map(
            (milestone: IMilestone) => new Milestone(milestone),
          );

          return {
            status: response.status,
            data: milestones,
          };
        }

        return response;
      },
      "Unable to fetch milestones",
      "Milestones retrieved successfully",
    );
  },

  /**
   * POST /milestones/{id}/upload
   * Upload proof documents for a milestone. Changes status to under_review.
   */
  async uploadMilestoneProof(
    milestoneId: string,
    files: File[],
    notes?: string,
  ) {
    return await withErrorHandling<{ message: string; status: string }>(
      async () => {
        const formData = new FormData();
        files.forEach((f) => formData.append("files", f));
        if (notes) formData.append("notes", notes);

        const response = await instance.post(
          `/milestones/${milestoneId}/upload`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );

        if (response.status === 200) {
          return {
            status: response.status,
            data: {
              message:
                "Proof documents uploaded — milestone submitted for review",
              status: "under_review",
            },
          };
        }

        return response;
      },
      "Failed to upload milestone proof",
    );
  },

  async createMilestone(projectId: string, payload: MilestoneBatchDto) {
    return await withErrorHandling<{ message: string; milestone?: Milestone }>(
      async () => {
        const response = await instance.post(
          `/projects/${projectId}/milestones`,
          payload,
        );

        if (response.status === 200 || response.status === 201) {
          const detail = toObject(response.data);
          let milestone: Milestone | undefined;

          if (detail) {
            milestone = new Milestone(detail as IMilestone);
          }

          return {
            status: response.status,
            data: {
              message:
                response.data?.message ?? "Milestone created successfully",
              milestone,
            },
          };
        }

        return response;
      },
      "An error occurred while creating the milestone",
    );
  },

  async updateMilestone(
    projectId: string,
    milestoneId: string,
    payload: Partial<MilestoneBatchDto>,
  ) {
    return await withErrorHandling<{ message: string; milestone?: Milestone }>(
      async () => {
        const response = await instance.put(
          `/projects/${projectId}/milestones/${milestoneId}`,
          payload,
        );

        if (response.status === 200) {
          const detail = toObject(response.data);
          let milestone: Milestone | undefined;

          if (detail) {
            milestone = new Milestone(detail as IMilestone);
          }

          return {
            status: response.status,
            data: {
              message:
                response.data?.message ?? "Milestone updated successfully",
              milestone,
            },
          };
        }

        return response;
      },
      "An error occurred while updating the milestone",
    );
  },

  async removeMilestone(projectId: string, milestoneId: string) {
    return await withErrorHandling<{ message: string }>(async () => {
      const response = await instance.delete(
        `/projects/${projectId}/milestones/${milestoneId}`,
      );

      if (response.status === 200 || response.status === 204) {
        return {
          status: response.status,
          data: {
            message: response.data?.message ?? "Milestone deleted successfully",
          },
        };
      }

      return response;
    }, "An error occurred while deleting the milestone");
  },

  /**
   * POST /projects/{id}/submit
   * Submit a project for admin validation (draft → pending).
   */
  async submitForValidation(id: string) {
    return await withErrorHandling<{
      id: string;
      status: string;
      message: string;
    }>(async () => {
      const response = await instance.post(`/projects/${id}/submit`);

      if (response.status === 200) {
        const detail = toObject(response.data) ?? response.data;
        return {
          status: response.status,
          data: {
            id: detail.id ?? id,
            status: detail.status ?? "pending",
            message: detail.message ?? "Project submitted for validation",
          },
        };
      }

      return response;
    }, "Failed to submit project for validation");
  },

  // ─── Public Projects (investor-facing) ─────────────────────────

  /**
   * GET /projects/public
   * Public — paginated list of approved projects with filters.
   */
  async getPublicProjects(params?: {
    category?: string;
    status?: string;
    currency?: string;
    query?: string;
    min_goal?: number;
    max_goal?: number;
    page?: number;
    page_size?: number;
  }) {
    return await withErrorHandling<{
      data: DiscoverProjectItem[];
      meta?: { total: number; page: number; page_size: number };
    }>(async () => {
      const response = await instance.get("/projects/public", { params });

      if (response.status === 200) {
        return {
          status: response.status,
          data: {
            data: toArray(response.data),
            meta: response.data?.meta,
          },
        };
      }

      return response;
    }, "Unable to load projects");
  },

  // ─── Invest in a Project ───────────────────────────────────────

  /**
   * POST /projects/{id}/invest
   * Initiate an investment via PawaPay (MMO).
   */
  async investInProject(
    id: string,
    payload: {
      amount: number;
      phone_number: string;
      currency?: string;
      provider?: string;
    },
  ) {
    return await withErrorHandling<{
      invested_amount: number;
      platform_fee_pct: number;
      platform_fee_amt: number;
      total_charge: number;
      remaining: number;
      funding_progress: string;
      deposit_id: string;
      pawapay_status: string;
      provider: string;
    }>(async () => {
      const response = await instance.post(`/projects/${id}/invest`, payload);

      if (response.status === 201) {
        const detail = toObject(response.data);
        return {
          status: response.status,
          data: detail as any,
        };
      }

      return response;
    }, "Failed to process investment");
  },

  // ─── Project Investors ─────────────────────────────────────────

  /**
   * GET /projects/{id}/investors
   * List investors for a project (name, amount, ownership %).
   */
  async getInvestors(
    id: string,
  ): Promise<{ data?: InvestorItem[]; error?: string }> {
    try {
      const response = await instance.get(`/projects/${id}/investors`);

      if (response.status === 200) {
        const items = toArray(response.data);
        return { data: items as InvestorItem[] };
      }

      const errorMsg =
        response.data?.error ??
        response.data?.message ??
        "Failed to load investors";
      return { error: errorMsg };
    } catch (err: any) {
      return { error: err?.message ?? "Failed to load investors" };
    }
  },

  // ─── Portfolio (my investments) ────────────────────────────────

  /**
   * GET /portfolio
   * User's portfolio — total value + list of investments with project & company.
   */
  async getPortfolio(): Promise<{
    data?: {
      total_value: number;
      currency: string;
      investments: PortfolioItem[];
    };
    error?: string;
  }> {
    try {
      const response = await instance.get("/portfolio");

      if (response.status === 200) {
        const detail = toObject(response.data);
        return {
          data: {
            total_value: detail?.total_value ?? 0,
            currency: detail?.currency ?? "XOF",
            investments: (detail?.investments ?? []) as PortfolioItem[],
          },
        };
      }

      const errorMsg =
        response.data?.error ??
        response.data?.message ??
        "Failed to load portfolio";
      return { error: errorMsg };
    } catch (err: any) {
      return { error: err?.message ?? "Failed to load portfolio" };
    }
  },
};

export interface PortfolioItem {
  investment_id?: string;
  project_id?: string;
  project_title?: string;
  company_name?: string;
  project_created?: string;
  amount?: number;
  currency?: string;
  ownership_pct?: number;
  project_status?: string;
}

/* ─── Investor Item Interface ──────────── */
export interface InvestorItem {
  investment_id?: string;
  user_id?: string;
  full_name?: string;
  amount?: number;
  ownership_pct?: number;
  currency?: string;
  platform_fee_pct?: number;
  invested_at?: string;
}
