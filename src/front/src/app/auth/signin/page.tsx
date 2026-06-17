"use client";

import { Button } from "@/components/atoms/button";
import { MUIInput } from "@/components/atoms/input";
import Image from "next/image";
import vector from "@/assets/images/Vector.svg";
import illustration from "@/assets/images/amico.svg";
import Link from "next/link";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import { authProvider } from "@/api/auth";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Storage, StorageKeys } from "@/api/auth/storage";

interface ISigninForm {
  email: string;
  password: string;
}

export default function AuthSignin() {
  const { handleSubmit, control, reset } = useForm<ISigninForm>({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    const access = Storage.getItem(StorageKeys.access);
    const refresh = Storage.getItem(StorageKeys.refresh);

    if (user && access && refresh) {
      router.replace("/admin/dashboard");
    }
  }, [user, router]);

  const [loading, setLoading] = useState(false);
  const [passwordViewed, setPasswordViewed] = useState(false);

  const onSubmit: SubmitHandler<ISigninForm> = async (formData) => {
    setLoading(true);

    const { data, error } = await authProvider.login(formData);

    if (data && !error) {
      toast.success("Login successful");
      reset();
      router.push("/admin/dashboard");
    } else {
      toast.error(error || "An error occurred during authentication");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="bg-black h-[344px] w-full flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="Midaas logo"
          width={140}
          height={36}
          className="object-contain"
        />
      </div>

      <section className="w-full flex items-start justify-center -mt-20 px-4 pb-20">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-MontserratSemiBold text-center uppercase mb-6">
            MIDAAS LOGIN
          </h2>

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
                  placeholder="user@example.com"
                  type="email"
                  aria-label="Email Address"
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
                        stroke="#555"
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
                  placeholder="Enter your password"
                  type={passwordViewed ? "text" : "password"}
                  aria-label="Password"
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
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M2.45825 12C3.73253 7.94288 7.52281 5 12.0004 5C16.4781 5 20.2684 7.94291 21.5426 12C20.2684 16.0571 16.4781 19 12.0005 19C7.52281 19 3.73251 16.0571 2.45825 12Z"
                            stroke="#333"
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
                            stroke="#333"
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

            <div className="flex items-center justify-between mt-2">
              <div>
                <input type="checkbox" id="remember" className="mr-2" />
                <label htmlFor="remember" className="text-sm select-none">
                  Remember me
                </label>
              </div>
              <Link href="/auth/forgot-password">
                <span className="text-[#00CCC0] text-sm cursor-pointer hover:underline">
                  Forgot password?
                </span>
              </Link>
            </div>

            <Button
              className="w-full h-10 rounded-lg mt-6 bg-[#00CCC0] text-white hover:bg-[#50100d] font-semibold"
              type="submit"
              disabled={loading}
            >
              {loading ? "LOGGING IN..." : "LOGIN"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/auth/signup">
              <Button className="w-full h-10 rounded-lg mt-2 text-[#00CCC0] bg-transparent hover:bg-transparent shadow-none font-medium">
                Create an account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
