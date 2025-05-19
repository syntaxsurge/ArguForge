"use client";

import { useState } from "react";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { generateDebateSummary } from "@/lib/actions/debate";
import { useToast } from "@/lib/ui/toast";
import { logError } from "@/lib/utils/logger";

interface AnalysisGeneratorProps {
  debateId: string;
  hasAnalysis: boolean;
}

export function SummaryGenerator({
  debateId,
  hasAnalysis,
}: AnalysisGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateAnalysis = async () => {
    try {
      setIsGenerating(true);

      await generateDebateSummary(debateId);

      toast({
        title: "Analysis generated",
        description: "The debate analysis has been generated successfully.",
      });
    } catch (error) {
      logError("Error generating analysis:", error);
      toast({
        title: "Error",
        description: "Failed to generate analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (hasAnalysis) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGenerateAnalysis}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        "Generate Analysis"
      )}
    </Button>
  );
}
