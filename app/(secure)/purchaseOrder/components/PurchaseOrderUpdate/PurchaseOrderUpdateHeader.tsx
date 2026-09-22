import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import type { PurchaseOrderUpdateHeaderProps } from "../../types";
import { capitalizeName } from "@/app/utils";

export const PurchaseOrderUpdateProgressHeader = ({
  reviewed,
  total,
  suppliers,
  setSupplier,
  selectedSupplier,
}: PurchaseOrderUpdateHeaderProps) => {
  const progress = Math.round((reviewed / total) * 100);

  return (
    <Box>
      <Paper>
        <FormControl fullWidth size="small">
          <InputLabel id="suplier-label">Fornecedor</InputLabel>
          <Select
            labelId="supplier-label"
            label="Fornecedor"
            onChange={(s) => setSupplier((s.target.value as string) ?? "")}
            value={selectedSupplier ?? ""}
          >
            <MenuItem value={""}>
              <em>Selecione o fornecedor</em>
            </MenuItem>
            {suppliers.map((supplier) => (
              <MenuItem
                key={supplier._id as string}
                value={supplier._id as string}
              >
                {capitalizeName(supplier.name)}
              </MenuItem>
            ))}
          </Select>
          {!selectedSupplier && (
            <FormHelperText>{"Selecione um fornecedor"}</FormHelperText>
          )}
        </FormControl>
      </Paper>
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
