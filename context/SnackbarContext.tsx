"use client";

import { createContext, useContext, useState } from "react";
import { Alert, Slide, Snackbar } from "@mui/material";
import { type AlertSeverity } from "./types";
import { indigo } from "@mui/material/colors";

const SnackbarContext = createContext<{
  addSnack: (param: { message: string; severity?: AlertSeverity }) => void;
} | null>(null);

export const useSnackbar = () => {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error("useSnackbar must be used inside SnackbarProvider");
  return ctx;
};

export const SnackbarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [message, setMessage] = useState<string>();
  const [severity, setSeverity] = useState<AlertSeverity>("info");

  const addSnack = ({
    message,
    severity,
  }: {
    message: string;
    severity?: AlertSeverity;
  }) => {
    if (!message) return;
    setMessage(message);
    setSeverity(severity ?? "info");
  };

  const getAlertBackgrondColor = (severity?: AlertSeverity) => {
    if (severity === "error") return "#9E2F39";
    if (severity === "success") return "#2F9E49";
    if (severity === "warning") return "#9e9c2fff";
    return indigo[700];
  };

  const autoHideDuration =
    severity === "error" || severity === "warning" ? 5000 : 3000;

  return (
    <SnackbarContext.Provider value={{ addSnack }}>
      {children}

      {message && (
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          open={!!message}
          slots={{ transition: Slide }}
          onClose={() => setMessage(undefined)}
          autoHideDuration={autoHideDuration}
        >
          <Alert
            onClose={() => setMessage(undefined)}
            severity={severity}
            variant="filled"
            sx={{
              width: "100%",
              backgroundColor: getAlertBackgrondColor(severity),
            }}
          >
            {message}
          </Alert>
        </Snackbar>
      )}
    </SnackbarContext.Provider>
  );
};
