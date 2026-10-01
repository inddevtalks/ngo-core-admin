"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NGOCoreLogo } from "@/components/ui/NGOCoreLogo";
import { ROUTES } from "@/constants/routes";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSendOtp(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });
      if (error) throw error;
      setOtpSent(true);
      setMessage("We sent a one-time passcode to your email.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });
      if (error) throw error;
      router.push(ROUTES.PLATFORM);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7f6] px-4">
      <div className="w-full max-w-[480px] rounded-2xl border border-[#e8eeec] bg-white px-4 py-6 shadow-[0_24px_70px_rgba(15,45,42,0.12)] sm:rounded-[40px] sm:px-8 sm:py-8">
        <NGOCoreLogo href={ROUTES.LOGIN} />
        <div className="mt-6 space-y-2">
          <h1 className="text-[2rem] font-bold leading-[1.1] tracking-[-0.04em] text-neutral-900">
            Platform admin
          </h1>
          <p className="text-sm leading-relaxed text-neutral-500">
            Sign in with an APNA TECH operator email. This console is separate from the NGO staff app.
          </p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
            <Input
              id="email"
              type="email"
              label="Admin email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@apnatech.in"
              autoComplete="email"
            />
            <Button type="submit" size="lg" isLoading={loading} className="h-12 w-full rounded-xl bg-[#0f5c54] hover:bg-[#0d4f48]">
              Send login code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
            <Input
              id="otp"
              label="One-time passcode"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="123456"
            />
            <Button type="submit" size="lg" isLoading={loading} className="h-12 w-full rounded-xl bg-[#0f5c54] hover:bg-[#0d4f48]">
              Verify & continue
            </Button>
            <button
              type="button"
              className="text-sm font-medium text-primary-600 underline underline-offset-2 hover:text-primary-700"
              onClick={() => {
                setOtpSent(false);
                setMessage(null);
              }}
            >
              Use a different email
            </button>
          </form>
        )}

        {message ? <p className="mt-4 text-sm text-neutral-600">{message}</p> : null}

        <Button
          variant="ghost"
          className="mt-4 w-full"
          onClick={() => router.push(ROUTES.PLATFORM)}
        >
          Skip to console (dev)
        </Button>
      </div>
    </div>
  );
}
