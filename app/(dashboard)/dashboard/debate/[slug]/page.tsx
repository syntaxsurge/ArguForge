import Link from "next/link";
import { redirect } from "next/navigation";

import { format } from "date-fns";

import DebateAnalysis from "@/components/debate-analysis";
import { SummaryGenerator } from "@/components/summary-generator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { deleteDebate } from "@/lib/actions/debate";
import { getDebateById } from "@/lib/db/queries";
import { createServerClient } from "@/lib/supabase";

interface DebatePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function DebatePage({ params }: DebatePageProps) {
  const { slug } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const debate = await getDebateById(slug);

  if (!debate) {
    return (
      <div className="py-10 m-auto max-w-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Debate not found</h1>
          <p className="text-muted-foreground">
            The debate you are looking for does not exist.
          </p>
        </div>
        <div className="mt-4 flex justify-center gap-2">
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/practice">Practice</Link>
          </Button>
        </div>
      </div>
    );
  }

  const transcript = debate.transcript as Array<{
    role: string;
    text: string;
    id: string;
  }>;

  return (
    <main className="container max-w-5xl py-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5">
          <div>
            <h2 className="font-semibold mb-2">{debate.topic}</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Stance: {debate.stance} •{" "}
              {debate.createdAt && format(new Date(debate.createdAt), "PPP")} •{" "}
              {Math.floor(debate.duration / 60)}:
              {(debate.duration % 60).toString().padStart(2, "0")} mins
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button variant="outline">Back to Debates</Button>
            </Link>
            <Button
              variant="destructive"
              onClick={async () => {
                "use server";
                await deleteDebate(debate.id);
              }}
            >
              Delete Debate
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <Card className="p-0 md:p-6 bg-transparent md:bg-card border-transparent md:border-border shadow-none md:shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Analysis</h2>
            <SummaryGenerator
              debateId={debate.id}
              hasAnalysis={!!debate.analysis}
            />
          </div>

          {debate.analysis ? (
            <DebateAnalysis analysis={debate.analysis} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>
                No analysis available. Click "Generate Analysis" to create one.
              </p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Transcript</h2>
          <div className="space-y-4">
            {transcript.map((msg) => (
              <div key={msg.id} className="mb-2">
                <p className="font-semibold">
                  {msg.role === "user" ? "You" : "AI"}:
                </p>
                <p className="pl-2 border-l-2 border-primary">{msg.text}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
