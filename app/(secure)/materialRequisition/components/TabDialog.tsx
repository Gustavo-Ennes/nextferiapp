"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";
import { useRef, useState, type KeyboardEvent, type MouseEvent } from "react";

export const NewTabDialog = ({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}) => {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const onEntered = () => inputRef?.current?.focus();

  const handleCreate = (
    e:
      | KeyboardEvent<HTMLDivElement>
      | MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    onCreate(name.trim());
    setName("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{ transition: { onEntered } }}
    >
      <DialogTitle>Adicionar departamento</DialogTitle>
      <DialogContent>
        <TextField
          label="Nome"
          fullWidth
          value={name}
          size="small"
          onChange={(e) => setName(e.target.value)}
          sx={{ my: 2 }}
          inputRef={inputRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate(e);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          disabled={!name.trim()}
          variant="contained"
          onClick={(e) => handleCreate(e)}
        >
          Criar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
