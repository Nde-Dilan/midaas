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
        const response = await instance.get("/companies/");

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
      "Impossible de récupérer la liste des entreprises",
      "Liste des entreprises récupérée avec succès",
    );
  },

  /**
   * GET /companies/:id/
   * Get a company by its ID.
   */
  async getById(id: string) {
    return await withErrorHandling<Company | null>(
      async () => {
        const response = await instance.get(`/companies/${id}/`);

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
      "Impossible de récupérer les détails de l'entreprise",
      "Détails de l'entreprise récupérés avec succès",
    );
  },

  /**
   * POST /companies/
   * Create a new company.
   */
  async create(payload: CreateCompanyDto) {
    return await withErrorHandling<{ message: string; company?: Company }>(
      async () => {
        const response = await instance.post("/companies/", payload);

        if (response.status === 200 || response.status === 201) {
          const detail = toObject(response.data);
          let company: Company | undefined;

          if (detail) {
            company = new Company(detail as ICompany);
          }

          return {
            status: response.status,
            data: {
              message: response.data?.message ?? "Entreprise créée avec succès",
              company,
            },
          };
        }

        return response;
      },
      "Une erreur s'est produite lors de la création de l'entreprise",
    );
  },

  /**
   * PUT /companies/:id/
   * Update an existing company.
   */
  async update(id: string, payload: UpdateCompanyDto) {
    return await withErrorHandling<{ message: string; company?: Company }>(
      async () => {
        const response = await instance.put(`/companies/${id}/`, payload);

        if (response.status === 200) {
          const detail = toObject(response.data);
          let company: Company | undefined;

          if (detail) {
            company = new Company(detail as ICompany);
          }

          return {
            status: response.status,
            data: {
              message:
                response.data?.message ?? "Entreprise mise à jour avec succès",
              company,
            },
          };
        }

        return response;
      },
      "Une erreur s'est produite lors de la mise à jour de l'entreprise",
    );
  },

  /**
   * DELETE /companies/:id/
   * Delete a company.
   */
  async remove(id: string) {
    return await withErrorHandling<{ message: string }>(async () => {
      const response = await instance.delete(`/companies/${id}/`);

      if (response.status === 200 || response.status === 204) {
        return {
          status: response.status,
          data: {
            message:
              response.data?.message ?? "Entreprise supprimée avec succès",
          },
        };
      }

      return response;
    }, "Une erreur s'est produite lors de la suppression de l'entreprise");
  },
};
