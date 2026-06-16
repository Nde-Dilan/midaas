import { withErrorHandling } from "@/api/api-wrapper-utility";
import instance from "..";
import Project, { IProject } from "@/entities/project/project";
import Milestone, { IMilestone } from "@/entities/project/milestone";
import {
  CreateCampaignDto,
  CreateMilestoneDto,
  UpdateCampaignDto,
} from "./dto";

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
        const response = await instance.get("/projects");

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
      "Impossible de récupérer les jalons",
      "Jalons récupérés avec succès",
    );
  },

  async createMilestone(projectId: string, payload: CreateMilestoneDto) {
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
              message: response.data?.message ?? "Jalon créé avec succès",
              milestone,
            },
          };
        }

        return response;
      },
      "Une erreur s'est produite lors de la création du jalon",
    );
  },

  async updateMilestone(
    projectId: string,
    milestoneId: string,
    payload: Partial<CreateMilestoneDto>,
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
              message: response.data?.message ?? "Jalon mis à jour avec succès",
              milestone,
            },
          };
        }

        return response;
      },
      "Une erreur s'est produite lors de la mise à jour du jalon",
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
            message: response.data?.message ?? "Jalon supprimé avec succès",
          },
        };
      }

      return response;
    }, "Une erreur s'est produite lors de la suppression du jalon");
  },
};
