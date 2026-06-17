"use client";

import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import AdminLoader from "@/components/organisms/modals/loader/adminLoader";
import ModalContainer from "@/components/organisms/modals/modals-content/modal-container";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import useNotifications from "@/hooks/useNotifications";
import { usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import useAdminAuth from "@/hooks/useAdminAuth";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  const [open, setOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [, setIsMobile] = useState(false);

  const { user } = useAuthStore();

  const router = useRouter();

  // Try admin auth first, fall back to regular user auth
  useAdminAuth();
  useAuth();
  // useNotifications();
  const isSubscribed = true;

  useEffect(() => {
    if (typeof window === undefined) return;

    if (window.innerWidth < 1024) {
      setIsMobile(true);
    }

    window.addEventListener("resize", () => {
      if (window.innerWidth < 1024) {
        setIsMobile(true);
        setOpen(false);
      } else {
        setIsMobile(false);
      }
    });

    return () => {
      window.removeEventListener("resize", () => {});
    };
  }, []);

  // useEffect(() => {
  // 	if (!subscription) return;

  // 	if (!subscribed) {
  // 		router.push("/subscriptions");
  // 	}
  // }, [subscribed, subscription]);

  useEffect(() => {
    if (!user) {
      //   router.push("/auth/signin");
    }
    // Uncomment and adjust if needed for subscription redirect
    // if (!subscribed) {
    //   router.push("/subscriptions");
    // }
  }, [user, isSubscribed, router]); // Dependencies: re-run if user or

  const pathname = usePathname();

  return (
    <section className="bg-gray-50 w-screen h-screen flex overflow-hidden relative">
      {/* Maroon background strip at top */}
      <div className="fixed top-0 left-0 right-0 h-32 bg-[#00CCC0] z-10" />

      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-30">
        <Navbar
          onOpen={() => setOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
        />
      </div>

      {/* Sidebar - Desktop (floating with shadow) */}
      <div className="hidden lg:block fixed left-4 top-4 bottom-4 z-40">
        <Sidebar
          onClose={() => setOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />
      </div>

      {/* Sidebar - Mobile */}
      <div
        className={twMerge(
          "block lg:hidden fixed top-0 left-0 bottom-0 z-50 transition-all duration-300",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Sidebar
          onClose={() => setOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />
      </div>

      {/* Main content area - starts below navbar, overlaps maroon strip */}
      <main
        className="w-full h-full pt-20 relative z-20 transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? "124px" : "296px" }}
      >
        <div className="h-full overflow-y-auto scrollable">
          <div className="min-h-full bg-white rounded-[2rem] shadow-2xl p-8 m-6">
            {children}
          </div>
        </div>
      </main>

      <div
        className={twMerge(
          "fixed top-0 left-0 w-full h-full bg-black/40 z-30",
          open ? "block" : "hidden",
        )}
        onClick={() => setOpen(false)}
      >
        <span
          onClick={() => setOpen(false)}
          className="fixed top-4 right-4 w-10 h-10 flex items-center justify-center cursor-pointer rounded-full bg-background"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-primary"
          >
            <path
              d="M6 18L18 6M6 6L18 18"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      <ModalContainer />
    </section>
  );
}
