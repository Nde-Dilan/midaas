"use client";

import { useState, useEffect, Suspense } from "react";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import ServiceForm, {
  ServiceFormData,
} from "@/components/organisms/maintenance/service-form";

function EditServiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<
    Partial<ServiceFormData> | undefined
  >(undefined);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchServiceData = async () => {
      if (!serviceId) {
        toast.error("ID du service manquant");
        router.push("/admin/entretien");
        return;
      }

      setDataLoading(true);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data - replace with actual API response
        const mockServiceData: ServiceFormData = {
          title: "Nettoyage intérieur simple",
          price: "CHF 45",
          duration: "2h",
          activity1: "Lavage à l'eau & à la main",
          activity2: "Lavage à l'eau & à la main",
          activity3: "Lavage à l'eau & à la main",
          activity4: "Lavage à l'eau & à la main",
          activity5: "Lavage à l'eau & à la main",
          activity6: "Lavage à l'eau & à la main",
          activity7: "",
        };

        setInitialData(mockServiceData);
      } catch (error) {
        toast.error("Erreur lors du chargement du service");
        router.push("/admin/entretien");
      } finally {
        setDataLoading(false);
      }
    };

    fetchServiceData();
  }, [serviceId, router]);

  const handleSubmit = async (values: ServiceFormData) => {
    setLoading(true);

    try {
      // Collect all non-empty activities
      const features = [
        values.activity1,
        values.activity2,
        values.activity3,
        values.activity4,
        values.activity5,
        values.activity6,
        values.activity7,
      ].filter((activity) => activity.trim() !== "");

      const payload = {
        id: serviceId,
        name: values.title,
        price: values.price,
        duration: values.duration,
        features,
      };

      // TODO: Replace with actual API call
      console.log("Update service payload:", payload);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Service modifié avec succès!");
      router.push("/admin/entretien");
    } catch (error) {
      toast.error("Erreur lors de la modification du service");
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#50E3C2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-MontserratRegular">
            Chargement des données...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ServiceForm
      mode="edit"
      initialData={initialData}
      loading={loading}
      onSubmit={handleSubmit}
      onCancel={() => router.push("/admin/entretien")}
    />
  );
}

export default function EditMaintenanceServicePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#50E3C2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-MontserratRegular">
              Chargement...
            </p>
          </div>
        </div>
      }
    >
      <EditServiceContent />
    </Suspense>
  );
}
