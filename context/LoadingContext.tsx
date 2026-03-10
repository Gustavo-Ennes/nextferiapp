"use client";

import { Loader } from "@/app/(secure)/components/Loader";
import { usePathname, useSearchParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  Suspense,
} from "react";

const LoadingContext = createContext<{
  setLoading: (isLoading: boolean) => void;
  isLoading: boolean;
} | null>(null);

export const useLoading = () => {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used inside LoadingProvider");
  return ctx;
};

const NavigationWatcher = ({ onNavigate }: { onNavigate: () => void }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    onNavigate();
  }, [pathname, searchParams, onNavigate]);

  return null;
};

export const LoadingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setLoading = useCallback(
    (loading: boolean) => setIsLoading(loading),
    [],
  );

  const handleNavigate = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <LoadingContext.Provider value={{ setLoading, isLoading }}>
      <Suspense fallback={null}>
        <NavigationWatcher onNavigate={handleNavigate} />
      </Suspense>

      {children}
      <Loader isLoading={isLoading} />
    </LoadingContext.Provider>
  );
};
