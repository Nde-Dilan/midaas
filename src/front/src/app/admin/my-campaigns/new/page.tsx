"use client";

import { useRouter } from "next/navigation";
import CampaignCreationForm from "@/components/organisms/campaign-creation/campaign-creation-form";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/atoms/button";

export default function NewCampaignPage() {
  const router = useRouter();

  return (
    <section className="p-6">
      <div className="max-w-[1200px] mx-auto mt-8 space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/my-campaigns")}
          className="gap-2 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Campaigns
        </Button>

        <CampaignCreationForm
          onComplete={() => router.push("/admin/my-campaigns")}
        />
      </div>
    </section>
  );
}
