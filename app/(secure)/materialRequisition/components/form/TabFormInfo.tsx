"use client";

import { translateEntityKey } from "@/app/translate";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { fuelList } from "../../utils";
import { useEffect } from "react";
import { useMaterialRequisitionForm } from "@/context/MaterialRequisitionFormContext";
import { isEmpty } from "ramda";
import type { KeyboardEvent } from "react";

export const TabFormInfo = ({ prefixExists }: { prefixExists: boolean }) => {
  const {
    setSelectedCar,
    selectedTabData,
    vehicle,
    prefix,
    fuel,
    setVehicle,
    setPrefix,
    setFuel,
    dateInputRef,
    vehicleEquipInputRef,
  } = useMaterialRequisitionForm();
  useEffect(() => {
    vehicleEquipInputRef?.current?.focus();
  }, []);

  // Enter in prefix field if prefix exists to edit existent
  const handleKeyDownInPrefixField = (e: KeyboardEvent<HTMLDivElement>) => {
    if (
      e.key === "Enter" &&
      prefixExists &&
      !isEmpty(selectedTabData?.carEntries)
    ) {
      e.preventDefault();
      const carToSelect = selectedTabData?.carEntries?.find(
        (car) => car.prefix === prefix,
      );
      setSelectedCar(carToSelect ?? null);
      dateInputRef?.current?.focus();
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextField
          size="small"
          label="Veículo/Equip."
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
          inputRef={vehicleEquipInputRef}
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
          onKeyDown={handleKeyDownInPrefixField}
          fullWidth
          helperText={prefixExists ? `Prefixo ${prefix} já foi criado.` : ""}
          error={prefixExists}
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
