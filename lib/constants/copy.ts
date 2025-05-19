/**
 * Centralized UI copy and toast messages.
 * Extend or restructure as new strings are required.
 */
export const copy = {
  errors: {
    genericTitle: "Whoops!",
    noCredits: "No credits remaining!",
  },
  status: {
    requestingMic: "Requesting microphone access...",
    fetchingToken: "Fetching ephemeral token...",
    establishingConnection: "Establishing connection...",
    sessionEstablishedTitle: "We're live, baby!",
    togglingAssistantTitle: "Toggling Voice Assistant...",
    sessionStopped: "Session stopped",
  },
  debate: {
    analysisGenerating: "Analyzing your debate performance...",
    saved: "Debate saved with detailed analysis",
  },
  buttons: {
    randomTopic: "Random Topic",
    startDebate: "Start Debate",
    stopDebate: "Stop Debate",
  },
} as const;

export type Copy = typeof copy;
