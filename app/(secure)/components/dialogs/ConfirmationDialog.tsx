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
  onCloseAction,
  onConfirmAction,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  role = "dialog",
}: DialogOptions) => (
  <Dialog open={openState ?? false} onClose={onCloseAction} role={role}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Typography>{description}</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCloseAction}>{cancelLabel}</Button>
      <Button
        variant="contained"
        color={role === "dialog" ? "primary" : "error"}
        onClick={() => onConfirmAction()}
      >
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);
