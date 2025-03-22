import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { tryCatch } from "@/lib/try-catch";
import { ChatHeader } from "./ChatHeader";
import { ChatResponse } from "./ChatResponse";
import { ChatInput } from "./ChatInput";

export function ChatContainer() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [responseChunks, setResponseChunks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [waitingForFirstToken, setWaitingForFirstToken] = useState(false);

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

  // Setup event listeners for model tokens
  useEffect(() => {
    // Listen for tokens from the model
    const unlisten = listen<string>("model-token", (event) => {
      // If this is the first token, stop showing the loading indicator
      if (waitingForFirstToken) {
        setWaitingForFirstToken(false);

        // For the first token, remove any leading whitespace
        const token = event.payload.trimStart();
        setResponse(token);
        setResponseChunks([token]);
      } else {
        // For subsequent tokens, just append
        const token = event.payload;
        setResponse((prev) => prev + token);
        setResponseChunks((prev) => [...prev, token]);
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setWaitingForFirstToken(true);
    setResponse("");

    const result = await tryCatch(invoke("prompt_model", { prompt: input }));

    if (result.error) {
      console.error("Error prompting model:", result.error);
      setResponse("Error: " + String(result.error));
      setIsLoading(false);
      setWaitingForFirstToken(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col h-screen overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: animationStyle }} />
      <div className="max-w-5xl w-full mx-auto flex flex-col h-full px-6 sm:px-8 py-4 pt-8">
        <ChatHeader />
        <ChatResponse
          response={response}
          responseChunks={responseChunks}
          waitingForFirstToken={waitingForFirstToken}
          isLoading={isLoading}
        />
        <ChatInput
          input={input}
          setInput={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
