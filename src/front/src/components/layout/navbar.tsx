"use client";

import { useAuthStore } from "@/store/auth";
import { ModalNames, useModalStore } from "@/store/modal";
import Link from "next/link";
import { useNotificationsStore } from "@/store/notifications";
import { useEffect, useMemo } from "react";
import notificationService from "@/services/notification-service";
import { usePathname } from "next/navigation";

interface Props {
  onOpen: () => void;
  sidebarCollapsed: boolean;
}

// Helper function to generate breadcrumb with links
const generateBreadcrumb = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);

  // Map of path segments to display names
  const pathMap: Record<string, string> = {
    admin: "",
    dashboard: "Dashboard",
    locataires: "Locataires",
    "mes-biens": "Mes Biens",
    maintenances: "Maintenances",
    entretien: "Entretien",
    locations: "Locations",
    messagerie: "Messagerie",
    notifications: "Notifications",
    rapports: "Rapports",
    contrats: "Contrats",
    annonces: "Annonces",
    abonnements: "Abonnements",
    ajout: "Ajout",
    modifier: "Ajouter",
    edit: "Modification",
    view: "Détails",
  };

  const breadcrumbItems: { label: string; path: string }[] = [];
  let currentPath = "";

  segments.forEach((segment) => {
    // Skip dynamic IDs
    if (/^[0-9a-f-]{8,}$/i.test(segment) || /^\d+$/.test(segment)) {
      return;
    }

    currentPath += `/${segment}`;
    const label =
      pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

    if (label) {
      breadcrumbItems.push({ label, path: currentPath });
    }
  });

  return breadcrumbItems;
};

// Helper to get page title based on pathname
const getPageTitle = (pathname: string): string => {
  const pageTitles: Record<string, string> = {
    "/admin/dashboard": "Tableau de bord",
    "/admin/entretien": "Demandes d'entretien de voiture",
    "/admin/entretien/ajout": "Formulaire d'ajout d'un service d'entretien",
    "/admin/entretien/modifier": "Modification des informations d'un service",
    "/admin/locataires": "Gestion des locataires",
    "/admin/mes-biens": "Mes biens immobiliers",
    "/admin/locations": "Gestion des locations",
    "/admin/contrats": "Gestion des contrats",
    "/admin/annonces": "Mes annonces",
    "/admin/messagerie": "Messagerie",
    "/admin/notifications": "Notifications",
    "/admin/rapports": "Rapports",
  };

  return pageTitles[pathname] || "";
};

