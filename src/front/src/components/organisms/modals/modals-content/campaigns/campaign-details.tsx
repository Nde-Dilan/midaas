"use client";

import { useModalStore, ModalNames } from "@/store/modal";
import { Button } from "@/components/atoms/button";
import { DialogTitle } from "../../modal";
import { useState, useEffect } from "react";
import { campaignProvider } from "@/api/campaigns";
import { toast } from "react-toastify";
import { Loader, Plus, Trash2 } from "lucide-react";
import Project from "@/entities/project/project";
import Milestone from "@/entities/project/milestone";
import { useCampaignsStore } from "@/store/campaigns";

export default function CampaignDetailsModal() {
  const { toggle, data, openModal } = useModalStore();
  const { updateCampaignInList } = useCampaignsStore();
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState<Project | null>(
    (data?.campaign as Project) ?? null,
  );
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    if (data?.campaign) {
      const c = data.campaign as Project;
      setCampaign(c);
      loadMilestones(c.id);
    }
  }, [data?.campaign]);

  const loadMilestones = async (projectId: string) => {
    setLoading(true);
    const { data: milestonesData, error } =
      await campaignProvider.getMilestones(projectId);

    if (milestonesData) {
      setMilestones(milestonesData);
    } else {
      console.error(error);
    }
    setLoading(false);
  };

  const handleEdit = () => {
    toggle();
    openModal({
      name: ModalNames.EDIT_CAMPAIGN,
      data: { campaign, type: "edit" },
    });
  };

  const handleAddMilestone = () => {
    if (!campaign) return;
    openModal({
      name: ModalNames.ADD_MILESTONE,
      data: { projectId: campaign.id },
    });
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!campaign) return;
    if (!confirm("Are you sure you want to delete this milestone?")) return;

    const { data: result, error } = await campaignProvider.removeMilestone(
      campaign.id,
      milestoneId,
    );

    if (result) {
      toast.success("Milestone deleted successfully");
      setMilestones((prev) => prev.filter((m) => m.id !== milestoneId));
    } else {
      toast.error(error);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!campaign) return;
    if (
      !confirm(
        "Are you sure you want to delete this campaign? This action is irreversible.",
      )
    )
      return;

    setLoading(true);
    const { data: result, error } = await campaignProvider.remove(campaign.id);

    if (result) {
      toast.success("Campaign deleted successfully");
      toggle();
    } else {
      toast.error(error);
    }
    setLoading(false);
  };

  if (!campaign) {
    return (
      <section className="w-full p-8 bg-white">
        <div className="flex items-center justify-center h-32">
          <Loader className="animate-spin" />
        </div>
      </section>
    );
  }

  const totalAllocated = milestones.reduce(
    (sum, m) => sum + m.fundAllocation,
    0,
  );
  const completedMilestones = milestones.filter(
    (m) => m.status === "approved" || m.status === "paid",
  ).length;

  return (
    <section className="w-full p-8 flex flex-col max-h-[85vh] bg-white">
      <div className="w-full flex items-center justify-between">
        <DialogTitle>{campaign.title}</DialogTitle>
        <span
          onClick={() => toggle()}
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

      <div className="flex-1 overflow-y-auto mt-4 space-y-6 pr-2">
        {/* Status & Progress */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${campaign.statusColor}`}
            >
              {campaign.statusLabel}
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Progress</p>
            <p className="text-xl font-bold mt-1">
              {campaign.progressPercentage}%
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Goal</p>
            <p className="text-lg font-semibold mt-1">
              {campaign.fundingGoal.toLocaleString()}{" "}
              <span className="text-sm text-gray-500">{campaign.currency}</span>
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Raised</p>
            <p className="text-lg font-semibold mt-1">
              {campaign.fundingRaised.toLocaleString()}{" "}
              <span className="text-sm text-gray-500">{campaign.currency}</span>
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Description</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {campaign.description}
          </p>
        </div>

        {/* Category & Dates */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Category:</span>
            <span className="ml-2 font-medium">{campaign.category}</span>
          </div>
          <div>
            <span className="text-gray-500">Currency:</span>
            <span className="ml-2 font-medium">{campaign.currency}</span>
          </div>
          {campaign.startDate && (
            <div>
              <span className="text-gray-500">Start:</span>
              <span className="ml-2 font-medium">
                {campaign.startDate.toLocaleDateString()}
              </span>
            </div>
          )}
          {campaign.endDate && (
            <div>
              <span className="text-gray-500">End:</span>
              <span className="ml-2 font-medium">
                {campaign.endDate.toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Milestones Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">
              Milestones ({milestones.length})
            </h3>
            <Button
              type="button"
              size="sm"
              onClick={handleAddMilestone}
              className="gap-1"
            >
              <Plus className="w-3 h-3" />
              Add
            </Button>
          </div>

          {loading && milestones.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="animate-spin" />
            </div>
          ) : milestones.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 text-sm">
                No milestones defined for this campaign
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Milestones allow you to release funds progressively as goals are
                met
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500 px-2 mb-1">
                <span>
                  {completedMilestones}/{milestones.length} completed
                </span>
                <span>
                  Allocated: {totalAllocated.toLocaleString()}{" "}
                  {campaign.currency}
                </span>
              </div>
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {milestone.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {milestone.fundAllocation.toLocaleString()}{" "}
                        {campaign.currency}
                        {milestone.dueDate &&
                          ` — Due: ${milestone.dueDate.toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${milestone.statusColor}`}
                    >
                      {milestone.statusLabel}
                    </span>
                    <button
                      onClick={() => handleDeleteMilestone(milestone.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleDeleteCampaign}
          disabled={loading}
        >
          Delete
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => toggle()}>
            Close
          </Button>
          <Button type="button" onClick={handleEdit}>
            Edit
          </Button>
        </div>
      </div>
    </section>
  );
}
