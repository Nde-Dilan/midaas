"use client";

interface GainsSummaryProps {
  totalAmount: string;
  currency?: string;
  profitPercentage: number;
  comparisonText?: string;
  chartPercentage: number;
  isLoading?: boolean;
  error?: string | null;
}

export default function GainsSummary({
  totalAmount,
  currency = "CHF",
  profitPercentage,
  comparisonText = "Le profit est de 48% de plus que le mois passé",
  chartPercentage,
  isLoading = false,
  error = null,
}: GainsSummaryProps) {
  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-MontserratBold mb-4">Gains</h2>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-MontserratBold mb-4">Gains</h2>
        <div className="space-y-4">
          <div className="h-20 bg-gray-100 rounded animate-pulse" />
          <div className="h-40 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // Calculate the stroke-dasharray for the circular progress
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (chartPercentage / 100) * circumference;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col gap-6">
      {/* Header Section */}
      <div>
        <div className="text-sm text-gray-500 mb-1">Total obtenu</div>
        <h2 className="text-lg font-MontserratBold">Gains</h2>
        <div className="text-3xl font-MontserratBold text-[#00CCC0] mt-2">
          {totalAmount} {currency}
        </div>
        <p className="text-sm text-gray-500 mt-2">{comparisonText}</p>
      </div>

      {/* Circular Chart */}
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="#f3f4f6"
              strokeWidth="20"
              fill="none"
            />
            {/* Progress circle - Maroon portion */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="#00CCC0"
              strokeWidth="20"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            {/* Remaining portion - Black */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="#1f2937"
              strokeWidth="20"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={-strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {/* Percentage text in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-MontserratBold text-gray-900">
              {chartPercentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
