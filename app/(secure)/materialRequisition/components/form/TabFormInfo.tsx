"use client";

import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useEffect } from "react";
import { useMaterialRequisitionForm } from "@/context/MaterialRequisitionFormContext";
import { isEmpty } from "ramda";
import type { KeyboardEvent } from "react";
import type { FuelDTO } from "@/dto/FuelDTO";
import { capitalizeFirstLetter } from "@/app/utils";

export const TabFormInfo = ({
  prefixExists,
  fuels,
}: {
  prefixExists: boolean;
  fuels: FuelDTO[];
}) => {
  const {
    selectedCar,
    setSelectedCar,
    selectedDepartment,
    vehicleForm,
    setVehicleForm,
    dateInputRef,
    vehicleEquipInputRef,
  } = useMaterialRequisitionForm();

  useEffect(() => {
    vehicleEquipInputRef?.current?.focus();
    setVehicleForm({
      ...vehicleForm,
      fuel: selectedCar?.fuel ?? fuels?.[0] ?? "",
    });
  }, []);

  // Enter in prefix field if prefix exists to edit existent
  const handleKeyDownInPrefixField = (e: KeyboardEvent<HTMLDivElement>) => {
    if (
      e.key === "Enter" &&
      prefixExists &&
      !isEmpty(selectedDepartment?.vehicles)
    ) {
      e.preventDefault();
      const carToSelect = selectedDepartment?.vehicles?.find(
        (car) => car.prefix === vehicleForm.prefix,
      );

      setSelectedCar(carToSelect ?? null);
      dateInputRef?.current?.focus();
    } else if (e.key === "Enter" && !prefixExists) setSelectedCar(null);
  };

  const sortedFuels = fuels.sort((a, b) => b.name.localeCompare(a.name));

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextField
          size="small"
          label="Veículo/Equip."
          value={vehicleForm.description}
          onChange={(e) =>
            setVehicleForm({ ...vehicleForm, description: e.target.value })
          }
          inputRef={vehicleEquipInputRef}
          autoFocus
          fullWidth
        />
      </Grid>

      <Grid size={6}>
        <TextField
          size="small"
          label="Prefix/BP"
          value={vehicleForm.prefix}
          type="number"
          onChange={(e) =>
            setVehicleForm({ ...vehicleForm, prefix: Number(e.target.value) })
          }
          onKeyDown={handleKeyDownInPrefixField}
          fullWidth
          helperText={
            prefixExists ? `Prefixo ${vehicleForm.prefix} já foi criado.` : ""
          }
          error={prefixExists}
        />
      </Grid>

      <Grid size={6}>
        <FormControl fullWidth>
          <InputLabel>Combustível</InputLabel>
          <Select
            size="small"
            name="fuelType"
            value={(vehicleForm.fuel as FuelDTO)?._id ?? ""}
            label="Combustível"
            onChange={(e) => {
              const fuel = fuels.find((f) => f._id === e.target.value);
              setVehicleForm({ ...vehicleForm, fuel: fuel ?? "" });
            }}
          >
            <MenuItem value={""} key={"empty"}>
              Escolha um combustível
            </MenuItem>
            {sortedFuels.map(({ name, _id }) => (
              <MenuItem value={_id} key={_id}>
                {capitalizeFirstLetter(name)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};
