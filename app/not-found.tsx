import Link from "next/link";

import { ArrowLeft, Flame, Home } from "lucide-react";

import SiteHeader from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config/site";

/**
 * Global 404 page with compact header, reduced top gap, and decorative accents.
 */
export default function NotFound() {
  return (
    <>
      {/* Site header */}
      <SiteHeader />

      {/* Content */}
      <main className="relative flex flex-col items-center px-6 pt-20 pb-24 min-h-[80vh]">
        {/* Decorative blurred blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-48 left-1/2 h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -bottom-48 right-1/3 h-[500px] w-[500px] translate-x-1/3 rounded-full bg-secondary/25 blur-2xl" />
        </div>

        {/* Heading & Copy */}
        <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl">
          404<span className="text-primary">.</span>
          <span className="block text-2xl font-semibold md:inline">
            &nbsp;Page Not Found
          </span>
        </h1>
        <p className="mt-4 max-w-lg text-center text-muted-foreground md:text-lg">
          Looks like you&apos;ve ventured off the debate floor. Let&apos;s get
          you back to {siteConfig.name}.
        </p>

        {/* Actions */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="gap-2 px-8 py-6">
            <Link href="/">
              <Home className="h-5 w-5" />
              Home
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="gap-2 border-secondary bg-white/60 backdrop-blur hover:bg-secondary/10"
          >
            <Link href="/dashboard/practice">
              <Flame className="h-5 w-5" />
              Start a Debate
            </Link>
          </Button>
        </div>

        <div className="mt-16 text-sm text-muted-foreground">
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </Link>
        </div>
      </main>
    </>
  );
}