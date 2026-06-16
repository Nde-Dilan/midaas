"use client";

import { campaignProvider } from "@/api/campaigns";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/molecules/table";
import useGetCampaigns from "@/hooks/useCampaigns";
import Project from "@/entities/project/project";
import { useCampaignsStore } from "@/store/campaigns";
import { ModalNames, useModalStore } from "@/store/modal";
import { useMemo, useState } from "react";
import {
  Plus,
  Eye,
  Edit3,
  Search,
  TrendingUp,
  Layers,
  Loader,
} from "lucide-react";

export default function MyCampaignsPage() {
  useGetCampaigns({ page: 1 });

  const { campaigns, count } = useCampaignsStore();
  const { openModal } = useModalStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [detailLoading, setDetailLoading] = useState<string | null>(null);

  const filteredCampaigns = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return campaigns.filter((campaign) => {
      const matchesSearch =
        campaign.title.toLowerCase().includes(normalized) ||
        campaign.category?.toLowerCase().includes(normalized) ||
        campaign.id.toLowerCase().includes(normalized);

      const matchesStatus =
        statusFilter === "all" || campaign.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [campaigns, search, statusFilter]);

  const handleViewDetails = async (campaign: Project) => {
    setDetailLoading(campaign.id);
    const { data, error } = await campaignProvider.getById(campaign.id);

    if (data) {
      openModal({
        name: ModalNames.CAMPAIGN_DETAILS,
        data: { campaign: data },
      });
    } else {
      // Fallback: use local data if fetch fails
      openModal({
        name: ModalNames.CAMPAIGN_DETAILS,
        data: { campaign },
      });
    }

    setDetailLoading(null);
  };

  const handleEdit = (campaign: Project) => {
    openModal({
      name: ModalNames.EDIT_CAMPAIGN,
      data: { campaign, type: "edit" },
    });
  };

  const handleAddCampaign = () => {
    openModal({ name: ModalNames.ADD_CAMPAIGN });
  };

  // Summary stats
  const totalFundingGoal = campaigns.reduce((sum, c) => sum + c.fundingGoal, 0);
  const totalFundingRaised = campaigns.reduce(
    (sum, c) => sum + c.fundingRaised,
    0,
  );
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const completedCampaigns = campaigns.filter(
    (c) => c.status === "completed" || c.status === "funded",
  ).length;

  return (
    <section className="p-6">
      <div className="max-w-[1400px] mx-auto mt-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-MontserratBold text-gray-900">
              My Campaigns
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage your crowdfunding projects
            </p>
          </div>
          <Button onClick={handleAddCampaign} className="gap-2">
            <Plus className="w-4 h-4" />
            New Campaign
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Total Campaigns</p>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Layers className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{count}</p>
          </div>

          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Total Goal</p>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">
              {totalFundingGoal.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">XOF</p>
          </div>

          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Raised</p>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">
              {totalFundingRaised.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">XOF</p>
          </div>

          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Active / Completed</p>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Loader className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">
              {activeCampaigns}
              <span className="text-gray-400 text-lg font-normal">
                {" "}
                / {completedCampaigns}
              </span>
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 bg-white p-4 rounded-xl border border-border items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Title, category or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
          <div className="w-48">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="funded">Funded</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b bg-gray-50">
                <TableHead className="font-semibold text-gray-700">
                  Title
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Category
                </TableHead>
                <TableHead className="font-semibold text-gray-700 text-right">
                  Goal
                </TableHead>
                <TableHead className="font-semibold text-gray-700 text-right">
                  Raised
                </TableHead>
                <TableHead className="font-semibold text-gray-700 text-center">
                  Progress
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-gray-700 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.length > 0 ? (
                filteredCampaigns.map((campaign) => (
                  <TableRow
                    key={campaign.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">
                          {campaign.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {campaign.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {campaign.category || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {campaign.fundingGoal.toLocaleString()}{" "}
                      <span className="text-xs text-gray-400">
                        {campaign.currency}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {campaign.fundingRaised.toLocaleString()}{" "}
                      <span className="text-xs text-gray-400">
                        {campaign.currency}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              campaign.progressPercentage >= 100
                                ? "bg-emerald-500"
                                : campaign.progressPercentage >= 50
                                  ? "bg-blue-500"
                                  : "bg-amber-500"
                            }`}
                            style={{
                              width: `${campaign.progressPercentage}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-500 w-8">
                          {campaign.progressPercentage}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${campaign.statusColor}`}
                      >
                        {campaign.statusLabel}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(campaign)}
                          disabled={detailLoading === campaign.id}
                          className="hover:bg-primary/5"
                        >
                          {detailLoading === campaign.id ? (
                            <Loader className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(campaign)}
                          className="hover:bg-primary/5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <Layers className="w-10 h-10 text-gray-300" />
                      <p className="text-gray-500 font-medium">
                        {search || statusFilter !== "all"
                          ? "No campaigns found"
                          : "You haven't created any campaigns yet"}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {search || statusFilter !== "all"
                          ? "Try adjusting your filters"
                          : "Click « New Campaign » to get started"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
