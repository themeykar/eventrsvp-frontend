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
  metadataBase: new URL("https://eventrsvp.site"),
  title: {
    default: "EventRSVP — Gatherings made effortless",
    template: "%s — EventRSVP",
  },
  description:
    "Create elegant event links in seconds. Your guests RSVP with a single tap — no passwords, apps, or friction.",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "EventRSVP — Gatherings made effortless",
    description:
      "Create elegant event links in seconds. Your guests RSVP with a single tap — no passwords, apps, or friction.",
    url: "https://eventrsvp.site",
    siteName: "EventRSVP",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EventRSVP — Gatherings made effortless",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EventRSVP — Gatherings made effortless",
    description:
      "Create elegant event links in seconds. Your guests RSVP with a single tap — no passwords, apps, or friction.",
    images: ["/og-image.png"],
  },
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
