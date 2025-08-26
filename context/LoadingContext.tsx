"use client";

import { Backdrop } from "@mui/material";
import { createContext, useCallback, useContext, useState } from "react";
import "./loading.css";
import { indigo } from "@mui/material/colors";

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
      <Backdrop
        sx={(theme) => ({
          color: "#fff",
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: "rgba(25, 44, 160, 0.4)",
        })}
        open={isLoading}
        onClick={() => undefined}
      >
        <div className="loader"></div>
      </Backdrop>
    </LoadingContext.Provider>
  );
};
