"use client";

import { useEffect, useState } from "react";
import { adminProvider } from "@/api/admin";
import { useAdminStore } from "@/store/admin";
import { Button } from "@/components/atoms/button";
import Link from "next/link";
import {
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  User,
  ChevronRight,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { toast } from "react-toastify";

export default function AdminPendingCampaignsPage() {
  const { pendingProjects, setPendingProjects, setPendingProjectsLoading } =
    useAdminStore();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    setPendingProjectsLoading(true);
    const { data, error } = await adminProvider.getPendingProjects();
    if (data) {
      setPendingProjects(data);
    } else {
      toast.error(error || "Failed to load projects");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (pendingProjects.length === 0) fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = pendingProjects.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.company?.legal_name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  const totalGoal = pendingProjects.reduce(
    (s, p) => s + (p.funding_goal ?? 0),
    0,
  );

  return (
    <section className="p-6">
      <div className="max-w-[1400px] mx-auto mt-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-MontserratBold text-gray-900">
              Campaign Review Queue
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Review and approve/reject submitted investment campaigns
            </p>
          </div>
          <Button
            onClick={fetchProjects}
            variant="outline"
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#50E3C2]/20 focus:border-[#50E3C2] transition-all"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Pending Review</p>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{pendingProjects.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Total Funding Goal</p>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">
              {totalGoal.toLocaleString()} XOF
            </p>
          </div>
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Categories</p>
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Layers className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">
              {
                new Set(pendingProjects.map((p) => p.category).filter(Boolean))
                  .size
              }
            </p>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {loading && pendingProjects.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-300" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="flex flex-col items-center gap-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-200" />
                <p className="text-gray-500 font-MontserratSemiBold text-lg">
                  No campaigns pending review
                </p>
                <p className="text-gray-400 text-sm max-w-md">
                  All submitted campaigns have been processed.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((project) => (
                <Link
                  key={project.id}
                  href={`/admin/campaigns/pending/${project.id}`}
                  className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center flex-shrink-0 border border-blue-100">
                      <Layers className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-MontserratSemiBold text-gray-900 truncate">
                          {project.title}
                        </h3>
                        {project.status && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-amber-100 text-amber-800 border-amber-200">
                            <Clock className="w-3 h-3" />
                            {project.status}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500 flex-wrap">
                        {project.company?.legal_name && (
                          <span>{project.company.legal_name}</span>
                        )}
                        {project.category && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span>{project.category}</span>
                          </>
                        )}
                        {project.funding_goal && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span className="inline-flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5" />
                              {project.funding_goal.toLocaleString()} XOF
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
