"use client";

import { Button, Box, Grid, Divider, Paper } from "@mui/material";
import { TabFormInfo } from "./TabFormInfo";
import { TabFormFuelings } from "./TabFormFuelings";
import { departmentHasPrefix } from "../../utils";
import { useMaterialRequisitionForm } from "@/context/MaterialRequisitionFormContext";
import { FuelingFormList } from "./FuelingFormList";
import type { FuelDTO } from "@/dto/FuelDTO";
import type {
  WeeklyFuellingSummaryDepartment,
  WeeklyFuellingSummaryVehicle,
} from "@/dto/WeeklyFuellingSummaryDTO";

export const TabForm = ({
  onSubmitAction,
  summaryDepartment,
  fuels,
}: {
  onSubmitAction: (vehicle: WeeklyFuellingSummaryVehicle) => Promise<void>;
  summaryDepartment: WeeklyFuellingSummaryDepartment;
  fuels: FuelDTO[];
}) => {
  const {
    selectedCar,
    vehicleForm: { description, prefix, fuel, fuelings },
    vehicleEquipInputRef,
    totalValue,
    totalLiters,
    totalKmHr,
    lastKm,
  } = useMaterialRequisitionForm();

  const handleSubmit = () => {
    if (description && prefix && fuel && fuelings.length > 0) {
      onSubmitAction({
        vehicle: description,
        prefix,
        fuelings,
        fuel,
        totalValue,
        totalLiters,
        totalKmHr,
        lastKm,
      }).then(() => vehicleEquipInputRef?.current?.focus());
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
      description !== selectedCar?.vehicle ||
      prefix !== selectedCar?.prefix ||
      fuel !== selectedCar.fuel ||
      fuelings !== selectedCar.fuelings
    );
  };

  const prefixExists =
    departmentHasPrefix({ department: summaryDepartment, prefix }) &&
    prefix !== selectedCar?.prefix;

  const shouldDisableSumbit =
    !description ||
    !prefix ||
    !fuel ||
    !isSelectedCarEditing() ||
    (prefixExists && selectedCar?.prefix !== prefix) ||
    (fuelings.length === 0 && mode === "create") ||
    (fuelings.length > 0 && mode === "remove");

  return (
    <Grid container component={Box} spacing={2} alignContent="start">
      <Grid size={7}>
        <Paper elevation={1} sx={{ padding: 2 }}>
          <TabFormInfo prefixExists={prefixExists} fuels={fuels} />

          <Divider sx={{ my: 4 }} />

          <TabFormFuelings onSubmitAction={handleSubmit} />
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
          disabled={shouldDisableSumbit}
        >
          {buttonLabel}
        </Button>
      </Grid>
    </Grid>
  );
};
