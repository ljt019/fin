import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const responseRef = useRef<HTMLDivElement>(null);
  const thinkingRef = useRef<HTMLDivElement>(null);

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

  // Append only new thinking tokens
  useEffect(() => {
    if (thinkingBufferRef.current && thinkingRef.current) {
      // Create a document fragment to batch DOM changes
      const fragment = document.createDocumentFragment();

      // Split by newlines to properly handle paragraph breaks
      const lines = thinkingBufferRef.current.split("\n");

      lines.forEach((line, index) => {
        // Add the text content
        if (line.length > 0) {
          const span = document.createElement("span");
          span.textContent = line;
          span.className = "inline-block opacity-0 animate-token";
          fragment.appendChild(span);
        }

        // Add line break if not the last line
        if (index < lines.length - 1) {
          fragment.appendChild(document.createElement("br"));
        }
      });

      // Append all changes at once
      thinkingRef.current.appendChild(fragment);
      thinkingBufferRef.current = ""; // clear buffer
    }
  }, [thinkingTrigger]);

  // Append only new answer tokens
  useEffect(() => {
    if (answerBufferRef.current && responseRef.current) {
      // Create a document fragment to batch DOM changes
      const fragment = document.createDocumentFragment();

      // Split by newlines to properly handle paragraph breaks
      const lines = answerBufferRef.current.split("\n");

      lines.forEach((line, index) => {
        // Add the text content
        if (line.length > 0) {
          const span = document.createElement("span");
          span.textContent = line;
          span.className = "inline-block opacity-0 animate-token";
          fragment.appendChild(span);
        }

        // Add line break if not the last line
        if (index < lines.length - 1) {
          fragment.appendChild(document.createElement("br"));
        }
      });

      // Append all changes at once
      responseRef.current.appendChild(fragment);
      answerBufferRef.current = ""; // clear buffer
    }
  }, [answerTrigger]);

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
            <div className="text-muted-foreground italic" ref={thinkingRef}></div>
            <div ref={responseRef}></div>
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}
