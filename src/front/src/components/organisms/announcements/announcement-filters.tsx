"use client";

import { useState } from "react";

interface AnnouncementFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
}

export interface FilterValues {
  search: string;
  type: string;
  status: string;
  location: string;
}

export default function AnnouncementFilters({
  onFilterChange,
}: AnnouncementFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    type: "all",
    status: "all",
    location: "",
  });

  const handleChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterValues = {
      search: "",
      type: "all",
      status: "all",
      location: "",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.type !== "all" ||
    filters.status !== "all" ||
    filters.location !== "";

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rechercher
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleChange("search", e.target.value)}
              placeholder="Titre, localisation..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50E3C2] focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de bien
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleChange("type", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50E3C2] focus:border-transparent bg-white"
          >
            <option value="all">Tous les types</option>
            <option value="appartement">Appartement</option>
            <option value="villa">Villa</option>
            <option value="studio">Studio</option>
            <option value="local">Local commercial</option>
            <option value="terrain">Terrain</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statut
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50E3C2] focus:border-transparent bg-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="pending">En attente</option>
            <option value="expired">Expiré</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">Filtres actifs</p>
          <button
            onClick={handleReset}
            className="text-sm text-[#50E3C2] hover:underline font-medium"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}
