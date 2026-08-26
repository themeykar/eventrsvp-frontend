/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, logout } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Copy,
  Check,
  RotateCw,
  UserCheck,
  UserX,
  HelpCircle,
  Users,
  LogOut,
  Loader2,
  AlertCircle,
  Link as LinkIcon,
} from "lucide-react";

/**
 * Format ISO datetime string to friendly readable format.
 * Example: "Saturday, Sep 12, 2026 • 7:00 PM"
 */
function formatEventDateTime(dateTimeStr) {
  if (!dateTimeStr) return "";
  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) return dateTimeStr;

  const dateFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

  const timeFormatted = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return `${dateFormatted} • ${timeFormatted}`;
}

/**
 * Format RSVP submitted date.
 * Example: "Aug 26, 2026 at 1:15 PM"
 */
function formatSubmittedAt(dateTimeStr) {
  if (!dateTimeStr) return "";
  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) return dateTimeStr;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id;

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Data states
  const [eventData, setEventData] = useState(null);
  const [rsvpSummary, setRsvpSummary] = useState({
    yes_count: 0,
    no_count: 0,
    maybe_count: 0,
    total_plus_ones: 0,
    total_rsvps: 0,
  });
  const [rsvps, setRsvps] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Copy link state
  const [copied, setCopied] = useState(false);

  // Load event details and RSVPs
  const fetchEventAndRSVPs = useCallback(
    async (isManualRefresh = false) => {
      if (!eventId) return;

      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setLoadingData(true);
      }
      setErrorMsg(null);

      try {
        // Fetch event info and RSVPs concurrently
        const [eventRes, rsvpRes] = await Promise.all([
          apiRequest(`/api/events/${eventId}/`),
          apiRequest(`/api/events/${eventId}/rsvps/`),
        ]);

        if (eventRes.status === 401 || rsvpRes.status === 401) {
          logout();
          return;
        }

        // If either returns 404, the event does not exist or host does not own it
        if (eventRes.status === 404 || rsvpRes.status === 404) {
          setNotFound(true);
          return;
        }

        if (!eventRes.ok || !rsvpRes.ok) {
          throw new Error("Failed to load event data. Please try again.");
        }

        const [eventJson, rsvpJson] = await Promise.all([
          eventRes.json(),
          rsvpRes.json(),
        ]);

        setEventData(eventJson);
        if (rsvpJson.summary) {
          setRsvpSummary(rsvpJson.summary);
        }
        if (rsvpJson.rsvps) {
          // Sort by most recent first
          const sorted = [...rsvpJson.rsvps].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
          setRsvps(sorted);
        }
      } catch (err) {
        console.error("Error loading event detail:", err);
        setErrorMsg(err.message || "An error occurred while loading event details.");
      } finally {
        setLoadingData(false);
        setIsRefreshing(false);
      }
    },
    [eventId]
  );

  // Auth verification & initial fetch
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      setCheckingAuth(false);
      fetchEventAndRSVPs();
    }
  }, [router, fetchEventAndRSVPs]);

  // Handle Copy Link
  const handleCopyLink = () => {
    if (typeof window === "undefined" || !eventId) return;
    const publicUrl = `${window.location.origin}/rsvp/${eventId}`;
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Auth check loader
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

  // Header Nav element
  const renderHeader = () => (
    <header className="sticky top-0 z-40 mx-auto w-full max-w-5xl px-4 py-4 sm:py-6 bg-[#F8F6ED]/80 backdrop-blur-xs">
      <nav className="flex items-center justify-between">
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

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-[#57534E] shadow-2xs hover:bg-stone-50 hover:text-[#1C1917] transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-[#57534E] shadow-2xs hover:bg-stone-50 hover:text-[#1C1917] transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </nav>
    </header>
  );

  // 404 / Ownership Not Found State
  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-grain">
        {renderHeader()}
        <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-16 sm:py-24 flex flex-col items-center justify-center text-center">
          <div className="w-full max-w-md rounded-3xl border border-stone-200/90 bg-white p-8 sm:p-12 shadow-[0_8px_30px_rgba(28,25,23,0.04)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-800 border border-rose-200 mb-5">
              <AlertCircle className="h-7 w-7 text-rose-600" />
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1917]">
              Event Not Found
            </h1>

            <p className="mt-3 text-xs sm:text-sm text-[#57534E] leading-relaxed">
              This event does not exist or you do not have permission to manage it.
            </p>

            <div className="mt-6">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-[#E4D9F7] px-6 py-2.5 text-xs font-semibold text-[#1C1917] border border-[#D4C3F2] hover:bg-[#D7C7F3] shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-[#2D253B]" />
                <span>Return to Dashboard</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const shareableUrl =
    typeof window !== "undefined" && eventId
      ? `${window.location.origin}/rsvp/${eventId}`
      : `/rsvp/${eventId}`;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-grain">
      {renderHeader()}

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
        {/* Navigation Breadcrumb & Back button */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#78716C] hover:text-[#1C1917] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to all events</span>
          </Link>
        </div>

        {/* General Error Banner */}
        {errorMsg && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => fetchEventAndRSVPs()}
              className="font-semibold underline hover:text-rose-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Content Loading State */}
        {loadingData ? (
          <div className="space-y-6 animate-pulse">
            <div className="rounded-3xl border border-stone-200/80 bg-white/70 p-6 sm:p-8 h-44" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 h-24" />
            <div className="rounded-3xl border border-stone-200/80 bg-white/70 p-6 h-36" />
          </div>
        ) : (
          eventData && (
            <div className="space-y-8">
              {/* Event Header Banner Card */}
              <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgba(28,25,23,0.03)]">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F8F6ED] px-3 py-1 text-[11px] font-semibold text-[#57534E] border border-stone-200/80 mb-3">
                      <Clock className="h-3 w-3 text-[#78716C]" />
                      <span>
                        {new Date(eventData.date_time) > new Date()
                          ? "Upcoming Event"
                          : "Past Event"}
                      </span>
                    </span>

                    <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1917]">
                      {eventData.title}
                    </h1>

                    <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#57534E]">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#78716C] shrink-0" />
                        <span>{formatEventDateTime(eventData.date_time)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#78716C] shrink-0" />
                        <span>{eventData.location}</span>
                      </div>
                    </div>

                    {eventData.description && (
                      <p className="mt-4 text-xs sm:text-sm text-[#57534E] leading-relaxed max-w-2xl pt-3 border-t border-stone-100">
                        {eventData.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* RSVP Summary Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Attending (Yes) */}
                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 sm:p-5 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
                    <span>Attending</span>
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-emerald-950">
                    {rsvpSummary.yes_count}
                  </div>
                </div>

                {/* Declined (No) */}
                <div className="rounded-2xl border border-rose-200/80 bg-rose-50/60 p-4 sm:p-5 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-rose-800">
                    <span>Declined</span>
                    <UserX className="h-4 w-4 text-rose-600" />
                  </div>
                  <div className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-rose-950">
                    {rsvpSummary.no_count}
                  </div>
                </div>

                {/* Maybe */}
                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 sm:p-5 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-800">
                    <span>Maybe</span>
                    <HelpCircle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-amber-950">
                    {rsvpSummary.maybe_count}
                  </div>
                </div>

                {/* Plus Ones */}
                <div className="rounded-2xl border border-[#D4C3F2] bg-[#E4D9F7]/40 p-4 sm:p-5 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#2D253B]">
                    <span>Total Plus-Ones</span>
                    <Users className="h-4 w-4 text-[#2D253B]" />
                  </div>
                  <div className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
                    +{rsvpSummary.total_plus_ones}
                  </div>
                </div>
              </div>

              {/* Shareable Public RSVP Link Box */}
              <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-[0_4px_20px_rgba(28,25,23,0.03)]">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-[#78716C]">
                  <LinkIcon className="h-3.5 w-3.5 text-[#78716C]" />
                  <span>Shareable Public RSVP Link</span>
                </div>
                <p className="text-xs text-[#57534E] mb-4">
                  Send this link to your guests via SMS, WhatsApp, or email. No guest account required.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareableUrl}
                    className="flex-1 rounded-xl border border-stone-200 bg-[#FAF8F5] px-4 py-2.5 text-xs sm:text-sm font-mono text-[#1C1917] select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E4D9F7] px-5 py-2.5 text-xs font-semibold text-[#1C1917] border border-[#D4C3F2] hover:bg-[#D7C7F3] shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-700" />
                        <span className="text-emerald-800 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 text-[#2D253B]" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Guest Responses Section */}
              <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgba(28,25,23,0.03)]">
                {/* Header & Refresh Action */}
                <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
                  <div>
                    <h2 className="font-serif text-2xl font-bold tracking-tight text-[#1C1917]">
                      Guest Responses
                    </h2>
                    <p className="text-xs text-[#57534E] mt-0.5">
                      {rsvpSummary.total_rsvps === 1
                        ? "1 response recorded"
                        : `${rsvpSummary.total_rsvps} responses recorded`}
                    </p>
                  </div>

                  <button
                    onClick={() => fetchEventAndRSVPs(true)}
                    disabled={isRefreshing}
                    className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#57534E] hover:bg-stone-50 hover:text-[#1C1917] shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RotateCw
                      className={`h-3.5 w-3.5 ${
                        isRefreshing ? "animate-spin text-[#2D253B]" : ""
                      }`}
                    />
                    <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
                  </button>
                </div>

                {/* Empty State */}
                {rsvps.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8F6ED] border border-stone-200 mb-4">
                      <Users className="h-6 w-6 text-[#78716C]" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                      No responses yet
                    </h3>
                    <p className="mt-1 text-xs text-[#57534E] max-w-sm">
                      Share your public invitation link to start collecting guest RSVPs.
                    </p>
                    <button
                      onClick={handleCopyLink}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#E4D9F7] px-4 py-2 text-xs font-semibold text-[#1C1917] border border-[#D4C3F2] hover:bg-[#D7C7F3] transition-all cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>{copied ? "Copied!" : "Copy RSVP Link"}</span>
                    </button>
                  </div>
                ) : (
                  /* Guest Responses Table / Card list */
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-stone-200/80 text-[11px] uppercase tracking-wider text-[#78716C]">
                          <th className="pb-3 font-semibold">Guest Name</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold text-center">Plus-Ones</th>
                          <th className="pb-3 font-semibold text-right">Submitted</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {rsvps.map((rsvp) => (
                          <tr key={rsvp.id} className="hover:bg-stone-50/60 transition-colors">
                            <td className="py-3.5 font-semibold text-[#1C1917]">
                              {rsvp.guest_name}
                            </td>
                            <td className="py-3.5">
                              {rsvp.status === "yes" && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                                  <UserCheck className="h-3 w-3 text-emerald-600" />
                                  <span>Attending</span>
                                </span>
                              )}
                              {rsvp.status === "no" && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-800 border border-rose-200">
                                  <UserX className="h-3 w-3 text-rose-600" />
                                  <span>Declined</span>
                                </span>
                              )}
                              {rsvp.status === "maybe" && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
                                  <HelpCircle className="h-3 w-3 text-amber-600" />
                                  <span>Maybe</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 text-center font-mono text-xs text-[#57534E]">
                              {rsvp.plus_one_count > 0 ? `+${rsvp.plus_one_count}` : "0"}
                            </td>
                            <td className="py-3.5 text-right text-xs text-[#78716C]">
                              {formatSubmittedAt(rsvp.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </main>

      <footer className="border-t border-stone-200/60 py-6 text-center text-xs text-[#78716C] mt-auto">
        © {new Date().getFullYear()} EventRSVP. All rights reserved.
      </footer>
    </div>
  );
}
