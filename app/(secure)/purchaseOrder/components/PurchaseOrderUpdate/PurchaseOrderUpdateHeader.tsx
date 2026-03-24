import { Box, LinearProgress, Typography } from "@mui/material";
import type { PurchaseOrderUpdateHeaderProps } from "../../types";

export const PurchaseOrderUpdateProgressHeader = ({
  reviewed,
  total,
}: PurchaseOrderUpdateHeaderProps) => {
  const progress = Math.round((reviewed / total) * 100);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {reviewed} de {total} pedidos revisados
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {progress}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ borderRadius: 1, height: 5 }}
      />
    </Box>
  );
};
