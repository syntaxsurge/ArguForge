/**
 * Structured analysis schema returned by Gemini.
 * This is the single custom DB-adjacent type needed outside Drizzle.
 */
export interface DebateAnalysis {
  argument_analysis: {
    main_arguments: string[];
    reasoning_quality: string;
    evidence_usage: string;
    logical_fallacies: string[];
  };
  rhetorical_analysis: {
    persuasiveness_score: number;
    clarity_score: number;
    language_effectiveness: string;
    notable_phrases: string[];
  };
  strategy_analysis: {
    opening_effectiveness: string;
    counterargument_handling: string;
    time_management: string;
    overall_strategy: string;
  };
  improvement_areas: {
    priority_improvements: string[];
    practice_suggestions: string[];
    specific_examples: string[];
  };
  overall_assessment: {
    key_strengths: string[];
    learning_points: string[];
    effectiveness_score: number;
    summary: string;
  };
}
