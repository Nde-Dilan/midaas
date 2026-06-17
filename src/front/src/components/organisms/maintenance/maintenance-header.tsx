"use client";

interface MaintenanceHeaderProps {
  title: string;
  requestCount?: number;
  onAddRequest?: () => void;
}

export default function MaintenanceHeader({
  title,
  requestCount,
  onAddRequest,
}: MaintenanceHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-MontserratBold text-gray-900">{title}</h1>
        {requestCount !== undefined && (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
            {requestCount} demande{requestCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      {/* {onAddRequest && (
        <button
          onClick={onAddRequest}
          className="px-6 py-3 bg-[#50E3C2] text-white text-sm font-medium rounded-lg hover:bg-[#4a0f0a] transition-colors flex items-center gap-2"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouvelle demande
        </button>
      )} */}
    </div>
  );
}
