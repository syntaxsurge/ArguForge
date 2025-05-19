"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { BroadcastButton } from "@/components/broadcast-button";
import { DebateForm } from "@/components/debate-form";
import { MessageControls } from "@/components/message-controls";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  generateDebateSummary,
  saveDebate,
  checkDebateCredits,
  useDebateCredit,
} from "@/lib/actions/debate";
import useWebRTCAudioSession from "@/lib/hooks/use-webrtc";
import { tools } from "@/lib/tools";
import { extractTokenUsage } from "@/lib/utils";

function LoadingSkeleton() {
  return (
    <div className="w-full max-w-xl text-card-foreground border-secondary py-4 md:p-4 space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-20 w-full" />
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

export default function PracticePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [savingStage, setSavingStage] = useState<
    "idle" | "analyzing" | "saving"
  >("idle");
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCredits = async () => {
    try {
      const count = await checkDebateCredits();
      setCredits(count);
    } catch (error) {
      console.error("Error loading credits:", error);
      toast.error("Failed to load credits");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCredits();
  }, []);

  const {
    status,
    isSessionActive,
    handleStartStopClick: handleStartStopWebRTC,
    registerFunction,
    msgs,
    conversation,
    showForm,
    debateInfo,
    handleDebateFormSubmit,
    timer,
    showSummary,
    resetAndStartNewDebate,
    stopSession,
  } = useWebRTCAudioSession(tools);

  const handleStartStopClick = async () => {
    if (isSessionActive === "connecting") {
      return;
    }
    if (credits === 0 && isSessionActive === "inactive") {
      toast.error("No credits remaining!");
      return;
    }

    try {
      handleStartStopWebRTC();

      // Only consume a credit when beginning a brand-new debate
      if (isSessionActive === "inactive") {
        await useDebateCredit();
        setCredits((prev) => (prev !== null ? prev - 1 : 0));
      }
    } catch (error) {
      console.error("Error using credit:", error);
      toast.error("Failed to use credit");
    }
  };

  const getTimerSeconds = () => {
    if (!timer) return 0;
    const [minutes, seconds] = timer.split(":").map(Number);
    return minutes * 60 + seconds;
  };

  const handleSaveDebate = async () => {
    if (!debateInfo || isSaving) return;
    const analysisToastId = toast.loading(
      "Analyzing your debate performance...",
    );
    try {
      setIsSaving(true);
      setSavingStage("analyzing");

      const { inputTokens, outputTokens } = extractTokenUsage(msgs);

      const debateId = await saveDebate({
        topic: debateInfo.topic,
        stance: debateInfo.stance,
        duration: getTimerSeconds(),
        inputTokens,
        outputTokens,
        transcript: conversation,
      });

      toast.dismiss(analysisToastId);
      const savingToastId = toast.loading("Saving debate and analysis...");
      await generateDebateSummary(debateId);
      toast.dismiss(savingToastId);
      setSavingStage("saving");

      toast.success("Debate saved with detailed analysis");
      router.push(`/dashboard/debate/${debateId}`);
    } catch (error) {
      console.error("Error saving debate:", error);
      toast.error("Failed to save debate");
      setIsSaving(false);
    } finally {
      setSavingStage("idle");
    }
  };

  useEffect(() => {
    registerFunction(
      "end_debate",
      ({ reason: _reason }: { reason: string }) => {
        setTimeout(() => {
          stopSession();
        }, 2000);

        return { success: true, message: "Debate ended" };
      },
    );

    registerFunction(
      "time_warning",
      ({ remaining_seconds }: { remaining_seconds: number }) => {
        return {
          success: true,
          message: "Time warning issued",
          remaining_seconds,
        };
      },
    );
  }, [registerFunction, stopSession]);

  if (isLoading) {
    return (
      <main className="h-full flex items-center justify-center bg-background">
        <LoadingSkeleton />
      </main>
    );
  }

  /**
   * Only show the "No credits" screen if the user has zero credits
   * **and** they have not started or finished a debate in the current view.
   */
  const showNoCreditsScreen =
    credits !== null &&
    credits === 0 &&
    showForm &&
    isSessionActive === "inactive" &&
    !showSummary;

  if (showNoCreditsScreen) {
    return (
      <main className="h-full flex items-center justify-center bg-background">
        <div className="w-full max-w-xl p-8">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center">
            <AlertCircle className="mx-auto mb-4 h-8 w-8 text-destructive" />
            <h2 className="mb-2 text-xl font-semibold">No Credits Remaining</h2>
            <p className="mb-6 text-muted-foreground">
              You have used all your practice credits. Please try again later or
              contact support for more credits.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="mx-auto"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-full flex items-center justify-center bg-background">
      <div className="w-full max-w-xl text-card-foreground border-secondary py-4 md:p-4 space-y-4">
        {showForm ? (
          <>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Debate Practice</h2>
              {credits !== null && (
                <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground shadow-sm">
                  {credits} credits
                </span>
              )}
            </div>
            <DebateForm onSubmit={handleDebateFormSubmit} />
          </>
        ) : showSummary ? (
          <>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Debate Summary</h2>
                <div className="text-right w-max">
                  <div className="text-xl font-mono font-bold">{timer}</div>
                  <p className="text-xs text-muted-foreground">
                    Total Duration
                  </p>
                </div>
              </div>

              {debateInfo && (
                <div className="p-4 bg-secondary/30 rounded-md">
                  <h3 className="font-medium mb-1">
                    Topic: {debateInfo.topic}
                  </h3>
                  <p className="text-sm">
                    {debateInfo.username}'s stance: {debateInfo.stance}
                  </p>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium mb-3 text-lg">Transcript</h3>
              <div className="max-h-80 overflow-y-auto p-4 border border-secondary/50 rounded-md">
                {conversation.map((msg) => (
                  <div key={msg.id} className="mb-3">
                    <p className="text-sm font-semibold">
                      {msg.role === "user"
                        ? debateInfo?.username || "You"
                        : "AI"}
                      :
                    </p>
                    <p className="pl-3 border-l-2 border-primary/30">
                      {msg.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={resetAndStartNewDebate}
                variant="outline"
                className="flex-1 border-secondary hover:bg-secondary/20"
              >
                Start New Debate
              </Button>
              <Button
                onClick={handleSaveDebate}
                className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {savingStage === "analyzing" ? "Analyzing..." : "Saving..."}
                  </>
                ) : (
                  "Save to History"
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex justify-between items-center gap-5">
                <div className="text-left">
                  {debateInfo && (
                    <div>
                      <h3 className="text-xl font-medium">
                        Debating: {debateInfo.topic}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Your stance: {debateInfo.stance}
                      </p>
                    </div>
                  )}
                </div>
                <div className="text-right w-max">
                  <div className="text-xl font-mono font-bold">{timer}</div>
                  <p className="text-xs text-muted-foreground">Time Elapsed</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-6">
                <BroadcastButton
                  isSessionActive={isSessionActive}
                  onClick={handleStartStopClick}
                />
              </div>
            </div>

            {status && (
              <div className="w-full">
                <MessageControls conversation={conversation} msgs={msgs} />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
