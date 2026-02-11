"use client";

import { Button, Box, Grid, Divider } from "@mui/material";
import { useEffect, useRef } from "react";
import type {
  CarEntry,
  TabData,
} from "../../../../lib/repository/weeklyFuellingSummary/types";
import { TabFormInfo } from "./TabFormInfo";
import { TabFormFuelings } from "./TabFormFuelings";
import { prefixExistsInTabData } from "../utils";
import { useMaterialRequisitionForm } from "@/context/MaterialRequisitionFormContext";

export const TabForm = ({
  onSubmit,
  tabData,
}: {
  onSubmit: (car: CarEntry) => void;
  tabData: TabData;
}) => {
  const { selectedCar, setSelectedCar, vehicle, prefix, fuel, fuelings } =
    useMaterialRequisitionForm();
  const vechicleEquipInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedCar(selectedCar);
  }, [selectedCar]);

  const handleSubmit = () => {
    if (vehicle && prefix) {
      onSubmit({ vehicle, prefix, fuelings, fuel });
      setSelectedCar(null);
      vechicleEquipInputRef?.current?.focus();
    }
  };

  const buttonLabel = !selectedCar
    ? "Criar"
    : fuelings.length
      ? "Atualizar"
      : "Remover";

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
      <Grid size={6}>
        <TabFormInfo
          dateInputRef={dateInputRef}
          vechicleEquipInputRef={vechicleEquipInputRef}
          prefixExists={prefixExists}
        />
      </Grid>
      <Grid size={6} container>
        colocar abastecimentos
      </Grid>

      <Grid size={12} component={Divider} />
      <Grid component={Box} size={12}>
        <TabFormFuelings dateInputRef={dateInputRef} onSubmit={onSubmit} />
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
            !fuelings.length
          }
        >
          {buttonLabel}
        </Button>
      </Grid>
    </Grid>
  );
};
