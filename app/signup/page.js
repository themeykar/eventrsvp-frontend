/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    // Frontend validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Passwords do not match. Please verify both fields.");
      return;
    }

    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${apiUrl}/api/auth/signup/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        let msg = "Signup failed. Please try again.";
        if (data.email && Array.isArray(data.email)) {
          msg = data.email.join(" ");
        } else if (data.password && Array.isArray(data.password)) {
          msg = data.password.join(" ");
        } else if (data.password_confirmation && Array.isArray(data.password_confirmation)) {
          msg = data.password_confirmation.join(" ");
        } else if (data.detail) {
          msg = data.detail;
        } else if (data.error) {
          msg = data.error;
        } else if (data.non_field_errors) {
          msg = data.non_field_errors.join(" ");
        }
        setError(msg);
        setLoading(false);
        return;
      }

      // Success
      setSuccessMsg("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      console.error("Signup error:", err);
      setError("Unable to connect to server. Please check your network connection.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-10 bg-grain font-sans">
      {/* Top Bar Navigation */}
      <header className="mx-auto w-full max-w-6xl flex items-center justify-between py-2">
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-none"
        >
          <img
            src="/logo-placeholder.png"
            alt="EventRSVP Logo"
            className="h-8 w-8 rounded-full object-cover shadow-xs border border-stone-300/40 transition-transform group-hover:scale-105"
          />
          <span className="font-serif text-xl font-bold tracking-tight text-[#1C1917]">
            EventRSVP
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#78716C] hover:text-[#1C1917] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to homepage</span>
        </Link>
      </header>

      {/* Main Two-Column Split Container */}
      <main className="mx-auto w-full max-w-6xl my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center py-8">
        {/* Left Column: Rich Value Proposition & Host Pitch (5 columns) */}
        <div className="lg:col-span-5 flex flex-col justify-center pr-0 lg:pr-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E4D9F7]/70 border border-[#D4C3F2] px-3.5 py-1 text-xs font-semibold text-[#1C1917] w-fit mb-4">

            <span>Host Account Registration</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1C1917] leading-[1.12]">
            Gatherings made{" "}
            <em className="italic font-serif text-[#1C1917] font-normal underline decoration-[#E4D9F7] decoration-wavy decoration-2 underline-offset-4">
              effortless
            </em>
            .
          </h1>

          <p className="mt-4 text-base text-[#57534E] leading-relaxed">
            Create elegant event links in seconds. Your guests RSVP with a single
            tap, no passwords, apps, or friction.
          </p>

          {/* Feature List */}
          <div className="mt-8 space-y-3.5">
            <div className="flex items-start gap-3 text-sm text-[#1C1917]">
              <div className="rounded-full bg-emerald-100 p-1 text-emerald-700 mt-0.5 shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span>
                <strong>Zero guest friction</strong> — no account creation needed for attendees.
              </span>
            </div>

            <div className="flex items-start gap-3 text-sm text-[#1C1917]">
              <div className="rounded-full bg-emerald-100 p-1 text-emerald-700 mt-0.5 shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span>
                <strong>Live host dashboard</strong> — track headcounts and dietary restrictions instantly.
              </span>
            </div>

            <div className="flex items-start gap-3 text-sm text-[#1C1917]">
              <div className="rounded-full bg-emerald-100 p-1 text-emerald-700 mt-0.5 shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span>
                <strong>Instant share links</strong> — works via SMS, WhatsApp, or email.
              </span>
            </div>
          </div>

          {/* Editorial Quote Card */}
          <div className="mt-8 rounded-2xl border border-stone-200/80 bg-white/70 backdrop-blur-xs p-5 text-xs text-[#57534E] italic leading-relaxed">
            &ldquo;EventRSVP transformed how we manage our dinner parties and celebrations. It&apos;s clean, fast, and our guests love how simple it is.&rdquo;
          </div>
        </div>

        {/* Right Column: Signup Form Card (7 columns) */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-stone-200/90 bg-white p-7 sm:p-10 shadow-[0_8px_30px_rgba(28,25,23,0.04)]">
            <div className="text-left">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1917]">
                Create your host account
              </h2>
              <p className="mt-1 text-sm text-[#78716C]">
                Start hosting your next event for free.
              </p>
            </div>

            {/* Success Alert */}
            {successMsg && (
              <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-rose-200/80 bg-rose-50 p-3.5 text-xs font-medium text-rose-700">
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
                    placeholder="At least 8 characters"
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
                <p className="mt-1 text-[11px] text-[#78716C]">
                  Must be at least 8 characters long.
                </p>
              </div>

              <div>
                <label
                  htmlFor="passwordConfirmation"
                  className="block text-xs font-semibold text-[#1C1917] mb-1.5"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="passwordConfirmation"
                    type={showConfirmation ? "text" : "password"}
                    required
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full rounded-xl border border-stone-200 bg-[#FAF8F5]/50 px-4 py-3 pr-11 text-sm text-[#1C1917] placeholder-[#A8A29E] transition-colors focus:border-[#2D253B] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2D253B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmation((prev) => !prev)}
                    aria-label={showConfirmation ? "Hide confirmation password" : "Show confirmation password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[#78716C] hover:text-[#1C1917] focus:outline-none focus:text-[#1C1917] transition-colors cursor-pointer"
                  >
                    {showConfirmation ? (
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
                disabled={loading || Boolean(successMsg)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-[#D4C3F2] bg-[#E4D9F7] px-5 py-3.5 text-sm font-semibold text-[#1C1917] shadow-xs hover:bg-[#D7C7F3] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#2D253B]" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            {/* Link to Login */}
            <p className="mt-6 text-center text-xs text-[#78716C]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#1C1917] underline decoration-stone-300 underline-offset-2 hover:decoration-[#1C1917] transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="mx-auto w-full max-w-6xl text-center py-4">
        <p className="text-xs text-[#78716C]">
          © {new Date().getFullYear()} EventRSVP. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
