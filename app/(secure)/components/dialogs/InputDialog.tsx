"use client";

import type { DialogOptions } from "@/context/types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { useRef, useState, type KeyboardEvent, type MouseEvent } from "react";

export const InputDialog = ({
  onClose,
  onConfirm,
  title,
  cancelLabel = "Cancelar",
  confirmLabel = "Criar",
  description,
  openState,
  inputLabel,
  input,
}: DialogOptions) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalInput, setInternalInput] = useState(input ?? "");
  const onEntered = () => inputRef?.current?.focus();

  const handleConfirm = (
    e:
      | KeyboardEvent<HTMLDivElement>
      | MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    onConfirm(internalInput);
    onClose?.();
  };

  return (
    <Dialog
      open={openState ?? false}
      onClose={onClose}
      slotProps={{ transition: { onEntered } }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{description}</Typography>
        <TextField
          label={inputLabel ?? "input"}
          fullWidth
          value={input}
          size="small"
          onChange={(e) => setInternalInput(e.target.value)}
          sx={{ my: 2 }}
          inputRef={inputRef}
          onKeyDown={(e) => {
            if (e.key === "Enter" && internalInput.length >= 3)
              handleConfirm(e);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{cancelLabel}</Button>
        <Button
          disabled={internalInput.length < 3}
          variant="contained"
          onClick={(e) => handleConfirm(e)}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
