import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

export const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  successBtnLabel = "Confirmar",
  cancelBtnLabel = "Cancelar",
  message,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  successBtnLabel?: string;
  cancelBtnLabel?: string;
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Typography>{message}</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>{cancelBtnLabel}</Button>
      <Button variant="contained" onClick={onConfirm}>
        {successBtnLabel}
      </Button>
    </DialogActions>
  </Dialog>
);
