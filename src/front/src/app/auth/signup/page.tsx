"use client";

import { Button } from "@/components/atoms/button";
import { MUIInput } from "@/components/atoms/input";
import Image from "next/image";
import vector from "@/assets/images/Vector.svg";
import illustration from "@/assets/images/pana.svg";
import Link from "next/link";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useEffect, useState } from "react";
import { authProvider } from "@/api/auth";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Storage, StorageKeys } from "@/api/auth/storage";
import { useAuthStore } from "@/store/auth";

interface ISignupForm {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  idCardNumber: string;
  idCardFront: FileList | null;
  idCardBack: FileList | null;
}

export default function Home() {
  const { handleSubmit, control, reset, register } = useForm<ISignupForm>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      phoneNumber: "",
      idCardNumber: "",
      idCardFront: null,
      idCardBack: null,
    },
  });

  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    const access = Storage.getItem(StorageKeys.access);
    const refresh = Storage.getItem(StorageKeys.refresh);

    if (user && access && refresh) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const [loading, setLoading] = useState(false);
  const [passwordViewed, setPasswordViewed] = useState(false);

  const onSubmit: SubmitHandler<ISignupForm> = async (formData) => {
    setLoading(true);

    try {
      let idCardFrontUrl = "";
      let idCardBackUrl = "";

      // 1. Upload ID card files if provided
      const hasFront = formData.idCardFront && formData.idCardFront.length > 0;
      const hasBack = formData.idCardBack && formData.idCardBack.length > 0;

      if (hasFront || hasBack) {
        const uploadFormData = new FormData();
        if (hasFront) uploadFormData.append("front", formData.idCardFront![0]);
        if (hasBack) uploadFormData.append("back", formData.idCardBack![0]);

        const { data: uploadResult } =
          await authProvider.uploadIdCard(uploadFormData);

        if (uploadResult) {
          idCardFrontUrl = uploadResult.front_url ?? "";
          idCardBackUrl = uploadResult.back_url ?? "";
        }
      }

      // 2. Map frontend camelCase state to the API schema
      const backendPayload = {
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        phone_number: formData.phoneNumber || undefined,
        id_card_number: formData.idCardNumber || undefined,
        id_card_url: idCardFrontUrl || undefined,
      };

      // 3. Dispatch structured payload to backend signup route
      const { data, error } = await authProvider.signup(backendPayload);

      if (data && !error) {
        toast.success("Registration successful");
        reset();
        router.push("/auth/signin");
      } else {
        toast.error(error || "An error occurred during registration");
      }
    } catch (err) {
      toast.error("Server communication error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-screen h-screen p-4 flex items-center ">
      <div className="relative hidden lg:flex w-1/2 h-full bg-primary rounded-2xl">
        <Image
          src={illustration}
          alt="Illustration"
          objectFit="cover"
          width={400}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        />
        <Image
          src={vector}
          alt="Vector"
          objectFit="cover"
          width={1000}
          className="absolute w-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      <div className="relative w-full lg:w-1/2 h-full flex flex-col items-center overflow-auto">
        <Link href="/auth/signin">
          <span className="absolute top-4 left-12 border-2 border-border w-10 h-10 flex items-center justify-center cursor-pointer rounded-full bg-background">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 19L3 12M3 12L10 5M3 12L21 12"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </Link>

        <div className="mt-[60px] max-w-[430px] w-full px-10 pb-[60px] lg:pb-0">
          <h1 className="text-3xl font-MontserratSemiBold text-center uppercase tracking-tight">
            Sign up on
          </h1>

          <Image
            src="/logo.png"
            alt="Midaas logo"
            width={200}
            height={50}
            className="mx-auto mb-6"
          />

          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Controller
              name="fullName"
              control={control}
              rules={{ required: "Full name is required" }}
              render={({ field }) => (
                <MUIInput className="w-full" label="Full name" {...field} />
              )}
            />

            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              }}
              render={({ field }) => (
                <MUIInput
                  className="w-full"
                  label="Email"
                  type="email"
                  {...field}
                />
              )}
            />

            <Controller
              name="phoneNumber"
              control={control}
              rules={{ required: "Phone number is required" }}
              render={({ field }) => (
                <MUIInput className="w-full" label="Phone number" {...field} />
              )}
            />

            <Controller
              name="password"
              control={control}
              rules={{
                required: "Password is required",
                minLength: { value: 6, message: "Minimum 6 characters" },
              }}
              render={({ field }) => (
                <MUIInput
                  className="w-full"
                  label="Password"
                  type={passwordViewed ? "text" : "password"}
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
                            stroke="#333"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M2.45825 12C3.73253 7.94288 7.52281 5 12.0004 5C16.4781 5 20.2684 7.94291 21.5426 12C20.2684 16.0571 16.4781 19 12.0005 19C7.52281 19 3.73251 16.0571 2.45825 12Z"
                            stroke="#333"
                            strokeWidth="1.5"
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
                            stroke="#333"
                            strokeWidth="1.5"
                          />
                        </svg>
                      )}
                    </div>
                  }
                  {...field}
                />
              )}
            />

            <hr className="my-2 border-border" />

            {/* KYC/Identity Document Tracking Layer */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-foreground pl-1">
                Identity Document (ID Card or Receipt)
              </p>

              {/* Front (Recto) */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground pl-1">
                  Front (Recto)
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="w-full text-sm border border-border rounded-lg p-2.5 bg-background cursor-pointer"
                  {...register("idCardFront")}
                />
              </div>

              {/* Back (Verso) */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground pl-1">
                  Back (Verso) — optional
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="w-full text-sm border border-border rounded-lg p-2.5 bg-background cursor-pointer"
                  {...register("idCardBack")}
                />
              </div>
            </div>

            <Controller
              name="idCardNumber"
              control={control}
              rules={{ required: "Document number is required" }}
              render={({ field }) => (
                <MUIInput
                  className="w-full"
                  label="Identity card number"
                  {...field}
                />
              )}
            />

            <Button
              className="w-full h-11 rounded-lg mt-4  text-black bg-[#00CCC0] hover:bg-primary/90 font-semibold"
              type="submit"
              disabled={loading}
            >
              {loading ? "Loading..." : "Create my account"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
