import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface ChatResponseProps {
  response: string;
  responseChunks: string[];
  waitingForFirstToken: boolean;
  isLoading: boolean;
}

export function ChatResponse({
  response,
  responseChunks,
  waitingForFirstToken,
  isLoading,
}: ChatResponseProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // Function to scroll to bottom
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

  // Find and store the viewport element when the component mounts
  useEffect(() => {
    if (scrollAreaRef.current) {
      viewportRef.current = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLDivElement;
    }
  }, [scrollAreaRef.current]);

  // Scroll to bottom of response area when new content is added
  useEffect(() => {
    if (!scrollAreaRef.current || !response) return;

    // Scroll immediately and set up an interval to keep scrolling while tokens are streaming
    scrollToBottom();

    // Use an interval to ensure smooth scrolling while tokens are being generated
    const scrollInterval = setInterval(() => {
      if (isLoading || waitingForFirstToken) {
        scrollToBottom();
      } else {
        clearInterval(scrollInterval);
      }
    }, 100);

    return () => clearInterval(scrollInterval);
  }, [response, isLoading, waitingForFirstToken]);

  // Set up a separate mechanism for the initial loading state
  useEffect(() => {
    if (waitingForFirstToken) {
      const viewport = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]");
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [waitingForFirstToken]);

  return (
    <Card
      className="flex-1 min-h-0 mb-6 bg-primary/2 border-none shadow-sm overflow-hidden"
      ref={scrollAreaRef}
    >
      {response || waitingForFirstToken ? (
        <ScrollArea className="h-full" type="hover" scrollHideDelay={0}>
          <div className="p-4" id="response-container">
            {waitingForFirstToken ? (
              <div className="prose prose-sm max-w-none text-foreground/90">
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
              <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap font-mono">
                {responseChunks.map((chunk, index) => {
                  if (chunk === "\n") {
                    return <br key={`chunk-${index}`} />;
                  }

                  return (
                    <span
                      key={`chunk-${index}`}
                      className="inline-block opacity-0"
                      style={{
                        animation: "fadeInLeftToRight 0.3s ease-out forwards",
                        animationDelay: `${Math.min(index * 0.008, 0.2)}s`,
                      }}
                    >
                      {chunk.split("\n").map((part, i) => (
                        <React.Fragment key={`part-${index}-${i}`}>
                          {i > 0 && <br />}
                          {part}
                        </React.Fragment>
                      ))}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-muted-foreground/70 italic text-sm">
            Ask Fin-R1 any financial question...
          </div>
        </div>
      )}
    </Card>
  );
}
