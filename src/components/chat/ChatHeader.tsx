import React from "react";

export function ChatHeader() {
  return (
    <div className="flex-shrink-0 mb-6">
      <h1 className="text-2xl font-bold text-foreground/90 tracking-tight">Fin-R1</h1>
      <p className="text-sm text-muted-foreground/70">
        Fin-R1 is a financial reasoning language model built on Qwen2.5-7B-Instruct and fine-tuned
        with high-quality, verifiable financial problem datasets. The model achieves
        state-of-the-art performance on multiple financial benchmarks, making it particularly
        effective for complex financial reasoning tasks.
      </p>
    </div>
  );
}
