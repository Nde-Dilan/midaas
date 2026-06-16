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
import { companyProvider } from "@/api/company";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/auth";
import { useCompanyStore } from "@/store/company";
import { Loader, Building2 } from "lucide-react";

const corporateForms = ["ETS", "SARL", "SA", "SAS"];

const industrySectors = [
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

type ICompanyForm = {
  legal_name: string;
  trade_name: string;
  corporate_form: string;
  industry_sector: string;
  physical_address: string;
};

export default function AddCompanyModal() {
  const { toggle } = useModalStore();
  const { user } = useAuthStore();
  const { addCompany } = useCompanyStore();

  const { handleSubmit, control, reset } = useForm<ICompanyForm>({
    defaultValues: {
      legal_name: "",
      trade_name: "",
      corporate_form: "",
      industry_sector: "",
      physical_address: "",
    },
  });

  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<ICompanyForm> = async (value) => {
    if (!user) {
      toast.error("Vous devez être connecté");
      return;
    }

    if (!user.isEntrepreneur) {
      toast.error("Vous devez être entrepreneur pour créer une entreprise");
      return;
    }

    setLoading(true);

    const payload = {
      legal_name: value.legal_name,
      trade_name: value.trade_name || undefined,
      corporate_form: value.corporate_form,
      industry_sector: value.industry_sector || undefined,
      physical_address: value.physical_address || undefined,
    };

    try {
      const { data, error } = await companyProvider.create(payload);

      if (data?.company) {
        toast.success(data.message || "Entreprise créée avec succès");
        addCompany(data.company);
        reset();
        toggle();
      } else {
        toast.error(error || "Erreur lors de la création de l'entreprise");
      }
    } catch {
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full p-8 flex flex-col max-h-[80vh] bg-white">
      <div className="w-full flex items-center justify-between">
        <DialogTitle>Créer une entreprise</DialogTitle>

        <span
          onClick={() => {
            reset();
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
          {/* Legal Name */}
          <Controller
            name="legal_name"
            control={control}
            rules={{ required: "Le nom légal est requis" }}
            render={({ field }) => (
              <MUIInput
                {...field}
                label="Nom légal de l'entreprise"
                after={<div className="pr-4"></div>}
                className="pl-4"
              />
            )}
          />

          {/* Trade Name */}
          <Controller
            name="trade_name"
            control={control}
            render={({ field }) => (
              <MUIInput
                {...field}
                label="Nom commercial (optionnel)"
                after={<div className="pr-4"></div>}
                className="pl-4"
              />
            )}
          />

          {/* Corporate Form */}
          <Controller
            name="corporate_form"
            control={control}
            rules={{ required: "La forme juridique est requise" }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Forme juridique" />
                </SelectTrigger>
                <SelectContent>
                  {corporateForms.map((form) => (
                    <SelectItem key={form} value={form}>
                      {form}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {/* Industry Sector */}
          <Controller
            name="industry_sector"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Secteur d'activité (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  {industrySectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {/* Physical Address */}
          <Controller
            name="physical_address"
            control={control}
            render={({ field }) => (
              <MUITextarea
                {...field}
                label="Adresse physique (optionnel)"
                className="min-h-[80px]"
                placeholder=" "
              />
            )}
          />
        </div>

        <div className="mt-6 pt-4 border-t border-border flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              toggle();
            }}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader className="animate-spin w-4 h-4" />
            ) : (
              <>
                <Building2 className="w-4 h-4" />
                Créer l'entreprise
              </>
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