export default function Navbar({ onOpen, sidebarCollapsed }: Props) {
  const { user } = useAuthStore();
  const { toggle } = useModalStore();
  // const { unreadCount } = useNotificationsStore();
  const unreadCount = 10;
  const pathname = usePathname();

  // Generate breadcrumb based on current path
  const breadcrumbItems = useMemo(
    () => generateBreadcrumb(pathname),
    [pathname],
  );
  const pageTitle = useMemo(() => getPageTitle(pathname), [pathname]);

  // Request notification permission when the component mounts
  useEffect(() => {
    if (notificationService.isSupported()) {
      notificationService.requestPermission();
    }
  }, []);

  if (!user) return null;

  return (
    <header className="w-full h-16 bg-[#00CCC0] px-6 flex items-center justify-between">
      {/* Mobile menu toggle */}
      <div
        className={
          sidebarCollapsed
            ? "flex items-center gap-4 lg:ml-[108px]"
            : "flex items-center gap-4 lg:ml-[276px]"
        }
      >
        <button
          className="cursor-pointer block lg:hidden"
          onClick={onOpen}
          aria-label="Open menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-white"
          >
            <path
              d="M4 6H20M4 12H20M4 18H20"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Breadcrumb navigation and page title */}
        <div className="flex flex-col gap-1">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white font-MontserratRegular text-sm">
            {breadcrumbItems.length > 0 ? (
              breadcrumbItems.map((item, index) => (
                <div key={item.path} className="flex items-center gap-2">
                  <Link
                    href={item.path}
                    className="hover:underline transition-all"
                  >
                    {item.label}
                  </Link>
                  {index < breadcrumbItems.length - 1 && (
                    <span className="opacity-70">/</span>
                  )}
                </div>
              ))
            ) : (
              <span>Dashboard</span>
            )}
          </div>

          {/* Page title */}
          {pageTitle && (
            <div className="text-white font-MontserratRegular text-xs opacity-90">
              {pageTitle}
            </div>
          )}
        </div>
      </div>

      {/* Right side icons */}
      <div className="flex items-center gap-4">
        {/* Settings icon */}
        <button
          onClick={() => toggle({ name: ModalNames.PROFILE_DETAIL })}
          className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Settings"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.9999 8.25022C11.2583 8.25022 10.5332 8.47015 9.91655 8.88221C9.29987 9.29426 8.81922 9.87993 8.53539 10.5652C8.25157 11.2504 8.1773 12.0044 8.322 12.7318C8.46669 13.4592 8.82385 14.1274 9.34829 14.6519C9.87274 15.1763 10.5409 15.5335 11.2684 15.6782C11.9958 15.8229 12.7498 15.7486 13.435 15.4648C14.1202 15.1809 14.7059 14.7003 15.118 14.0836C15.53 13.4669 15.7499 12.7419 15.7499 12.0002C15.747 11.0066 15.3509 10.0545 14.6483 9.35185C13.9457 8.64923 12.9936 8.25319 11.9999 8.25022ZM20.0962 12.0002C20.0942 12.3506 20.0686 12.7005 20.0193 13.0474L22.3017 14.8343C22.4011 14.9164 22.468 15.0311 22.4906 15.158C22.5132 15.2849 22.4899 15.4158 22.4249 15.5271L20.2659 19.2546C20.2002 19.3649 20.0978 19.4486 19.9766 19.4909C19.8553 19.5331 19.7231 19.5313 19.6031 19.4857L16.9195 18.4076C16.3607 18.8379 15.7491 19.195 15.0998 19.4702L14.6985 22.3193C14.6761 22.4469 14.61 22.5628 14.5116 22.6471C14.4132 22.7314 14.2886 22.7789 14.159 22.7815H9.84088C9.71369 22.779 9.59108 22.7335 9.49309 22.6523C9.3951 22.5712 9.32751 22.4592 9.30135 22.3347L8.9001 19.4857C8.24894 19.2136 7.63699 18.856 7.08041 18.4221L4.39682 19.5002C4.27686 19.5459 4.14464 19.5478 4.02342 19.5056C3.90219 19.4634 3.79971 19.3799 3.73401 19.2696L1.57494 15.5426C1.50996 15.4312 1.48667 15.3004 1.50926 15.1735C1.53184 15.0466 1.59882 14.9318 1.69823 14.8498L3.98057 13.0629C3.93189 12.7107 3.90621 12.3557 3.90369 12.0002C3.90564 11.6498 3.93133 11.3 3.98057 10.953L1.69823 9.16616C1.59882 9.08408 1.53184 8.96933 1.50926 8.84241C1.48667 8.71549 1.50996 8.58468 1.57494 8.47334L3.73401 4.74585C3.79964 4.6355 3.90209 4.55183 4.02332 4.50956C4.14455 4.4673 4.27681 4.46913 4.39682 4.51475L7.08041 5.59288C7.63922 5.16257 8.25074 4.80546 8.9001 4.53022L9.30135 1.68116C9.32381 1.55354 9.38988 1.43768 9.48829 1.35338C9.5867 1.26908 9.71133 1.22157 9.84088 1.21897H14.159C14.2862 1.22145 14.4088 1.26697 14.5068 1.3481C14.6048 1.42923 14.6724 1.54119 14.6985 1.66569L15.0998 4.51475C15.7518 4.78661 16.3645 5.1443 16.9218 5.57835L19.6031 4.50022C19.723 4.45456 19.8552 4.45265 19.9765 4.49483C20.0977 4.53701 20.2002 4.62058 20.2659 4.73085L22.4249 8.45835C22.4899 8.56968 22.5132 8.70049 22.4906 8.82741C22.468 8.95433 22.4011 9.06908 22.3017 9.15116L20.0193 10.938C20.068 11.29 20.0937 11.6449 20.0962 12.0002Z"
              fill="white"
            />
          </svg>
        </button>

        {/* Notifications icon */}
        <Link href="#">
          <button
            className="relative w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.6289 15.9984C20.5511 15.9047 20.4747 15.8109 20.3997 15.7205C19.3684 14.4731 18.7445 13.7203 18.7445 10.1892C18.7445 8.36109 18.3072 6.86109 17.4451 5.73609C16.8095 4.90499 15.9503 4.27453 14.8178 3.80859C14.8032 3.80048 14.7902 3.78985 14.7794 3.77718C14.372 2.41312 13.2573 1.49953 12.0001 1.49953C10.7429 1.49953 9.62873 2.41312 9.22139 3.77578C9.21052 3.78798 9.19768 3.79827 9.18342 3.80624C6.54061 4.89421 5.25623 6.98156 5.25623 10.1878C5.25623 13.7203 4.63326 14.4731 3.60108 15.7191C3.52608 15.8095 3.44967 15.9014 3.37186 15.997C3.17086 16.2394 3.04351 16.5343 3.00488 16.8469C2.96625 17.1594 3.01796 17.4764 3.15389 17.7605C3.44311 18.3698 4.05951 18.7481 4.76311 18.7481H19.2423C19.9426 18.7481 20.5548 18.3703 20.845 17.7637C20.9815 17.4796 21.0337 17.1623 20.9954 16.8494C20.9571 16.5366 20.8299 16.2412 20.6289 15.9984Z"
                fill="white"
              />
              <path
                d="M11.9999 22.4999C12.6773 22.4994 13.3419 22.3155 13.9232 21.9678C14.5045 21.6202 14.9809 21.1216 15.3018 20.5251C15.3169 20.4965 15.3244 20.4645 15.3235 20.4322C15.3226 20.3998 15.3133 20.3683 15.2966 20.3406C15.2799 20.3129 15.2563 20.29 15.2282 20.2741C15.2 20.2582 15.1682 20.2499 15.1359 20.2499H8.86492C8.83254 20.2498 8.80068 20.2581 8.77245 20.274C8.74422 20.2898 8.72057 20.3127 8.70382 20.3404C8.68706 20.3681 8.67777 20.3997 8.67684 20.4321C8.67591 20.4644 8.68337 20.4965 8.69851 20.5251C9.01939 21.1215 9.49569 21.62 10.0769 21.9677C10.6581 22.3154 11.3226 22.4993 11.9999 22.4999Z"
                fill="white"
              />
            </svg>

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white bg-red-500 font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </Link>
      </div>
    </header>
  );
}
