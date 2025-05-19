import { Manrope } from "next/font/google";

import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/lib/config/site";
import { UserProvider } from "@/lib/contexts/user-context";
import { cn } from "@/lib/utils";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ArguForge — Forge Better Arguments",
  description:
    "ArguForge empowers speakers to sharpen their reasoning with live AI debates, actionable feedback, and progress tracking.",
  authors: [{ name: siteConfig.author, url: siteConfig.links.twitter }],
  creator: siteConfig.author,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    images: "/opengraph-image.png",
  },
  icons: {
    icon: "/favicon.ico",
  },
  keywords: [
    "Debate",
    "Debating",
    "Debate AI",
    "Debate Platform",
    "Debate Preparation",
    "Debate Training",
    "Debate Skills",
    "Debate Strategies",
    "Debate Tips",
    "Debate Techniques",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-dvh bg-background font-sans antialiased",
          manrope.variable,
        )}
      >
        <UserProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative min-h-dvh bg-background">
              <main>{children}</main>
            </div>
            <Toaster />
          </ThemeProvider>
        </UserProvider>
        <Analytics />
      </body>
    </html>
  );
}
