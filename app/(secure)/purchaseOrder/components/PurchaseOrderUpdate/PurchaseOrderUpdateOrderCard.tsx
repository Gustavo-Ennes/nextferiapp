import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { statusAlert } from "../../utils";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { PurchaseOrderUpdateOrderCardProps } from "../../types";

export const PurchaseOrderUpdateOrderCard = ({
  order,
  draft,
  index,
  total,
  status,
  onQtyChange,
  onKeep,
  onAdd,
}: PurchaseOrderUpdateOrderCardProps) => (
  <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
    <Typography variant="overline" color="text.secondary">
      Pedido {index + 1} de {total}
    </Typography>
    <Typography variant="h5" fontWeight={600} gutterBottom>
      {order.reference}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {(order.department as { name: string })?.name}
    </Typography>

    <Divider sx={{ my: 2 }} />

    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {order.items.map((item, i) => {
        const fuel = item.fuel as FuelDTO;
        const editedQty = draft.items[i]?.quantity ?? item.quantity;

        return (
          <Box
            key={String(fuel._id)}
            sx={{ display: "flex", alignItems: "center", gap: 2 }}
          >
            <Typography variant="body2" sx={{ flex: 1 }}>
              {fuel.name}{" "}
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
              >
                ({fuel.unit})
              </Typography>
            </Typography>
            <TextField
              type="number"
              size="small"
              value={editedQty}
              onChange={(e) => onQtyChange(i, Number(e.target.value))}
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
              sx={{ width: 130 }}
            />
          </Box>
        );
      })}
    </Box>

    {status !== "pending" && (
      <Alert
        severity={statusAlert[status].severity}
        variant="outlined"
        sx={{ mt: 2.5 }}
      >
        {statusAlert[status].message}
      </Alert>
    )}

    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 3 }}>
      <Button variant="outlined" onClick={onKeep}>
        Manter
      </Button>
      <Button
        variant="contained"
        onClick={onAdd}
        disabled={
          !draft ||
          draft.items.every(
            (item, i) => item.quantity === order.items[i].quantity,
          )
        }
      >
        Adicionar
      </Button>
    </Box>
  </Paper>
);
