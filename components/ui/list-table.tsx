import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type TableIconActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  tone?: "neutral" | "primary" | "danger";
};

const toneClass = {
  neutral: "text-neutral-600 hover:bg-neutral-100",
  primary: "text-primary-700 hover:bg-primary-50",
  danger: "text-red-700 hover:bg-red-50",
};

/** Icon-only row action — matches tenant donations/donors Actions column. */
export function TableIconButton({
  label,
  tone = "neutral",
  className,
  children,
  ...props
}: TableIconActionProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cn("rounded-lg p-1.5 transition-colors", toneClass[tone], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function TableIconLink({
  href,
  label,
  tone = "primary",
  children,
}: {
  href: string;
  label: string;
  tone?: "neutral" | "primary" | "danger";
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className={cn("rounded-lg p-1.5 transition-colors", toneClass[tone])}
    >
      {children}
    </Link>
  );
}

export function TableStatusBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        className,
      )}
    >
      {children}
    </span>
  );
}

export const LIST_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_LIST_PAGE_SIZE = 10;

export const tableHeadClass =
  "border-y border-[#dfeae7] bg-[#f8faf9] text-xs uppercase tracking-wide text-neutral-500";

export const tableRowClass = "hover:bg-[#f8faf9]/70";
