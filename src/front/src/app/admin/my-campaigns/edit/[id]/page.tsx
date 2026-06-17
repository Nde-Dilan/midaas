"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { campaignProvider } from "@/api/campaigns";
import CampaignCreationForm from "@/components/organisms/campaign-creation/campaign-creation-form";
import { ArrowLeft, Loader } from "lucide-react";
import { Button } from "@/components/atoms/button";
import Project from "@/entities/project/project";

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!campaignId) return;

    (async () => {
      setLoading(true);
      const { data, error } = await campaignProvider.getById(campaignId);
      if (data) {
        setCampaign(data);
      }
      setLoading(false);
    })();
  }, [campaignId]);

  if (loading) {
    return (
      <section className="p-6">
        <div className="max-w-[1200px] mx-auto mt-8 flex items-center justify-center min-h-[400px]">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (!campaign) {
    return (
      <section className="p-6">
        <div className="max-w-[1200px] mx-auto mt-8 text-center py-16">
          <p className="text-gray-500">Campaign not found</p>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/my-campaigns")}
            className="mt-4"
          >
            Back to My Campaigns
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="p-6">
      <div className="max-w-[1200px] mx-auto mt-8 space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/my-campaigns")}
          className="gap-2 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Campaigns
        </Button>

        <CampaignCreationForm
          campaign={campaign}
          onComplete={() => router.push("/admin/my-campaigns")}
        />
      </div>
    </section>
  );
}
