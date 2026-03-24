import { Box, Divider, Paper, Typography } from "@mui/material";
import type { PurchaseOrderUpdateOrderSidebarProps } from "../../types";
import { PurchaseOrderUpdateSidebarEntry } from "./PurchaseOrderUpdateSidebarEntry";

export const PurchaseOrderUpdateOrderSidebar = ({
  entries,
  currentIndex,
  onNavigate,
}: PurchaseOrderUpdateOrderSidebarProps) => (
  <Paper
    elevation={0}
    variant="outlined"
    sx={{
      p: 2,
      borderRadius: 3,
      display: "flex",
      flexDirection: "column",
      height: "100%",
    }}
  >
    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
      Pedidos
    </Typography>
    <Divider sx={{ mb: 1.5 }} />

    <Box
      sx={{
        overflowY: "auto",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      {entries.map((entry, idx) => (
        <PurchaseOrderUpdateSidebarEntry
          key={entry.orderId}
          entry={entry}
          isCurrent={idx === currentIndex}
          onClick={() => onNavigate(idx)}
        />
      ))}
    </Box>
  </Paper>
);
