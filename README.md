# EventRSVP — Frontend

The Next.js frontend for EventRSVP. Built with the App Router and Tailwind, talking to a Django REST Framework backend.

## What this does

For hosts: sign up, log in, create and manage events, see who's RSVP'd, share a link to your event, pull a QR code for that link, and export the guest list as a CSV.

For guests: no account needed. Open a shared event link, RSVP with your name, email, and status (yes/no/maybe, plus an optional plus-one count), and get a confirmation screen with an "Add to Calendar" option. If you need to change your response later, the same link lets you edit it.

## Tech stack

- Next.js (App Router, JavaScript)
- Tailwind CSS
- `qrcode.react` for the shareable-link QR code

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in your own values. Note the prefix here is `NEXT_PUBLIC_` (not `VITE_`, if you're used to the Vite-based projects) — anything the browser needs access to must use that prefix.
3. Run the dev server:
   ```
   npm run dev
   ```

## Pages and routes

- `/` — landing page, sets the design system (fonts, colors, nav) used everywhere else
- `/login`, `/signup` — deliberately distinct layouts, not the same template with swapped text
- `/dashboard` — protected, lists the host's events
- `/dashboard/events/[id]` — event management: guest list, RSVP summary stats, shareable link, QR code, CSV export
- `/events/[id]/rsvp` — the public RSVP page guests use, no login required. Reused for both new submissions and editing an existing RSVP.

Since the App Router doesn't have a single router wrapper the way something like react-router does, protected routes handle the JWT check and redirect individually rather than through a top-level guard.

## Known limitations

- **No event cover image upload.** This was left out on purpose — file upload and cloud storage handling is the whole teaching point of a separate upcoming project, so it made sense to keep that scope out of here.
- **Email delivery depends on the backend's Resend setup.** The RSVP flow itself works regardless, but real inbox delivery is currently limited to the account owner's verified email (see the backend README for details).
- **No reminder emails, no waitlist/capacity limits, no co-host support.** These follow the same backend limitations — nothing on the frontend is hiding functionality that exists elsewhere.

None of the above are bugs — they're scope decisions made along the way, kept here so they're easy to find later.