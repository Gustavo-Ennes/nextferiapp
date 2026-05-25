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
}: DialogOptions) => (
  <Dialog open={openState ?? false} onClose={onCloseAction}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Typography>{description}</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCloseAction}>{cancelLabel}</Button>
      <Button variant="contained" onClick={() => onConfirmAction()}>
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);
