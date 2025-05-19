"use client";

import { useState, useRef, useEffect } from "react";

import { v4 } from "uuid";

import { copy } from "@/lib/constants/copy";
import { Conversation } from "@/lib/conversations";
import { prompts, formatPrompt } from "@/lib/prompts";
import { Tool } from "@/lib/tools";
import { logError } from "@/lib/utils/logger";
import type { Stance, Message } from "@/types";

/**
 * The return type for the hook, matching Approach A
 * (RefObject<HTMLDivElement | null> for the audioIndicatorRef).
 */
interface UseWebRTCAudioSessionReturn {
  status: string;
  isSessionActive: "inactive" | "active" | "connecting";
  audioIndicatorRef: React.RefObject<HTMLDivElement | null>;
  startSession: (
    debateValues?: {
      username: string;
      topic: string;
      stance: Stance;
    } | null,
  ) => Promise<void>;
  stopSession: () => void;
  handleStartStopClick: () => void;
  registerFunction: (name: string, fn: Function) => void;
  msgs: Message[];
  currentVolume: number;
  conversation: Conversation[];
  sendTextMessage: (text: string) => void;
  showForm: boolean;
  debateInfo: {
    username: string;
    topic: string;
    stance: Stance;
  } | null;
  handleDebateFormSubmit: (values: {
    username: string;
    topic: string;
    stance: Stance;
  }) => void;
  timer: string;
  showSummary: boolean;
  resetAndStartNewDebate: () => void;
}

/**
 * Hook to manage a real-time session with OpenAI's Realtime endpoints.
 */
