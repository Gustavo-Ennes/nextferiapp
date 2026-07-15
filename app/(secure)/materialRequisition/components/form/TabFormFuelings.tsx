"use client";

import { Grid, TextField, Button } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { startOfDay, toDate } from "date-fns";
import { useMaterialRequisitionForm } from "@/context/MaterialRequisitionFormContext";
import type { KeyboardEvent } from "react";
import { sortCarFuelings } from "../../utils";
import type { WeeklyFuellingSummaryVehicle } from "@/dto/WeeklyFuellingSummaryDTO";

export const TabFormFuelings = ({
  onSubmitAction,
}: {
  onSubmitAction: (vehicle: WeeklyFuellingSummaryVehicle) => void;
}) => {
  const {
    vehicleForm: { fuelings, description, prefix, fuel },
    setVehicleForm,
    date,
    quantity,
    kmHr,
    setDate,
    setQuantity,
    setKmHr,
    dateInputRef,
    totalKmHr,
    totalLiters,
    totalValue,
    lastKm,
  } = useMaterialRequisitionForm();

  const addFueling = () => {
    if (date && quantity > 0) {
      setVehicleForm({
        description,
        prefix,
        fuel,
        fuelings: sortCarFuelings([
          ...fuelings,
          { date, quantity, kmHr: kmHr ?? null },
        ]),
      });
      setDate(new Date().toISOString());
      setQuantity(0);
    }
  };

  const handleAddFueling = () => {
    addFueling();
    dateInputRef?.current?.focus();
  };

  // ctrl+Enter to submit form in date field
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (
      e.ctrlKey &&
      e.key === "Enter" &&
      description &&
      prefix &&
      fuelings.length > 0 &&
      fuel
    ) {
      e.preventDefault();

      onSubmitAction({
        fuelings,
        prefix,
        vehicle: description,
        fuel,
        totalKmHr,
        totalLiters,
        totalValue,
        lastKm,
      });
    }
  };

  return (
    <Grid container spacing={2} sx={{ height: "100%" }}>
      <Grid size={4}>
        <DatePicker
          value={toDate(date)}
          onChange={(e) =>
            e ? setDate(startOfDay(e).toISOString()) : undefined
          }
          sx={{ width: 1 }}
          label="Data"
          format="dd/MM/yyyy"
          inputRef={dateInputRef}
          slotProps={{
            textField: { size: "small", onKeyDown: handleKeyDown },
          }}
        />
      </Grid>
      <Grid size={3}>
        <TextField
          size="small"
          fullWidth
          type="number"
          label="Qtd"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </Grid>
      <Grid size={3}>
        <TextField
          size="small"
          fullWidth
          type="number"
          label="Km/Hr."
          value={kmHr ?? ""}
          onChange={(e) =>
            setKmHr(e.target.value ? Number(e.target.value) : null)
          }
        />
      </Grid>
      <Grid size={2} justifyContent={"center"} alignItems={"center"}>
        <Button
          variant="outlined"
          onClick={handleAddFueling}
          disabled={!date || quantity <= 0 || !fuel || !description || !prefix}
        >
          +
        </Button>
      </Grid>
    </Grid>
  );
};
