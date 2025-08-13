"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";
import { useState } from "react";

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
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Adicionar departamento</DialogTitle>
      <DialogContent>
        <TextField
          label="Nome do departamento"
          fullWidth
          value={name}
          size="small"
          onChange={(e) => setName(e.target.value)}
          sx={{ p: 1 }}
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
