"use client";

import { useModalStore } from "@/store/modal";
import { DialogTitle } from "../../modal";
import CampaignCreationForm from "@/components/organisms/campaign-creation/campaign-creation-form";
import Project from "@/entities/project/project";

export default function AddCampaignModal() {
  const { toggle, data } = useModalStore();

  const isEditMode = data?.type === "edit";
  const campaignToEdit = data?.campaign as Project | undefined;

  return (
    <section className="w-full p-8 flex flex-col max-h-[80vh] bg-white">
      <div className="w-full flex items-center justify-between mb-4">
        <DialogTitle>
          {isEditMode ? "Edit Campaign" : "New Campaign"}
        </DialogTitle>
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
            className="text-[#00CCC0]"
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

      <div className="flex-1 overflow-y-auto">
        <CampaignCreationForm
          campaign={isEditMode ? campaignToEdit : undefined}
          onComplete={() => toggle()}
        />
      </div>
    </section>
  );
}
