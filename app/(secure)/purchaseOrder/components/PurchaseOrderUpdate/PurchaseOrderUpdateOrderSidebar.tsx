import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Paper,
  Typography,
} from "@mui/material";
import type { PurchaseOrderUpdateOrderSidebarProps } from "../../types";
import { PurchaseOrderUpdateSidebarEntry } from "./PurchaseOrderUpdateSidebarEntry";

export const PurchaseOrderUpdateOrderSidebar = ({
  entries,
  currentIndex,
  onNavigate,
  setLowBalance,
  setOutdated,
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
      maxHeight: "60vh",
    }}
  >
    <FormGroup>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Remover com:
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            onChange={(e) => setOutdated(e.target.checked)}
          />
        }
        label="Versão Preço desatualizada"
        slotProps={{ typography: { fontSize: 12 } }}
      />
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            onChange={(e) => setLowBalance(e.target.checked)}
          />
        }
        label="Saldo Baixo"
        slotProps={{ typography: { fontSize: 12 } }}
      />
    </FormGroup>
    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
      Pedidos ({entries.length})
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
