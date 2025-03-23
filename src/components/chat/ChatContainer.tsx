import React, { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { tryCatch } from "@/lib/try-catch";
import { ChatHeader } from "./ChatHeader";
import { ChatResponse } from "./ChatResponse";
import { ChatInput } from "./ChatInput";

export function ChatContainer() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [showThinking, setShowThinking] = useState(false);
  const [waitingForFirstToken, setWaitingForFirstToken] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const flushInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Add new states just to trigger effects
  const [thinkingTrigger, setThinkingTrigger] = useState(0);
  const [answerTrigger, setAnswerTrigger] = useState(0);

  // Refs to hold the token buffers
  const thinkingBuffer = useRef("");
  const answerBuffer = useRef("");

  const flushBuffers = () => {
    if (thinkingBuffer.current) {
      setThinkingTrigger((prev) => prev + 1); // Just a trigger, no actual text append
    }
    if (answerBuffer.current) {
      setAnswerTrigger((prev) => prev + 1);
    }
  };

  // Function to normalize newlines in tokens
  const normalizeToken = (token: string): string => {
    // Log the exact representation of the token for debugging
    console.log("Token before normalization:", JSON.stringify(token));

    // More careful normalization that preserves intentional formatting
    let normalizedToken = token;

    // Fix specific problematic patterns:

    // 1. Fix period followed by multiple newlines (common issue)
    // Only reduce multiple newlines after punctuation to a single newline
    normalizedToken = normalizedToken.replace(/([.!?])(\n{2,})/g, "$1\n");

    // 2. Preserve paragraph breaks (double newlines)
    // But normalize 3+ consecutive newlines to exactly 2
    normalizedToken = normalizedToken.replace(/\n{3,}/g, "\n\n");

    // 3. Special case: If token is ONLY newlines, preserve just one
    // This prevents accumulation of blank lines from single-newline tokens
    if (/^\n+$/.test(normalizedToken)) {
      normalizedToken = "\n";
    }

    console.log("Token after normalization:", JSON.stringify(normalizedToken));
    return normalizedToken;
  };

  useEffect(() => {
    const unlistenThink = listen<string>("model-thought-token", (event) => {
      console.log("Thought token received:", event.payload);
      console.log(
        "Thought token char codes:",
        Array.from(event.payload).map((c) => `${c} (${c.charCodeAt(0)})`)
      );

      // Normalize the token before adding to buffer
      const normalizedToken = normalizeToken(event.payload);
      thinkingBuffer.current += normalizedToken;

      if (waitingForFirstToken) setWaitingForFirstToken(false);
    });

    const unlistenAnswer = listen<string>("model-answer-token", (event) => {
      console.log("Answer token received:", event.payload);
      console.log(
        "Answer token char codes:",
        Array.from(event.payload).map((c) => `${c} (${c.charCodeAt(0)})`)
      );

      // Normalize the token before adding to buffer
      const normalizedToken = normalizeToken(event.payload);
      answerBuffer.current += normalizedToken;

      if (waitingForFirstToken) setWaitingForFirstToken(false);
    });

    const unlistenComplete = listen("model-complete", () => {
      flushBuffers();
      setIsLoading(false);
      setWaitingForFirstToken(false);
    });

    // Start the flush interval
    flushInterval.current = setInterval(flushBuffers, 100) as ReturnType<typeof setInterval>;

    return () => {
      unlistenThink.then((fn) => fn());
      unlistenAnswer.then((fn) => fn());
      unlistenComplete.then((fn) => fn());
      if (flushInterval.current) clearInterval(flushInterval.current);
    };
  }, [waitingForFirstToken]);

  const handleCancel = async () => {
    try {
      setIsLoading(false);
      setWaitingForFirstToken(false);
      setShowThinking(false);
      setCurrentResponse("");

      // Clear buffers
      thinkingBuffer.current = "";
      answerBuffer.current = "";

      // Reset triggers to clear the response
      setThinkingTrigger(0);
      setAnswerTrigger(0);

      // Clear any pending intervals
      if (flushInterval.current) {
        clearInterval(flushInterval.current);
      }

      // Abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Call the backend to cancel the generation
      await invoke("cancel_generation");
    } catch (error) {
      console.error("Error cancelling generation:", error);
      // Ensure we reset all states even if there's an error
      setIsLoading(false);
      setWaitingForFirstToken(false);
      setShowThinking(false);
      setCurrentResponse("");
      thinkingBuffer.current = "";
      answerBuffer.current = "";
      setThinkingTrigger(0);
      setAnswerTrigger(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setWaitingForFirstToken(true);

    // Reset the DOM containers by remounting the component
    setThinkingTrigger(0);
    setAnswerTrigger(0);

    thinkingBuffer.current = "";
    answerBuffer.current = "";

    // Clear the input
    setInput("");

    const result = await tryCatch(
      invoke("prompt_model", {
        prompt: input,
        signal: abortControllerRef.current.signal,
      })
    );

    if (result.error) {
      if (result.error.name === "AbortError") {
        // Handle abort gracefully
        return;
      }
      answerBuffer.current = "Error: " + String(result.error);
      setAnswerTrigger((prev) => prev + 1);
      setIsLoading(false);
      setWaitingForFirstToken(false);
    }
  };

  const handleExampleQuestionClick = (question: string) => {
    setInput(question);
    // Submit the form programmatically
    const form = document.querySelector("form");
    if (form) form.requestSubmit();
  };

  return (
    <div className="fixed inset-0 flex flex-col h-screen overflow-hidden">
      <div className="max-w-5xl w-full mx-auto flex flex-col h-full px-6 sm:px-8 py-4 pt-8">
        <ChatHeader />
        <ChatResponse
          thinkingTrigger={thinkingTrigger}
          answerTrigger={answerTrigger}
          thinkingBufferRef={thinkingBuffer}
          answerBufferRef={answerBuffer}
          waitingForFirstToken={waitingForFirstToken}
          isLoading={isLoading}
          onExampleQuestionClick={handleExampleQuestionClick}
        />
        <ChatInput
          input={input}
          setInput={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
