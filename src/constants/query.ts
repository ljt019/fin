import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export const queryKeys = {
  exampleKey: ["example-key"] as const,
  exampleKey2: () => [...queryKeys.exampleKey, "example-key-2"],
};
