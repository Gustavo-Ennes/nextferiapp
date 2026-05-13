"use client";

import { Box, Divider } from "@mui/material";
import { CardsGrid } from "./CardGrid";
import type {
  CarEntry,
  TabData,
} from "@/lib/repository/weeklyFuellingSummary/types";
import { TabForm } from "./TabForm";
import { useMaterialRequisitionForm } from "@/context/MaterialRequisitionFormContext";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { WeeklyFuellingSummaryDTO } from "@/dto/WeeklyFuellingSummaryDTO";

export const Tab = ({
  data: tabData,
  onDataChange,
  fuels,
  weeklyFuelingSummary,
}: {
  data: TabData;
  onDataChange: (updatedTabData: TabData) => void;
  fuels: FuelDTO[];
  weeklyFuelingSummary: WeeklyFuellingSummaryDTO | null;
}) => {
  const { selectedCar, setSelectedCar, vehicleEquipInputRef, dateInputRef } =
    useMaterialRequisitionForm();

  const submitData = (car: CarEntry) => {
    const isEditing = !!selectedCar;
    const populatedCar = {
      ...car,
      fuel: fuels.find((f) => f._id === car.fuel) ?? car.fuel,
    };
    const updatedTabData: TabData = { ...tabData };
    const carsExceptCarToEdit =
      tabData?.carEntries?.filter(
        (otherCar) => otherCar.prefix !== selectedCar?.prefix,
      ) ?? [];

    // I delete one car's fuelings
    if (isEditing && !car.fuelings.length) {
      updatedTabData.carEntries = carsExceptCarToEdit;
      // car has fuelings
    } else if (isEditing) {
      updatedTabData.carEntries = [...carsExceptCarToEdit, populatedCar];
      // creating a car
    } else
      updatedTabData.carEntries = [
        ...(tabData?.carEntries ?? []),
        populatedCar,
      ];

    onDataChange(updatedTabData);
    vehicleEquipInputRef?.current?.focus();
  };

  const removeCar = (prefixToDelete: number) => {
    onDataChange({
      ...tabData,
      carEntries:
        tabData?.carEntries?.filter(
          ({ prefix }) => prefix !== prefixToDelete,
        ) ?? [],
    });
    vehicleEquipInputRef?.current?.focus();
  };

  const editCar = (car: CarEntry) => {
    const unpopulatedCar = { ...car, fuel: (car.fuel as FuelDTO)?._id };
    setSelectedCar(selectedCar?.prefix === car.prefix ? null : unpopulatedCar);
    dateInputRef?.current?.focus();
  };

  return (
    tabData && (
      <Box>
        <TabForm onSubmit={submitData} tabData={tabData} fuels={fuels} />
        <Divider sx={{ my: 2 }} />
        <CardsGrid
          tabData={tabData}
          onRemove={removeCar}
          onEdit={editCar}
          weeklyFuelingSummary={weeklyFuelingSummary}
        />
      </Box>
    )
  );
};
