"use server";

import Image from "next/image";
import Link from "next/link";

import {
  Bolt,
  Brain,
  CalendarClock,
  LineChart,
  Mic,
  Scale,
} from "lucide-react";

import { MainHeader } from "@/components/navigation/main-header";
import { Button } from "@/components/ui/button";
import { createServerClient } from "@/lib/supabase";

interface Feature {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const FEATURES: Feature[] = [
  {
    title: "Real-time AI Sparring",
    description:
      "Face an adaptive AI opponent that challenges every claim in milliseconds.",
    icon: Mic,
  },
  {
    title: "Granular Performance Insights",
    description:
      "Get an in-depth breakdown of logic, rhetoric, and strategy after every session.",
    icon: LineChart,
  },
  {
    title: "Progress Tracking",
    description:
      "Visualise growth over time and uncover trends in clarity and persuasion.",
    icon: Brain,
  },
  {
    title: "Practice on Your Schedule",
    description:
      "Sharpen your skills anywhere, anytime — no partner coordination needed.",
    icon: CalendarClock,
  },
  {
    title: "Competitive Edge",
    description:
      "Simulate high-pressure rounds to build confidence and think on your feet faster.",
    icon: Bolt,
  },
  {
    title: "Balanced Perspectives",
    description:
      "ArguForge automatically adopts the opposing stance so you can stress-test every viewpoint.",
    icon: Scale,
  },
];

export default async function HomePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ctaHref = user ? "/dashboard/practice" : "/login";

  return (
    <main className="relative min-h-svh bg-gradient-to-b from-background via-background/80 to-background text-foreground">
      {/* Decorative blurred blobs */}
      <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-48 right-1/3 h-[550px] w-[550px] translate-x-1/3 rounded-full bg-secondary/25 blur-2xl" />
      </div>

      {/* Sticky blurred header */}
      <MainHeader user={user} compact />

      {/* Hero */}
      <section className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 sm:px-6 pt-20 lg:flex-row lg:items-start lg:gap-24 lg:pt-32">
        {/* Copy */}
        <div className="max-w-2xl space-y-8 text-center lg:text-left">
          <h1 className="break-words text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Forge&nbsp;
            <span className="bg-gradient-to-r from-primary via-primary/70 to-primary/45 bg-clip-text text-transparent">
              stronger&nbsp;arguments
            </span>
            <br className="hidden sm:inline" />
            with AI-powered debates
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground md:text-xl">
            ArguForge pairs you with a relentless AI sparring partner that hones
            your logic, refines your rhetoric and tracks your progress — all in
            one streamlined platform.
          </p>
          <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-start">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto px-10 py-6"
            >
              <Link href={ctaHref}>Start Practising</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-secondary bg-white/60 backdrop-blur hover:bg-secondary/10"
            >
              <Link href="#features">See Features</Link>
            </Button>
          </div>
        </div>

        {/* Illustration – hidden on very small screens to remove overflow */}
        <div className="relative mx-auto hidden w-full max-w-sm sm:block lg:mx-0 lg:max-w-lg">
          <Image
            src="https://cdn.arguforge.com/illustrations/argument.svg"
            alt="Abstract illustration of debating"
            width={800}
            height={800}
            className="w-full drop-shadow-xl"
            priority
          />
          <div className="absolute inset-0 -z-10 rounded-full border-8 border-primary/20 blur-lg" />
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto mt-24 max-w-7xl px-6">
        <svg
          viewBox="0 0 1200 80"
          fill="none"
          className="h-16 w-full text-secondary"
        >
          <path
            d="M0 40C200 0 400 0 600 40C800 80 1000 80 1200 40V80H0V40Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Features */}
      <section
        id="features"
        className="mx-auto mt-24 grid max-w-7xl grid-cols-1 gap-10 px-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURES.map(({ title, description, icon: Icon }) => (
          <article
            key={title}
            className="group relative overflow-hidden rounded-3xl border border-secondary/40 bg-card/70 p-8 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            {/* Gradient hover glow */}
            <span className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition duration-500 group-hover:opacity-100">
              <span className="absolute inset-0 scale-110 bg-gradient-to-br from-primary/10 via-primary/0 to-transparent blur-2xl" />
            </span>

            <Icon className="h-10 w-10 text-primary" />
            <h3 className="mt-6 text-2xl font-semibold">{title}</h3>
            <p className="mt-2 text-muted-foreground">{description}</p>
          </article>
        ))}
      </section>

      {/* Secondary CTA */}
      <section className="mx-auto mt-32 flex max-w-5xl flex-col items-center rounded-3xl border border-secondary/40 bg-card/70 px-10 py-20 text-center shadow-sm backdrop-blur-sm">
        <h2 className="max-w-2xl text-2xl sm:text-3xl font-bold md:text-4xl">
          Ready to elevate your debating skills?
        </h2>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Join hundreds of speakers using ArguForge to think faster, argue
          better and win more rounds.
        </p>
        <Button asChild size="lg" className="mt-10 px-10 py-6">
          <Link href={ctaHref}>Begin Your First Debate</Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="mt-32 border-t border-secondary/40 py-10 text-center text-sm text-muted-foreground">
        <p>
          Crafted with ❤️ by{" "}
          <Link
            href="https://x.com/itsjadeempleo"
            className="underline-offset-2 hover:underline"
          >
            Jade Laurence Empleo
          </Link>
        </p>
      </footer>
    </main>
  );
}