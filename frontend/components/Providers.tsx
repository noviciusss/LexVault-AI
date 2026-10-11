"use client";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import { ErrorState, LoadingState } from "@/components/ui/primitives";
import { errorMessage } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false } },
      }),
  );
  const email = useAppStore((state) => state.currentUser.email);
  const [identity, setIdentity] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setError("");
    localStorage.removeItem("lexvault_token");
    client.cancelQueries();
    client.clear();
    api.auth
      .login({ email, password: "password123" })
      .then((data) => {
        if (!active) return;
        localStorage.setItem("lexvault_token", data.access_token);
        setIdentity(email);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [email, client, attempt]);
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={client}>
        <MotionConfig reducedMotion="user">
          {pathname === "/" || identity === email ? (
            children
          ) : (
            <div className="mx-auto max-w-xl p-8">
              {error ? (
                <ErrorState
                  message={`Demo workspace could not connect: ${error}`}
                  retry={() => setAttempt((value) => value + 1)}
                />
              ) : (
                <LoadingState label="Connecting to your research workspace…" />
              )}
            </div>
          )}
          <Toaster richColors closeButton position="bottom-right" />
        </MotionConfig>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
