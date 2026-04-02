"use client";

import type { DialogOptions } from "@/context/types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  DialogActions,
  Button,
  Select,
  MenuItem,
} from "@mui/material";
import { useState, type KeyboardEvent, type MouseEvent } from "react";

export const SelectDialog = ({
  openState,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  options,
  selectedOption,
}: DialogOptions) => {
  const [internalSelectedOption, setInternalSelectedOption] = useState(
    selectedOption ?? "",
  );

  const handleSelectConfirm =
    (selectedOption: string) =>
    (
      e:
        | KeyboardEvent<HTMLDivElement>
        | MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
    ) => {
      e.preventDefault();
      e.stopPropagation();
      onConfirm(selectedOption);
      onClose?.();
    };
  return (
    <Dialog open={openState ?? false} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{description}</Typography>
        <Select
          fullWidth
          sx={{ mt: 2 }}
          value={internalSelectedOption}
          onChange={(e) => setInternalSelectedOption(e.target.value)}
        >
          {options?.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{cancelLabel}</Button>
        <Button
          variant="contained"
          onClick={(e) => handleSelectConfirm(internalSelectedOption)(e)}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
