"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";
import { useRef, useState } from "react";

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
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          disabled={!name.trim()}
          variant="contained"
          onClick={() => {
            onCreate(name.trim());
            setName("");
          }}
        >
          Criar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