export default function useWebRTCAudioSession(
  tools?: Tool[],
): UseWebRTCAudioSessionReturn {
  // Connection/session states
  const [status, setStatus] = useState("");
  const [isSessionActive, setIsSessionActive] = useState<
    "inactive" | "active" | "connecting"
  >("inactive");

  // Timer state
  const [timer, setTimer] = useState("00:00");
  const timerIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Format elapsed time in min:sec
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Update timer every second
  const updateTimer = () => {
    if (!startTimeRef.current) return;

    const elapsedTime = (Date.now() - startTimeRef.current) / 1000;
    setTimer(formatTime(elapsedTime));
  };

  // Debate form states
  const [showForm, setShowForm] = useState(true);
  const [debateInfo, setDebateInfo] = useState<{
    username: string;
    topic: string;
    stance: Stance;
  } | null>(null);

  // Audio references for local mic
  // Approach A: explicitly typed as HTMLDivElement | null
  const audioIndicatorRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  // WebRTC references
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  // Keep track of all raw events/messages
  const [msgs, setMsgs] = useState<Message[]>([]);

  // Main conversation state
  const [conversation, setConversation] = useState<Conversation[]>([]);

  const functionRegistry = useRef<Record<string, Function>>({});

  // Volume analysis (assistant inbound audio)
  const [currentVolume, setCurrentVolume] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeIntervalRef = useRef<number | null>(null);

  /**
   * We track only the ephemeral user message **ID** here.
   * While user is speaking, we update that conversation item by ID.
   */
  const ephemeralUserMessageIdRef = useRef<string | null>(null);

  const [showSummary, setShowSummary] = useState(false);

  /**
   * Register a function (tool) so the AI can call it.
   */
  function registerFunction(name: string, fn: Function) {
    functionRegistry.current[name] = fn;
  }

  /**
   * Configure the data channel on open, sending a session update to the server.
   */
  function configureDataChannel(
    dataChannel: RTCDataChannel,
    debateInfo: {
      username: string;
      topic: string;
      stance: "FOR" | "AGAINST";
    } | null,
  ) {
    const sessionUpdate = {
      type: "session.update",
      session: {
        modalities: ["text", "audio"],
        tools: tools || [],
        input_audio_transcription: {
          model: "whisper-1",
        },
      },
    };

    dataChannel.send(JSON.stringify(sessionUpdate));

    if (debateInfo) {
      const formattedInstructions = formatPrompt(prompts.initialInstructions, {
        username: debateInfo.username,
        topic: debateInfo.topic,
      });

      const startMessage = {
        type: "response.create",
        response: {
          instructions: formattedInstructions,
        },
      };
      dataChannel.send(JSON.stringify(startMessage));
    }
  }

  /**
   * Return an ephemeral user ID, creating a new ephemeral message in conversation if needed.
   */
  function getOrCreateEphemeralUserId(): string {
    let ephemeralId = ephemeralUserMessageIdRef.current;
    if (!ephemeralId) {
      ephemeralId = v4();
      ephemeralUserMessageIdRef.current = ephemeralId;

      const newMessage: Conversation = {
        id: ephemeralId,
        role: "user",
        text: "",
        timestamp: new Date().toISOString(),
        isFinal: false,
        status: "speaking",
      };

      setConversation((prev) => [...prev, newMessage]);
    }
    return ephemeralId;
  }

  /**
   * Update the ephemeral user message (by ephemeralUserMessageIdRef) with partial changes.
   */
  function updateEphemeralUserMessage(partial: Partial<Conversation>) {
    const ephemeralId = ephemeralUserMessageIdRef.current;
    if (!ephemeralId) return;

    setConversation((prev) =>
      prev.map((msg) => {
        if (msg.id === ephemeralId) {
          return { ...msg, ...partial };
        }
        return msg;
      }),
    );
  }

  /**
   * Clear ephemeral user message ID so the next user speech starts fresh.
   */
  function clearEphemeralUserMessage() {
    ephemeralUserMessageIdRef.current = null;
  }

  /**
   * Main data channel message handler: interprets events from the server.
   */
  async function handleDataChannelMessage(event: MessageEvent) {
    try {
      const msg = JSON.parse(event.data);

      switch (msg.type) {
        /**
         * User speech started
         */
        case "input_audio_buffer.speech_started": {
          getOrCreateEphemeralUserId();
          updateEphemeralUserMessage({ status: "speaking" });
          break;
        }

        /**
         * User speech stopped
         */
        case "input_audio_buffer.speech_stopped": {
          // optional: you could set "stopped" or just keep "speaking"
          updateEphemeralUserMessage({ status: "speaking" });
          break;
        }

        /**
         * Audio buffer committed => "Processing speech..."
         */
        case "input_audio_buffer.committed": {
          updateEphemeralUserMessage({
            text: "Processing speech...",
            status: "processing",
          });
          break;
        }

        /**
         * Partial user transcription
         */
        case "conversation.item.input_audio_transcription": {
          const partialText =
            msg.transcript ?? msg.text ?? "User is speaking...";
          updateEphemeralUserMessage({
            text: partialText,
            status: "speaking",
            isFinal: false,
          });
          break;
        }

        /**
         * Final user transcription
         */
        case "conversation.item.input_audio_transcription.completed": {
          updateEphemeralUserMessage({
            text: msg.transcript || "",
            isFinal: true,
            status: "final",
          });
          clearEphemeralUserMessage();
          break;
        }

        /**
         * Streaming AI transcripts (assistant partial)
         */
        case "response.audio_transcript.delta": {
          const newMessage: Conversation = {
            id: v4(), // generate a fresh ID for each assistant partial
            role: "assistant",
            text: msg.delta,
            timestamp: new Date().toISOString(),
            isFinal: false,
          };

          setConversation((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.role === "assistant" && !lastMsg.isFinal) {
              // Append to existing assistant partial
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...lastMsg,
                text: lastMsg.text + msg.delta,
              };
              return updated;
            } else {
              // Start a new assistant partial
              return [...prev, newMessage];
            }
          });
          break;
        }

        /**
         * Mark the last assistant message as final
         */
        case "response.audio_transcript.done": {
          setConversation((prev) => {
            if (prev.length === 0) return prev;
            const updated = [...prev];
            updated[updated.length - 1].isFinal = true;
            return updated;
          });
          break;
        }

        /**
         * AI calls a function (tool)
         */
        case "response.function_call_arguments.done": {
          // Look up the function in our registry
          const fn = functionRegistry.current[msg.name];
          if (fn) {
            try {
              // Parse the JSON arguments
              const args = JSON.parse(msg.arguments);

              // Execute the function with provided arguments
              const result = await fn(args);

              // Create a properly formatted response for the function call output
              const response = {
                type: "conversation.item.create",
                item: {
                  type: "function_call_output",
                  call_id: msg.call_id,
                  output: JSON.stringify(result),
                },
              };

              // Send the function output back to the AI
              dataChannelRef.current?.send(JSON.stringify(response));

              // Tell the AI to continue generating a response
              const responseCreate = {
                type: "response.create",
              };
              dataChannelRef.current?.send(JSON.stringify(responseCreate));
            } catch (error) {
              logError(`Error executing function ${msg.name}:`, error);

              // Return error message if function execution fails
              const errorResponse = {
                type: "conversation.item.create",
                item: {
                  type: "function_call_output",
                  call_id: msg.call_id,
                  output: JSON.stringify({
                    error: `Error executing function: ${
                      error instanceof Error ? error.message : String(error)
                    }`,
                  }),
                },
              };

              dataChannelRef.current?.send(JSON.stringify(errorResponse));

              // Tell the AI to continue
              const responseCreate = {
                type: "response.create",
              };
              dataChannelRef.current?.send(JSON.stringify(responseCreate));
            }
          } else {
            logError(`Function ${msg.name} not found in registry`);

            // Return error if function not found
            const notFoundResponse = {
              type: "conversation.item.create",
              item: {
                type: "function_call_output",
                call_id: msg.call_id,
                output: JSON.stringify({
                  error: `Function ${msg.name} not found`,
                }),
              },
            };

            dataChannelRef.current?.send(JSON.stringify(notFoundResponse));

            // Tell the AI to continue
            const responseCreate = {
              type: "response.create",
            };
            dataChannelRef.current?.send(JSON.stringify(responseCreate));
          }
          break;
        }

        default: {
          // console.warn("Unhandled message type:", msg.type);
          break;
        }
      }

      // Always log the raw message
      setMsgs((prevMsgs) => [...prevMsgs, msg as Message]);
      return msg;
    } catch (error) {
      logError("Error handling data channel message:", error);
    }
  }

  /**
   * Handle debate form submission
   */
  const handleDebateFormSubmit = (values: {
    username: string;
    topic: string;
    stance: Stance;
  }) => {
    // Set the debate info in state for UI purposes only
    setDebateInfo(values);
    setShowForm(false);
    // Start session and pass the values directly
    startSession(values);
  };

  /**
   * Get an ephemeral token for this session
   */
  async function getEphemeralToken(
    debateInfo: {
      username: string;
      topic: string;
      stance: Stance;
    } | null,
  ) {
    try {
      // Always send the debate info to API, even if null
      // The API will handle default values if needed
      const response = await fetch("/api/openai/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ debateInfo }),
      });
      if (!response.ok) {
        throw new Error(`Failed to get ephemeral token: ${response.status}`);
      }
      const data = await response.json();
      return data.client_secret.value;
    } catch (err) {
      logError("getEphemeralToken error:", err);
      throw err;
    }
  }

  /**
   * Sets up a local audio visualization for mic input (toggle wave CSS).
   */
  function setupAudioVisualization(stream: MediaStream) {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    source.connect(analyzer);

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateIndicator = () => {
      if (!audioContext) return;
      analyzer.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;

      // Toggle an "active" class if volume is above a threshold
      if (audioIndicatorRef.current) {
        audioIndicatorRef.current.classList.toggle("active", average > 30);
      }
      requestAnimationFrame(updateIndicator);
    };
    updateIndicator();

    audioContextRef.current = audioContext;
  }

  /**
   * Calculate RMS volume from inbound assistant audio
   */
  function getVolume(): number {
    if (!analyserRef.current) return 0;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const float = (dataArray[i] - 128) / 128;
      sum += float * float;
    }
    return Math.sqrt(sum / dataArray.length);
  }

  /**
   * Start a new session:
   */
  async function startSession(
    debateValues?: {
      username: string;
      topic: string;
      stance: Stance;
    } | null,
  ) {
    try {
      setIsSessionActive("connecting");
      // Reset and start timer
      startTimeRef.current = Date.now();
      setTimer("00:00");

      // Start timer interval
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      timerIntervalRef.current = window.setInterval(updateTimer, 1000);

      setStatus(copy.status.requestingMic);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      setupAudioVisualization(stream);

      // Use the directly passed values or fall back to state
      const valueToUse = debateValues || debateInfo;

      setStatus(copy.status.fetchingToken);
      const ephemeralToken = await getEphemeralToken(valueToUse);

      setStatus(copy.status.establishingConnection);
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // Hidden <audio> element for inbound assistant TTS
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;

      // Inbound track => assistant's TTS
      pc.ontrack = (event) => {
        audioEl.srcObject = event.streams[0];

        // Optional: measure inbound volume
        const audioCtx = new (window.AudioContext || window.AudioContext)();
        const src = audioCtx.createMediaStreamSource(event.streams[0]);
        const inboundAnalyzer = audioCtx.createAnalyser();
        inboundAnalyzer.fftSize = 256;
        src.connect(inboundAnalyzer);
        analyserRef.current = inboundAnalyzer;

        // Start volume monitoring
        volumeIntervalRef.current = window.setInterval(() => {
          setCurrentVolume(getVolume());
        }, 100);
      };

      // Data channel for transcripts
      const dataChannel = pc.createDataChannel("response");
      dataChannelRef.current = dataChannel;

      dataChannel.onopen = () => {
        configureDataChannel(dataChannel, valueToUse);
      };
      dataChannel.onmessage = handleDataChannelMessage;

      // Add local (mic) track
      pc.addTrack(stream.getTracks()[0]);

      // Create offer & set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send SDP offer to OpenAI Realtime
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const voice = "alloy";
      const response = await fetch(`${baseUrl}?model=${model}&voice=${voice}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralToken}`,
          "Content-Type": "application/sdp",
        },
      });

      // Set remote description
      const answerSdp = await response.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
      setIsSessionActive("active");
      setStatus(copy.status.sessionEstablishedTitle);
    } catch (err) {
      logError("startSession error:", err);
      setStatus(`Error: ${err}`);
      stopSession();
      setIsSessionActive("inactive");
    }
  }

  /**
   * Stop the session & cleanup
   */
  function stopSession() {
    if (isSessionActive === "inactive") return;
    // Stop timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    // Don't reset startTimeRef to keep the final time

    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (audioIndicatorRef.current) {
      audioIndicatorRef.current.classList.remove("active");
    }
    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = null;
    }
    analyserRef.current = null;

    ephemeralUserMessageIdRef.current = null;

    setCurrentVolume(0);
    setIsSessionActive("inactive");
    setStatus(copy.status.sessionStopped);

    setShowSummary(true);
    setShowForm(false);
  }

  /**
   * Reset everything and start a new debate
   */
  function resetAndStartNewDebate() {
    // Reset conversation, messages, and timer
    setMsgs([]);
    setConversation([]);
    setTimer("00:00");
    setDebateInfo(null);
    startTimeRef.current = null;

    // Hide summary and show form
    setShowSummary(false);
    setShowForm(true);
  }

  /**
   * Toggle start/stop from a single button
   */
  function handleStartStopClick() {
    if (isSessionActive === "connecting") {
      return;
    }
    if (isSessionActive === "active") {
      stopSession();
    } else {
      debateInfo ? startSession(debateInfo) : startSession();
    }
  }

  /**
   * Send a text message through the data channel
   */
  function sendTextMessage(text: string) {
    if (
      !dataChannelRef.current ||
      dataChannelRef.current.readyState !== "open"
    ) {
      logError("Data channel not ready");
      return;
    }

    const messageId = v4();

    const newMessage: Conversation = {
      id: messageId,
      role: "user",
      text,
      timestamp: new Date().toISOString(),
      isFinal: true,
      status: "final",
    };

    setConversation((prev) => [...prev, newMessage]);

    const message = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: text,
          },
        ],
      },
    };

    const response = {
      type: "response.create",
    };

    dataChannelRef.current.send(JSON.stringify(message));
    dataChannelRef.current.send(JSON.stringify(response));
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => stopSession();
  }, []);

  return {
    status,
    isSessionActive,
    audioIndicatorRef,
    startSession,
    stopSession,
    handleStartStopClick,
    registerFunction,
    msgs,
    currentVolume,
    conversation,
    sendTextMessage,
    showForm,
    debateInfo,
    handleDebateFormSubmit,
    timer,
    showSummary,
    resetAndStartNewDebate,
  };
}
