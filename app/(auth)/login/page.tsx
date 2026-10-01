"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { isSuperAdminEmail } from "@/lib/superadmin";
import { createBrowserSupabaseClient } from "@/lib/supabase";

const DEFAULT_EMAIL =
  process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL ?? "superadmin@ngocore.org";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || ROUTES.PLATFORM;
  const reason = searchParams.get("reason");

  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      setMessage("Email and password are required.");
      setLoading(false);
      return;
    }

    if (!isSuperAdminEmail(normalizedEmail)) {
      setMessage("This account is not authorized for the platform admin console.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: normalizedPassword,
      });
      if (error) throw error;

      const signedInEmail = data.user?.email?.toLowerCase() ?? "";
      if (!isSuperAdminEmail(signedInEmail)) {
        await supabase.auth.signOut();
        throw new Error("This account is not authorized for the platform admin console.");
      }

      router.push(nextPath.startsWith("/") ? nextPath : ROUTES.PLATFORM);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="space-y-2 text-left">
        <h1 className="text-[2rem] font-bold leading-[1.1] tracking-[-0.04em] text-neutral-900">
          Superadmin
        </h1>
        <p className="text-sm leading-relaxed text-neutral-500">
          Sign in with the platform superadmin account. This console is separate from the NGO staff
          app.
        </p>
        {reason === "expired" ? (
          <p className="text-sm font-medium text-amber-700">Your session expired. Sign in again.</p>
        ) : null}
        {reason === "unauthorized" ? (
          <p className="text-sm font-medium text-amber-700">You need to sign in to continue.</p>
        ) : null}
      </div>

      <form onSubmit={handleLogin} className="mt-6 space-y-4">
        <Input
          id="email"
          type="email"
          label="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="superadmin@ngocore.org"
          autoComplete="username"
        />
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <button
            type="button"
            className="absolute right-3 top-[38px] text-xs font-medium text-primary-700 hover:underline"
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <Button
          type="submit"
          size="lg"
          isLoading={loading}
          className="h-12 w-full rounded-xl bg-[#0f5c54] hover:bg-[#0d4f48]"
        >
          Sign in
        </Button>
      </form>

      {message ? <p className="mt-4 text-sm font-medium text-red-600">{message}</p> : null}
    </AuthLayout>
  );
}
