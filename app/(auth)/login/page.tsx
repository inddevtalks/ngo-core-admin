"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createBrowserSupabaseClient } from "@/lib/supabase";

/**
 * Platform admin auth — separate from NGO staff auth in ngocore-frontend.
 * Backend must enforce `platform_admin` role on admin API routes.
 */
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
      setMessage("Platform admin OTP sent. Only allowlisted emails should succeed.");
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
      router.push("/platform");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-zinc-100">
        <CardHeader>
          <CardTitle>Platform admin sign-in</CardTitle>
          <CardDescription className="text-zinc-400">
            Restricted to APNA TECH operators. Separate deployment and auth surface from NGO
            staff app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium">
                  Admin email
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@apnatech.in"
                  className="border-zinc-700 bg-zinc-950 text-zinc-100"
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                {loading ? "Sending…" : "Send admin OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label htmlFor="otp" className="mb-1 block text-sm font-medium">
                  One-time passcode
                </label>
                <Input
                  id="otp"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="border-zinc-700 bg-zinc-950 text-zinc-100"
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                {loading ? "Verifying…" : "Verify & enter console"}
              </Button>
            </form>
          )}

          {message ? <p className="mt-4 text-sm text-zinc-400">{message}</p> : null}

          <Button
            variant="ghost"
            className="mt-4 w-full text-zinc-300 hover:bg-zinc-800"
            onClick={() => router.push("/platform")}
          >
            Skip to console (dev)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
