"use client";

import { useModalStore } from "@/store/modal";
import { MUIInput, MUITextarea } from "@/components/atoms/input";
import {
  Select,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/atoms/select";
import { Button } from "@/components/atoms/button";
import { DialogTitle } from "../../modal";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { campaignProvider } from "@/api/campaigns";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/auth";
import { useCampaignsStore } from "@/store/campaigns";
import { useCompanyStore } from "@/store/company";
import useGetCompanies from "@/hooks/useCompanies";
import { Loader } from "lucide-react";
import { DatePicker } from "@/components/molecules/date-picker";
import Project from "@/entities/project/project";

const campaignCategories = [
  "Agriculture",
  "Technologie",
  "Art & Culture",
  "Education",
  "Santé",
  "Environnement",
  "Commerce",
  "Artisanat",
  "Immobilier",
  "Transport",
  "Alimentation",
  "Autre",
];

type ICampaignForm = {
  title: string;
  description: string;
  fundingGoal: string;
  category: string;
  companyId: string;
  currency: string;
  startDate: Date;
  endDate: Date;
};

export default function AddCampaignModal() {
  const { toggle, data } = useModalStore();
  const { user } = useAuthStore();
  const { addCampaign, updateCampaignInList } = useCampaignsStore();
  const { companies } = useCompanyStore();

  // Load companies for the selector
  useGetCompanies();

  const { handleSubmit, control, reset, getValues, setValue } =
    useForm<ICampaignForm>({
      defaultValues: {
        title: "",
        description: "",
        fundingGoal: "",
        category: "",
        companyId: "",
        currency: "XOF",
        startDate: new Date(),
        endDate: new Date(),
      },
    });

  const [loading, setLoading] = useState(false);

  const isEditMode = data?.type === "edit";
  const campaignToEdit = data?.campaign as Project | undefined;

  // Pre-fill form when in edit mode
  const [prefilled, setPrefilled] = useState(false);
  if (isEditMode && campaignToEdit && !prefilled) {
    setValue("title", campaignToEdit.title);
    setValue("description", campaignToEdit.description);
    setValue("fundingGoal", campaignToEdit.fundingGoal.toString());
    setValue("category", campaignToEdit.category);
    setValue("currency", campaignToEdit.currency);
    if (campaignToEdit.companyId)
      setValue("companyId", campaignToEdit.companyId);
    if (campaignToEdit.startDate)
      setValue("startDate", campaignToEdit.startDate);
    if (campaignToEdit.endDate) setValue("endDate", campaignToEdit.endDate);
    setPrefilled(true);
  }

  const onSubmit: SubmitHandler<ICampaignForm> = async (value) => {
    if (!user) {
      toast.error("Vous devez être connecté");
      return;
    }

    setLoading(true);

    const payload: any = {
      title: value.title,
      description: value.description,
      funding_goal: parseFloat(value.fundingGoal),
      category: value.category,
      currency: value.currency,
      start_date: value.startDate.toISOString().split("T")[0],
      end_date: value.endDate.toISOString().split("T")[0],
    };

    // Attach company_id for new campaigns
    if (!isEditMode && value.companyId) {
      payload.company_id = value.companyId;
    }

    try {
      if (isEditMode && campaignToEdit) {
        const { data: responseData, error } = await campaignProvider.update(
          campaignToEdit.id,
          payload,
        );

        if (responseData?.project) {
          toast.success("Campagne modifiée avec succès");
          updateCampaignInList(responseData.project);
        } else {
          toast.error(error || "Erreur lors de la modification");
        }
      } else {
        const { data: responseData, error } =
          await campaignProvider.create(payload);

        if (responseData?.project) {
          toast.success(responseData.message || "Campagne créée avec succès");
          addCampaign(responseData.project);
        } else {
          toast.error(error || "Erreur lors de la création");
        }
      }

      reset();
      setPrefilled(false);
      toggle();
    } catch {
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full p-8 flex flex-col max-h-[80vh] bg-white">
      <div className="w-full flex items-center justify-between">
        <DialogTitle>
          {isEditMode ? "Modifier la campagne" : "Nouvelle campagne"}
        </DialogTitle>

        <span
          onClick={() => {
            reset();
            setPrefilled(false);
            toggle();
          }}
          className="w-8 h-8 flex items-center justify-center border border-primary/30 rounded-full cursor-pointer"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-primary"
          >
            <path
              d="M6 18L18 6M6 6L18 18"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 flex flex-col min-h-0 mt-4"
      >
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Title */}
          <Controller
            name="title"
            control={control}
            rules={{ required: "Le titre est requis" }}
            render={({ field }) => (
              <MUIInput
                {...field}
                label="Titre de la campagne"
                after={<div className="pr-4"></div>}
                className="pl-4"
              />
            )}
          />

          {/* Description */}
          <Controller
            name="description"
            control={control}
            rules={{ required: "La description est requise" }}
            render={({ field }) => (
              <MUITextarea
                {...field}
                label="Description de la campagne"
                className="min-h-[100px]"
                placeholder=" "
              />
            )}
          />

          {/* Funding Goal */}
          <Controller
            name="fundingGoal"
            control={control}
            rules={{ required: "L'objectif de financement est requis" }}
            render={({ field }) => (
              <MUIInput
                {...field}
                type="number"
                label="Objectif de financement"
                after={
                  <div className="pr-4">
                    <span className="text-gray-500 text-sm">
                      {getValues("currency") || "XOF"}
                    </span>
                  </div>
                }
                className="pl-4"
              />
            )}
          />

          {/* Company (only in create mode) */}
          {!isEditMode && (
            <div className="space-y-1">
              <Controller
                name="companyId"
                control={control}
                rules={{ required: "Veuillez sélectionner une entreprise" }}
                render={({ field }) => (
                  <>
                    {companies.length > 0 ? (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Sélectionner une entreprise" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.displayName} ({company.corporateForm})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="h-12 flex items-center px-3 rounded-md border border-input bg-white text-sm text-gray-400 cursor-not-allowed">
                        Aucune entreprise disponible
                      </div>
                    )}
                  </>
                )}
              />
              {companies.length === 0 && (
                <p className="text-xs text-gray-400 pl-1">
                  Créez d&apos;abord une entreprise depuis le tableau de bord
                </p>
              )}
            </div>
          )}

          {/* Category */}
          <Controller
            name="category"
            control={control}
            rules={{ required: "La catégorie est requise" }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {campaignCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {/* Currency */}
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Devise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XOF">XOF (F CFA)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />

          {/* Start Date */}
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <DatePicker {...field} label="Date de début" />
            )}
          />

          {/* End Date */}
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <DatePicker {...field} label="Date de fin" />
            )}
          />
        </div>

        <div className="mt-6 pt-4 border-t border-border flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              setPrefilled(false);
              toggle();
            }}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader className="animate-spin w-4 h-4" />
            ) : isEditMode ? (
              "Modifier"
            ) : (
              "Créer la campagne"
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
