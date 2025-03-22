"use client";

import type React from "react";

import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "@/screens/root";
import { Send } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Index,
});

function Index() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [waitingForFirstToken, setWaitingForFirstToken] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sanitize text by replacing problematic characters
  const sanitizeText = (text: string): string => {
    // Replace non-ASCII characters with their ASCII equivalents or empty string
    return (
      text
        // Basic ASCII replacements
        .replace(/['']/g, "'")
        .replace(/[""]/g, '"')
        .replace(/…/g, "...")
        .replace(/—/g, "-")
        .replace(/–/g, "-")
        // Replace any problematic Unicode characters
        .replace(/[\u0080-\uFFFF]/g, (match) => {
          // Check for common sequences and replace appropriately
          if (/[\u2018\u2019]/.test(match)) return "'"; // Smart quotes (single)
          if (/[\u201C\u201D]/.test(match)) return '"'; // Smart quotes (double)
          if (match === "\u2026") return "..."; // Ellipsis
          if (match === "\u2013" || match === "\u2014") return "-"; // En/em dash
          if (match === "\u2022") return "*"; // Bullet point
          if (match === "\u00A9") return "(c)"; // Copyright
          if (match === "\u00AE") return "(r)"; // Registered trademark
          if (match === "\u2122") return "TM"; // Trademark
          if (match === "\u20AC") return "EUR"; // Euro
          if (match === "\u00A3") return "GBP"; // Pound
          if (match === "\u00A5") return "JPY"; // Yen
          if (match === "\n" || match === "\r" || match === "\u000D" || match === "\u000A")
            return "\n"; // Newlines
          return ""; // Replace any other non-ASCII char with empty string
        })
    );
  };

  // Define custom animation style
  const animationStyle = `
    @keyframes fadeInLeftToRight {
      0% {
        opacity: 0;
        transform: translateX(-5px);
        filter: blur(3px);
      }
      60% {
        opacity: 0.8;
        transform: translateX(-1px);
        filter: blur(1px);
      }
      100% {
        opacity: 1;
        transform: translateX(0);
        filter: blur(0);
      }
    }
  `;

  // Auto-resize textarea as content grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Setup event listeners for model tokens
  useEffect(() => {
    // Listen for tokens from the model
    const unlisten = listen<string>("model-token", (event) => {
      // If this is the first token, stop showing the loading indicator
      if (waitingForFirstToken) {
        setWaitingForFirstToken(false);

        // For the first token, remove any leading whitespace
        const sanitizedToken = sanitizeText(event.payload.trimStart());
        setResponse(sanitizedToken);
      } else {
        // For subsequent tokens, just sanitize
        const sanitizedToken = sanitizeText(event.payload);
        setResponse((prev) => prev + sanitizedToken);
      }
    });

    // Listen for model completion
    const unlistenComplete = listen("model-complete", () => {
      setIsLoading(false);
      setWaitingForFirstToken(false);
    });

    // Cleanup listeners on component unmount
    return () => {
      unlisten.then((fn) => fn());
      unlistenComplete.then((fn) => fn());
    };
  }, [waitingForFirstToken]);

  // Scroll to bottom of response area when new content is added
  useEffect(() => {
    if (!scrollAreaRef.current) return;

    const scrollToBottom = () => {
      const scrollContainer = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    };

    // Setup mutation observer to react to DOM changes
    const responseContainer = scrollAreaRef.current.querySelector("div > div.p-4");
    if (responseContainer) {
      const observer = new MutationObserver((mutations) => {
        // Only scroll if we're observing content mutations related to the response
        if (mutations.some((m) => m.type === "childList" || m.type === "characterData")) {
          scrollToBottom();
        }
      });

      observer.observe(responseContainer, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      // Immediate scroll
      scrollToBottom();

      return () => observer.disconnect();
    }

    // Fallback if we can't find the response container
    if (response) {
      scrollToBottom();
      const timeout = setTimeout(scrollToBottom, 50);
      return () => clearTimeout(timeout);
    }
  }, [response, waitingForFirstToken]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      setWaitingForFirstToken(true);
      setResponse("");

      // Call the Tauri command to prompt the model
      await invoke("prompt_model", {
        modelPath: "C:\\Users\\lucie\\Desktop\\Projects\\personal\\fin\\model\\fin-r1.gguf", // Adjust the path to your model
        systemPrompt: "", // Not needed with the new approach
        prompt: `<|im_start|>system
You are a helpful AI Assistant that provides well-reasoned but concise responses with redundant overthinking, primarily related to financial questions. You first think about the reasoning process as an internal monologue within <think>...</think> xml tags, and then provide the user with the answer.
<|im_end|>
<|im_start|>user
${input}
<|im_end|>
<|im_start|>assistant
`,
        maxTokens: 100000,
      });
    } catch (error) {
      console.error("Error prompting model:", error);
      setResponse("Error: " + String(error));
      setIsLoading(false);
      setWaitingForFirstToken(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (not in combination with Shift key for newlines)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.closest("form");
      if (form) form.requestSubmit();
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col h-screen overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: animationStyle }} />
      <div className="max-w-5xl w-full mx-auto flex flex-col h-full px-6 sm:px-8 py-4 pt-8">
        <div className="flex-shrink-0 mb-6">
          <h1 className="text-2xl font-bold text-foreground/90 tracking-tight">Fin-R1</h1>
          <p className="text-sm text-muted-foreground/70">
            Fin-R1 is a financial reasoning language model built on Qwen2.5-7B-Instruct and
            fine-tuned with high-quality, verifiable financial problem datasets. The model achieves
            state-of-the-art performance on multiple financial benchmarks, making it particularly
            effective for complex financial reasoning tasks.
          </p>
        </div>

        <Card
          className="flex-1 min-h-0 mb-6 bg-primary/2 border-none shadow-sm overflow-hidden"
          ref={scrollAreaRef}
        >
          {response || waitingForFirstToken ? (
            <ScrollArea className="h-full" type="hover">
              <div className="p-4">
                {response ? (
                  <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap font-mono">
                    {response.split("").map((char, index) => {
                      // Special handling for newlines
                      if (char === "\n") {
                        return <br key={index} />;
                      }

                      return (
                        <span
                          key={index}
                          className="inline opacity-0"
                          style={{
                            animation: "fadeInLeftToRight 0.3s ease-out forwards",
                            animationDelay: `${Math.min(index * 0.008, 0.4)}s`,
                          }}
                        >
                          {char}
                        </span>
                      );
                    })}
                  </div>
                ) : (
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

        <div className="w-full mb-4 flex-shrink-0">
          <form onSubmit={handleSubmit} className="w-full flex gap-2 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="resize-none flex-1 min-h-[44px] max-h-[200px] border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading}
              className={cn(
                "h-10 w-10 rounded-full shrink-0 self-end transition-all",
                "bg-transparent hover:bg-foreground/10 text-foreground",
                isLoading && "opacity-50"
              )}
            >
              <Send
                className={cn(
                  "h-4 w-4 transition-transform",
                  isLoading ? "opacity-0" : "opacity-100"
                )}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-4 w-4 border-2 border-foreground/30 border-t-foreground/80 rounded-full animate-spin"></div>
                </div>
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </form>

          <div className="text-xs text-muted-foreground/50 text-center mt-2">
            Press Enter to send
          </div>
        </div>
      </div>
    </div>
  );
}
