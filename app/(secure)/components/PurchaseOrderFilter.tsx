"use client";

import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useEffect, useState } from "react";
import { capitalizeName } from "@/app/utils";
import type { SupplierDTO } from "@/dto";
import type { PurchaseOrderFilterParam } from "./types";

export const PurchaseOrderFilter = ({
  suppliers,
  filterAction,
}: {
  suppliers: SupplierDTO[];
  filterAction: (param: PurchaseOrderFilterParam) => void;
}) => {
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [hideOutdated, sethideOutdated] = useState(false);
  const [hideLowBalance, sethideLowBalance] = useState(false);

  useEffect(() => {
    const supplier = selectedSupplier === "all" ? "" : selectedSupplier;
    filterAction({ selectedSupplier: supplier, hideLowBalance, hideOutdated });
  }, [selectedSupplier, hideLowBalance, hideOutdated]);

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center">
      <Grid size={3}>
        {" "}
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={hideOutdated}
                onChange={(e) => sethideOutdated(e.target.checked)}
                size="small"
              />
            }
            slotProps={{ typography: { fontSize: 10 } }}
            labelPlacement="bottom"
            label="Excluir versão preço desatualizada"
          />
        </FormGroup>
      </Grid>
      <Grid size={3}>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={hideLowBalance}
                onChange={(e) => sethideLowBalance(e.target.checked)}
                size="small"
              />
            }
            slotProps={{ typography: { fontSize: 10 } }}
            labelPlacement="bottom"
            label="Excluir saldo baixo"
          />
        </FormGroup>
      </Grid>

      <Grid size={6}>
        <FormControl fullWidth size="small">
          <InputLabel id="supplier-label">Fornecedor</InputLabel>
          <Select
            labelId="supplier-label"
            label="Fornecedor"
            onChange={(s) =>
              setSelectedSupplier((s.target.value as string) ?? "all")
            }
            value={selectedSupplier ?? "all"}
          >
            <MenuItem value={"all"} key={"all"}>
              Todos os fornecedores
            </MenuItem>
            {suppliers.map((supplier) => (
              <MenuItem key={supplier._id} value={supplier._id}>
                {capitalizeName(supplier.name)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};
