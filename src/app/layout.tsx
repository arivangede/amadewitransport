import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "sonner";

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
    "Amadewi Trans is your trusted partner for Bali private tours, car rental with driver, and airport transfers. Explore Bali safely and comfortably with our professional drivers.",
  keywords: [
    "Bali car rental",
    "Bali private tour",
    "car rental with driver Bali",
    "airport transfer Bali",
    "Bali tour service",
    "Amadewi Trans",
    "Bali transport service",
    "Bali travel agency",
  ],
  openGraph: {
    title: "Amadewi Trans | Bali Car Rental & Private Tour with Driver",
    description:
      "Reliable and affordable Bali car rental and private tour service. Explore Bali with Amadewi Trans and our experienced local drivers.",
    url: "https://amadewitrans.com",
    siteName: "Amadewi Trans",
    images: [
      {
        url: "https://svvbafvdcppzxndukdlw.supabase.co/storage/v1/object/public/landing//og-image.png", // Ganti dengan gambar sebenarnya
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
      "https://svvbafvdcppzxndukdlw.supabase.co/storage/v1/object/public/landing//og-image.png",
    ], // Ganti dengan gambar sebenarnya
  },
  alternates: {
    canonical: "https://amadewitrans.com",
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
        <Providers>{children}</Providers>
        <Toaster richColors expand={false} />
      </body>
    </html>
  );
}
