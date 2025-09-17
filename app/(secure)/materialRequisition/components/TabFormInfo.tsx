import { translateEntityKey } from "@/app/translate";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { fuelList } from "../utils";
import type { FuelType } from "../types";
import type { SetStateAction, RefObject } from "react";

export const TabFormInfo = ({
  vehicle,
  prefix,
  fuel,
  setVehicle,
  setPrefix,
  setFuel,
  vechicleEquipInputRef,
}: {
  vehicle: string;
  prefix: number;
  fuel: FuelType;
  setVehicle: (value: SetStateAction<string>) => void;
  setPrefix: (value: SetStateAction<number>) => void;
  setFuel: (value: SetStateAction<FuelType>) => void;
  vechicleEquipInputRef: RefObject<HTMLInputElement | null>;
}) => {
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextField
          size="small"
          label="Veículo/Equip."
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
          inputRef={vechicleEquipInputRef}
          autoFocus
          fullWidth
        />
      </Grid>

      <Grid size={6}>
        <TextField
          size="small"
          label="Prefix/BP"
          value={prefix}
          type="number"
          onChange={(e) => setPrefix(parseInt(e.target.value))}
          fullWidth
        />
      </Grid>

      <Grid size={6}>
        <FormControl fullWidth>
          <InputLabel>Combustível</InputLabel>
          <Select
            size="small"
            name="fuelType"
            value={fuel}
            label="Combustível"
            onChange={(e) => setFuel(e.target.value)}
          >
            {fuelList.map((fuel) => (
              <MenuItem value={fuel} key={fuel}>
                {translateEntityKey({ entity: "fuel", key: fuel })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};
