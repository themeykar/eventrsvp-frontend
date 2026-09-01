/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  CalendarPlus,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
  AlertCircle,
  Plus,
  Minus,
  Check,
  Edit3,
} from "lucide-react";

/**
 * Formats ISO datetime string to user-friendly format.
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
 * Formats a JavaScript Date object to UTC iCalendar format (YYYYMMDDTHHMMSSZ).
 */
function formatDateToICal(date) {
  const pad = (n) => String(n).padStart(2, "0");
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escapes special characters for iCalendar text fields.
 */
function escapeICalText(str) {
  if (!str) return "";
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
}

export default function PublicRSVPPage() {
  const params = useParams();
  const eventId = params?.id;

  // View state: 'loading' | 'notFound' | 'form' | 'confirmation'
  const [viewState, setViewState] = useState("loading");
  const [eventData, setEventData] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // Form input state
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [status, setStatus] = useState("yes"); // 'yes' | 'no' | 'maybe'
  const [plusOneCount, setPlusOneCount] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Existing RSVP details for confirmation card
  const [existingRSVP, setExistingRSVP] = useState(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Check localStorage for prior RSVP submission
  const checkLocalStorage = useCallback(() => {
    if (!eventId || typeof window === "undefined") return false;

    const savedGuestId = localStorage.getItem(`guest_id_${eventId}`);
    const savedDetailsStr = localStorage.getItem(`rsvp_details_${eventId}`);

    if (savedGuestId && savedDetailsStr) {
      try {
        const parsed = JSON.parse(savedDetailsStr);
        setExistingRSVP(parsed);
        // Pre-fill form state with existing values
        setGuestName(parsed.guest_name || "");
        setGuestEmail(parsed.guest_email || "");
        setStatus(parsed.status || "yes");
        setPlusOneCount(parsed.plus_one_count || 0);
        return true;
      } catch (err) {
        console.error("Failed to parse saved RSVP details:", err);
      }
    }
    return false;
  }, [eventId]);

  // Load public event details
  const fetchPublicEvent = useCallback(async () => {
    if (!eventId) return;

    setViewState("loading");
    setFetchError(null);

    try {
      const res = await fetch(`${baseUrl}/api/events/${eventId}/public/`);

      if (res.status === 404) {
        setViewState("notFound");
        return;
      }

      if (!res.ok) {
        throw new Error(`Unable to load invitation (Server error ${res.status})`);
      }

      const data = await res.json();
      setEventData(data);

      // Check if guest already responded on this device
      const hasResponded = checkLocalStorage();
      if (hasResponded) {
        setViewState("confirmation");
      } else {
        setViewState("form");
      }
    } catch (err) {
      console.error("Error fetching public event:", err);
      setFetchError(err.message || "Could not connect to the server.");
      setViewState("notFound");
    }
  }, [eventId, baseUrl, checkLocalStorage]);

  useEffect(() => {
    fetchPublicEvent();
  }, [fetchPublicEvent]);

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!guestName.trim()) {
      errors.guestName = "Please enter your name.";
    }
    if (!guestEmail.trim()) {
      errors.guestEmail = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
      errors.guestEmail = "Please enter a valid email address.";
    }
    if (!status) {
      errors.status = "Please select an RSVP response.";
    }
    return errors;
  };

  // Submit RSVP (Create or Update)
  const handleSubmitRSVP = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);

    try {
      // Reuse existing guest_id from localStorage or state if updating, otherwise generate a new UUID
      let guestId = null;
      if (typeof window !== "undefined") {
        guestId = localStorage.getItem(`guest_id_${eventId}`);
      }
      if (!guestId && existingRSVP?.guest_id) {
        guestId = existingRSVP.guest_id;
      }
      if (!guestId) {
        guestId = crypto.randomUUID();
      }

      const payload = {
        guest_name: guestName.trim(),
        guest_email: guestEmail.trim(),
        status,
        plus_one_count: status === "yes" ? Number(plusOneCount) || 0 : 0,
        guest_id: guestId,
      };

      const res = await fetch(`${baseUrl}/api/events/${eventId}/rsvp/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        let msg = "Failed to submit RSVP. Please try again.";
        if (data.guest_id && Array.isArray(data.guest_id)) {
          msg = data.guest_id.join(" ");
        } else if (data.guest_name && Array.isArray(data.guest_name)) {
          msg = data.guest_name.join(" ");
        } else if (data.guest_email && Array.isArray(data.guest_email)) {
          msg = data.guest_email.join(" ");
        } else if (data.detail) {
          msg = data.detail;
        } else if (data.error) {
          msg = data.error;
        }
        throw new Error(msg);
      }

      // Save to localStorage to recognize returning guest and preserve updated details
      if (typeof window !== "undefined") {
        localStorage.setItem(`guest_id_${eventId}`, guestId);
        localStorage.setItem(`rsvp_details_${eventId}`, JSON.stringify(payload));
      }

      setExistingRSVP(payload);
      setViewState("confirmation");
    } catch (err) {
      console.error("Submit RSVP error:", err);
      setSubmitError(err.message || "Unable to submit RSVP.");
    } finally {
      setSubmitting(false);
    }
  };

  // Allow guest to edit response
  const handleEditRSVP = () => {
    if (existingRSVP) {
      setGuestName(existingRSVP.guest_name || "");
      setGuestEmail(existingRSVP.guest_email || "");
      setStatus(existingRSVP.status || "yes");
      setPlusOneCount(existingRSVP.plus_one_count || 0);
    }
    setViewState("form");
  };

  // Download .ics calendar event file
  const handleAddToCalendar = () => {
    if (!eventData) return;

    const startDate = eventData.date_time ? new Date(eventData.date_time) : new Date();
    const isValidDate = !isNaN(startDate.getTime());
    const actualStartDate = isValidDate ? startDate : new Date();
    const actualEndDate = new Date(actualStartDate.getTime() + 2 * 60 * 60 * 1000);

    const dtStart = formatDateToICal(actualStartDate);
    const dtEnd = formatDateToICal(actualEndDate);
    const summary = escapeICalText(eventData.title || "Event");
    const description = escapeICalText(eventData.description || "");
    const location = escapeICalText(eventData.location || "");

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//EventRSVP//EN",
      "BEGIN:VEVENT",
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const safeTitle = (eventData.title || "event")
      .replace(/[/\\?%*:|"<>]/g, "-")
      .trim();
    link.setAttribute("download", `${safeTitle}.ics`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Header Bar
  const renderHeader = () => (
    <header className="py-4 px-4 border-b border-stone-200/60 bg-[#FAF8F5]/80 backdrop-blur-xs">
      <div className="mx-auto max-w-lg flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
          <img
            src="/logo-placeholder.png"
            alt="EventRSVP Logo"
            className="h-7 w-7 rounded-full object-cover shadow-xs border border-stone-300/40"
          />
          <span className="font-serif text-lg font-bold tracking-tight text-[#1C1917]">
            EventRSVP
          </span>
        </Link>
        <span className="text-[11px] font-semibold text-[#78716C] bg-[#F8F6ED] px-3 py-1 rounded-full border border-stone-200/80">
          Invitation
        </span>
      </div>
    </header>
  );

  // 1. Loading state
  if (viewState === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-grain font-sans p-4">
        <div className="flex items-center gap-3 rounded-full border border-stone-200/90 bg-white/80 backdrop-blur-md px-5 py-3 shadow-xs">
          <Loader2 className="h-4 w-4 animate-spin text-[#2D253B]" />
          <span className="text-xs font-medium text-[#57534E]">
            Loading invitation...
          </span>
        </div>
      </div>
    );
  }

  // 2. 404 / Event Not Found state
  if (viewState === "notFound") {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-grain">
        {renderHeader()}
        <main className="flex-1 mx-auto w-full max-w-lg px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-full rounded-3xl border border-stone-200/90 bg-white p-8 sm:p-10 shadow-[0_8px_30px_rgba(28,25,23,0.04)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-800 border border-rose-200 mb-5">
              <AlertCircle className="h-7 w-7 text-rose-600" />
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1917]">
              Invitation Not Found
            </h1>

            <p className="mt-3 text-xs sm:text-sm text-[#57534E] leading-relaxed">
              {fetchError || "This event link is invalid or may have been removed."}
            </p>

            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-[#E4D9F7] px-6 py-2.5 text-xs font-semibold text-[#1C1917] border border-[#D4C3F2] hover:bg-[#D7C7F3] transition-all"
              >
                <span>Go to EventRSVP Home</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-grain">
      {renderHeader()}

      <main className="flex-1 mx-auto w-full max-w-lg px-4 py-8 sm:py-12">
        {/* 5. Keepsake Confirmation Card View */}
        {viewState === "confirmation" && existingRSVP && eventData && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Elegant Digital Invitation Card */}
            <div className="relative rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-10 shadow-[0_12px_40px_rgba(28,25,23,0.06)] overflow-hidden text-center">
              {/* Top Accent Gradient Line */}
              <div
                className={`absolute top-0 left-0 right-0 h-2 ${
                  existingRSVP.status === "yes"
                    ? "bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-300"
                    : existingRSVP.status === "no"
                    ? "bg-gradient-to-r from-rose-300 via-rose-500 to-rose-300"
                    : "bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300"
                }`}
              />

              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6 border shadow-2xs">
                {existingRSVP.status === "yes" && (
                  <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border-emerald-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>You’re Going!</span>
                  </div>
                )}
                {existingRSVP.status === "no" && (
                  <div className="flex items-center gap-1.5 text-rose-800 bg-rose-50 border-rose-200">
                    <XCircle className="h-4 w-4 text-rose-600" />
                    <span>Regrets Sent</span>
                  </div>
                )}
                {existingRSVP.status === "maybe" && (
                  <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50 border-amber-200">
                    <HelpCircle className="h-4 w-4 text-amber-600" />
                    <span>Not Certain</span>
                  </div>
                )}
              </div>

              {/* Event Title */}
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1917] leading-tight">
                {eventData.title}
              </h1>

              {/* Event Details Pill */}
              <div className="mt-6 rounded-2xl bg-[#FAF8F5] p-4 border border-stone-200/80 space-y-2.5 text-xs text-[#57534E] text-left">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-[#78716C] shrink-0" />
                  <span className="font-medium text-[#1C1917]">
                    {formatEventDateTime(eventData.date_time)}
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-[#78716C] shrink-0 mt-0.5" />
                  <span>{eventData.location}</span>
                </div>
              </div>

              {/* Guest Response Details Block */}
              <div className="mt-6 pt-6 border-t border-stone-100 space-y-2">
                <p className="text-xs uppercase tracking-wider text-[#78716C] font-semibold">
                  Response Recorded For
                </p>
                <p className="font-serif text-xl font-bold text-[#1C1917]">
                  {existingRSVP.guest_name}
                </p>

                {existingRSVP.status === "yes" && (
                  <p className="text-xs text-emerald-700 font-medium">
                    Attending • {existingRSVP.plus_one_count > 0 ? `+${existingRSVP.plus_one_count} guest` : "No extra guests"}
                  </p>
                )}

                {existingRSVP.status === "no" && (
                  <p className="text-xs text-rose-700 font-medium">
                    Declined invitation
                  </p>
                )}

                {existingRSVP.status === "maybe" && (
                  <p className="text-xs text-amber-700 font-medium">
                    Status: Not Certain
                  </p>
                )}
              </div>

              {/* Warm Host Note */}
              <p className="mt-6 text-xs text-[#57534E] italic leading-relaxed">
                {existingRSVP.status === "yes"
                  ? "Your response has been saved. The host has been notified and looks forward to seeing you!"
                  : existingRSVP.status === "no"
                  ? "Your regrets have been recorded. Thank you for letting the host know!"
                  : "Your response has been saved as 'Not Certain'. You can update your response anytime if your plans change."}
              </p>

              {/* Confirmation Card Actions */}
              <div className="mt-8 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-center gap-3">
                {(existingRSVP.status === "yes" || existingRSVP.status === "maybe") && (
                  <button
                    onClick={handleAddToCalendar}
                    className="inline-flex items-center gap-2 rounded-full border border-[#D4C3F2] bg-[#E4D9F7] px-5 py-2.5 text-xs font-semibold text-[#1C1917] hover:bg-[#D7C7F3] shadow-2xs transition-all cursor-pointer"
                  >
                    <CalendarPlus className="h-3.5 w-3.5 text-[#1C1917]" />
                    <span>Add to Calendar</span>
                  </button>
                )}

                <button
                  onClick={handleEditRSVP}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-2.5 text-xs font-semibold text-[#57534E] hover:bg-stone-50 hover:text-[#1C1917] shadow-2xs transition-all cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Update Response</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. RSVP Form View */}
        {viewState === "form" && eventData && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Event Overview Card */}
            <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgba(28,25,23,0.03)]">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F8F6ED] px-3 py-1 text-[11px] font-semibold text-[#57534E] border border-stone-200/80 mb-3">
                <Clock className="h-3 w-3 text-[#78716C]" />
                <span>You’re Invited</span>
              </span>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1917] leading-tight">
                {eventData.title}
              </h1>

              <div className="mt-4 space-y-2 text-xs sm:text-sm text-[#57534E]">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-[#78716C] shrink-0" />
                  <span className="font-semibold text-[#1C1917]">
                    {formatEventDateTime(eventData.date_time)}
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-[#78716C] shrink-0 mt-0.5" />
                  <span>{eventData.location}</span>
                </div>
              </div>

              {eventData.description && (
                <p className="mt-4 pt-4 border-t border-stone-100 text-xs sm:text-sm text-[#57534E] leading-relaxed italic">
                  “{eventData.description}”
                </p>
              )}
            </div>

            {/* RSVP Form Card */}
            <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgba(28,25,23,0.04)]">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-[#1C1917] mb-1">
                Will you be attending?
              </h2>
              <p className="text-xs text-[#78716C] mb-6">
                Please enter your name and select your RSVP status below.
              </p>

              {/* Submit Error Banner */}
              {submitError && (
                <div className="mb-6 flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="flex-1">{submitError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitRSVP} className="space-y-6">
                {/* Guest Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => {
                      setGuestName(e.target.value);
                      if (formErrors.guestName) setFormErrors((prev) => ({ ...prev, guestName: null }));
                    }}
                    placeholder="e.g. Maya Lin"
                    className={`w-full rounded-2xl border ${
                      formErrors.guestName
                        ? "border-rose-300 bg-rose-50/30 focus:ring-rose-200"
                        : "border-stone-200 bg-stone-50/50 focus:ring-[#E4D9F7]"
                    } px-4 py-3 text-sm text-[#1C1917] placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 transition-all`}
                  />
                  {formErrors.guestName && (
                    <p className="mt-1 text-xs text-rose-600">{formErrors.guestName}</p>
                  )}
                </div>

                {/* Guest Email */}
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => {
                      setGuestEmail(e.target.value);
                      if (formErrors.guestEmail) setFormErrors((prev) => ({ ...prev, guestEmail: null }));
                    }}
                    placeholder="e.g. maya@example.com"
                    className={`w-full rounded-2xl border ${
                      formErrors.guestEmail
                        ? "border-rose-300 bg-rose-50/30 focus:ring-rose-200"
                        : "border-stone-200 bg-stone-50/50 focus:ring-[#E4D9F7]"
                    } px-4 py-3 text-sm text-[#1C1917] placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 transition-all`}
                  />
                  {formErrors.guestEmail && (
                    <p className="mt-1 text-xs text-rose-600">{formErrors.guestEmail}</p>
                  )}
                </div>

                {/* RSVP Status Selection (3 Distinct Cards) */}
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-2">
                    RSVP Response <span className="text-rose-500">*</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Option 1: Yes / Attending */}
                    <button
                      type="button"
                      onClick={() => setStatus("yes")}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                        status === "yes"
                          ? "border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-200 shadow-xs"
                          : "border-stone-200 bg-stone-50/40 text-[#57534E] hover:bg-stone-50"
                      }`}
                    >
                      <CheckCircle2
                        className={`h-6 w-6 mb-1.5 ${
                          status === "yes" ? "text-emerald-600" : "text-[#78716C]"
                        }`}
                      />
                      <span className="font-semibold text-xs sm:text-sm">Yes</span>
                      <span className="text-[11px] opacity-75 mt-0.5">I’ll be there</span>
                    </button>

                    {/* Option 2: No / Decline */}
                    <button
                      type="button"
                      onClick={() => setStatus("no")}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                        status === "no"
                          ? "border-rose-500 bg-rose-50/80 text-rose-950 ring-2 ring-rose-200 shadow-xs"
                          : "border-stone-200 bg-stone-50/40 text-[#57534E] hover:bg-stone-50"
                      }`}
                    >
                      <XCircle
                        className={`h-6 w-6 mb-1.5 ${
                          status === "no" ? "text-rose-600" : "text-[#78716C]"
                        }`}
                      />
                      <span className="font-semibold text-xs sm:text-sm">No</span>
                      <span className="text-[11px] opacity-75 mt-0.5">Can’t make it</span>
                    </button>

                    {/* Option 3: Maybe / Not Certain */}
                    <button
                      type="button"
                      onClick={() => setStatus("maybe")}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                        status === "maybe"
                          ? "border-amber-500 bg-amber-50/80 text-amber-950 ring-2 ring-amber-200 shadow-xs"
                          : "border-stone-200 bg-stone-50/40 text-[#57534E] hover:bg-stone-50"
                      }`}
                    >
                      <HelpCircle
                        className={`h-6 w-6 mb-1.5 ${
                          status === "maybe" ? "text-amber-600" : "text-[#78716C]"
                        }`}
                      />
                      <span className="font-semibold text-xs sm:text-sm">Maybe</span>
                      <span className="text-[11px] opacity-75 mt-0.5">Not Certain</span>
                    </button>
                  </div>
                </div>

                {/* Conditional Plus-One Field (Only if Attending / Yes) */}
                {status === "yes" && (
                  <div className="rounded-2xl border border-stone-200 bg-[#FAF8F5]/60 p-4 transition-all animate-in fade-in duration-200">
                    <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                      Bringing additional guests? (+1)
                    </label>
                    <p className="text-[11px] text-[#78716C] mb-3">
                      Select how many extra guests will be joining you.
                    </p>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setPlusOneCount((prev) => Math.max(0, prev - 1))}
                        disabled={plusOneCount <= 0}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-[#1C1917] shadow-2xs hover:bg-stone-50 disabled:opacity-40 transition-all cursor-pointer"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <span className="w-12 text-center font-serif text-xl font-bold text-[#1C1917]">
                        +{plusOneCount}
                      </span>

                      <button
                        type="button"
                        onClick={() => setPlusOneCount((prev) => Math.min(10, prev + 1))}
                        disabled={plusOneCount >= 10}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-[#1C1917] shadow-2xs hover:bg-stone-50 disabled:opacity-40 transition-all cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-[#D4C3F2] bg-[#E4D9F7] px-6 py-3.5 text-sm font-semibold text-[#1C1917] shadow-xs hover:bg-[#D7C7F3] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-[#2D253B]" />
                        <span>{existingRSVP ? "Updating RSVP..." : "Submitting RSVP..."}</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 text-[#2D253B]" />
                        <span>{existingRSVP ? "Update RSVP" : "Submit RSVP"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-stone-200/60 py-6 text-center text-xs text-[#78716C] mt-auto">
        © {new Date().getFullYear()} EventRSVP. Powered by EventRSVP.
      </footer>
    </div>
  );
}
