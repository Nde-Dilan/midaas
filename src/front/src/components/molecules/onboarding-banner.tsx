"use client";

import { authProvider } from "@/api/auth";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/atoms/button";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  Briefcase,
  TrendingUp,
  Loader,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface Props {
  onDismiss?: () => void;
}

export default function OnboardingBanner({ onDismiss }: Props) {
  const { user, loadUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Don't show if user already made a choice (via API or localStorage)
  const storedRole =
    typeof window !== "undefined" ? localStorage.getItem("midaas_role") : null;
  if (
    !user ||
    dismissed ||
    user.isEntrepreneur ||
    user.entrepreneurStatus === "pending" ||
    storedRole
  ) {
    return null;
  }

  const handleBecomeEntrepreneur = async () => {
    setLoading(true);

    const { data, error } = await authProvider.becomeEntrepreneur();

    if (data) {
      localStorage.setItem("midaas_role", "entrepreneur");
      toast.success("Application submitted! Awaiting approval.");
      // Refresh user to get updated profile with entrepreneur status
      const { data: refreshed } = await authProvider.refreshUser();

      if (refreshed?.user) {
        loadUser(refreshed.user);
      }

      setDismissed(true);
    } else {
      toast.error(error || "An error occurred");
    }

    setLoading(false);
  };

  const handleStayInvestor = () => {
    localStorage.setItem("midaas_role", "investor");
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#5E0E08] via-[#7A1A12] to-[#5E0E08] p-[2px]">
      <div className="relative bg-white rounded-2xl p-6">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#00de00]/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#00de00]/5 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />

        {/* Close button */}
        <button
          onClick={handleStayInvestor}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Icon */}
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00de00] to-[#E0B004] flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-[#5E0E08]" />
          </div>

          {/* Text */}
          <div className="flex-1">
            <h3 className="text-xl font-MontserratBold text-gray-900">
              Welcome to Midaas!
            </h3>
            <p className="text-gray-600 mt-1 max-w-2xl text-sm leading-relaxed">
              Choose how you&apos;d like to participate in our crowdfunding
              platform. You can change your mind at any time.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button
              onClick={handleBecomeEntrepreneur}
              disabled={loading}
              className="gap-2 bg-gradient-to-r from-[#5E0E08] to-[#7A1A12] hover:from-[#7A1A12] hover:to-[#5E0E08] text-white shadow-lg min-w-[200px]"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Briefcase className="w-4 h-4" />
                  I&apos;m an Entrepreneur
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <Button
              onClick={handleStayInvestor}
              variant="outline"
              className="gap-2 border-[#5E0E08]/20 text-[#5E0E08] hover:bg-[#5E0E08]/5 min-w-[200px]"
            >
              <TrendingUp className="w-4 h-4" />
              I&apos;m an Investor
            </Button>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00de00]/10 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-4 h-4 text-[#00de00]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Entrepreneur
              </p>
              <p className="text-xs text-gray-500">
                Create campaigns and secure funding
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00de00]/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-[#00de00]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Investor</p>
              <p className="text-xs text-gray-500">
                Explore and invest in promising projects
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00de00]/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-[#00de00]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Simple & Secure
              </p>
              <p className="text-xs text-gray-500">
                Track your investments in real time
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
