"use client";

import { Input } from "@/components/atoms/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/molecules/table";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface IProject {
  id: string;
  title: string;
  entrepreneur: string;
  category:
    | "Agribusiness"
    | "Tech & Innovation"
    | "Retail & Trade"
    | "Healthcare"
    | "Energy";
  targetAmount: number;
  raisedAmount: number;
  currentMilestone: string;
  completionPercentage: number;
  status: "Active" | "Completed" | "Paused";
  location: string;
}

const mockProjects: IProject[] = [
  {
    id: "PRJ-2026-01",
    title: "Eco-Friendly Cold Hubs for Local Markets",
    entrepreneur: "Amadou Diallo",
    category: "Agribusiness",
    targetAmount: 25000,
    raisedAmount: 18750,
    currentMilestone: "Solar Panel Installation",
    completionPercentage: 75,
    status: "Active",
    location: "Yaoundé, Cameroon",
  },
  {
    id: "PRJ-2026-02",
    title: "Fintech Platform for Rural Micro-Loans",
    entrepreneur: "Nde Hurich",
    category: "Tech & Innovation",
    targetAmount: 50000,
    raisedAmount: 50000,
    currentMilestone: "Regulatory Sandbox Clearance",
    completionPercentage: 100,
    status: "Completed",
    location: "Douala, Cameroon",
  },
  {
    id: "PRJ-2026-03",
    title: "Solar-Powered Water Purification Units",
    entrepreneur: "Florence Obi",
    category: "Energy",
    targetAmount: 35000,
    raisedAmount: 10500,
    currentMilestone: "Prototype Logistics Assembly",
    completionPercentage: 30,
    status: "Active",
    location: "Garoua, Cameroon",
  },
  {
    id: "PRJ-2026-04",
    title: "Bantu Language E-Learning Core System",
    entrepreneur: "Linguistic Tech Lab",
    category: "Tech & Innovation",
    targetAmount: 15000,
    raisedAmount: 4500,
    currentMilestone: "NER Dataset Validation",
    completionPercentage: 30,
    status: "Paused",
    location: "Yaoundé, Cameroon",
  },
];

const CATEGORIES = [
  "All",
  "Agribusiness",
  "Tech & Innovation",
  "Retail & Trade",
  "Healthcare",
  "Energy",
] as const;

export default function ValidatedProjectsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredProjects = useMemo(() => {
    return mockProjects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.entrepreneur
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        project.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || project.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Top Static Context Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-MontserratSemiBold text-foreground">
            Validated Projects
          </h1>
          <p className="text-sm text-muted-foreground">
            Live and finalized crowdfunding operations. Click any project entry
            to inspect audited milestones.
          </p>
        </div>

        {/* Toggle View Controller */}
        <div className="flex border border-border rounded-lg p-1 bg-white shadow-sm self-end md:self-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "grid"
                ? "text-[#50E3C2]"
                : "text-black hover:bg-slate-100"
            }`}
            title="Grid Layout"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "list"
                ? "text-[#50E3C2]"
                : "text-black hover:bg-slate-100"
            }`}
            title="List Layout"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Query Filter Blocks */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-border mb-6">
        <div className="w-full lg:max-w-md">
          <Input
            placeholder="Filter by title, ID or entrepreneur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Dynamic Category Horizon Filters */}
        <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-start lg:justify-end">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === category
                  ? "bg-black text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Main Campaign Render Layouts */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-border">
          <p className="text-muted-foreground text-sm">
            No validated items match your search criteria.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID LAYOUT MODE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group bg-white border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between cursor-pointer"
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] uppercase font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
                    {project.category}
                  </span>
                  <span
                    className={`text-[10px] font-MontserratSemiBold uppercase tracking-wider px-2 py-0.5 rounded ${
                      project.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : project.status === "Completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                <h3 className="font-MontserratSemiBold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
                  {project.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  By {project.entrepreneur}
                </p>

                {/* Milestone Linear Tracker */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">
                      Milestone Progress
                    </span>
                    <span className="text-foreground">
                      {project.completionPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300"
                      style={{ width: `${project.completionPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                  <span className="font-semibold block text-slate-500 text-[10px] uppercase tracking-tight">
                    Current Milestone Goal
                  </span>
                  <span className="text-slate-700 font-medium line-clamp-1">
                    {project.currentMilestone}
                  </span>
                </div>
              </div>

              {/* Data Values Context Footer Row */}
              <div className="px-5 py-3 bg-slate-50 border-t border-border flex justify-between items-center text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">
                    Raised / Target
                  </span>
                  <span className="font-mono font-semibold text-foreground">
                    ${project.raisedAmount.toLocaleString()} / $
                    {project.targetAmount.toLocaleString()}
                  </span>
                </div>
                <span className="text-[11px] text-primary font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  View Details
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
            </Link>
          ))}
        </div>
      ) : (
        /* LIST LAYOUT MODE */
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70 pointer-events-none select-none">
                <TableHead className="pl-6">Project Specifications</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Active Milestone Target</TableHead>
                <TableHead>Funding Matrix Balance</TableHead>
                <TableHead className="pr-6">State Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow
                  key={project.id}
                  className="cursor-pointer hover:bg-slate-50/80 transition-colors group"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <TableCell className="pl-6">
                    <div className="flex flex-col">
                      <span className="font-MontserratSemiBold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {project.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {project.id} • {project.entrepreneur}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium">
                      {project.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col max-w-[220px]">
                      <span className="text-xs text-slate-700 truncate font-medium">
                        {project.currentMilestone}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {project.completionPercentage}% Processed
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-semibold text-foreground">
                        ${project.raisedAmount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Target: ${project.targetAmount.toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="pr-6">
                    <span
                      className={`text-[10px] font-MontserratSemiBold uppercase tracking-wider px-2 py-1 rounded-md ${
                        project.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : project.status === "Completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {project.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
