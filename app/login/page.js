/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${apiUrl}/api/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage =
          data.detail ||
          data.error ||
          (data.non_field_errors && data.non_field_errors[0]) ||
          "Invalid email or password. Please check your credentials.";
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Store JWT tokens in localStorage
      if (data.access) {
        localStorage.setItem("access_token", data.access);
      }
      if (data.refresh) {
        localStorage.setItem("refresh_token", data.refresh);
      }

      // Redirect to /dashboard replacing history entry
      router.replace("/dashboard");
    } catch (err) {
      console.error("Login submission error:", err);
      setError("Unable to connect to server. Please check your network connection.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-grain font-sans">
      {/* Centered Login Card */}
      <div className="w-full max-w-md rounded-3xl border border-stone-200/90 bg-white p-8 sm:p-10 shadow-[0_8px_30px_rgba(28,25,23,0.04)]">
        {/* Header with Logo */}
        <div className="text-center">
          <Link href="/" className="inline-block focus:outline-none">
            <img
              src="/logo-placeholder.png"
              alt="EventRSVP Logo"
              className="mx-auto h-10 w-10 rounded-full object-cover shadow-xs border border-stone-300/50"
            />
          </Link>
          <h1 className="mt-4 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1917]">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-[#78716C]">
            Log in to manage your events and track RSVPs
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-rose-200/80 bg-rose-50 p-3.5 text-xs font-medium text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-[#1C1917] mb-1.5"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-stone-200 bg-[#FAF8F5]/50 px-4 py-3 text-sm text-[#1C1917] placeholder-[#A8A29E] transition-colors focus:border-[#2D253B] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2D253B]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-[#1C1917] mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-stone-200 bg-[#FAF8F5]/50 px-4 py-3 pr-11 text-sm text-[#1C1917] placeholder-[#A8A29E] transition-colors focus:border-[#2D253B] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2D253B]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[#78716C] hover:text-[#1C1917] focus:outline-none focus:text-[#1C1917] transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-[#D4C3F2] bg-[#E4D9F7] px-5 py-3.5 text-sm font-semibold text-[#1C1917] shadow-xs hover:bg-[#D7C7F3] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#2D253B]" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Log in</span>
            )}
          </button>
        </form>

        {/* Link to Signup */}
        <p className="mt-6 text-center text-xs text-[#78716C]">
          Don’t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#1C1917] underline decoration-stone-300 underline-offset-2 hover:decoration-[#1C1917] transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* Back to homepage link */}
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 text-xs font-medium text-[#78716C] hover:text-[#1C1917] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to homepage</span>
      </Link>
    </div>
  );
}
