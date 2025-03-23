"use client";

import type React from "react";
import { useRef, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
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
  const [showThinking, setShowThinking] = useState(true); // Start expanded
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const responseRef = useRef<HTMLDivElement>(null);
  const thinkingRef = useRef<HTMLDivElement>(null);
  const [hasThinkingContent, setHasThinkingContent] = useState(false);

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

  // Helper function to process tokens with animation
  const processTokens = (
    text: string,
    containerRef: React.RefObject<HTMLDivElement>,
    isFirstContent: boolean
  ) => {
    if (!text || !containerRef.current) return;

    // Create a document fragment to batch DOM changes
    const fragment = document.createDocumentFragment();

    // Split by newlines to properly handle paragraph breaks
    const lines = text.split("\n");

    // Skip empty lines at the beginning if this is the first content
    let startIndex = 0;
    if (isFirstContent && containerRef.current.childNodes.length === 0) {
      while (startIndex < lines.length && lines[startIndex].trim() === "") {
        startIndex++;
      }
    }

    lines.slice(startIndex).forEach((line, index) => {
      // Add the text content
      if (line.length > 0) {
        // Split by spaces, but keep the spaces
        const words = line.split(/(\s+)/);

        words.forEach((word) => {
          if (word.length > 0) {
            const span = document.createElement("span");
            span.textContent = word;
            // Display inline to allow natural text wrapping
            span.className = "inline opacity-0 animate-token";
            fragment.appendChild(span);
          }
        });
      }

      // Add line break if not the last line
      if (index < lines.length - startIndex - 1) {
        fragment.appendChild(document.createElement("br"));
      }
    });

    // Append all changes at once
    containerRef.current.appendChild(fragment);
  };

  // Process thinking tokens
  useEffect(() => {
    if (thinkingBufferRef.current && thinkingRef.current) {
      // If we have any content, make sure the section is visible
      if (thinkingBufferRef.current.trim() !== "") {
        setHasThinkingContent(true);
      }

      // Process tokens with the same animation as answer tokens
      processTokens(thinkingBufferRef.current, thinkingRef, true);

      // Clear the buffer
      thinkingBufferRef.current = "";

      // Force scroll update
      setTimeout(scrollToBottom, 0);
    }
  }, [thinkingTrigger]);

  // Process answer tokens
  useEffect(() => {
    if (answerBufferRef.current && responseRef.current) {
      // Process tokens with animation
      processTokens(answerBufferRef.current, responseRef, true);

      // Clear the buffer
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
            {/* Thinking section with toggle */}
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
                <span className="text-xs font-medium">
                  {showThinking ? "Hide thinking process" : "Show thinking process"}
                </span>
              </div>

              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 bg-card/50 rounded-[var(--radius-sm)]",
                  showThinking ? "max-h-[500px] opacity-100 p-3" : "max-h-0 opacity-0 py-0 px-3"
                )}
              >
                <div
                  className="text-muted-foreground italic text-sm whitespace-pre-wrap"
                  ref={thinkingRef}
                ></div>
              </div>
            </div>

            {/* Answer section */}
            <div ref={responseRef}></div>
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}
