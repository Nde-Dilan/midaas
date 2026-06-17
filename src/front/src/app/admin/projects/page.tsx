"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { campaignProvider, type DiscoverProjectItem } from "@/api/campaigns";
import { Input } from "@/components/atoms/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/molecules/table";
import { Loader, Search, Grid3X3, List, AlertCircle } from "lucide-react";

const CATEGORIES = [
  "All",
  "Fintech",
  "Agribusiness",
  "Healthcare",
  "Energy",
  "Tech & Innovation",
  "Retail & Trade",
] as const;

const formatCurrency = (amount: number, currency = "XOF") =>
  `${new Intl.NumberFormat("en-US").format(amount)} ${currency}`;

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<DiscoverProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error: fetchError } =
        await campaignProvider.getPublicProjects();
      if (data) {
        setProjects(data.data ?? []);
      } else {
        setError(fetchError ?? "Failed to load projects");
      }
      setLoading(false);
    })();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const sector = p.company?.industry_sector ?? p.category ?? "";

      if (selectedCategory !== "All" && sector !== selectedCategory)
        return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesCompany = (p.company?.legal_name ?? "")
          .toLowerCase()
          .includes(q);
        const matchesSector = sector.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCompany && !matchesSector) return false;
      }
      return true;
    });
  }, [projects, searchQuery, selectedCategory]);

  const progress = useCallback(
    (p: DiscoverProjectItem) =>
      p.funding_goal > 0
        ? Math.round(((p.funding_raised ?? 0) / p.funding_goal) * 100)
        : 0,
    [],
  );

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-[#00CCC0]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-sm text-[#00CCC0] hover:underline font-MontserratSemiBold"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-MontserratSemiBold text-foreground">
            Explore Projects
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse verified investment opportunities. Click any project to view
            full details and invest.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex border border-border rounded-lg p-1 bg-white shadow-sm">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "grid"
                ? "text-[#00CCC0] bg-[#00CCC0]/10"
                : "text-gray-400 hover:text-gray-600"
            }`}
            title="Grid view"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "list"
                ? "text-[#00CCC0] bg-[#00CCC0]/10"
                : "text-gray-400 hover:text-gray-600"
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-border mb-6">
        <div className="w-full lg:max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-start lg:justify-end">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-[#00CCC0] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-border">
          <Search className="w-10 h-10 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">
            No projects match your filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="mt-3 text-xs text-[#00CCC0] hover:underline"
          >
            Reset filters
          </button>
        </div>
      )}

      {/* Grid view */}
      {filteredProjects.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const sector =
              project.company?.industry_sector ?? project.category ?? "";
            const pct = progress(project);

            return (
              <div
                key={project.id}
                onClick={() => router.push(`/admin/projects/${project.id}`)}
                className="group bg-white border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#00CCC0]/30 transition-all cursor-pointer flex flex-col"
              >
                {/* Cover image placeholder */}
                <div className="h-36 bg-gradient-to-br from-[#00CCC0]/5 to-[#00CCC0]/20 relative flex items-center justify-center">
                  {project.cover_image_url ? (
                    <img
                      src={project.cover_image_url}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="rgba(0,222,0,0.3)"
                        strokeWidth="1.5"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                  )}
                  {sector && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase bg-white/90 backdrop-blur-sm rounded-full text-gray-700">
                      {sector}
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-MontserratSemiBold text-sm text-foreground group-hover:text-[#00CCC0] transition-colors line-clamp-1 mb-1">
                    {project.title}
                  </h3>
                  {project.company && (
                    <p className="text-xs text-muted-foreground mb-3">
                      {project.company.trade_name || project.company.legal_name}{" "}
                      · {project.company.corporate_form}
                    </p>
                  )}

                  {/* Funding progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-foreground">
                        {formatCurrency(
                          project.funding_raised ?? 0,
                          project.currency,
                        )}
                      </span>
                      <span className="text-muted-foreground">
                        of{" "}
                        {formatCurrency(project.funding_goal, project.currency)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 100
                            ? "bg-green-500"
                            : pct >= 50
                              ? "bg-blue-500"
                              : "bg-amber-500"
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <p className="text-right text-[10px] text-gray-400 mt-0.5">
                      {pct}%
                    </p>
                  </div>

                  {/* ROI badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.short_term_roi && (
                      <span className="px-2 py-0.5 text-[10px] font-MontserratSemiBold bg-emerald-50 text-emerald-700 rounded-full">
                        {project.short_term_roi}% ST ROI
                      </span>
                    )}
                    {project.medium_term_roi && (
                      <span className="px-2 py-0.5 text-[10px] font-MontserratSemiBold bg-blue-50 text-blue-700 rounded-full">
                        {project.medium_term_roi}% MT ROI
                      </span>
                    )}
                    {project.long_term_roi && (
                      <span className="px-2 py-0.5 text-[10px] font-MontserratSemiBold bg-purple-50 text-purple-700 rounded-full">
                        {project.long_term_roi}% LT ROI
                      </span>
                    )}
                  </div>

                  <div className="flex-1" />

                  {/* Investor count & CTA */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-[11px] text-gray-400">
                      {project.investor_count ?? 0} investor
                      {project.investor_count !== 1 ? "s" : ""}
                    </span>
                    <span className="text-[11px] font-MontserratSemiBold text-[#00CCC0] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      View details
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {filteredProjects.length > 0 && viewMode === "list" && (
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70">
                <TableHead className="pl-6">Project</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Funding Progress</TableHead>
                <TableHead className="pr-6">ROI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => {
                const sector =
                  project.company?.industry_sector ?? project.category ?? "";
                const pct = progress(project);

                return (
                  <TableRow
                    key={project.id}
                    className="cursor-pointer hover:bg-slate-50/80 transition-colors group"
                    onClick={() => router.push(`/admin/projects/${project.id}`)}
                  >
                    <TableCell className="pl-6">
                      <div className="flex flex-col">
                        <span className="font-MontserratSemiBold text-sm text-foreground group-hover:text-[#00CCC0] transition-colors line-clamp-1">
                          {project.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {project.company?.trade_name ??
                          project.company?.legal_name ??
                          "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium">
                        {sector || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col max-w-[180px]">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-foreground">
                            {formatCurrency(
                              project.funding_raised ?? 0,
                              project.currency,
                            )}
                          </span>
                          <span className="text-muted-foreground">{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pct >= 100
                                ? "bg-green-500"
                                : pct >= 50
                                  ? "bg-blue-500"
                                  : "bg-amber-500"
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          Goal:{" "}
                          {formatCurrency(
                            project.funding_goal,
                            project.currency,
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex flex-wrap gap-1">
                        {project.short_term_roi && (
                          <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                            ST {project.short_term_roi}%
                          </span>
                        )}
                        {project.medium_term_roi && (
                          <span className="text-[10px] font-medium bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                            MT {project.medium_term_roi}%
                          </span>
                        )}
                        {!project.short_term_roi &&
                          !project.medium_term_roi && (
                            <span className="text-xs text-muted-foreground">
                              -
                            </span>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
