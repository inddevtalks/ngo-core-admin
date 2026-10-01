import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function NGOCoreLogo({
  href = "/",
  className,
  width = 140,
  height = 42,
}: {
  href?: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center transition-opacity hover:opacity-90", className)}
    >
      <Image
        src="/icons/full-logo.svg"
        alt="NGOCore logo"
        width={width}
        height={height}
        priority
        unoptimized
      />
    </Link>
  );
}
