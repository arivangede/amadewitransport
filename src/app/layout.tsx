import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "sonner";
import TrafficTrackProvider from "@/provider/VisitorTrackerProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Amadewi Trans | Bali Car Rental & Private Tour with Driver",
  description:
    "Amadewi Trans provides trusted Bali car rental with driver, private tours, and airport transfers. Discover Bali in comfort with our reliable local transport service.",
  keywords: [
    "Bali car rental",
    "Bali private tour",
    "car rental with driver Bali",
    "airport transfer Bali",
    "Bali transport",
    "Amadewi Trans",
    "Bali travel agency",
    "private car hire Bali",
    "driver service Bali",
  ],
  openGraph: {
    title: "Amadewi Trans | Bali Car Rental & Private Tour with Driver",
    description:
      "Reliable and affordable Bali car rental and private tour service. Explore Bali with Amadewi Trans and our experienced local drivers.",
    url: process.env.NEXT_PUBLIC_API_BASE_URL,
    siteName: "Amadewi Trans",
    images: [
      {
        url: "https://svvbafvdcppzxndukdlw.supabase.co/storage/v1/object/public/landing/og-image.png",
        width: 1200,
        height: 630,
        alt: "Amadewi Trans Bali Transport Service",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amadewi Trans | Bali Car Rental & Private Tour",
    description:
      "Book your Bali transport with Amadewi Trans — Private tours, airport transfers, and car rentals with experienced local drivers.",
    images: [
      "https://svvbafvdcppzxndukdlw.supabase.co/storage/v1/object/public/landing/og-image.png",
    ],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <TrafficTrackProvider />
          {children}
        </Providers>
        <Toaster richColors expand={false} />
      </body>
    </html>
  );
}
