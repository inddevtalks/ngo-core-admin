import Link from "next/link";
import { PlatformNav } from "./nav";

interface PlatformShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function PlatformShell({ title, description, children }: PlatformShellProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <Link href="/platform" className="text-lg font-semibold text-indigo-300">
              NGOCORE Admin
            </Link>
            <p className="text-xs text-zinc-400">APNA TECH platform operators</p>
          </div>
          <Link href="/login" className="text-sm text-zinc-400 hover:text-zinc-200">
            Sign out
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-8 md:grid-cols-[220px_1fr]">
        <aside className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <PlatformNav />
        </aside>

        <main>
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">{title}</h1>
            {description ? <p className="mt-1 text-sm text-zinc-400">{description}</p> : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
