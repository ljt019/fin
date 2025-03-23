import React, { useState } from "react";

export function ChatHeader() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const text =
    "Fin-R1 is a financial reasoning language model built on Qwen2.5-7B-Instruct and fine-tuned with high-quality, verifiable financial problem datasets. The model achieves state-of-the-art performance on multiple financial benchmarks, making it particularly effective for complex financial reasoning tasks.";
  const chars = text.split("");

  const getHighlightClass = (index: number) => {
    if (hoveredIndex === null) return "text-muted-foreground/70";

    const distance = Math.abs(index - hoveredIndex);
    if (distance <= 2) return "text-foreground";
    if (distance <= 4) return "text-foreground/80";
    if (distance <= 6) return "text-foreground/60";

    return "text-muted-foreground/70";
  };

  return (
    <div className="flex-shrink-0 mb-6">
      <div className="relative inline-block">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[var(--header-gradient-start)] to-[var(--header-gradient-end)] bg-clip-text text-transparent transform hover:scale-[1.03] transition-transform duration-500 ease-in-out cursor-default">
          Fin-R1
        </h1>
      </div>
      <p className="text-sm relative cursor-default">
        {chars.map((char, index) => (
          <span
            key={index}
            className={`${getHighlightClass(index)} transition-colors duration-150 cursor-default`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {char}
          </span>
        ))}
      </p>
    </div>
  );
}
