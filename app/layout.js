import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "EventRSVP — Modern Event Invitations & Live RSVP Tracking",
  description:
    "Create elegant event invitation links in seconds. Guests RSVP instantly with a single tap — no account or app required.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F8F6ED] text-[#1C1917] bg-grain selection:bg-[#E4D9F7] selection:text-[#1C1917]">
        {children}
      </body>
    </html>
  );
}
