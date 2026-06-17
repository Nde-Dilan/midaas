"use client";

import { Button } from "@/components/atoms/button";
import { MUIInput } from "@/components/atoms/input";
import Image from "next/image";
import Link from "next/link";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import { adminProvider, AdminStorageKeys } from "@/api/admin";
import { Storage, StorageKeys } from "@/api/auth/storage";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/admin";
import { useAuthStore } from "@/store/auth";
import User from "@/entities/user/user";
import { ShieldAlert } from "lucide-react";

interface IAdminSigninForm {
  email: string;
  password: string;
}

export default function AdminSignin() {
  const { handleSubmit, control, reset } = useForm<IAdminSigninForm>({
    defaultValues: { email: "", password: "" },
  });
  const router = useRouter();
  const { admin, loadAdmin } = useAdminStore();
  const { loadUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [passwordViewed, setPasswordViewed] = useState(false);

  // Redirect if already logged in as admin
  useEffect(() => {
    const token = Storage.getItem(AdminStorageKeys.adminAccess);
    if (admin && token) {
      router.replace("/admin/dashboard");
    }
  }, [admin, router]);

  const onSubmit: SubmitHandler<IAdminSigninForm> = async (formData) => {
    setLoading(true);
    const { data, error } = await adminProvider.login(formData);

    if (data && !error) {
      // Store admin in admin store
      loadAdmin(data.admin);

      // Also create a synthetic user in the auth store so the sidebar/layout work
      const adminUser = new User({
        id: data.admin.id,
        email: data.admin.email,
        name: data.admin.full_name,
        validationStatus: "verified",
        role: "admin",
      });
      loadUser(adminUser);

      // Also store the admin token as the regular access token for API requests
      if (data.token) {
        Storage.setItem(StorageKeys.access, data.token);
      }

      toast.success("Connexion administrateur réussie");
      reset();
      router.push("/admin/dashboard");
    } else {
      toast.error(error || "Email ou mot de passe invalide");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Top Accent */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-[#00CCC0] to-emerald-400" />

      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Shield Badge */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-emerald-400" />
            </div>
          </div>

          {/* Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image
                src="/logo.png"
                alt="Midaas Admin"
                width={120}
                height={36}
                className="object-contain brightness-0 invert opacity-90"
              />
            </div>

            <div className="text-center mb-8">
              <h2 className="text-xl font-MontserratBold text-white">
                Administration
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Accès réservé aux administrateurs
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="email"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <MUIInput
                    {...field}
                    className="w-full my-3"
                    label=""
                    placeholderShown
                    placeholder="admin@midaas.com"
                    type="email"
                    aria-label="Email"
                    after={
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-4"
                      >
                        <path
                          d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z"
                          stroke="#888"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <MUIInput
                    {...field}
                    className="w-full my-3"
                    label=""
                    placeholderShown
                    placeholder="Mot de passe"
                    type={passwordViewed ? "text" : "password"}
                    aria-label="Mot de passe"
                    after={
                      <div
                        className="mr-4 cursor-pointer"
                        onClick={() => setPasswordViewed((prev) => !prev)}
                      >
                        {passwordViewed ? (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
                              stroke="#888"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M2.45825 12C3.73253 7.94288 7.52281 5 12.0004 5C16.4781 5 20.2684 7.94291 21.5426 12C20.2684 16.0571 16.4781 19 12.0005 19C7.52281 19 3.73251 16.0571 2.45825 12Z"
                              stroke="#888"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M3 3L6.58916 6.58916M21 21L17.4112 17.4112M13.8749 18.8246C13.2677 18.9398 12.6411 19 12.0005 19C7.52281 19 3.73251 16.0571 2.45825 12C2.80515 10.8955 3.33851 9.87361 4.02143 8.97118M9.87868 9.87868C10.4216 9.33579 11.1716 9 12 9C13.6569 9 15 10.3431 15 12C15 12.8284 14.6642 13.5784 14.1213 14.1213M9.87868 9.87868L14.1213 14.1213M9.87868 9.87868L6.58916 6.58916M14.1213 14.1213L6.58916 6.58916M14.1213 14.1213L17.4112 17.4112M6.58916 6.58916C8.14898 5.58354 10.0066 5 12.0004 5C16.4781 5 20.2684 7.94291 21.5426 12C20.8357 14.2507 19.3545 16.1585 17.4112 17.4112"
                              stroke="#888"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    }
                  />
                )}
              />

              <Button
                className="w-full h-11 rounded-lg mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all"
                type="submit"
                disabled={loading}
              >
                {loading ? "CONNEXION..." : "ACCÉDER AU PANEL"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-800 text-center">
              <Link href="/auth/signin">
                <span className="text-gray-500 text-sm hover:text-gray-300 transition-colors cursor-pointer">
                  ← Retour à l&apos;espace utilisateur
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
