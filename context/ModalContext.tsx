"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
} from "@mui/material";
import { createContext, useContext, useState, useCallback } from "react";

type ModalContextType = {
  open: (options: ModalOptions) => void;
  close: () => void;
};

type ModalOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  input?: boolean;
  onConfirm: (observation: string) => void;
};

const ModalContext = createContext<ModalContextType | null>(null);

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used inside ModalProvider");
  return ctx;
};

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [openState, setOpenState] = useState(false);
  const [observation, setObservation] = useState("");
  const [options, setOptions] = useState<ModalOptions | null>(null);

  const open = useCallback((opts: ModalOptions) => {
    setOptions(opts);
    setOpenState(true);
  }, []);

  const close = useCallback(() => {
    setOpenState(false);
    setObservation("");
    setOptions(null);
  }, []);

  const handleConfirm = () => {
    options?.onConfirm(observation);
    close();
  };

  return (
    <ModalContext.Provider value={{ open, close }}>
      {children}

      <Dialog open={openState} onClose={close} fullWidth maxWidth="sm">
        <DialogTitle>{options?.title}</DialogTitle>
        <DialogContent>
          {options?.description && (
            <Typography variant="body1" mb={2}>
              {options.description}
            </Typography>
          )}
          {options?.input && (
            <TextField
              label="Observação"
              fullWidth
              multiline
              minRows={3}
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>{options?.cancelLabel || "Cancelar"}</Button>
          <Button variant="contained" onClick={handleConfirm}>
            {options?.confirmLabel || "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </ModalContext.Provider>
  );
};
