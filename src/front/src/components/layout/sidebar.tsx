"use client";

import { authProvider } from "@/api/auth";
import { AdminStorageKeys } from "@/api/admin";
import { sidebar } from "@/data/navigation/sidebar";
import { useModalStore } from "@/store/modal";
import { Storage, StorageKeys } from "@/api/auth/storage";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { useAuthStore } from "@/store/auth";

interface Props {
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  onClose,
  collapsed = false,
  onToggleCollapse,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { openModal } = useModalStore();
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Subscription check
  const { user } = useAuthStore();
  const isSubscribed = true;
  const isExpanded = !collapsed;

  // Determine user's role for sidebar filtering
  const userRole = user?.role ?? "investor";

  // Filter sidebar items based on user role
  const filteredSidebar = useMemo(() => {
    return sidebar.filter((item) => {
      // If no allowedRoles defined, it's visible to everyone
      if (!item.allowedRoles || item.allowedRoles.length === 0) return true;

      // Map our UserRole to the sidebar's role naming
      const roleMap: Record<string, string> = {
        investor: "ROLE_CLIENT",
        entrepreneur: "ROLE_FRANCHISEE",
        admin: "ROLE_ADMIN",
      };

      return item.allowedRoles.includes(roleMap[userRole] as any);
    });
  }, [userRole]);

  const handleToggleCollapse = () => {
    onToggleCollapse?.();
  };

  const handleLogout = async () => {
    setLogoutLoading(true);

    // Clear admin storage keys if present
    Storage.removeItem(AdminStorageKeys.adminAccess);
    Storage.removeItem(AdminStorageKeys.adminId);

    // Clear regular auth tokens
    Storage.removeItem(StorageKeys.access);
    Storage.removeItem(StorageKeys.refresh);
    Storage.removeItem(StorageKeys.userId);

    // Clear role preference
    localStorage.removeItem("midaas_role");

    // Clear auth store
    useAuthStore.getState().loadUser(null as any);

    // Call logout API
    await authProvider.logout();

    setLogoutLoading(false);

    // Redirect to login
    window.location.href = "/auth/signin";
  };

  // Render menu item content
  const renderMenuItem = (
    item: (typeof sidebar)[0],
    isActive: boolean,
    isDisabled: boolean,
  ) => {
    return (
      <>
        <span
          className={twMerge(
            "flex items-center justify-center w-10 h-10 rounded-lg transition-all shrink-0",
            isActive ? "bg-[#00CCC0]" : "bg-transparent",
          )}
        >
          <span className="[&_svg_path]:transition-all">
            {isActive ? item.icon.active : item.icon.default}
          </span>
        </span>

        <div
          className={twMerge(
            "flex items-center flex-1 min-w-0 overflow-hidden transition-all duration-200",
            !isExpanded ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100",
          )}
        >
          <span
            className={twMerge(
              "text-[15px] leading-[150%] transition-colors whitespace-nowrap",
              isActive
                ? "font-MontserratBold text-[#00CCC0]"
                : "font-MontserratRegular text-gray-500",
            )}
          >
            {item.title}
          </span>
        </div>
      </>
    );
  };

  return (
    <aside
      className={twMerge(
        "relative h-full bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden transition-all duration-300",
        !isExpanded ? "w-[88px]" : "w-[260px]",
      )}
    >
      {/* Logo Section */}
      <div
        className={twMerge(
          "flex items-center justify-center py-6 transition-all duration-300",
          !isExpanded ? "px-3" : "px-6",
        )}
      >
        <Image
          src="/logo.png"
          alt="Midaas Logo"
          width={!isExpanded ? 44 : 120}
          height={60}
          className="object-contain"
        />
      </div>

      {/* Separator */}
      <div className="mx-6 h-[2px] bg-gradient-to-r from-transparent via-[#00CCC0] to-transparent" />

      {/* Navigation Items */}
      <nav
        className={twMerge(
          "flex-1 overflow-y-auto py-6 scrollable transition-all duration-300",
          !isExpanded ? "px-3" : "px-4",
        )}
      >
        <ul className="flex flex-col gap-2">
          {filteredSidebar.map((item) => {
            // Check if current path matches or is a nested route
            const isActive =
              pathname === item.link || pathname.startsWith(item.link + "/");
            const isDisabled = !isSubscribed;

            const itemClasses = twMerge(
              "flex items-center py-3 rounded-xl transition-all duration-200",
              !isExpanded ? "justify-center gap-0 px-3" : "gap-3 px-4",
              isActive ? "bg-gray-50 shadow-sm" : "hover:bg-gray-50/50",
              isDisabled && "opacity-50 cursor-not-allowed",
            );

            // Disabled items (non-clickable)
            if (isDisabled) {
              return (
                <li key={item.key}>
                  <div className={itemClasses}>
                    {renderMenuItem(item, isActive, isDisabled)}
                  </div>
                </li>
              );
            }

            // Regular link items
            return (
              <li key={item.key}>
                <Link
                  href={item.link}
                  onClick={onClose}
                  className={itemClasses}
                >
                  {renderMenuItem(item, isActive, isDisabled)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={twMerge("pb-4", !isExpanded ? "px-3" : "px-6")}>
        <button
          onClick={handleToggleCollapse}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-border text-xs font-MontserratSemiBold text-gray-700 hover:bg-gray-50 transition-colors"
          aria-label={!isExpanded ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current"
          >
            <path
              d={!isExpanded ? "M14 5L7 12L14 19" : "M10 5L17 12L10 19"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {isExpanded && <span>Collapse</span>}
        </button>
      </div>

      {/* Logout Button */}
      <div className={twMerge("pb-6 mt-auto", !isExpanded ? "px-3" : "px-6")}>
        <button
          onClick={handleLogout}
          disabled={logoutLoading}
          className={twMerge(
            "w-full flex items-center justify-center rounded-full font-MontserratBold text-sm uppercase tracking-wide hover:bg-gray-900 transition-colors disabled:opacity-50",
            !isExpanded
              ? "gap-0 px-4 py-4 bg-black text-white"
              : "gap-3 px-6 py-4 bg-black text-white",
          )}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17 16L21 12M21 12L17 8M21 12H7M13 16V17C13 18.6569 11.6569 20 10 20H6C4.34315 20 3 18.6569 3 17V7C3 5.34315 4.34315 4 6 4H10C11.6569 4 13 5.34315 13 7V8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {!collapsed && (
            <span>{logoutLoading ? "Déconnexion..." : "DÉCONNEXION"}</span>
          )}
        </button>
      </div>
    </aside>
  );
}
