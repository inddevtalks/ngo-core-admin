import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className = "",
      disabled,
      isLoading,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "cursor-pointer font-medium rounded-lg transition-colors duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800",
      secondary: "bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200",
      ghost: "text-primary-600 hover:bg-primary-50 active:bg-primary-100",
      danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border border-red-600",
    };

    const sizes = {
      sm: "px-3 py-2 text-sm",
      md: "h-10 px-4 py-2.5 text-sm",
      lg: "h-[52px] px-6 py-3 text-base w-full",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
