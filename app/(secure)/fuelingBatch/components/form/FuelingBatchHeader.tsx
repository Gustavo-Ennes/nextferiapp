import {
  Paper,
  Stack,
  Divider,
  Box,
  Typography,
  Grid,
  Button,
  Tooltip,
} from "@mui/material";
import { getInvoicesTotalFuels } from "../../utils";
import { useFuelingBatchForm } from "@/context/FuelingBatchFormContext";
import type { FuelingBatchDTO } from "@/dto";
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
import { useDialog } from "@/context/DialogContext";
import { updateFuelingBatch } from "@/app/(secure)/utils";
import { useLoading } from "@/context/LoadingContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { Edit } from "@mui/icons-material";
import type { FuelingBatchHeaderParam } from "../../types";

export const FuelingBatchHeader = ({
  fuelingBatch,
  fuels,
  setFuelingBatch,
}: FuelingBatchHeaderParam) => {
  const { setLoading } = useLoading();
  const { selectedDepartment } = useFuelingBatchForm();
  const { openInputDialog } = useDialog();
  const { addSnack } = useSnackbar();

  const invoices = fuelingBatch?.departments.flatMap((d) => d.invoices) ?? [];

  const handleAddObservation = (pastObservation?: string) =>
    openInputDialog({
      title: "Adicione uma observação a esse lote de abastecimentos.",
      inputLabel: "Observação",
      input: pastObservation,
      confirmLabel: pastObservation
        ? "Modificar observação"
        : "Salvar observação",
      onConfirmAction: async (observation?: string) => {
        if (!observation) return;

        setLoading(true);
        updateFuelingBatch({ ...fuelingBatch, observation } as FuelingBatchDTO)
          .then((returnedBatch) => {
            addSnack({ message: "Observação adicionada ao lote com sucesso!" });
            setFuelingBatch(returnedBatch);
          })
          .catch(() => {
            addSnack({
              message: "Houve um erro ao adicionar a observação ao lote.",
            });
          })
          .finally(() => setLoading(false));
      },
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
  const fuelInventory = useMemo(() => {
    const inventory = getFuelInventory({
      departmentTotalFuels: selectedFuelingBatch?.totals.totalFuels ?? {},
      invoiceTotalFuels: getInvoicesTotalFuels(selectedInvoices, fuels),
    });
    return inventory;
  }, [selectedDepartment]);

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

          <Grid size={12}>
            <Box
              sx={{
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
              }}
            >
              {fuelingBatch.observation ? (
                <Typography variant="caption">
                  {fuelingBatch.observation}{" "}
                  <Tooltip title="Edite a observação do lote" color="success">
                    <Edit
                      sx={{ fontSize: 15, cursor: "pointer" }}
                      onClick={() =>
                        handleAddObservation(fuelingBatch.observation)
                      }
                    />
                  </Tooltip>
                </Typography>
              ) : fuelingBatch._id ? (
                <Button variant="text" onClick={() => handleAddObservation()}>
                  Adicionar descrição ao lote
                </Button>
              ) : (
                <></>
              )}
            </Box>
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
