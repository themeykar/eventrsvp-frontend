/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, logout } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import {
  LogOut,
  Calendar,
  Loader2,
  Plus,
  MapPin,
  Clock,
  ChevronRight,
  X,
  AlertCircle,
  CheckCircle2,
  CalendarPlus,
  Sparkles,
} from "lucide-react";

/**
 * Formats ISO date string into a user-friendly date & time representation.
 * Example: "Sat, Sep 12, 2026 • 7:00 PM"
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

export default function DashboardPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Event list state
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date_time: "",
    location: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successBanner, setSuccessBanner] = useState(null);

  // Check auth status & fetch initial events
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      setCheckingAuth(false);
      loadEvents();
    }
  }, [router]);

  // Load events from Django backend
  const loadEvents = async () => {
    setLoadingEvents(true);
    setFetchError(null);

    try {
      const res = await apiRequest("/api/events/");
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        throw new Error(`Failed to load events (Server returned ${res.status})`);
      }
      const data = await res.json();
      
      // Sort by date_time: soonest upcoming first
      const sorted = [...data].sort(
        (a, b) => new Date(a.date_time) - new Date(b.date_time)
      );
      setEvents(sorted);
    } catch (err) {
      setFetchError(err.message || "Could not connect to the backend server.");
    } finally {
      setLoadingEvents(false);
    }
  };

  // Open & Close modal helpers
  const openModal = () => {
    setFormData({ title: "", description: "", date_time: "", location: "" });
    setFormErrors({});
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!submitting) {
      setIsModalOpen(false);
    }
  };

  // Form Field Change Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Client Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = "Event title is required.";
    }
    if (!formData.location.trim()) {
      errors.location = "Location is required.";
    }
    if (!formData.date_time) {
      errors.date_time = "Date & time is required.";
    } else {
      const parsedDate = new Date(formData.date_time);
      if (isNaN(parsedDate.getTime())) {
        errors.date_time = "Please enter a valid date and time.";
      }
    }
    return errors;
  };

  // Submit Handler for Create Event
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);

    try {
      // Format datetime to ISO 8601 UTC string for DRF DateTimeField
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date_time: new Date(formData.date_time).toISOString(),
        location: formData.location.trim(),
      };

      const res = await apiRequest("/api/events/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        let errorMsg = "Failed to create event.";
        if (errorData) {
          if (typeof errorData === "object") {
            const messages = [];
            for (const [key, val] of Object.entries(errorData)) {
              const valText = Array.isArray(val) ? val.join(" ") : val;
              messages.push(`${key}: ${valText}`);
            }
            errorMsg = messages.join(" | ");
          } else if (errorData.detail) {
            errorMsg = errorData.detail;
          }
        }
        throw new Error(errorMsg);
      }

      const newEvent = await res.json();

      // Update state without full page reload
      setEvents((prev) => {
        const updated = [newEvent, ...prev];
        return updated.sort(
          (a, b) => new Date(a.date_time) - new Date(b.date_time)
        );
      });

      setIsModalOpen(false);
      setSuccessBanner(`"${newEvent.title}" has been created!`);
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err) {
      setSubmitError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  // Prevent flash while checking auth
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
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 mx-auto w-full max-w-5xl px-4 pt-4 sm:pt-6">
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

          <div className="flex items-center gap-3">
            <button
              onClick={openModal}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#E4D9F7] px-4 py-2 text-xs font-semibold text-[#1C1917] border border-[#D4C3F2] hover:bg-[#D7C7F3] shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-[#2D253B]" />
              <span>Create Event</span>
            </button>

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

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
        {/* Dashboard Title & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1917]">
              Your Events
            </h1>
            <p className="mt-1 text-sm text-[#57534E]">
              Manage your upcoming occasions and view live guest responses.
            </p>
          </div>

          {events.length > 0 && !loadingEvents && (
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 rounded-full bg-[#1C1917] text-white px-5 py-2.5 text-xs font-semibold shadow-md hover:bg-[#2D253B] transition-all hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Event</span>
            </button>
          )}
        </div>

        {/* Success Banner Notification */}
        {successBanner && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-medium text-emerald-800 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>{successBanner}</span>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="text-emerald-600 hover:text-emerald-900 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Error Alert Box */}
        {fetchError && (
          <div className="mb-8 rounded-2xl border border-rose-200 bg-rose-50/80 p-5 text-rose-900 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-700">
                  Failed to load events
                </h3>
                <p className="mt-1 text-xs text-rose-800">{fetchError}</p>
                <button
                  onClick={loadEvents}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-900 hover:bg-rose-200 transition-colors cursor-pointer"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Skeleton State */}
        {loadingEvents && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-3xl border border-stone-200/80 bg-white/70 p-6 shadow-xs animate-pulse flex flex-col justify-between h-48"
              >
                <div>
                  <div className="h-4 w-24 bg-stone-200 rounded-full mb-3" />
                  <div className="h-6 w-3/4 bg-stone-200 rounded-lg mb-4" />
                  <div className="h-3 w-1/2 bg-stone-200 rounded mb-2" />
                  <div className="h-3 w-2/3 bg-stone-200 rounded" />
                </div>
                <div className="h-4 w-28 bg-stone-200 rounded-full mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loadingEvents && !fetchError && events.length === 0 && (
          <div className="rounded-3xl border border-stone-200/90 bg-white/90 p-8 sm:p-12 text-center shadow-[0_8px_30px_rgba(28,25,23,0.03)] flex flex-col items-center max-w-lg mx-auto my-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E4D9F7] text-[#1C1917] border border-[#D4C3F2] mb-5">
              <CalendarPlus className="h-8 w-8 text-[#2D253B]" />
            </div>

            <h2 className="font-serif text-2xl font-bold tracking-tight text-[#1C1917]">
              No events yet — create your first one
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-[#57534E] leading-relaxed max-w-sm">
              Get started by creating your event. You will receive a unique shareable link for guest RSVPs instantly.
            </p>

            <button
              onClick={openModal}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#E4D9F7] px-6 py-3 text-xs font-semibold text-[#1C1917] border border-[#D4C3F2] hover:bg-[#D7C7F3] shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-[#2D253B]" />
              <span>Create Your First Event</span>
            </button>
          </div>
        )}

        {/* Event List Grid */}
        {!loadingEvents && !fetchError && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/dashboard/events/${event.id}`}
                className="group relative flex flex-col justify-between rounded-3xl border border-stone-200/90 bg-white p-6 shadow-[0_4px_20px_rgba(28,25,23,0.03)] hover:shadow-[0_12px_30px_rgba(28,25,23,0.08)] hover:border-[#D4C3F2] transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#E4D9F7]"
              >
                <div>
                  {/* Top Card Tag */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F8F6ED] px-3 py-1 text-[11px] font-semibold text-[#57534E] border border-stone-200/80">
                      <Clock className="h-3 w-3 text-[#78716C]" />
                      <span>
                        {new Date(event.date_time) > new Date()
                          ? "Upcoming"
                          : "Past Event"}
                      </span>
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="font-serif text-xl font-bold tracking-tight text-[#1C1917] group-hover:text-[#2D253B] transition-colors line-clamp-1">
                    {event.title}
                  </h2>

                  {/* Date & Time */}
                  <div className="mt-3 flex items-start gap-2 text-xs text-[#57534E]">
                    <Calendar className="h-3.5 w-3.5 text-[#78716C] mt-0.5 flex-shrink-0" />
                    <span>{formatEventDateTime(event.date_time)}</span>
                  </div>

                  {/* Location */}
                  <div className="mt-2 flex items-start gap-2 text-xs text-[#57534E]">
                    <MapPin className="h-3.5 w-3.5 text-[#78716C] mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>

                  {/* Optional Description snippet */}
                  {event.description && (
                    <p className="mt-3 text-xs text-[#78716C] line-clamp-2 italic">
                      “{event.description}”
                    </p>
                  )}
                </div>

                {/* Card Footer Link CTA */}
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-[#57534E] group-hover:text-[#1C1917]">
                  <span>Manage Event</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F8F6ED] group-hover:bg-[#E4D9F7] text-[#1C1917] transition-all">
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/60 py-6 text-center text-xs text-[#78716C] mt-auto">
        © {new Date().getFullYear()} EventRSVP. All rights reserved.
      </footer>

      {/* Create Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/40 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-2xl my-8 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold tracking-tight text-[#1C1917]">
                  Create New Event
                </h2>
                <p className="text-xs text-[#57534E] mt-0.5">
                  Fill in the details to set up your invitation page.
                </p>
              </div>
              <button
                onClick={closeModal}
                disabled={submitting}
                className="rounded-full p-2 text-[#78716C] hover:bg-stone-100 hover:text-[#1C1917] transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Error Banner */}
            {submitError && (
              <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800">
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="flex-1">{submitError}</span>
              </div>
            )}

            {/* Event Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Event Title */}
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">
                  Event Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Maya & Julian's Engagement Dinner"
                  className={`w-full rounded-2xl border ${
                    formErrors.title
                      ? "border-rose-300 bg-rose-50/30 focus:ring-rose-200"
                      : "border-stone-200 bg-stone-50/50 focus:ring-[#E4D9F7]"
                  } px-4 py-2.5 text-sm text-[#1C1917] placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 transition-all`}
                />
                {formErrors.title && (
                  <p className="mt-1 text-xs text-rose-600">{formErrors.title}</p>
                )}
              </div>

              {/* Date & Time */}
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">
                  Date & Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="date_time"
                  value={formData.date_time}
                  onChange={handleChange}
                  className={`w-full rounded-2xl border ${
                    formErrors.date_time
                      ? "border-rose-300 bg-rose-50/30 focus:ring-rose-200"
                      : "border-stone-200 bg-stone-50/50 focus:ring-[#E4D9F7]"
                  } px-4 py-2.5 text-sm text-[#1C1917] focus:bg-white focus:outline-none focus:ring-2 transition-all`}
                />
                {formErrors.date_time && (
                  <p className="mt-1 text-xs text-rose-600">
                    {formErrors.date_time}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">
                  Location <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. The Botanical Gardens, Pavilion 4"
                  className={`w-full rounded-2xl border ${
                    formErrors.location
                      ? "border-rose-300 bg-rose-50/30 focus:ring-rose-200"
                      : "border-stone-200 bg-stone-50/50 focus:ring-[#E4D9F7]"
                  } px-4 py-2.5 text-sm text-[#1C1917] placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 transition-all`}
                />
                {formErrors.location && (
                  <p className="mt-1 text-xs text-rose-600">
                    {formErrors.location}
                  </p>
                )}
              </div>

              {/* Description (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">
                  Description <span className="text-xs text-[#78716C] font-normal">(Optional)</span>
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add any extra details, dress code, or note for your guests..."
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-sm text-[#1C1917] placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E4D9F7] transition-all resize-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-full border border-stone-200 px-5 py-2.5 text-xs font-semibold text-[#57534E] hover:bg-stone-50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full bg-[#E4D9F7] px-6 py-2.5 text-xs font-semibold text-[#1C1917] border border-[#D4C3F2] hover:bg-[#D7C7F3] shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2D253B]" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5 text-[#2D253B]" />
                      <span>Create Event</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

