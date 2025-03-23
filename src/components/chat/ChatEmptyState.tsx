"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles, Brain, Lightbulb } from "lucide-react";

interface ChatEmptyStateProps {
  onQuestionClick: (question: string) => void;
}

export function ChatEmptyState({ onQuestionClick }: ChatEmptyStateProps) {
  const exampleQuestions = [
    {
      text: "What's the best way to start investing with $1,000?",
      icon: <Sparkles className="h-4 w-4 shrink-0" />,
    },
    {
      text: "Can you explain how compound interest works?",
      icon: <Brain className="h-4 w-4 shrink-0" />,
    },
    {
      text: "What are the pros and cons of a Roth IRA vs Traditional IRA?",
      icon: <Lightbulb className="h-4 w-4 shrink-0" />,
    },
    {
      text: "How should I budget for a major purchase?",
      icon: <MessageSquare className="h-4 w-4 shrink-0" />,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="w-full max-w-3xl">
        <div className="grid gap-3 md:grid-cols-2">
          {exampleQuestions.map((question, index) => (
            <Button
              key={index}
              variant="ghost"
              className="group relative justify-start h-auto py-4 px-6 transition-all text-left whitespace-normal break-words rounded-[var(--radius)] border border-[var(--header-gradient-start)]/10 hover:border-[var(--header-gradient-start)]/30 hover:bg-primary/5 hover:scale-[1.02] hover:shadow-sm"
              onClick={() => onQuestionClick(question.text)}
            >
              <div className="relative flex items-start gap-3">
                <div className="mt-1 text-muted-foreground group-hover:text-primary transition-colors">
                  {question.icon}
                </div>
                <span className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">
                  {question.text}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
