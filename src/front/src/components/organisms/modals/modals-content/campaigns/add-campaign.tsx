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
            {isEditMode ? "Edit Campaign" : "New Campaign"}
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
            stroke="currentColor"
            className="text-[#00de00]"
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
            rules={{ required: "Title is required" }}
            render={({ field }) => (
              <MUIInput
                {...field}
                label="Campaign Title"
                after={<div className="pr-4"></div>}
                className="pl-4"
              />
            )}
          />

          {/* Description */}
          <Controller
            name="description"
            control={control}
            rules={{ required: "Description is required" }}
            render={({ field }) => (
              <MUITextarea
                {...field}
                label="Campaign Description"
                className="min-h-[100px]"
                placeholder=" "
              />
            )}
          />

          {/* Funding Goal */}
          <Controller
            name="fundingGoal"
            control={control}
            rules={{ required: "Funding goal is required" }}
            render={({ field }) => (
              <MUIInput
                {...field}
                type="number"
                label="Funding Goal"
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
                rules={{ required: "Please select a company" }}
                render={({ field }) => (
                  <>
                    {companies.length > 0 ? (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select a company" />
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
                        No company available
                      </div>
                    )}
                  </>
                )}
              />
              {companies.length === 0 && (
                <p className="text-xs text-gray-400 pl-1">
                  Create a company first from your dashboard
                </p>
              )}
            </div>
          )}

          {/* Category */}
          <Controller
            name="category"
            control={control}
            rules={{ required: "Category is required" }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select a category" />
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
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XOF">XOF (CFA Franc)</SelectItem>
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
              <DatePicker {...field} label="Start Date" />
            )}
          />

          {/* End Date */}
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <DatePicker {...field} label="End Date" />
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
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader className="animate-spin w-4 h-4" />
            ) : isEditMode ? (
              "Save Changes"
            ) : (
              "Create Campaign"
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
