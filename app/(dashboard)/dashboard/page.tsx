import Link from "next/link";
import { redirect } from "next/navigation";

import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  Clock3,
  Flame,
  FolderOpen,
  Sparkles,
  CircleDollarSign,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserDebates } from "@/lib/db/queries";
import { getCredits } from "@/lib/db/services/profile";
import { createServerClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [debates, credits] = await Promise.all([
    getUserDebates(user.id),
    getCredits(user.id),
  ]);

  const hasDebates = debates.length > 0;
  const totalSecondsSpoken = debates.reduce((sum, d) => sum + d.duration, 0);
  const minutesSpoken = Math.floor(totalSecondsSpoken / 60);
  const hoursSpoken = Math.floor(minutesSpoken / 60);

  return (
    <main className="relative">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-48 left-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-48 right-0 h-[600px] w-[600px] translate-x-1/3 rounded-full bg-secondary/30 blur-2xl" />
      </div>

      {/* Hero */}
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 pt-12 text-center lg:flex-row lg:justify-between lg:text-left">
        <div className="max-w-xl space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Welcome back<span className="text-primary">.</span>
          </h1>
          <p className="text-muted-foreground md:text-lg">
            Review your past debates, track improvement, and jump into a new
            sparring session whenever you're ready.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-start">
            <Button asChild size="lg" className="px-8 py-6">
              <Link
                href="/dashboard/practice"
                className="flex items-center gap-2"
              >
                <Flame className="h-5 w-5" />
                Start New Debate
              </Link>
            </Button>
            {hasDebates && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-secondary bg-white/60 backdrop-blur hover:bg-secondary/10"
              >
                <Link href="#history" className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Jump to History
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid w-full max-w-sm grid-cols-3 gap-4 rounded-3xl border border-secondary/40 bg-card/70 p-6 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="mt-1 text-2xl font-bold">{debates.length}</span>
            <span className="text-xs text-muted-foreground">Debates</span>
          </div>

          <div className="flex flex-col items-center">
            <CircleDollarSign className="h-6 w-6 text-emerald-600" />
            <span className="mt-1 text-2xl font-bold">{credits}</span>
            <span className="text-xs text-muted-foreground">Credits Left</span>
          </div>

          <div className="flex flex-col items-center">
            <Clock3 className="h-6 w-6 text-blue-600" />
            <span className="mt-1 text-2xl font-bold">
              {hoursSpoken}h {minutesSpoken % 60}m
            </span>
            <span className="text-xs text-muted-foreground">Time Spoken</span>
          </div>
        </div>
      </section>

      {/* Recent Debates */}
      <section
        id="history"
        className="mx-auto mt-20 max-w-6xl space-y-8 px-6 pb-24"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Recent Debates</h2>
          <Button asChild size="sm" variant="outline" className="gap-1">
            <Link href="/dashboard/practice">
              <Flame className="h-4 w-4" />
              Practice
            </Link>
          </Button>
        </div>

        {hasDebates ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {debates.map((debate) => {
              const minutes = Math.floor(debate.duration / 60);
              const seconds = (debate.duration % 60)
                .toString()
                .padStart(2, "0");
              return (
                <Card
                  key={debate.id}
                  className={cn(
                    "group relative overflow-hidden border-secondary/40 bg-card/70 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg",
                  )}
                >
                  {/* Gradient hover glow */}
                  <span className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition duration-500 group-hover:opacity-100">
                    <span className="absolute inset-0 scale-110 bg-gradient-to-br from-primary/10 via-primary/0 to-transparent blur-2xl" />
                  </span>

                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2 text-lg font-medium leading-snug">
                      <Link
                        href={`/dashboard/debate/${debate.id}`}
                        className="hover:underline"
                      >
                        {debate.topic}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">
                        {debate.stance.toLowerCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {minutes}:{seconds} mins
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {debate.createdAt &&
                        formatDistanceToNow(new Date(debate.createdAt), {
                          addSuffix: true,
                        })}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed border-secondary/50 bg-muted/20 px-10 py-20 text-center shadow-inner">
            <p className="max-w-sm text-muted-foreground">
              You haven't saved any debates yet. Start practising to build your
              history and track your progress over time.
            </p>
            <Button asChild size="lg" className="px-10 py-6">
              <Link
                href="/dashboard/practice"
                className="flex items-center gap-2"
              >
                <Flame className="h-5 w-5" />
                Start Your First Debate
              </Link>
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
