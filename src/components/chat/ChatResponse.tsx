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

type Token = { id: number; text: string };

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

  // Token arrays and committed text for thinking and answer
  const [thinkingTokens, setThinkingTokens] = useState<Token[]>([]);
  const [answerTokens, setAnswerTokens] = useState<Token[]>([]);
  const [committedThinkingText, setCommittedThinkingText] = useState("");
  const [committedAnswerText, setCommittedAnswerText] = useState("");

  // Refs for performance optimization
  const committedThinkingRef = useRef("");
  const committedAnswerRef = useRef("");
  const tokenId = useRef(0); // Shared counter for unique token IDs
  const MAX_BUFFER = 20; // Maximum number of tokens to keep animated
  const AGGRESSIVE_BUFFER = 100; // Threshold for aggressive flushing

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
  }, [thinkingTokens.length, answerTokens.length, committedThinkingText, committedAnswerText]);

  // Reset state when waiting for a new response
  useEffect(() => {
    if (waitingForFirstToken) {
      setIsAnswering(false);
      setThinkingTokens([]);
      setAnswerTokens([]);
      setCommittedThinkingText("");
      setCommittedAnswerText("");
      committedThinkingRef.current = "";
      committedAnswerRef.current = "";
      tokenId.current = 0; // Reset the token ID counter
    }
  }, [waitingForFirstToken]);

  // Token buffer compression for thinking tokens
  useEffect(() => {
    if (thinkingTokens.length > MAX_BUFFER) {
      const toCommit = thinkingTokens.slice(0, thinkingTokens.length - MAX_BUFFER);
      const newCommittedText = toCommit.map((t) => t.text).join("");
      setCommittedThinkingText((prev) => prev + newCommittedText);
      committedThinkingRef.current += newCommittedText;
      setThinkingTokens((prev) => prev.slice(-MAX_BUFFER));
    }
  }, [thinkingTokens]);

  // Token buffer compression for answer tokens
  useEffect(() => {
    if (answerTokens.length > MAX_BUFFER) {
      const toCommit = answerTokens.slice(0, answerTokens.length - MAX_BUFFER);
      const newCommittedText = toCommit.map((t) => t.text).join("");
      setCommittedAnswerText((prev) => prev + newCommittedText);
      committedAnswerRef.current += newCommittedText;
      setAnswerTokens((prev) => prev.slice(-MAX_BUFFER));
    }
  }, [answerTokens]);

  // Aggressive buffer compression if tokens accumulate too much
  useEffect(() => {
    if (thinkingTokens.length > AGGRESSIVE_BUFFER) {
      const toCommit = thinkingTokens.slice(0, thinkingTokens.length - MAX_BUFFER);
      const newCommittedText = toCommit.map((t) => t.text).join("");
      setCommittedThinkingText((prev) => prev + newCommittedText);
      committedThinkingRef.current += newCommittedText;
      setThinkingTokens((prev) => prev.slice(-MAX_BUFFER));
    }
  }, [thinkingTokens]);

  useEffect(() => {
    if (answerTokens.length > AGGRESSIVE_BUFFER) {
      const toCommit = answerTokens.slice(0, answerTokens.length - MAX_BUFFER);
      const newCommittedText = toCommit.map((t) => t.text).join("");
      setCommittedAnswerText((prev) => prev + newCommittedText);
      committedAnswerRef.current += newCommittedText;
      setAnswerTokens((prev) => prev.slice(-MAX_BUFFER));
    }
  }, [answerTokens]);

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
      const tokens: Token[] = [];

      lines.forEach((line, index) => {
        if (line.length > 0) {
          // Split by spaces but keep the spaces
          const words = line.split(/(\s+)/);
          tokens.push(...words.map((text) => ({ id: tokenId.current++, text })));
        }
        // Add line break if not the last line
        if (index < lines.length - 1) {
          tokens.push({ id: tokenId.current++, text: "\n" });
        }
      });

      // Add new tokens to the array
      setThinkingTokens((prev) => [...prev, ...tokens]);
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
      const tokens: Token[] = [];

      lines.forEach((line, index) => {
        if (line.length > 0) {
          // Split by spaces but keep the spaces
          const words = line.split(/(\s+)/);
          tokens.push(...words.map((text) => ({ id: tokenId.current++, text })));
        }
        // Add line break if not the last line
        if (index < lines.length - 1) {
          tokens.push({ id: tokenId.current++, text: "\n" });
        }
      });

      // Add new tokens to the array
      setAnswerTokens((prev) => [...prev, ...tokens]);
      answerBufferRef.current = "";
    }
  }, [answerTrigger]);

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
                    {/* Top border */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
                      style={{
                        backgroundImage: `repeating-linear-gradient(to right, var(--header-gradient-start) 0, var(--header-gradient-start) 4px, transparent 4px, transparent 8px)`,
                        opacity: 0.7,
                        zIndex: 1,
                      }}
                    />
                    {/* Left border */}
                    <div
                      className="absolute top-0 left-0 bottom-0 w-[2px] pointer-events-none"
                      style={{
                        backgroundImage: `repeating-linear-gradient(to bottom, var(--header-gradient-start) 0, var(--header-gradient-start) 4px, transparent 4px, transparent 8px)`,
                        opacity: 0.7,
                        zIndex: 1,
                      }}
                    />
                    {/* Right border */}
                    <div
                      className="absolute top-0 right-0 bottom-0 w-[2px] pointer-events-none"
                      style={{
                        backgroundImage: `repeating-linear-gradient(to bottom, var(--header-gradient-end) 0, var(--header-gradient-end) 4px, transparent 4px, transparent 8px)`,
                        opacity: 0.7,
                        zIndex: 1,
                      }}
                    />
                    {/* Bottom border */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none"
                      style={{
                        backgroundImage: `repeating-linear-gradient(to right, var(--header-gradient-end) 0, var(--header-gradient-end) 4px, transparent 4px, transparent 8px)`,
                        opacity: 0.7,
                        zIndex: 1,
                      }}
                    />
                  </>
                )}
                <div className="text-muted-foreground italic text-sm whitespace-pre-wrap relative z-10 h-full">
                  {thinkingTokens.length === 0 && !committedThinkingText ? (
                    <div className="flex items-center justify-center p-4 opacity-50">
                      <Brain className="h-8 w-8 mr-2 opacity-30" />
                      <span>Waiting for thinking process...</span>
                    </div>
                  ) : (
                    <div className="thinking-stream">
                      {/* Static committed tokens */}
                      <span className="committed-tokens">{committedThinkingText}</span>
                      {/* Animated streaming tokens */}
                      {thinkingTokens.map((token) => (
                        <span key={`thinking-${token.id}`} className="animate-token">
                          {token.text}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Answer section */}
            <div className="answer-stream">
              {/* Static committed tokens */}
              <span className="committed-tokens">{committedAnswerText}</span>
              {/* Animated streaming tokens */}
              {answerTokens.map((token) => (
                <span key={`answer-${token.id}`} className="animate-token">
                  {token.text}
                </span>
              ))}
            </div>
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}
