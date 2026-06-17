"use client";

interface Service {
  id: number;
  name: string;
  price: string;
  features: string[];
}

interface ServicesPanelProps {
  services: Service[];
  isLoading?: boolean;
  error?: string | null;
  onAddService?: () => void;
  onDeleteService?: (serviceId: number) => void;
  onEditService?: (service: Service) => void;
}

export default function ServicesPanel({
  services,
  isLoading = false,
  error = null,
  onAddService,
  onDeleteService,
  onEditService,
}: ServicesPanelProps) {
  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-MontserratBold mb-4">Services</h2>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-MontserratBold">Services</h2>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-32 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-MontserratBold">Services</h2>
        {onAddService && (
          <button
            onClick={onAddService}
            className="px-4 py-2 bg-[#50E3C2] text-white text-xs font-medium rounded-lg hover:bg-[#4a0f0a] transition-colors uppercase"
          >
            Ajouter un service
          </button>
        )}
      </div>

      <div className="space-y-4">
        {services.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Aucun service disponible
          </p>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-[#50E3C2] transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-MontserratBold text-sm text-gray-900 mb-1">
                    {service.name}
                  </h3>
                  <p className="text-[#50E3C2] font-MontserratBold text-base">
                    {service.price}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {onDeleteService && (
                    <button
                      onClick={() => onDeleteService(service.id)}
                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                      title="Supprimer"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.00003 16.6841C13.1963 16.6841 16.6841 13.1962 16.6841 8.99999C16.6841 4.79635 13.1886 1.31592 8.99232 1.31592C4.789 1.31592 1.31628 4.79635 1.31628 8.99999C1.31628 13.1962 4.79639 16.6841 9.00003 16.6841ZM7.13928 13.4749C6.60475 13.4749 6.29586 13.1811 6.27303 12.6463L5.99436 6.49895H5.54243C5.44298 6.49746 5.34803 6.45729 5.2777 6.38697C5.20737 6.31664 5.16721 6.22169 5.16571 6.12224C5.16571 5.91138 5.33928 5.74552 5.54243 5.74552H7.25243V5.13545C7.25243 4.54756 7.63686 4.17856 8.19421 4.17856H9.76857C10.3262 4.17856 10.7104 4.54756 10.7104 5.13545V5.74552H12.4204C12.6238 5.74552 12.7897 5.91138 12.7897 6.12224C12.7897 6.3257 12.6238 6.49895 12.4207 6.49895H11.9835L11.7049 12.6463C11.6746 13.1811 11.3657 13.4749 10.8309 13.4749H7.13928ZM8.01357 5.74552H9.94953V5.27849C9.94953 5.07503 9.8065 4.93938 9.59532 4.93938H8.36007C8.15661 4.93938 8.01357 5.07503 8.01357 5.27849V5.74552ZM7.59893 12.6463C7.78761 12.6463 7.90043 12.518 7.89303 12.3374L7.71207 7.28999C7.69696 7.10903 7.58414 6.98849 7.41089 6.98849C7.22253 6.98849 7.102 7.11674 7.10939 7.28999L7.31286 12.3448C7.32025 12.5257 7.43339 12.6463 7.59893 12.6463ZM8.98525 12.6386C9.17361 12.6386 9.29414 12.518 9.29414 12.3374V7.28999C9.29414 7.11642 9.17361 6.98849 8.98525 6.98849C8.79689 6.98849 8.67668 7.11674 8.67668 7.28999V12.3374C8.67668 12.518 8.80461 12.6386 8.98525 12.6386ZM10.379 12.6463C10.5448 12.6463 10.6576 12.5257 10.665 12.3448L10.8685 7.28999C10.8762 7.11642 10.748 6.98849 10.5599 6.98849C10.3941 6.98849 10.2735 7.10903 10.2658 7.28999L10.0852 12.3374C10.0775 12.518 10.1906 12.6463 10.379 12.6463Z"
                          fill="#862525"
                        />
                      </svg>
                    </button>
                  )}
                  {onEditService && (
                    <button
                      onClick={() => onEditService(service)}
                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                      title="Modifier"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8.78577 1.5C7.80085 1.5 6.82558 1.69399 5.91564 2.0709C5.0057 2.44781 4.1789 3.00026 3.48247 3.6967C2.07594 5.10322 1.28577 7.01088 1.28577 9C1.28577 10.9891 2.07594 12.8968 3.48247 14.3033C4.1789 14.9997 5.0057 15.5522 5.91564 15.9291C6.82558 16.306 7.80085 16.5 8.78577 16.5C10.7749 16.5 12.6825 15.7098 14.0891 14.3033C15.4956 12.8968 16.2858 10.9891 16.2858 9H14.7858C14.7858 10.5913 14.1536 12.1174 13.0284 13.2426C11.9032 14.3679 10.3771 15 8.78577 15C7.19447 15 5.66834 14.3679 4.54313 13.2426C3.41791 12.1174 2.78577 10.5913 2.78577 9C2.78577 7.4087 3.41791 5.88258 4.54313 4.75736C5.66834 3.63214 7.19447 3 8.78577 3V1.5ZM13.8708 2.25C13.736 2.25192 13.6071 2.30563 13.5108 2.4L12.5958 3.3075L14.4708 5.1825L15.3858 4.275C15.5808 4.08 15.5808 3.75 15.3858 3.5625L14.2233 2.4C14.1258 2.3025 13.9983 2.25 13.8708 2.25ZM12.0633 3.84L6.53577 9.375V11.25H8.41077L13.9383 5.715L12.0633 3.84Z"
                          fill="black"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {service.features && service.features.length > 0 && (
                <ul className="space-y-2 mt-3">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="mt-1">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="text-[#50E3C2]"
                        >
                          <circle cx="12" cy="12" r="10" fill="currentColor" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600 flex-1">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
