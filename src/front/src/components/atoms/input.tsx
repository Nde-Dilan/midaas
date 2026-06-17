import * as React from "react";

import { cn } from "@/lib/utils";
import { twMerge } from "tailwind-merge";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

const MUIInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & {
    label: string;
    before?: React.ReactNode;
    after?: React.ReactNode;
  } & {
    placeholderShown?: boolean;
    componentType?: "text" | "file";
  }
>(
  (
    {
      className,
      type,
      placeholder = "",
      placeholderShown,
      componentType,
      label,
      before,
      after,
      ...props
    },
    ref,
  ) => {
    const helpId = React.useId();
    const isFile = componentType === "file" || type === "file";
    const maxSizeMB = 10;

    return (
      <div className="relative float-label-input">
        <input
          ref={ref}
          type={type}
          placeholder={
            placeholderShown === true || placeholderShown === undefined
              ? placeholder
              : undefined
          }
          className={twMerge(
            "w-full disabled:opacity-50 disabled:cursor-not-allowed text-md bg-white placeholder:text-gray-500 focus:outline-none focus:shadow-outline border border-gray-300 rounded-md py-3 px-3 block appearance-none leading-normal focus:border-[#00CCC0]",
            className,
          )}
          {...props}
          disabled={componentType === "file" || props.disabled ? true : false}
          aria-describedby={isFile ? helpId : undefined}
        />
        {label && (
          <label
            htmlFor="name"
            className={twMerge(
              "absolute flex items-center gap-2 z-10 rounded-full text-sm top-3 left-2 text-gray-400 pointer-events-none transition duration-200 ease-in-outbg-white px-2 text-grey-darker",
            )}
          >
            {props.required && <span className="text-red-800">*</span>}

            <span>{label}</span>
          </label>
        )}

        {after && (
          <div className="absolute inset-y-0 right-0 flex items-center">
            {after}
          </div>
        )}

        {before && (
          <div className="absolute inset-y-0 left-0 flex items-center z-0">
            {before}
          </div>
        )}

        {isFile && (
          <p id={helpId} className="mt-2 text-xs text-gray-500">
            Taille Maximum du fichier: {maxSizeMB} MB
          </p>
        )}
      </div>
    );
  },
);
MUIInput.displayName = "MUIInput";

const MUITextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea"> & {
    label: string;
  }
>(({ className, label, ...props }, ref) => {
  return (
    <div className="relative float-label-input">
      <textarea
        ref={ref}
        className={twMerge(
          "w-full text-md bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-md py-3 px-3 block appearance-none leading-normal focus:border-primary",
          className,
        )}
        {...props}
        style={{
          resize: "none",
        }}
      />
      <label
        htmlFor="name"
        className="absolute z-10 rounded-full text-md top-3 left-2 text-gray-400 pointer-events-none transition duration-200 ease-in-outbg-white px-2 text-grey-darker"
      >
        {label}
      </label>
    </div>
  );
});

MUITextarea.displayName = "MUITextarea";

export { Input, MUIInput, MUITextarea };
