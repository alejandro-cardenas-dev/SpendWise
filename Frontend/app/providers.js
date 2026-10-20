"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "@/context/AuthContext";

export default function Providers({ children }) {
  // useState keeps ONE client for the lifetime of the page
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            // Retry network and server errors, never 4xx (retrying a 404 is pointless)
            retry: (failureCount, error) =>
              !error.response || error.response.status >= 500
                ? failureCount < 2
                : false,
          },
        },
      })
  );

  // AuthProvider is INSIDE QueryClientProvider because it clears the cache on logout
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}