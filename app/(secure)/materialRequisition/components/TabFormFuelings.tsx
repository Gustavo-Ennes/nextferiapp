"use client";

import { Grid, TextField, Button } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { startOfDay, toDate } from "date-fns";
import { useMaterialRequisitionForm } from "@/context/MaterialRequisitionFormContext";
import type { CarEntry } from "@/lib/repository/weeklyFuellingSummary/types";
import type { KeyboardEvent } from "react";
import { sortCarFuelings } from "../utils";

export const TabFormFuelings = ({
  onSubmit,
}: {
  onSubmit: (car: CarEntry) => void;
}) => {
  const {
    fuelings,
    setFuelings,
    date,
    quantity,
    kmHr,
    setDate,
    setQuantity,
    setKmHr,
    vehicle,
    prefix,
    fuel,
    setSelectedCar,
    dateInputRef,
  } = useMaterialRequisitionForm();

  const addFueling = () => {
    if (date && quantity > 0) {
      setFuelings(sortCarFuelings([...fuelings, { date, quantity, kmHr }]));
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
      vehicle &&
      prefix &&
      fuelings.length > 0
    ) {
      e.preventDefault();
      onSubmit({ vehicle, prefix, fuel, fuelings });
      setSelectedCar(null);
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
          disabled={!date || quantity <= 0}
        >
          +
        </Button>
      </Grid>
    </Grid>
  );
};
