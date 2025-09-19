"use client";

import { Button, Box, Grid, Divider } from "@mui/material";
import { useEffect, useState, useRef } from "react";
import type { CarEntry, FuelingData, FuelType, TabData } from "../types";
import { TabFormInfo } from "./TabFormInfo";
import { TabFormFuelings } from "./TabFormFuelings";
import { prefixExistsInTabData } from "../utils";

export const TabForm = ({
  onSubmit,
  selectedCarEntry,
  tabData,
}: {
  onSubmit: (car: CarEntry) => void;
  selectedCarEntry?: CarEntry;
  tabData: TabData;
}) => {
  const [vehicle, setVehicle] = useState(selectedCarEntry?.vehicle ?? "");
  const [prefix, setPrefix] = useState(selectedCarEntry?.prefix ?? 0);
  const [fuel, setFuel] = useState<FuelType>(selectedCarEntry?.fuel ?? "gas");
  const [date, setDate] = useState(
    selectedCarEntry?.fuelings[0]?.date ?? new Date()
  );
  const [quantity, setQuantity] = useState(0);
  const [kmHr, setKmHr] = useState<number>();
  const [fuelings, setFuelings] = useState<FuelingData[]>(
    selectedCarEntry?.fuelings ?? []
  );
  const vechicleEquipInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setVehicle(selectedCarEntry?.vehicle ?? "");
    setPrefix(selectedCarEntry?.prefix ?? 0);
    setDate(new Date());
    setQuantity(0);
    setKmHr(undefined);
    setFuelings(selectedCarEntry?.fuelings ?? []);
    setFuel(selectedCarEntry?.fuel ?? "gas");
  }, [selectedCarEntry]);

  const addFueling = () => {
    if (date && quantity > 0) {
      setFuelings((prev) => [
        ...prev,
        { date, quantity, kmHr, id: prev.length },
      ]);
      setDate(new Date());
      setQuantity(0);
    }
  };

  const removeFueling = (idx: number) => {
    setFuelings((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (vehicle && prefix) {
      onSubmit({ vehicle, prefix, fuelings, fuel });
      setVehicle("");
      setPrefix(0);
      setFuelings([]);
      setFuel("gas");
      setKmHr(undefined);
      vechicleEquipInputRef?.current?.focus();
    }
  };

  const buttonLabel = !selectedCarEntry
    ? "Criar"
    : fuelings.length
    ? "Atualizar"
    : "Remover";

  const isSelectedCarEditing = () => {
    return (
      vehicle !== selectedCarEntry?.vehicle ||
      prefix !== selectedCarEntry?.prefix ||
      fuel !== selectedCarEntry.fuel ||
      fuelings !== selectedCarEntry.fuelings
    );
  };

  const prefixExists = prefixExistsInTabData({ prefix, tabData });

  return (
    <Grid container component={Box} spacing={2} alignContent="start">
      <Grid size={12}>
        <TabFormInfo
          fuel={fuel}
          prefix={prefix}
          vehicle={vehicle}
          setFuel={setFuel}
          setPrefix={setPrefix}
          setVehicle={setVehicle}
          vechicleEquipInputRef={vechicleEquipInputRef}
          prefixExists={prefixExists}
        />
      </Grid>
      <Grid size={12} component={Divider} />
      <Grid component={Box} size={12}>
        <TabFormFuelings
          date={date}
          quantity={quantity}
          kmHr={kmHr}
          setDate={setDate}
          setKmHr={setKmHr}
          setQuantity={setQuantity}
          addFueling={addFueling}
          removeFueling={removeFueling}
          fuelings={fuelings}
        />
      </Grid>

      <Grid size={12}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            !vehicle ||
            !prefix ||
            !isSelectedCarEditing() ||
            prefixExists ||
            !fuelings.length
          }
        >
          {buttonLabel}
        </Button>
      </Grid>
    </Grid>
  );
};
