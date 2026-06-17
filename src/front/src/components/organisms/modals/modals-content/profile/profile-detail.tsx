import { useModalStore } from "@/store/modal";
import { useAuthStore } from "@/store/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { MUIInput } from "@/components/atoms/input";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { Button } from "@/components/atoms/button";

interface FormInput {
  profileType: "owner" | "agencies";
  name: string;
  email: string;
}

export default function ProfileDetailModal() {
  const { toggle } = useModalStore();
  const { user } = useAuthStore();
  const displayName = user?.name?.trim() || "User";

  const { control, setValue } = useForm<FormInput>({
    defaultValues: {
      profileType: "owner",
      name: "",
      email: "",
    },
  });

  useEffect(() => {
    if (!user) return;

    setValue("profileType", user.profileType || "owner");
    setValue("name", user.name || "User");
    setValue("email", user.email || "");
  }, [user, setValue]);

  // const onSubmit: SubmitHandler<FormInput> = async (formData) => {
  // 	setLoading(true);

  // 	const payload = {
  // 		...formData,
  // 		profile_type: formData.profileType,
  // 	};

  // 	// Call the login function from the authProvider
  // 	const { data, error } = await authProvider.signup(payload);

  // 	if (data) {
  // 		toast.success("Modification réussie");

  // 		// Reset the form
  // 		reset();
  // 	} else {
  // 		toast.error("Une erreur s'est produite");
  // 	}

  // 	setLoading(false);
  // };

  // const isFormVerified = () => {
  // 	const { profileType, name, email } = getValues();

  // 	if (!profileType || !name || !email) return false;

  // 	return true;
  // };

  if (!user) return null;

  return (
    <section className="w-full bg-white p-8 rounded-2xl">
      <div className="w-full flex items-center justify-between">
        <h2 className="text-lg font-MontserratBold">Profile</h2>

        <span
          onClick={() => toggle()}
          className="w-8 h-8 flex items-center justify-center border border-primary/30 rounded-full cursor-pointer"
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

      <div className="mt-4 flex flex-col gap-4">
        <div className="w-full flex justify-center items-center py-4">
          <div className="relative">
            <Avatar className="w-[100px] h-[100px]">
              <AvatarImage
                src="/static/avatar-default.webp"
                alt={displayName}
              />
              <AvatarFallback>
                {displayName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* <span className="absolute bottom-0 right-0 size-7 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                width="15"
                height="16"
                viewBox="0 0 15 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_1516_24725)">
                  <path
                    d="M14.5872 4.66284L13.2366 6.01343C13.0989 6.15112 12.8763 6.15112 12.7386 6.01343L9.48661 2.76147C9.34892 2.62378 9.34892 2.40112 9.48661 2.26343L10.8372 0.912842C11.385 0.36499 12.2757 0.36499 12.8265 0.912842L14.5872 2.67358C15.138 3.22144 15.138 4.11206 14.5872 4.66284ZM8.32646 3.42358L0.633095 11.1169L0.0120011 14.6765C-0.0729598 15.157 0.345986 15.573 0.826454 15.491L4.38602 14.8669L12.0794 7.17358C12.2171 7.03589 12.2171 6.81323 12.0794 6.67554L8.82743 3.42358C8.68681 3.28589 8.46415 3.28589 8.32646 3.42358ZM3.63602 10.4578C3.47489 10.2966 3.47489 10.0388 3.63602 9.87769L8.14774 5.36597C8.30888 5.20483 8.56669 5.20483 8.72782 5.36597C8.88895 5.5271 8.88895 5.78491 8.72782 5.94605L4.2161 10.4578C4.05497 10.6189 3.79716 10.6189 3.63602 10.4578ZM2.57841 12.9216H3.98466V13.9851L2.09501 14.3162L1.18388 13.405L1.51493 11.5154H2.57841V12.9216Z"
                    fill="#5B52BC"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_1516_24725">
                    <rect
                      width="15"
                      height="15"
                      fill="white"
                      transform="translate(0 0.5)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </span> */}
          </div>
        </div>

        <form action="">
          <Controller
            name="profileType"
            control={control}
            rules={{ required: true }}
            disabled
            render={({ field }) => (
              <Select
                {...field}
                onValueChange={(value) => field.onChange(value)}
              >
                <SelectTrigger className="w-full h-[50px] bg-background mb-6">
                  <SelectValue placeholder="Profile type" className="text-md" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="agencies">Agency</SelectItem>
                </SelectContent>
              </Select>
            )}
          />

          <Controller
            name="name"
            control={control}
            rules={{ required: true }}
            disabled
            render={({ field }) => (
              <MUIInput
                className="w-full mb-6"
                label="Full name"
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
                      d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                      stroke="#555"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
                      stroke="#555"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
                {...field}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            rules={{ required: true }}
            disabled
            render={({ field }) => (
              <MUIInput
                className="w-full mb-6"
                label="Email"
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
                {...field}
              />
            )}
          />

          {/* <Button disabled className="w-full h-12 font-MontserratBold">
            Modifier les informations
          </Button> */}
        </form>
      </div>
    </section>
  );
}
