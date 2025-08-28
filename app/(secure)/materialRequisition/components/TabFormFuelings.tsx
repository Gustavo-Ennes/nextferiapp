import { Grid, TextField, Button } from "@mui/material";
import type { SetStateAction } from "react";
import { FuelingFormList } from "./FuelingFormList";
import type { FuelingData } from "../types";

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
}) => (
  <Grid container spacing={2} sx={{ height: "100%" }}>
    <Grid size={4}>
      <TextField
        size="small"
        fullWidth
        type="date"
        value={date.toISOString().split("T")[0]}
        onChange={(e) => setDate(new Date(e.target.value))}
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
        onClick={addFueling}
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
