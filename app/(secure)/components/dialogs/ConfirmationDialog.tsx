import type { DialogOptions } from "@/context/types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

export const ConfirmationDialog = ({
  openState,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
}: DialogOptions) => (
  <Dialog open={openState ?? false} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Typography>{description}</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>{cancelLabel}</Button>
      <Button variant="contained" onClick={() => onConfirm()}>
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);
