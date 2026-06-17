"use client";

import { useForm, Controller } from "react-hook-form";
import { Loader } from "lucide-react";

export type ServiceFormData = {
  title: string;
  price: string;
  duration: string;
  activity1: string;
  activity2: string;
  activity3: string;
  activity4: string;
  activity5: string;
  activity6: string;
  activity7: string;
};

interface ServiceFormProps {
  mode: "create" | "edit";
  initialData?: Partial<ServiceFormData>;
  loading: boolean;
  onSubmit: (data: ServiceFormData) => void | Promise<void>;
  onCancel?: () => void;
}

const durations = [
  "30 min",
  "1h",
  "1h30",
  "2h",
  "2h30",
  "3h",
  "3h30",
  "4h",
  "5h",
  "6h",
  "8h",
  "Journée complète",
];

export default function ServiceForm({
  mode,
  initialData,
  loading,
  onSubmit,
  onCancel,
}: ServiceFormProps) {
  const { handleSubmit, control, watch } = useForm<ServiceFormData>({
    defaultValues: {
      title: initialData?.title || "",
      price: initialData?.price || "",
      duration: initialData?.duration || "",
      activity1: initialData?.activity1 || "",
      activity2: initialData?.activity2 || "",
      activity3: initialData?.activity3 || "",
      activity4: initialData?.activity4 || "",
      activity5: initialData?.activity5 || "",
      activity6: initialData?.activity6 || "",
      activity7: initialData?.activity7 || "",
    },
  });

  // Watch form values for validation
  const title = watch("title");
  const price = watch("price");
  const duration = watch("duration");

  const isFormValid = title && price && duration;

  return (
    <section className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-MontserratBold text-gray-900">
          {mode === "create"
            ? "Nouveaux service d'entretien"
            : "Modification des informations d'un service"}
        </h1>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="flex-1 bg-white rounded-xl shadow-sm p-8 overflow-y-auto scrollable">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Service Title and Price Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service Title */}
              <div>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Entrez l'intitulé su service"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50E3C2] focus:border-transparent"
                      disabled={loading}
                    />
                  )}
                />
              </div>

              {/* Price */}
              <div>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Entrez le prix"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50E3C2] focus:border-transparent"
                      disabled={loading}
                    />
                  )}
                />
              </div>
            </div>

            {/* Duration and Activity 1 Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Duration */}
              <div>
                <Controller
                  name="duration"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50E3C2] focus:border-transparent bg-white appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 1rem center",
                      }}
                      disabled={loading}
                    >
                      <option value="">Durée</option>
                      {durations.map((duration) => (
                        <option key={duration} value={duration}>
                          {duration}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>

              {/* Activity 1 */}
              <div>
                <Controller
                  name="activity1"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Activité 1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50E3C2] focus:border-transparent"
                      disabled={loading}
                    />
                  )}
                />
              </div>
            </div>

            {/* Activities 2-7 in pairs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Activity 2 */}
              <div>
                <Controller
                  name="activity2"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Activité 2"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50E3C2] focus:border-transparent"
                      disabled={loading}
                    />
                  )}
                />
              </div>

              {/* Activity 3 */}
              <div>
                <Controller
                  name="activity3"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Activité 3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50E3C2] focus:border-transparent"
                      disabled={loading}
                    />
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Activity 4 */}
              <div>
                <Controller
                  name="activity4"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Activité 4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50E3C2] focus:border-transparent"
                      disabled={loading}
                    />
                  )}
                />
              </div>

              {/* Activity 5 */}
              <div>
                <Controller
                  name="activity5"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Activité 5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50E3C2] focus:border-transparent"
                      disabled={loading}
                    />
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Activity 6 */}
              <div>
                <Controller
                  name="activity6"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Activité 6"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50E3C2] focus:border-transparent"
                      disabled={loading}
                    />
                  )}
                />
              </div>

              {/* Activity 7 */}
              <div>
                <Controller
                  name="activity7"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Activité 7"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50E3C2] focus:border-transparent"
                      disabled={loading}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Submit Button */}
        <div className="mt-6 flex justify-center gap-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-12 py-4 bg-gray-200 text-gray-700 text-sm font-MontserratBold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wide"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="px-12 py-4 bg-black text-white text-sm font-MontserratBold rounded-lg hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors uppercase tracking-wide flex items-center gap-3"
          >
            {loading && <Loader className="w-5 h-5 animate-spin" />}
            {loading
              ? mode === "create"
                ? "Ajout en cours..."
                : "Modification en cours..."
              : mode === "create"
                ? "Ajouter un service"
                : "Modifier les informations"}
          </button>
        </div>
      </form>
    </section>
  );
}
