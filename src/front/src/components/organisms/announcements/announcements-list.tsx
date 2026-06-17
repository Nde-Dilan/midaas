"use client";

interface Announcement {
  id: number | string;
  title: string;
  subtitle?: string;
  description: string;
  type: string;
  createdAt: string;
}

interface AnnouncementsListProps {
  announcements: Announcement[];
  isLoading?: boolean;
  error?: string | null;
  onDelete?: (announcementId: number | string) => void;
  onReadMore?: (announcement: Announcement) => void;
}

export default function AnnouncementsList({
  announcements,
  isLoading = false,
  error = null,
  onDelete,
  onReadMore,
}: AnnouncementsListProps) {
  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-MontserratBold mb-4">Mes annonces</h2>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-MontserratBold mb-4">Mes annonces</h2>
        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
          {[...Array(5)].map((_, idx) => (
            <div
              key={idx}
              className="p-4 border border-gray-200 rounded-lg space-y-2"
            >
              <div className="h-5 bg-gray-100 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
              <div className="h-16 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-MontserratBold mb-4">Mes annonces</h2>

      {announcements.length === 0 ? (
        <div className="text-center py-12">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            className="mx-auto text-gray-300 mb-3"
          >
            <path
              d="M21 10H3M16 6V4M8 6V4M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-gray-500 font-medium">Aucune annonce</p>
          <p className="text-gray-400 text-sm mt-1">
            Créez votre première annonce
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors relative group"
            >
              {/* Delete Button */}
              {onDelete && (
                <button
                  onClick={() => onDelete(announcement.id)}
                  className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-red-50 hover:border-red-300 transition-colors"
                  title="Supprimer"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-red-600"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}

              {/* Content */}
              <div className="pr-8">
                <h3 className="font-MontserratBold text-gray-900 mb-1">
                  {announcement.title}
                </h3>
                {announcement.subtitle && (
                  <p className="text-xs text-gray-500 mb-2">
                    {announcement.subtitle}
                  </p>
                )}
                <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                  {announcement.description}
                </p>
                {onReadMore && (
                  <button
                    onClick={() => onReadMore(announcement)}
                    className="text-sm text-[#00CCC0] hover:underline font-medium"
                  >
                    Voir plus
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
