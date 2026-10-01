import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    const errorClass = error
      ? "border-red-500 focus:ring-red-500"
      : "border-[#dfeae7] focus:ring-primary-600";

    return (
      <div className="w-full">
        {label ? (
          <label className="mb-2 block text-left text-sm font-medium text-neutral-700">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-neutral-900 shadow-sm placeholder-neutral-400 transition-colors duration-200 focus:border-transparent focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500 ${errorClass} ${className}`}
          {...props}
        />
        {error ? <p className="mt-1.5 text-sm text-red-500">{error}</p> : null}
      </div>
    );
  },
);

Input.displayName = "Input";
