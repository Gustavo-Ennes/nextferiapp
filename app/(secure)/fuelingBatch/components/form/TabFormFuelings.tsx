"use client";

import { Grid, TextField, Button, Tooltip } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { startOfDay, toDate } from "date-fns";
import { useFuelingBatchForm } from "@/context/FuelingBatchFormContext";
import type { KeyboardEvent } from "react";
import { checkInvoiceFuelQuantity, sortVehicleFuelings } from "../../utils";
import type { FuelDTO, FuelingBatchDTOVehicle } from "@/dto";
import type { TotalFuels } from "@/models/types";
import { sum } from "ramda";

export const TabFormFuelings = ({
  onSubmitAction,
  invoicesTotalFuels,
}: {
  onSubmitAction: (vehicle: FuelingBatchDTOVehicle) => void;
  invoicesTotalFuels: TotalFuels;
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
    totalKmHrs,
    totalLiters,
    totalValue,
    lastKm,
  } = useFuelingBatchForm();

  const quantityFitsInvoice = checkInvoiceFuelQuantity({
    totalFuels: invoicesTotalFuels,
    fuelName: (fuel as FuelDTO)?.name,
    quantity: quantity + sum(fuelings.map((f) => f.quantity)),
  });
  const canAddFueling =
    !!date &&
    quantity > 0 &&
    !!fuel &&
    !!description &&
    !!prefix &&
    quantityFitsInvoice;
  const submitTooltipMessage = !description
    ? "Descrição inválida"
    : !prefix
      ? "Prefixo inválido"
      : !fuel
        ? "Combustível inválido"
        : !date
          ? "Data inválida"
          : !quantity
            ? "Quantidade inválida"
            : !quantityFitsInvoice
              ? "Quantidade excede o total de combustíveis das notas fiscais"
              : "";

  const addFueling = () => {
    if (date && quantity > 0) {
      setVehicleForm({
        description,
        prefix,
        fuel,
        fuelings: sortVehicleFuelings([
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
        totals: {
          totalLiters,
          totalValue,
          totalKmHrs,
        },
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
        {!canAddFueling ? (
          <Tooltip
            title={submitTooltipMessage}
            placement="top"
            arrow
            color="secondary"
          >
            <Button variant="outlined">+</Button>
          </Tooltip>
        ) : (
          <Button
            variant="outlined"
            onClick={handleAddFueling}
            disabled={false}
          >
            +
          </Button>
        )}
      </Grid>
    </Grid>
  );
};
