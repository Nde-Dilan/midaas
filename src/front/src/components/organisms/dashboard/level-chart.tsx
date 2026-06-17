"use client";

interface LevelData {
  label: string;
  value: number;
}

interface LevelChartProps {
  data: LevelData[];
  isLoading?: boolean;
  error?: string | null;
}

export default function LevelChart({
  data,
  isLoading = false,
  error = null,
}: LevelChartProps) {
  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-MontserratBold mb-4">Level</h2>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-MontserratBold mb-4">Level</h2>
        <div className="h-40 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm h-full">
      <h2 className="text-lg font-MontserratBold mb-6">Level</h2>
      <div className="flex items-end justify-between gap-2 h-48 px-2">
        {data.map((item, i) => {
          const heightPercentage = (item.value / maxValue) * 100;
          const isVolume = i % 2 === 0; // Alternate colors based on index

          return (
            <div
              key={i}
              className="flex flex-col items-center justify-end flex-1 min-w-[20px]"
            >
              <div
                className={`w-full rounded-t-lg transition-all duration-300 min-h-[10px] ${
                  isVolume ? "bg-[#00CCC0]" : "bg-[#4FB3D9]"
                }`}
                style={{ height: `${heightPercentage}%` }}
                title={`${item.label}: ${item.value}`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-6 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#00CCC0]" />
          <span className="text-sm text-gray-600">Volume</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#4FB3D9]" />
          <span className="text-sm text-gray-600">Service</span>
        </div>
      </div>
    </div>
  );
}
