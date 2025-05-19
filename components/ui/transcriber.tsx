"use client";

import * as React from "react";

import * as AvatarPrimitive from "@radix-ui/react-avatar";

import ThreeDotsWave from "@/components/ui/three-dots-wave";
import { Conversation } from "@/lib/conversations";
import { cn } from "@/lib/utils";

/**
 * Avatar building blocks with Radix
 */
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className,
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

/**
 * Decide if a conversation item should be displayed or filtered out.
 * Optional, this is used to filter out empty or useless user messages (e.g., final + empty text)
 */
function shouldDisplayMessage(msg: Conversation): boolean {
  const { role, text, status, isFinal } = msg;

  if (role === "assistant") {
    // Always display assistant messages (even if they're empty, though that's rare).
    return true;
  } else {
    // User role
    // 1) If user is currently speaking or processing, we show it (wave or "Processing…").
    if (status === "speaking" || status === "processing") {
      return true;
    }
    // 2) If user is final, only show if the transcript is non-empty.
    if (isFinal && text.trim().length > 0) {
      return true;
    }
    // Otherwise, skip.
    return false;
  }
}

/**
 * Single conversation item
 */
function ConversationItem({ message }: { message: Conversation }) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const msgStatus = message.status;

  return (
    <div className={`flex items-start gap-3 ${isUser ? "justify-end" : ""}`}>
      {isAssistant && (
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
      )}

      {/* Message Bubble */}
      <div
        className={`${
          isUser
            ? "bg-primary text-background"
            : "bg-secondary dark:text-foreground"
        } px-4 py-2 rounded-lg max-w-[70%]`}
      >
        {(isUser && msgStatus === "speaking") || msgStatus === "processing" ? (
          <ThreeDotsWave />
        ) : (
          <p>{message.text}</p>
        )}

        <div className="text-xs text-muted-foreground">
          {new Date(message.timestamp).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
          })}
        </div>
      </div>

      {isUser && (
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarFallback>You</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

interface TranscriberProps {
  conversation: Conversation[];
}

export default function Transcriber({ conversation }: TranscriberProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation]);

  const displayableMessages = React.useMemo(() => {
    return conversation.filter(shouldDisplayMessage);
  }, [conversation]);

  return (
    <div className="flex flex-col w-full h-full mx-auto bg-background rounded-lg overflow-hidden dark:bg-background">
      <div
        ref={scrollRef}
        className="flex-1 max-h-[400px] overflow-y-auto p-4 space-y-4 z-50 scrollbar-thin scrollbar-thumb-primary"
      >
        {displayableMessages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No conversation started yet.</p>
            <p className="text-sm">Press the microphone button to begin.</p>
          </div>
        ) : (
          displayableMessages.map((message) => (
            <ConversationItem key={message.id} message={message} />
          ))
        )}
      </div>
    </div>
  );
}

export { Avatar, AvatarImage, AvatarFallback };
