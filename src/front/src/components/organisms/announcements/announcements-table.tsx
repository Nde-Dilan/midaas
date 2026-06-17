"use client";

interface Announcement {
  id: number | string;
  title: string;
  type: string;
  location: string;
  price: number;
  status: "active" | "pending" | "expired";
  views: number;
  applications: number;
  createdAt: string;
}

interface AnnouncementsTableProps {
  announcements: Announcement[];
  isLoading?: boolean;
  error?: string | null;
  onViewAnnouncement?: (announcement: Announcement) => void;
  onEditAnnouncement?: (announcement: Announcement) => void;
  onDeleteAnnouncement?: (announcement: Announcement) => void;
}

export default function AnnouncementsTable({
  announcements,
  isLoading = false,
  error = null,
  onViewAnnouncement,
  onEditAnnouncement,
  onDeleteAnnouncement,
}: AnnouncementsTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "expired":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Actif";
      case "pending":
        return "En attente";
      case "expired":
        return "Expiré";
      default:
        return status;
    }
  };

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="space-y-4">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm text-center">
        <div className="flex flex-col items-center gap-3">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            className="text-gray-300"
          >
            <path
              d="M21 10H3M16 6V4M8 6V4M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-gray-500 font-medium">Aucune annonce trouvée</p>
          <p className="text-gray-400 text-sm">
            Créez votre première annonce pour commencer
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Titre
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Localisation
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vues
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidatures
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {announcements.map((announcement) => (
              <tr
                key={announcement.id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onViewAnnouncement?.(announcement)}
              >
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {announcement.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {announcement.createdAt}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {announcement.type}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {announcement.location}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {announcement.price.toLocaleString()} CHF
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      announcement.status,
                    )}`}
                  >
                    {getStatusLabel(announcement.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {announcement.views}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {announcement.applications}
                </td>
                <td className="px-6 py-4 text-right">
                  <div
                    className="flex items-center justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {onViewAnnouncement && (
                      <button
                        onClick={() => onViewAnnouncement(announcement)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Voir les détails"
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
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    )}
                    {onEditAnnouncement && (
                      <button
                        onClick={() => onEditAnnouncement(announcement)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#00CCC0]"
                        title="Modifier"
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
                          <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" />
                          <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.43739 22.1213 4.00001C22.1213 4.56262 21.8978 5.10218 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" />
                        </svg>
                      </button>
                    )}
                    {onDeleteAnnouncement && (
                      <button
                        onClick={() => onDeleteAnnouncement(announcement)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                        title="Supprimer"
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
                          <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
