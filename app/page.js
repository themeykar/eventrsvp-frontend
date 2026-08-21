/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  Calendar,
  CalendarPlus,
  Share2,
  Users,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      {/* Floating Pill Navigation */}
      <header className="sticky top-0 z-50 mx-auto w-full max-w-5xl px-4 pt-4 sm:pt-6">
        <nav className="flex items-center justify-between rounded-full border border-stone-200/90 bg-[#FAF8F5]/85 backdrop-blur-md px-5 py-3 shadow-[0_4px_20px_rgba(28,25,23,0.03)] transition-all">
          {/* Left side: Logo img + Wordmark */}
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

          {/* Right side: EXACTLY TWO ITEMS ("Log in" link + "Get Started" lavender button) */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/login"
              className="text-sm font-medium text-[#57534E] hover:text-[#1C1917] transition-colors py-1.5 focus:outline-none"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-[#E4D9F7] px-4 sm:px-5 py-2 text-sm font-semibold text-[#1C1917] shadow-xs border border-[#D4C3F2]/70 hover:bg-[#D7C7F3] transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-5xl px-4 pt-16 sm:pt-24 pb-16 text-center">
          {/* Editorial Headline with italic emphasis on key word */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-[#1C1917] leading-[1.12] max-w-4xl mx-auto">
            Plan it. Share it.{" "}
            <em className="italic font-serif text-[#1C1917] font-normal underline decoration-[#E4D9F7] decoration-wavy decoration-2 underline-offset-4">
              Watch
            </em>{" "}
            them RSVP.
          </h1>

          {/* Sans-serif Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-[#57534E] max-w-2xl mx-auto leading-relaxed font-normal">
            Create a stunning event invitation link in seconds. Share it with
            anyone, your guests RSVP with a single tap, no account or app
            download needed.
          </p>

          {/* Primary CTA Button & Free trial caption */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-3 rounded-full bg-[#E4D9F7] px-8 py-4 text-base font-semibold text-[#1C1917] shadow-sm border border-[#D4C3F2] hover:bg-[#D7C7F3] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Calendar className="h-5 w-5 text-[#2D253B]" />
              <span>Create Your First Event</span>
              <ArrowRight className="h-4 w-4 text-[#2D253B]/70" />
            </Link>
            <span className="text-xs text-[#78716C] font-medium tracking-wide">
              Try for free.
            </span>
          </div>

          {/* Interactive / Visual Product Showcase Card */}
          <div className="mt-14 sm:mt-18 mx-auto max-w-3xl">
            <div className="relative rounded-3xl border border-stone-200/90 bg-[#FFFFFF] p-6 sm:p-8 shadow-[0_8px_30px_rgba(28,25,23,0.05)] text-left overflow-hidden">
              {/* Top decorative ribbon */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#E4D9F7] via-[#D4C3F2] to-[#E4D9F7]" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F8F6ED] px-3 py-1 text-xs font-semibold text-[#57534E] border border-stone-200/70 mb-2">
                    {/* <Sparkles className="h-3 w-3 text-[#78716C]" /> */}
                    <span>Public Invitation Preview</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
                    Summer Evening Soirée
                  </h2>
                  <p className="text-sm text-[#78716C] mt-0.5">
                    Hosted by Shalewa & Tobi
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live RSVPs
                  </span>
                </div>
              </div>

              {/* Event Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 text-sm">
                <div className="flex items-start gap-3 text-[#57534E]">
                  <div className="rounded-xl bg-[#F8F6ED] p-2.5 text-[#1C1917] border border-stone-200/60">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block font-medium text-[#1C1917]">
                      Saturday, July 18
                    </span>
                    <span className="text-xs text-[#78716C]">
                      6:30 PM – 10:00 PM WAT
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-[#57534E]">
                  <div className="rounded-xl bg-[#F8F6ED] p-2.5 text-[#1C1917] border border-stone-200/60">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block font-medium text-[#1C1917]">
                      The Courtyard Garden
                    </span>
                    <span className="text-xs text-[#78716C]">
                      142 Nsikak Drive, Abuja
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Guest Tracker Bar */}
              <div className="rounded-2xl bg-[#F8F6ED] p-4 border border-stone-200/80">
                <div className="flex items-center justify-between mb-3 text-xs font-semibold text-[#57534E]">
                  <span>Guest Responses (24 total)</span>
                  <span className="text-[#1C1917]">86% Attending</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-white p-2.5 border border-stone-200/60 shadow-2xs">
                    <span className="block font-bold text-lg text-emerald-700">
                      18
                    </span>
                    <span className="text-[#78716C] font-medium">Attending</span>
                  </div>
                  <div className="rounded-xl bg-white p-2.5 border border-stone-200/60 shadow-2xs">
                    <span className="block font-bold text-lg text-rose-600">
                      3
                    </span>
                    <span className="text-[#78716C] font-medium">Declined</span>
                  </div>
                  <div className="rounded-xl bg-white p-2.5 border border-stone-200/60 shadow-2xs">
                    <span className="block font-bold text-lg text-amber-600">
                      3
                    </span>
                    <span className="text-[#78716C] font-medium">Pending</span>
                  </div>
                </div>

                {/* Sample Guest Notification */}
                <div className="mt-3 flex items-center gap-2 text-xs text-[#57534E] bg-white/80 rounded-xl p-2.5 border border-stone-200/50">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong className="text-[#1C1917]">Cynthia Eze</strong>{" "}
                    just confirmed (+1 guest • Vegetarian option)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="border-t border-stone-200/60 bg-[#FAF8F5]/60 py-20">
          <div className="mx-auto max-w-5xl px-4">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1917]">
                How EventRSVP Works
              </h2>
              <p className="mt-3 text-base sm:text-lg text-[#57534E]">
                Hosting made effortless, from setup to headcount in three simple steps.
              </p>
            </div>

            {/* 3 Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative rounded-2xl border border-stone-200/80 bg-white p-7 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E4D9F7] text-[#1C1917] border border-[#D4C3F2]">
                      <CalendarPlus className="h-6 w-6 text-[#2D253B]" />
                    </div>
                    <span className="font-serif text-2xl font-bold text-stone-300">
                      01
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#1C1917] mb-2">
                    Create your event
                  </h3>
                  <p className="text-sm text-[#57534E] leading-relaxed">
                    Set up your event page in under a minute with title, date,
                    location, and host notes. No complex setups or bloated features.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs font-medium text-[#78716C]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Takes less than 60 seconds</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative rounded-2xl border border-stone-200/80 bg-white p-7 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E4D9F7] text-[#1C1917] border border-[#D4C3F2]">
                      <Share2 className="h-6 w-6 text-[#2D253B]" />
                    </div>
                    <span className="font-serif text-2xl font-bold text-stone-300">
                      02
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#1C1917] mb-2">
                    Share the link
                  </h3>
                  <p className="text-sm text-[#57534E] leading-relaxed">
                    Send your public invitation link via SMS, WhatsApp, or email.
                    Guests tap to open, no app download or registration required.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs font-medium text-[#78716C]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Zero guest friction</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative rounded-2xl border border-stone-200/80 bg-white p-7 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E4D9F7] text-[#1C1917] border border-[#D4C3F2]">
                      <Users className="h-6 w-6 text-[#2D253B]" />
                    </div>
                    <span className="font-serif text-2xl font-bold text-stone-300">
                      03
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#1C1917] mb-2">
                    Watch RSVPs roll in
                  </h3>
                  <p className="text-sm text-[#57534E] leading-relaxed">
                    Track guest responses, plus-ones, and dietary restrictions in
                    real time on your private, easy-to-use host dashboard.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs font-medium text-[#78716C]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Live headcount updates</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-stone-200/70 bg-[#F8F6ED] py-10">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo-placeholder.png"
              alt="EventRSVP Logo"
              className="h-6 w-6 rounded-full object-cover"
            />
            <span className="font-serif text-base font-bold text-[#1C1917]">
              EventRSVP
            </span>
          </div>

          <p className="text-xs text-[#78716C] text-center sm:text-right">
            © {new Date().getFullYear()} EventRSVP. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
