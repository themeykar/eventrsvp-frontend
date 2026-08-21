/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, logout } from "@/lib/auth";
import { LogOut, Calendar, Loader2, LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      const timer = setTimeout(() => {
        setCheckingAuth(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [router]);

  // Prevent flash of protected content while auth status is verified on client
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-grain font-sans p-4">
        <div className="flex items-center gap-3 rounded-full border border-stone-200/90 bg-white/80 backdrop-blur-md px-5 py-3 shadow-xs">
          <Loader2 className="h-4 w-4 animate-spin text-[#2D253B]" />
          <span className="text-xs font-medium text-[#57534E]">
            Verifying authentication...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-grain">
      {/* Dashboard Top Header */}
      <header className="sticky top-0 z-50 mx-auto w-full max-w-5xl px-4 pt-4 sm:pt-6">
        <nav className="flex items-center justify-between rounded-full border border-stone-200/90 bg-[#FAF8F5]/85 backdrop-blur-md px-5 py-3 shadow-[0_4px_20px_rgba(28,25,23,0.03)] transition-all">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <img
              src="/logo-placeholder.png"
              alt="EventRSVP Logo"
              className="h-8 w-8 rounded-full object-cover shadow-xs border border-stone-300/40"
            />
            <span className="font-serif text-xl font-bold tracking-tight text-[#1C1917]">
              EventRSVP
            </span>
          </Link>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-[#57534E] shadow-2xs hover:bg-stone-50 hover:text-[#1C1917] transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Log out</span>
          </button>
        </nav>
      </header>

      {/* Main Dashboard Placeholder Content */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-16 sm:py-24 flex flex-col items-center justify-center text-center">
        <div className="w-full max-w-lg rounded-3xl border border-stone-200/90 bg-white p-8 sm:p-12 shadow-[0_8px_30px_rgba(28,25,23,0.04)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E4D9F7] text-[#1C1917] border border-[#D4C3F2] mb-6">
            <LayoutDashboard className="h-7 w-7 text-[#2D253B]" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F8F6ED] px-3.5 py-1 text-xs font-semibold text-[#57534E] border border-stone-200/70 mb-3">
            <Calendar className="h-3.5 w-3.5 text-[#78716C]" />
            Host Area Protected Route
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1917]">
            Dashboard coming soon
          </h1>

          <p className="mt-3 text-sm text-[#57534E] leading-relaxed">
            Authentication is active and your session is verified. You will soon be able to create events, manage invitation links, and track guest RSVPs here.
          </p>

          <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-center gap-4">
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full bg-[#E4D9F7] px-6 py-2.5 text-xs font-semibold text-[#1C1917] border border-[#D4C3F2] hover:bg-[#D7C7F3] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5 text-[#2D253B]" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/60 py-6 text-center text-xs text-[#78716C]">
        © {new Date().getFullYear()} EventRSVP. All rights reserved.
      </footer>
    </div>
  );
}
