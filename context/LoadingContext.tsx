"use client";

import { Loader } from "@/app/(secure)/components/Loader";
import { createContext, useCallback, useContext, useState } from "react";

const LoadingContext = createContext<{
  setLoading: (isLoading: boolean) => void;
  isLoading: boolean;
} | null>(null);

export const useLoading = () => {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used inside LoadingProvider");
  return ctx;
};

export const LoadingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const setLoading = useCallback(
    (isLoading: boolean) => setIsLoading(isLoading),
    []
  );

  return (
    <LoadingContext.Provider value={{ setLoading, isLoading }}>
      {children}
      <Loader isLoading={isLoading} />
    </LoadingContext.Provider>
  );
};
