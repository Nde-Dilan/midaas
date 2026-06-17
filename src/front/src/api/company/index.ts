import { withErrorHandling } from "@/api/api-wrapper-utility";
import instance from "..";
import Company, { ICompany } from "@/entities/company/company";
import { CreateCompanyDto, UpdateCompanyDto } from "./dto";

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

export const companyProvider = {
  /**
   * GET /companies/
   * List all companies for the current entrepreneur.
   */
  async getAll() {
    return await withErrorHandling<Company[]>(
      async () => {
        const response = await instance.get("/companies");

        if (response.status === 200) {
          const companies = toArray(response.data).map(
            (item: ICompany) => new Company(item),
          );

          return {
            status: response.status,
            data: companies,
          };
        }

        return response;
      },
      "Unable to fetch company list",
      "Company list retrieved successfully",
    );
  },

  /**
   * GET /companies/:id/
   * Get a company by its ID.
   */
  async getById(id: string) {
    return await withErrorHandling<Company | null>(
      async () => {
        const response = await instance.get(`/companies/${id}`);

        if (response.status === 200) {
          const detail = toObject(response.data);

          if (!detail) {
            return { status: response.status, data: null };
          }

          return {
            status: response.status,
            data: new Company(detail as ICompany),
          };
        }

        if (response.status === 404) {
          return { status: response.status, data: null };
        }

        return response;
      },
      "Unable to fetch company details",
      "Company details retrieved successfully",
    );
  },

  /**
   * POST /companies/
   * Create a new company.
   */
  async create(payload: CreateCompanyDto) {
    return await withErrorHandling<{ message: string; company?: Company }>(
      async () => {
        const response = await instance.post("/companies", payload);

        if (response.status === 200 || response.status === 201) {
          const detail = toObject(response.data);
          let company: Company | undefined;

          if (detail) {
            company = new Company(detail as ICompany);
          }

          return {
            status: response.status,
            data: {
              message: response.data?.message ?? "Company created successfully",
              company,
            },
          };
        }

        return response;
      },
      "An error occurred while creating the company",
    );
  },

  /**
   * PUT /companies/:id/
   * Update an existing company.
   */
  async update(id: string, payload: UpdateCompanyDto) {
    return await withErrorHandling<{ message: string; company?: Company }>(
      async () => {
        const response = await instance.put(`/companies/${id}`, payload);

        if (response.status === 200) {
          const detail = toObject(response.data);
          let company: Company | undefined;

          if (detail) {
            company = new Company(detail as ICompany);
          }

          return {
            status: response.status,
            data: {
              message: response.data?.message ?? "Company updated successfully",
              company,
            },
          };
        }

        return response;
      },
      "An error occurred while updating the company",
    );
  },

  /**
   * DELETE /companies/:id/
   * Delete a company.
   */
  async remove(id: string) {
    return await withErrorHandling<{ message: string }>(async () => {
      const response = await instance.delete(`/companies/${id}`);

      if (response.status === 200 || response.status === 204) {
        return {
          status: response.status,
          data: {
            message: response.data?.message ?? "Company deleted successfully",
          },
        };
      }

      return response;
    }, "An error occurred while deleting the company");
  },

  /**
   * POST /companies/:id/submit
   * Submit the company for admin validation (draft → pending).
   */
  async submitForValidation(id: string) {
    return await withErrorHandling<{
      id: string;
      status: string;
      message: string;
    }>(async () => {
      const response = await instance.post(`/companies/${id}/submit`);

      if (response.status === 200) {
        const detail = toObject(response.data) ?? response.data;
        return {
          status: response.status,
          data: {
            id: detail.id,
            status: detail.status,
            message: detail.message ?? "Company submitted for validation",
          },
        };
      }

      return response;
    }, "Failed to submit company for validation");
  },

  /**
   * GET /companies/public
   * List approved companies — public endpoint, no auth required.
   */
  async getPublic(params?: {
    industry_sector?: string;
    corporate_form?: string;
    query?: string;
    page?: number;
    page_size?: number;
  }) {
    return await withErrorHandling<{
      companies: Company[];
      meta?: { total: number; page: number; page_size: number };
    }>(async () => {
      const response = await instance.get("/companies/public", {
        params: {
          ...params,
          page: params?.page ?? 1,
          page_size: params?.page_size ?? 20,
        },
      });

      if (response.status === 200) {
        const rawList = toArray(response.data);
        const companies = rawList.map((item: ICompany) => new Company(item));
        const meta = response.data?.meta;

        return {
          status: response.status,
          data: {
            companies,
            meta: meta ?? { total: companies.length, page: 1, page_size: 20 },
          },
        };
      }

      return response;
    }, "Unable to fetch approved companies");
  },

  /**
   * POST /companies/:id/upload
   * Upload documents for a specific category.
   * Accepts multipart form-data with `files` (array) and `category`.
   */
  async uploadDocuments(id: string, files: File[], category: string) {
    return await withErrorHandling<{ urls: string[]; category: string }>(
      async () => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        formData.append("category", category);

        const response = await instance.post(
          `/companies/${id}/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        if (response.status === 200) {
          const detail = toObject(response.data) ?? response.data;
          return {
            status: response.status,
            data: {
              urls: detail.urls ?? [],
              category: detail.category ?? category,
            },
          };
        }

        return response;
      },
      `Failed to upload ${category} documents`,
    );
  },

  /**
   * PUT /companies/:id/legal-docs
   * Save or update the legal documents metadata (RCCM number, NIU, etc.)
   * and document URLs. Call this AFTER uploading files so you have the URLs.
   */
  async saveLegalDocs(
    id: string,
    data: {
      rccm_number?: string;
      rccm_expiry_date?: string;
      rccm_docs?: string[];
      niu_number?: string;
      niu_doc_url?: string;
      statuts_docs?: string[];
      localisation_doc_url?: string;
      premises_photos?: string[];
      sector_permits?: string[];
    },
  ) {
    return await withErrorHandling<Record<string, any>>(async () => {
      const response = await instance.put(`/companies/${id}/legal-docs`, data);
      if (response.status === 200) {
        return { status: response.status, data: toObject(response.data) ?? {} };
      }
      return response;
    }, "Failed to save legal documents");
  },

  /**
   * PUT /companies/:id/financials
   * Save or update financial information (DSF years, bank/momo statements).
   */
  async saveFinancials(
    id: string,
    data: {
      dsf_years?: number[];
      dsf_stamped_docs?: string[];
      anr_issue_date?: string;
      anr_expiry_date?: string;
      anr_doc_url?: string;
      cnps_clearance_url?: string;
      bank_statements?: string[];
      momo_statements?: string[];
    },
  ) {
    return await withErrorHandling<Record<string, any>>(async () => {
      const response = await instance.put(`/companies/${id}/financials`, data);
      if (response.status === 200) {
        return { status: response.status, data: toObject(response.data) ?? {} };
      }
      return response;
    }, "Failed to save financial information");
  },

  /**
   * POST /companies/:id/beneficial-owners
   * Add a beneficial owner to the company.
   */
  async addBeneficialOwner(
    id: string,
    data: {
      full_name: string;
      equity_percentage: number;
      identity_docs?: string[];
    },
  ) {
    return await withErrorHandling<Record<string, any>>(async () => {
      const response = await instance.post(
        `/companies/${id}/beneficial-owners`,
        data,
      );
      if (response.status === 201) {
        return {
          status: response.status,
          data: toObject(response.data) ?? {},
        };
      }
      return response;
    }, "Failed to add beneficial owner");
  },

  /**
   * POST /companies/:id/managers
   * Add a manager to the company.
   */
  async addManager(
    id: string,
    data: {
      full_name: string;
      role?: string;
      identity_docs?: string[];
      casier_judiciaire_url?: string;
      casier_judiciaire_date?: string;
      cv_url?: string;
    },
  ) {
    return await withErrorHandling<Record<string, any>>(async () => {
      const response = await instance.post(`/companies/${id}/managers`, data);
      if (response.status === 201) {
        return {
          status: response.status,
          data: toObject(response.data) ?? {},
        };
      }
      return response;
    }, "Failed to add manager");
  },

  /**
   * DELETE /companies/:id/beneficial-owners/:ownerId
   * Remove a beneficial owner.
   */
  async removeBeneficialOwner(id: string, ownerId: string) {
    return await withErrorHandling<Record<string, any>>(async () => {
      const response = await instance.delete(
        `/companies/${id}/beneficial-owners/${ownerId}`,
      );
      if (response.status === 200) {
        return { status: response.status, data: toObject(response.data) ?? {} };
      }
      return response;
    }, "Failed to remove beneficial owner");
  },

  /**
   * DELETE /companies/:id/managers/:managerId
   * Remove a manager.
   */
  async removeManager(id: string, managerId: string) {
    return await withErrorHandling<Record<string, any>>(async () => {
      const response = await instance.delete(
        `/companies/${id}/managers/${managerId}`,
      );
      if (response.status === 200) {
        return { status: response.status, data: toObject(response.data) ?? {} };
      }
      return response;
    }, "Failed to remove manager");
  },

  /**
   * PUT /companies/:id/operations
   * Save operational data (suppliers, clients, collateral, continuity).
   */
  async saveOperations(
    id: string,
    data: {
      top_suppliers?: unknown;
      top_clients?: unknown;
      collateral_type?: string;
      collateral_proof_docs?: string[];
      continuity_infrastructure?: string;
    },
  ) {
    return await withErrorHandling<Record<string, any>>(async () => {
      const response = await instance.put(`/companies/${id}/operations`, data);
      if (response.status === 200) {
        return { status: response.status, data: toObject(response.data) ?? {} };
      }
      return response;
    }, "Failed to save operational data");
  },
};
