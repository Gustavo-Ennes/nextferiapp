"use client";

import { Button, Box, Grid, Divider, Paper } from "@mui/material";
import { TabFormInfo } from "./TabFormInfo";
import { TabFormFuelings } from "./TabFormFuelings";
import {
  departmentHasPrefix,
  getInvoicesFuels,
  getInvoicesTotalFuels,
} from "../../utils";
import { useFuelingBatchForm } from "@/context/FuelingBatchFormContext";
import { FuelingFormList } from "./FuelingBatchFuelingFormList";
import type { TabFormProps } from "../types";

export const TabForm = ({
  onSubmitAction,
  fuelingBatchDepartment,
  fuels,
}: TabFormProps) => {
  const { invoices } = fuelingBatchDepartment;
  const {
    selectedCar,
    vehicleForm: { description, prefix, fuel, fuelings },
    vehicleEquipInputRef,
    totalValue,
    totalLiters,
    totalKmHrs,
    lastKm,
  } = useFuelingBatchForm();
  const invoicesTotalFuels = getInvoicesTotalFuels(invoices, fuels);
  const invoicesFuels = getInvoicesFuels({ fuelingBatchDepartment, fuels });

  const handleSubmit = () => {
    if (
      description &&
      prefix &&
      fuel &&
      fuelings.length > 0 &&
      fuelingBatchDepartment.invoices.length > 0
    ) {
      onSubmitAction({
        vehicle: description,
        prefix,
        fuelings,
        fuel,
        totals: {
          totalLiters,
          totalValue,
          totalKmHrs,
        },
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
    departmentHasPrefix({ department: fuelingBatchDepartment, prefix }) &&
    prefix !== selectedCar?.prefix;

  const shouldDisableSumbit =
    !description ||
    !prefix ||
    !fuel ||
    !isSelectedCarEditing() ||
    (prefixExists && selectedCar?.prefix !== prefix) ||
    (fuelings.length === 0 && mode === "create") ||
    (fuelings.length > 0 && mode === "remove") ||
    fuelingBatchDepartment.invoices.length === 0;

  return (
    <Grid container component={Box} spacing={2} alignContent="start">
      <Grid size={7}>
        <Paper elevation={1} sx={{ padding: 2 }}>
          <TabFormInfo prefixExists={prefixExists} fuels={invoicesFuels} />

          <Divider sx={{ my: 4 }} />

          <TabFormFuelings
            onSubmitAction={handleSubmit}
            invoicesTotalFuels={invoicesTotalFuels}
          />
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
