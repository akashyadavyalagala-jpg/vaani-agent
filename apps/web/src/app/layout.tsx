import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Instrument_Serif } from "next/font/google";
import { Noto_Sans_Telugu, Noto_Serif_Telugu } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  variable: "--font-instrument-serif",
  subsets: ["latin"],
});

const notoTeluguSans = Noto_Sans_Telugu({
  weight: ["400", "500", "700"],
  variable: "--font-noto-telugu-sans",
  subsets: ["telugu"],
});

const notoTeluguSerif = Noto_Serif_Telugu({
  weight: ["400", "700"],
  variable: "--font-noto-telugu-serif",
  subsets: ["telugu"],
});

import { ThemeProvider } from "@/components/ThemeProvider";
import CookieBanner from '@/components/CookieBanner';
import { CustomCursor } from '@/components/CustomCursor';

export const metadata: Metadata = {
  title: "వాణి - Premium Telugu Voice AI",
  description: "Real-time Telugu voice AI agent for customer conversations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${notoTeluguSans.variable} ${notoTeluguSerif.variable} antialiased bg-zinc-50 text-zinc-900 dark:bg-[#0A0A0B] dark:text-[#EDEDF0] transition-colors duration-300`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <CustomCursor />
          {children}
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
