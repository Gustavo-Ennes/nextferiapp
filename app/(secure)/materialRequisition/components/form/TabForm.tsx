"use client";

import { Button, Box, Grid, Divider, Paper } from "@mui/material";
import type {
  CarEntry,
  TabData,
} from "@/lib/repository/weeklyFuellingSummary/types";
import { TabFormInfo } from "./TabFormInfo";
import { TabFormFuelings } from "./TabFormFuelings";
import { prefixExistsInTabData } from "../../utils";
import { useMaterialRequisitionForm } from "@/context/MaterialRequisitionFormContext";
import { FuelingFormList } from "./FuelingFormList";
import type { FuelDTO } from "@/dto/FuelDTO";

export const TabForm = ({
  onSubmit,
  tabData,
  fuels,
}: {
  onSubmit: (car: CarEntry) => void;
  tabData: TabData;
  fuels: FuelDTO[];
}) => {
  const {
    selectedCar,
    setSelectedCar,
    vehicle,
    prefix,
    fuel,
    fuelings,
    vehicleEquipInputRef,
  } = useMaterialRequisitionForm();

  const handleSubmit = () => {
    if (vehicle && prefix && fuel && fuelings.length > 0) {
      onSubmit({ vehicle, prefix, fuelings, fuel });
      setSelectedCar(null);
      vehicleEquipInputRef?.current?.focus();
    }
  };

  const buttonLabel = !selectedCar
    ? "Criar"
    : fuelings.length
      ? "Atualizar"
      : "Remover";
  const mode = !selectedCar
    ? "create"
    : fuelings.length > 0
      ? "edit"
      : "remove";

  const isSelectedCarEditing = () => {
    return (
      vehicle !== selectedCar?.vehicle ||
      prefix !== selectedCar?.prefix ||
      fuel !== selectedCar.fuel ||
      fuelings !== selectedCar.fuelings
    );
  };

  const prefixExists =
    prefixExistsInTabData({ prefix, tabData }) &&
    prefix !== selectedCar?.prefix;

  return (
    <Grid container component={Box} spacing={2} alignContent="start">
      <Grid size={7}>
        <Paper elevation={1} sx={{ padding: 2 }}>
          <TabFormInfo prefixExists={prefixExists} fuels={fuels} />

          <Divider sx={{ my: 4 }} />

          <TabFormFuelings onSubmit={onSubmit} />
        </Paper>
      </Grid>

      <Grid size={5} container>
        <Paper
          elevation={1}
          sx={{
            padding: 1,
            height: "230px",
            maxHeight: "230px",
            width: 1,
            overflow: "auto",
          }}
        >
          <FuelingFormList />
        </Paper>
      </Grid>

      <Grid size={12}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            !vehicle ||
            !prefix ||
            !isSelectedCarEditing() ||
            (prefixExists && selectedCar?.prefix !== prefix) ||
            (fuelings.length === 0 && mode === "create") ||
            (fuelings.length > 0 && mode === "remove")
          }
        >
          {buttonLabel}
        </Button>
      </Grid>
    </Grid>
  );
};
