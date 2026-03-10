"use client";

import { createContext, useCallback, useContext } from "react";
import { useRouter as useNextRouter } from "next/navigation";
import { useLoading } from "./LoadingContext";

const RouterContext = createContext<{
  redirectWithLoading: (url: string) => void;
} | null>(null);

export const useRouter = () => {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used inside RouterProvider");
  return ctx;
};

export const RouterProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useNextRouter();
  const { setLoading } = useLoading();

  const redirectWithLoading = useCallback((url: string) => {
    setLoading(true);
    router.push(url);
  }, []);

  return (
    <RouterContext.Provider value={{ redirectWithLoading }}>
      {children}
    </RouterContext.Provider>
  );
};
