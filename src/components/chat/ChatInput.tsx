"use client";

import type React from "react";
import { useRef, useEffect } from "react";
import { Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading: boolean;
  onCancel: () => void;
}

export function ChatInput({ input, setInput, onSubmit, isLoading, onCancel }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as content grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

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
    <div className="w-full mb-4">
      <form
        onSubmit={onSubmit}
        className="w-full flex items-end gap-2 rounded-[var(--radius)] bg-card/50 ring-1 ring-border"
      >
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          className="resize-none flex-1 min-h-[44px] max-h-[200px] border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-3 px-4"
        />
        <Button
          type={isLoading ? "button" : "submit"}
          size="icon"
          disabled={!isLoading && !input.trim()}
          onClick={isLoading ? onCancel : undefined}
          className={cn(
            "h-8 w-8 rounded-full mb-3 mr-3 relative",
            "bg-primary text-primary-foreground",
            !isLoading && !input.trim() && "opacity-50"
          )}
        >
          {isLoading ? (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 border-[3px] border-primary-foreground/10 border-t-primary-foreground/40 rounded-full animate-spin" />
              </div>
              <div className="relative z-10 h-2.5 w-2.5 bg-current" />
            </>
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="sr-only">{isLoading ? "Cancel generation" : "Send message"}</span>
        </Button>
      </form>

      <div className="flex justify-center mt-2">
        <div className="text-xs text-muted-foreground select-none flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-card rounded-[var(--radius-sm)] text-[10px] font-medium">
            Enter
          </kbd>
          <span>to send</span>
          <span className="mx-1 text-muted-foreground/30">•</span>
          <kbd className="px-1.5 py-0.5 bg-card rounded-[var(--radius-sm)] text-[10px] font-medium">
            Shift + Enter
          </kbd>
          <span>for new line</span>
        </div>
      </div>
    </div>
  );
}
