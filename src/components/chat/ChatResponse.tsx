"use client";

import type React from "react";
import { useRef, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatResponseProps {
  thinkingTrigger: number;
  answerTrigger: number;
  waitingForFirstToken: boolean;
  isLoading: boolean;
  thinkingBufferRef: React.MutableRefObject<string>;
  answerBufferRef: React.MutableRefObject<string>;
}

export function ChatResponse({
  thinkingTrigger,
  answerTrigger,
  thinkingBufferRef,
  answerBufferRef,
  waitingForFirstToken,
  isLoading,
}: ChatResponseProps) {
  const [showThinking, setShowThinking] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [hasThinkingContent, setHasThinkingContent] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);

  // Thinking states
  const [completedThinkingText, setCompletedThinkingText] = useState("");
  const [currentThinkingToken, setCurrentThinkingToken] = useState("");

  // Answering states
  const [completedAnswerText, setCompletedAnswerText] = useState("");
  const [currentAnswerToken, setCurrentAnswerToken] = useState("");

  // References for animation timing
  const lastThinkingUpdateRef = useRef<number>(0);
  const lastAnswerUpdateRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);
  const TARGET_FRAME_DURATION = 50; // Target ~50ms between updates

  // Create persistent token buffer refs outside the effect
  const thinkingTokenBufferRef = useRef<string>("");
  const answerTokenBufferRef = useRef<string>("");

  const scrollToBottom = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    } else if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLDivElement;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
        viewportRef.current = viewport;
      }
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      viewportRef.current = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLDivElement;
    }
  }, [scrollAreaRef.current]);

  // Scroll to bottom when new content is added
  useEffect(() => {
    scrollToBottom();
  }, [thinkingTrigger, answerTrigger, waitingForFirstToken]);

  // Reset state when waiting for a new response
  useEffect(() => {
    if (waitingForFirstToken) {
      setIsAnswering(false);
    }
  }, [waitingForFirstToken]);

  // Process thinking tokens
  useEffect(() => {
    if (thinkingBufferRef.current) {
      // If we have any content, make sure the section is visible
      if (thinkingBufferRef.current.trim() !== "") {
        setHasThinkingContent(true);
        // If we get new thinking tokens, we're not in answering phase
        setIsAnswering(false);
      }

      // Split by newlines and words, preserving spaces
      const lines = thinkingBufferRef.current.split("\n");
      const tokens: string[] = [];

      lines.forEach((line, index) => {
        if (line.length > 0) {
          // Split by spaces but keep the spaces
          const words = line.split(/(\s+)/);
          tokens.push(...words);
        }
        // Add line break if not the last line
        if (index < lines.length - 1) {
          tokens.push("\n");
        }
      });

      // Update the current thinking token
      setCurrentThinkingToken(tokens.join(""));
      thinkingBufferRef.current = "";
    }
  }, [thinkingTrigger]);

  // Process answer tokens
  useEffect(() => {
    if (answerBufferRef.current) {
      // We now have answer tokens, so thinking phase is done
      setIsAnswering(true);

      // Split by newlines and words, preserving spaces
      const lines = answerBufferRef.current.split("\n");
      const tokens: string[] = [];

      lines.forEach((line, index) => {
        if (line.length > 0) {
          // Split by spaces but keep the spaces
          const words = line.split(/(\s+)/);
          tokens.push(...words);
        }
        // Add line break if not the last line
        if (index < lines.length - 1) {
          tokens.push("\n");
        }
      });

      // Update the current answer token
      setCurrentAnswerToken(tokens.join(""));
      answerBufferRef.current = "";
    }
  }, [answerTrigger]);

  // Combined token batching logic using requestAnimationFrame
  useEffect(() => {
    let rafId: number;
    let lastUpdate = performance.now();

    // Add new tokens to our persistent buffers
    if (currentThinkingToken) {
      thinkingTokenBufferRef.current += currentThinkingToken;
    }

    if (currentAnswerToken) {
      answerTokenBufferRef.current += currentAnswerToken;
    }

    const flushBuffers = () => {
      rafId = requestAnimationFrame((now) => {
        const elapsed = now - lastUpdate;

        // Change back to 100ms as requested
        if (elapsed >= 100) {
          let updated = false;

          // Process thinking tokens if we have any
          if (thinkingTokenBufferRef.current) {
            setCompletedThinkingText((prev) => prev + thinkingTokenBufferRef.current);
            thinkingTokenBufferRef.current = ""; // Clear buffer after processing
            updated = true;
          }

          // Process answer tokens if we have any
          if (answerTokenBufferRef.current) {
            setCompletedAnswerText((prev) => prev + answerTokenBufferRef.current);
            answerTokenBufferRef.current = ""; // Clear buffer after processing
            updated = true;
          }

          // Clear current token states
          if (currentThinkingToken) {
            setCurrentThinkingToken("");
          }

          if (currentAnswerToken) {
            setCurrentAnswerToken("");
          }

          if (updated) {
            lastUpdate = now; // Reset timer only if we updated anything
          }
        }

        flushBuffers(); // Schedule next frame
      });
    };

    flushBuffers(); // Initial call

    return () => {
      cancelAnimationFrame(rafId); // Clean-up properly
    };
  }, [currentThinkingToken, currentAnswerToken]);

  // Reset completed text when waiting for new response
  useEffect(() => {
    if (waitingForFirstToken) {
      setCompletedThinkingText("");
      setCompletedAnswerText("");
      setCurrentThinkingToken("");
      setCurrentAnswerToken("");
      setIsAnswering(false);

      // Also reset our token buffers
      thinkingTokenBufferRef.current = "";
      answerTokenBufferRef.current = "";
    }
  }, [waitingForFirstToken]);

  const toggleThinking = () => {
    setShowThinking(!showThinking);
  };

  return (
    <Card
      className="flex-1 min-h-0 mb-6 bg-primary/2 border-none shadow-sm overflow-hidden"
      ref={scrollAreaRef}
    >
      {waitingForFirstToken ? (
        <div className="prose prose-sm max-w-none text-foreground/90 p-4">
          <div className="inline-flex gap-1.5">
            <div
              className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>
      ) : (
        <ScrollArea className="h-full" type="hover" scrollHideDelay={0}>
          <div className="p-4 prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap font-mono">
            {/* Thinking section */}
            <div className={cn("mb-4", !hasThinkingContent && "hidden")}>
              <div
                className="flex items-center gap-1 cursor-pointer mb-1 text-muted-foreground hover:text-foreground/70 transition-colors"
                onClick={toggleThinking}
              >
                {showThinking ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <Brain
                  className={cn(
                    "h-4 w-4 mr-1",
                    isLoading && !isAnswering && "animate-brain-pulse",
                    (!isLoading || isAnswering) && hasThinkingContent ? "text-foreground" : ""
                  )}
                  style={
                    isLoading && !isAnswering
                      ? {
                          stroke: "url(#brainGradient)",
                        }
                      : {}
                  }
                />
                <svg width="0" height="0" className="absolute">
                  <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--header-gradient-start)" />
                    <stop offset="100%" stopColor="var(--header-gradient-end)" />
                  </linearGradient>
                </svg>
                <span className="text-xs font-medium">
                  {showThinking ? "Hide thinking process" : "Show thinking process"}
                </span>
              </div>

              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 relative rounded-[var(--radius-sm)]",
                  showThinking ? "max-h-[500px] opacity-100 p-3" : "max-h-0 opacity-0 py-0 px-3"
                )}
              >
                {/* Gradient border overlay - Top */}
                {showThinking && (
                  <>
                    {/* Top border - moves right */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
                      style={{
                        backgroundImage: `repeating-linear-gradient(to right, var(--header-gradient-start) 0, var(--header-gradient-start) 4px, transparent 4px, transparent 8px)`,
                        opacity: 0.7,
                        animation: "moveDotRight 3s linear infinite",
                        zIndex: 1,
                      }}
                    />
                    {/* Left border - moves UP for clockwise flow */}
                    <div
                      className="absolute top-0 left-0 bottom-0 w-[2px] pointer-events-none"
                      style={{
                        backgroundImage: `repeating-linear-gradient(to bottom, var(--header-gradient-start) 0, var(--header-gradient-start) 4px, transparent 4px, transparent 8px)`,
                        opacity: 0.7,
                        animation: "moveDotUp 3s linear infinite",
                        zIndex: 1,
                      }}
                    />
                    {/* Right border - moves DOWN for clockwise flow */}
                    <div
                      className="absolute top-0 right-0 bottom-0 w-[2px] pointer-events-none"
                      style={{
                        backgroundImage: `repeating-linear-gradient(to bottom, var(--header-gradient-end) 0, var(--header-gradient-end) 4px, transparent 4px, transparent 8px)`,
                        opacity: 0.7,
                        animation: "moveDotDown 3s linear infinite",
                        zIndex: 1,
                      }}
                    />
                    {/* Bottom border - moves left */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none"
                      style={{
                        backgroundImage: `repeating-linear-gradient(to right, var(--header-gradient-end) 0, var(--header-gradient-end) 4px, transparent 4px, transparent 8px)`,
                        opacity: 0.7,
                        animation: "moveDotLeft 3s linear infinite",
                        zIndex: 1,
                      }}
                    />
                  </>
                )}
                <div className="text-muted-foreground italic text-sm whitespace-pre-wrap relative z-10 h-full">
                  {!completedThinkingText && !currentThinkingToken ? (
                    <div className="flex items-center justify-center p-4 opacity-50">
                      <Brain className="h-8 w-8 mr-2 opacity-30" />
                      <span>Waiting for thinking process...</span>
                    </div>
                  ) : (
                    <div className="thinking-stream">
                      {/* Completed thinking tokens */}
                      <span className="completed-tokens">{completedThinkingText}</span>
                      {/* Current thinking token with animation */}
                      {currentThinkingToken && (
                        <span
                          key={`thinking-${currentThinkingToken}`}
                          className="inline opacity-0 animate-token current-token"
                        >
                          {currentThinkingToken}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Answer section */}
            <div className="answer-stream">
              {/* Completed answer tokens */}
              <span className="completed-tokens">{completedAnswerText}</span>
              {/* Current answer token with animation */}
              {currentAnswerToken && (
                <span
                  key={`answer-${currentAnswerToken}`}
                  className="inline opacity-0 animate-token current-token"
                >
                  {currentAnswerToken}
                </span>
              )}
            </div>
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}
