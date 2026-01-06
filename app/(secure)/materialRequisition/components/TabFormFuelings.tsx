"use client";

import { Grid, TextField, Button } from "@mui/material";
import { type SetStateAction, useRef } from "react";
import { FuelingFormList } from "./FuelingFormList";
import type { FuelingData } from "../../../../lib/repository/weeklyFuellingSummary/types";
import { DatePicker } from "@mui/x-date-pickers";
import { startOfDay } from "date-fns";

export const TabFormFuelings = ({
  date,
  quantity,
  kmHr,
  setDate,
  setQuantity,
  setKmHr,
  addFueling,
  removeFueling,
  fuelings,
}: {
  date: Date;
  quantity: number;
  kmHr?: number;
  setDate: (value: SetStateAction<Date>) => void;
  setQuantity: (value: SetStateAction<number>) => void;
  setKmHr: (value: SetStateAction<number | undefined>) => void;
  removeFueling: (idx: number) => void;
  addFueling: () => void;
  fuelings: FuelingData[];
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleAddFueling = () => {
    addFueling();
    dateInputRef?.current?.focus();
  };

  return (
    <Grid container spacing={2} sx={{ height: "100%" }}>
      <Grid size={4}>
        <DatePicker
          value={date}
          onChange={(e) => (e ? setDate(startOfDay(e)) : undefined)}
          sx={{ width: 1 }}
          label="Data"
          format="dd/MM/yyyy"
          inputRef={dateInputRef}
          slotProps={{
            textField: { size: "small" },
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
            setKmHr(e.target.value ? Number(e.target.value) : undefined)
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

      <Grid size={12}>
        <FuelingFormList fuelings={fuelings} onRemove={removeFueling} />
      </Grid>
    </Grid>
  );
};
