import { Paper, Stack, Divider, Box, Typography, Grid } from "@mui/material";
import { getInvoicesTotalFuels } from "../../utils";
import { useFuelingBatchForm } from "@/context/FuelingBatchFormContext";
import type { FuelDTO, FuelingBatchDTO } from "@/dto";
import { assoc } from "ramda";
import { useMemo } from "react";
import {
  calculateFuelingBatchTotals,
  getFuelInventory,
} from "@/lib/repository/fuelingBatch/utils";
import { CompactStat } from "./FuelingBatchCompactStat";
import {
  getFuelInventoryStats,
  getPrimaryStats,
  getSecondaryStats,
} from "./statItems";

export const FuelingBatchHeader = ({
  fuelingBatch,
  fuels,
}: {
  fuelingBatch: FuelingBatchDTO | null;
  fuels: FuelDTO[];
}) => {
  const { selectedDepartment } = useFuelingBatchForm();

  const invoices = fuelingBatch?.departments.flatMap((d) => d.invoices) ?? [];
  const invoiceTotalFuels = getInvoicesTotalFuels(invoices, fuels);
  const fuelInventory = getFuelInventory({
    departmentTotalFuels: fuelingBatch?.totals.totalFuels ?? {},
    invoiceTotalFuels,
  });

  // same batch, just selecting one department if selectedDepartment and recalculating totals
  const selectedFuelingBatch = useMemo(
    () =>
      selectedDepartment
        ? (calculateFuelingBatchTotals({
            payload: assoc("departments", [selectedDepartment], fuelingBatch),
            fuels,
          }) as FuelingBatchDTO)
        : null,
    [selectedDepartment],
  );
  const selectedInvoices = useMemo(
    () =>
      selectedFuelingBatch
        ? selectedFuelingBatch.departments?.flatMap((d) => d.invoices)
        : [],
    [selectedFuelingBatch],
  );

  const primaryStats = getPrimaryStats({
    fuelingBatch,
    selectedDepartment,
    selectedFuelingBatch,
    invoices,
    selectedInvoices,
  });
  const secondaryStats = getSecondaryStats({
    fuelingBatch,
    selectedFuelingBatch,
  });
  const fuelInventoryStats = getFuelInventoryStats(fuelInventory.totals);

  return fuelingBatch ? (
    <Box>
      <Paper variant="outlined" sx={{ px: 1 }}>
        <Grid container justifyContent="center" alignItems="center">
          <Grid size={12}>
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem />}
              justifyContent="center"
              flexWrap="wrap"
              sx={{ py: 0.5 }}
            >
              {primaryStats.map((stat) => (
                <CompactStat key={`primaryStat-${stat.name}`} {...stat} />
              ))}
            </Stack>
          </Grid>

          <Grid size={12}>
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem />}
              justifyContent="center"
              flexWrap="wrap"
              sx={{ py: 0.5 }}
            >
              {secondaryStats.map((stat) => (
                <CompactStat key={`secondaryStat-${stat.name}`} {...stat} />
              ))}
            </Stack>
          </Grid>

          <Grid size={12}>
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem />}
              justifyContent="center"
              flexWrap="wrap"
              sx={{ py: 0.5 }}
            >
              {fuelInventoryStats.map((stat) => (
                <CompactStat key={`fuelInventoryStat-${stat.name}`} {...stat} />
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  ) : (
    <Typography
      variant="subtitle1"
      align="center"
      color="text.secondary"
      sx={{ py: 2 }}
    >
      Selecione um resumo semanal de abastecimento para continuar
    </Typography>
  );
};
