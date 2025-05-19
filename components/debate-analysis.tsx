"use client";
import {
  AlertCircle,
  ArrowUpRight,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  FileText,
  FlameKindling,
  Lightbulb,
  MessageSquareQuote,
  Target,
  ThumbsUp,
  Zap,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DebateAnalysis as DebateAnalysisType } from "@/types/database.types";

export default function DebateAnalysis({
  analysis,
}: {
  analysis: DebateAnalysisType;
}) {
  return (
    <div className="mx-auto max-w-5xl">
      <Tabs defaultValue="arguments" className="w-full">
        <TabsList className="h-auto rounded-none border-b bg-transparent p-0 grid w-full grid-cols-4 overflow-x-scroll">
          <TabsTrigger
            value="arguments"
            className="data-[state=active]:after:bg-border relative rounded-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none min-w-16 w-full"
          >
            <FileText className="min-h-4 min-w-4 mr-1" />
            Arguments
          </TabsTrigger>
          <TabsTrigger
            value="rhetoric"
            className="data-[state=active]:after:bg-border relative rounded-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none min-w-16 w-full"
          >
            <MessageSquareQuote className="min-h-4 min-w-4 mr-1" />
            Rhetoric
          </TabsTrigger>
          <TabsTrigger
            value="strategy"
            className="data-[state=active]:after:bg-border relative rounded-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none min-w-16 w-full"
          >
            <Target className="min-h-4 min-w-4 mr-1" />
            Strategy
          </TabsTrigger>
          <TabsTrigger
            value="improvement"
            className="data-[state=active]:after:bg-border relative rounded-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none min-w-16 w-full"
          >
            <Lightbulb className="min-h-4 min-w-4 mr-1" />
            Improvement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="arguments" className="py-6 sm:px-6">
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <ThumbsUp className="h-5 w-5 text-primary" />
                    Main Arguments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.argument_analysis.main_arguments.map((arg, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="mt-1 rounded-full bg-primary/20 p-1">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                        </div>
                        <span
                          className={arg.includes("FOR") ? "" : "text-red-500"}
                        >
                          {arg}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Brain className="h-5 w-5 text-amber-500" />
                    Reasoning Quality
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    {analysis.argument_analysis.reasoning_quality}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    Evidence Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {analysis.argument_analysis.evidence_usage}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Logical Fallacies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.argument_analysis.logical_fallacies.map(
                      (fallacy, i) => (
                        <div
                          key={i}
                          className="rounded-lg border bg-red-50/50 p-3 text-sm"
                        >
                          {fallacy}
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rhetoric" className="py-6 sm:px-6">
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Persuasiveness & Clarity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 grid-cols-2">
                    <div className="flex flex-col items-center">
                      <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-8 border-primary/20 bg-primary/10">
                        <span className="text-4xl font-bold text-primary leading-none">
                          {analysis.rhetorical_analysis.persuasiveness_score}
                        </span>
                        <span className="absolute bottom-5 text-sm font-medium text-primary/80">
                          /10
                        </span>
                      </div>
                      <span className="mt-3 font-medium">Persuasiveness</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-8 border-blue-300/50 bg-blue-50">
                        <span className="text-4xl font-bold text-blue-600 leading-none">
                          {analysis.rhetorical_analysis.clarity_score}
                        </span>
                        <span className="absolute bottom-5 text-sm font-medium text-blue-600/80">
                          /10
                        </span>
                      </div>
                      <span className="mt-3 font-medium">Clarity</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MessageSquareQuote className="h-5 w-5 text-violet-500" />
                    Language Effectiveness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm">
                    {analysis.rhetorical_analysis.language_effectiveness}
                  </p>
                  <div className="space-y-3">
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <h4 className="mb-2 font-medium">Notable Phrases</h4>
                      <div className="flex flex-wrap gap-2 text-sm">
                        {analysis.rhetorical_analysis.notable_phrases.map(
                          (phrase, i) => (
                            <p key={i}>{phrase}</p>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="strategy" className="py-6 sm:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FlameKindling className="h-5 w-5 text-orange-500" />
                  Opening Effectiveness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {analysis.strategy_analysis.opening_effectiveness}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                  Counterargument Handling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {analysis.strategy_analysis.counterargument_handling}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="h-5 w-5 text-amber-500" />
                  Time Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {analysis.strategy_analysis.time_management}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="h-5 w-5 text-blue-500" />
                  Overall Strategy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {analysis.strategy_analysis.overall_strategy}
                </p>
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>Strategy Effectiveness</span>
                    <span className="font-medium">
                      {analysis.overall_assessment.effectiveness_score}/10
                    </span>
                  </div>
                  <Progress
                    value={analysis.overall_assessment.effectiveness_score * 10}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="improvement" className="py-6 sm:px-6">
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Zap className="h-5 w-5 text-primary" />
                    Priority Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysis.improvement_areas.priority_improvements.map(
                      (item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 rounded-lg bg-primary/10 p-3"
                        >
                          <div className="mt-0.5 rounded-full bg-primary/20 p-1">
                            <CheckCircle2 className="h-3 w-3 text-primary" />
                          </div>
                          <span>{item}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BookOpen className="h-5 w-5 text-violet-500" />
                    Practice Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {analysis.improvement_areas.practice_suggestions.map(
                      (item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="mt-1 rounded-full bg-violet-100 p-1">
                            <CheckCircle2 className="h-3 w-3 text-violet-500" />
                          </div>
                          <span>{item}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  Specific Examples
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {analysis.improvement_areas.specific_examples.map(
                    (item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 rounded-lg border bg-amber-50/50 p-3"
                      >
                        <div className="mt-0.5 rounded-full bg-amber-100 p-1">
                          <Lightbulb className="h-3 w-3 text-amber-500" />
                        </div>
                        <span>{item}</span>
                      </li>
                    ),
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="bg-muted/20 py-6 sm:px-6">
        <h3 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
          <Award className="h-6 w-6 text-amber-500" />
          Overall Assessment
        </h3>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ThumbsUp className="h-5 w-5 text-emerald-500" />
                Key Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {analysis.overall_assessment.key_strengths.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="mt-1 rounded-full bg-emerald-100 p-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="h-5 w-5 text-blue-500" />
                Learning Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {analysis.overall_assessment.learning_points.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="mt-1 rounded-full bg-blue-100 p-1">
                      <CheckCircle2 className="h-3 w-3 text-blue-500" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-amber-500" />
                Final Score
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col items-center justify-center">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-8 border-amber-200 bg-amber-50">
                <div className="text-center">
                  <div className="text-5xl font-bold text-amber-600">
                    {analysis.overall_assessment.effectiveness_score}
                  </div>
                  <div className="text-sm font-medium text-amber-600/80">
                    out of 10
                  </div>
                </div>
              </div>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                {analysis.overall_assessment.summary}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
