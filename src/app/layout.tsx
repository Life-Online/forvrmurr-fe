import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google';

import Providers from "@/context/Providers";
import SplashScreenWrapper from "./splashScreen";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ForvrMurr | Luxury Perfume Samples",
  description:
    "Explore coveted fragrances in 8ml portions. Smell rich. Explore more. No full bottle pressure.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

// Basic fallback component for the root layout suspense
const RootLoadingFallback = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "var(--font-geist-sans)",
      }}
    >
      <p>Loading ForvrMurr...</p>
      {/* You could add a logo or a more sophisticated skeleton here */}
    </div>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-cursorstyle="true">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} antialiased`}
      >
        <Providers>
          <SplashScreenWrapper>
            <Suspense fallback={<RootLoadingFallback />}>{children}</Suspense>
          </SplashScreenWrapper>
        </Providers>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''} />
      </body>
    </html>
  );
}
