"use client";

import { useState, useEffect, useMemo } from "react";
import { useModalStore } from "@/store/modal";
import { Button } from "@/components/atoms/button";
import { DialogTitle } from "../../modal";
import { campaignProvider } from "@/api/campaigns";
import { toast } from "react-toastify";
import { Loader, CheckCircle, XCircle, Globe } from "lucide-react";
import {
  detectCountryFromMsisdn,
  getProvidersForCountry,
  getCountryName,
  fetchActiveProviders,
} from "@/services/pawapay-service";

type Step = "form" | "confirming" | "success" | "error";

export default function InvestModal() {
  const { toggle, data } = useModalStore();
  const projectId = data?.projectId as string;
  const projectTitle = data?.projectTitle as string;
  const fundingGoal = data?.fundingGoal as number;
  const fundingRaised = data?.fundingRaised as number;
  const currency = (data?.currency as string) ?? "XOF";

  const [step, setStep] = useState<Step>("form");
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [provider, setProvider] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, any> | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Dynamic provider detection
  const [availableProviders, setAvailableProviders] = useState<
    { value: string; label: string; currency: string }[]
  >([]);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [providersLoading, setProvidersLoading] = useState(true);

  // Fetch PawaPay providers on mount
  useEffect(() => {
    (async () => {
      setProvidersLoading(true);
      await fetchActiveProviders();
      setProvidersLoading(false);
    })();
  }, []);

  // Detect country and update providers when phone number changes
  useEffect(() => {
    const digits = phoneNumber.replace(/[^0-9]/g, "");
    if (digits.length >= 4) {
      const country = detectCountryFromMsisdn(digits);
      setDetectedCountry(country);
      if (country) {
        const providers = getProvidersForCountry(country);
        if (providers && providers.length > 0) {
          setAvailableProviders(providers);
          // Auto-select first provider if current selection is invalid
          setProvider((prev) =>
            providers.some((p) => p.value === prev) ? prev : providers[0].value,
          );
          return;
        }
      }
    }
    setAvailableProviders([]);
    setDetectedCountry(null);
  }, [phoneNumber]);

  const remaining = fundingGoal - fundingRaised;
  const parsedAmount = parseFloat(amount) || 0;
  const feeAmount = parsedAmount * 0.05;
  const totalCharge = parsedAmount + feeAmount;
  const digitsOnly = phoneNumber.replace(/[^0-9]/g, "");
  const isValid =
    parsedAmount >= 1000 &&
    parsedAmount <= remaining &&
    digitsOnly.length >= 8 &&
    digitsOnly.length <= 15 &&
    availableProviders.length > 0 &&
    provider.length > 0;

  const presets = [5000, 10000, 25000, 50000, 100000, 250000].filter(
    (p) => p <= remaining,
  );

  const handleInvest = async () => {
    if (!isValid) return;
    setLoading(true);
    setStep("confirming");

    const { data: investData, error } = await campaignProvider.investInProject(
      projectId,
      {
        amount: parsedAmount,
        phone_number: digitsOnly,
        currency,
        provider,
      },
    );

    setLoading(false);

    if (investData) {
      setResult(investData);
      setStep("success");
      toast.success("Investment initiated successfully!");
    } else {
      setErrorMsg(error ?? "Transaction failed. Please try again.");
      setStep("error");
    }
  };

  const handleClose = () => {
    toggle();
  };

  const handleTryAgain = () => {
    setStep("form");
    setErrorMsg("");
    setResult(null);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-2xl">
      <DialogTitle className="sr-only">Invest in Project</DialogTitle>

      {/* ─── FORM STEP ─────────────────────────────── */}
      {step === "form" && (
        <div className="space-y-5">
          {/* Header */}
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#00CCC0]/10 flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#00CCC0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h2 className="text-lg font-MontserratSemiBold text-gray-900">
              Invest in Project
            </h2>
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
              {projectTitle}
            </p>
          </div>

          {/* Amount presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investment Amount ({currency})
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  className={`px-3 py-2 text-xs font-MontserratSemiBold rounded-lg border transition-all ${
                    parseInt(amount) === preset
                      ? "border-[#00CCC0] bg-[#00CCC0]/10 text-[#00CCC0]"
                      : "border-gray-200 text-gray-600 hover:border-[#00CCC0] hover:text-[#00CCC0]"
                  }`}
                >
                  {preset.toLocaleString()}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-MontserratSemiBold">
                {currency}
              </span>
              <input
                type="number"
                min={1000}
                max={remaining}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Custom amount"
                className="w-full pl-14 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-[#00CCC0] focus:ring-2 focus:ring-[#00CCC0]/10 outline-none transition-all"
              />
            </div>
            {amount && (
              <div className="mt-2 space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Platform fee (5%)</span>
                  <span className="font-medium">
                    {currency} {feeAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-MontserratSemiBold text-gray-700">
                  <span>Total charge</span>
                  <span>
                    {currency} {totalCharge.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[#00CCC0] font-medium">
                  <span>Remaining to goal</span>
                  <span>
                    {currency} {remaining.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Mobile Money Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(e.target.value.replace(/[^0-9+]/g, ""))
                }
                placeholder="+237690000000"
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-[#00CCC0] focus:ring-2 focus:ring-[#00CCC0]/10 outline-none transition-all"
              />
              {detectedCountry && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[11px] text-gray-400">
                  <Globe className="w-3 h-3" />
                  <span>{getCountryName(detectedCountry)}</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Enter number with country code (e.g., 237695000000)
            </p>
          </div>

          {/* Provider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Mobile Money Provider
            </label>
            {providersLoading ? (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400 border border-gray-200 rounded-xl">
                <Loader className="w-4 h-4 animate-spin" />
                <span>Loading providers...</span>
              </div>
            ) : availableProviders.length > 0 ? (
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-[#00CCC0] focus:ring-2 focus:ring-[#00CCC0]/10 outline-none transition-all bg-white appearance-none"
              >
                {availableProviders.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            ) : phoneNumber.replace(/[^0-9]/g, "").length >= 4 ? (
              <div className="px-4 py-3 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl">
                No providers available for this country. Try a different number.
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-400 border border-gray-200 rounded-xl">
                Enter your phone number to see available providers
              </div>
            )}
            {detectedCountry && availableProviders.length > 0 && (
              <p className="text-[11px] text-gray-400 mt-1">
                {availableProviders.length} provider
                {availableProviders.length > 1 ? "s" : ""} available in{" "}
                {getCountryName(detectedCountry)}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleInvest}
              disabled={!isValid}
              className="flex-1 bg-[#00CCC0] hover:bg-[#00c800] text-white disabled:opacity-40"
            >
              Invest Now
            </Button>
          </div>
        </div>
      )}

      {/* ─── CONFIRMING STEP ──────────────────────── */}
      {step === "confirming" && (
        <div className="py-10 text-center space-y-4">
          <Loader className="w-10 h-10 animate-spin mx-auto text-[#00CCC0]" />
          <p className="text-sm text-gray-600">Processing your investment...</p>
          <p className="text-xs text-gray-400">
            Please check your phone for a payment prompt.
          </p>
        </div>
      )}

      {/* ─── SUCCESS STEP ─────────────────────────── */}
      {step === "success" && result && (
        <div className="py-6 text-center space-y-4">
          <CheckCircle className="w-14 h-14 mx-auto text-green-500" />
          <div>
            <h3 className="text-lg font-MontserratSemiBold text-gray-900">
              Investment Initiated!
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Your deposit is being processed via {result.provider}.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm text-left">
            <div className="flex justify-between">
              <span className="text-gray-500">Amount invested</span>
              <span className="font-medium">
                {currency} {result.invested_amount?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Platform fee (5%)</span>
              <span className="font-medium">
                {currency} {result.platform_fee_amt?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between font-MontserratSemiBold">
              <span>Total charged</span>
              <span>
                {currency} {result.total_charge?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-[#00CCC0]">
              <span>Funding progress</span>
              <span>{result.funding_progress}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Deposit ID</span>
              <span className="font-mono">{result.deposit_id}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">PawaPay status</span>
              <span
                className={`font-medium ${
                  result.pawapay_status === "ACCEPTED"
                    ? "text-green-600"
                    : "text-amber-600"
                }`}
              >
                {result.pawapay_status}
              </span>
            </div>
          </div>

          <Button
            onClick={handleClose}
            className="w-full bg-[#00CCC0] hover:bg-[#00c800] text-white"
          >
            Done
          </Button>
        </div>
      )}

      {/* ─── ERROR STEP ───────────────────────────── */}
      {step === "error" && (
        <div className="py-6 text-center space-y-4">
          <XCircle className="w-14 h-14 mx-auto text-red-500" />
          <div>
            <h3 className="text-lg font-MontserratSemiBold text-gray-900">
              Investment Failed
            </h3>
            <p className="text-sm text-red-500 mt-1">{errorMsg}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Close
            </Button>
            <Button
              onClick={handleTryAgain}
              className="flex-1 bg-[#00CCC0] hover:bg-[#00c800] text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
