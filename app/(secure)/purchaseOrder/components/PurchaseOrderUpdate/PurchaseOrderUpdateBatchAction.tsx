// components/BatchFooter.tsx
import { Box, Button, Paper, Typography } from "@mui/material";
import type { PurchaseOrderUpdateBatchActionProps } from "../../types";

export const PurchaseOrderUpdateBatchAction = ({
  queueCount,
  keptCount,
  isSubmitting,
  onSubmit,
}: PurchaseOrderUpdateBatchActionProps) => {
  if (queueCount === 0) {
    return (
      <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Todos os pedidos foram mantidos — nada a atualizar.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="body2" fontWeight={500}>
            Pronto para confirmar
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {queueCount} pedido(s) serão atualizados • {keptCount} mantido(s)
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          size="large"
          disabled={isSubmitting}
          onClick={onSubmit}
        >
          {isSubmitting
            ? "Atualizando..."
            : `Atualizar ${queueCount} pedido(s)`}
        </Button>
      </Box>
    </Paper>
  );
};
