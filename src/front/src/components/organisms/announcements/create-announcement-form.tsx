"use client";

import React, { useState } from "react";

interface CreateAnnouncementFormProps {
  onSubmit: (data: AnnouncementFormData) => void;
  isLoading?: boolean;
}

export interface AnnouncementFormData {
  title: string;
  texte: string;
  image?: File | null;
}

export default function CreateAnnouncementForm({
  onSubmit,
  isLoading = false,
}: CreateAnnouncementFormProps) {
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: "",
    texte: "",
    image: null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof AnnouncementFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFormData((prev) => ({ ...prev, image: file }));
  };

  const isValid = Boolean(formData.title && formData.texte);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm h-fit sticky top-6">
      <h2 className="text-lg font-MontserratBold mb-6">Création d'annonces</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Entrez le titre de l'annonce"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CCC0] focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        {/* Texte Textarea */}
        <div>
          <textarea
            value={formData.texte}
            onChange={(e) => handleChange("texte", e.target.value)}
            placeholder="Entrez le texte de l'annonce"
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CCC0] focus:border-transparent resize-none"
            disabled={isLoading}
          />
        </div>

        {/* Image (optional) */}
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors uppercase"
        >
          {isLoading ? "Publication..." : "Publier une annonce"}
        </button>
      </form>
    </div>
  );
}
