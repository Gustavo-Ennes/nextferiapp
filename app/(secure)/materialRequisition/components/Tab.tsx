"use client";

import { Box, Divider } from "@mui/material";
import { CardsGrid } from "./CardGrid";
import type {
  CarEntry,
  TabData,
} from "../../../../lib/repository/weeklyFuellingSummary/types";
import { TabForm } from "./TabForm";
import { useMaterialRequisitionForm } from "@/context/MaterialRequisitionFormContext";

export const Tab = ({
  data: tabData,
  onDataChange,
}: {
  data: TabData;
  onDataChange: (updatedTabData: TabData) => void;
}) => {
  const { selectedCar, setSelectedCar, vehicleEquipInputRef, dateInputRef } =
    useMaterialRequisitionForm();

  const submitData = (car: CarEntry) => {
    const isEditing = !!selectedCar;
    const updatedTabData: TabData = tabData;
    const carsExceptCarToEdit =
      tabData?.carEntries?.filter(
        (otherCar) => otherCar.prefix !== selectedCar?.prefix,
      ) ?? [];

    // I delete one car's fuelings
    if (isEditing && !car.fuelings.length) {
      updatedTabData.carEntries = carsExceptCarToEdit;
      // car has fuelings
    } else if (isEditing) {
      updatedTabData.carEntries = [...carsExceptCarToEdit, car];
      // creating a car
    } else updatedTabData.carEntries = [...(tabData?.carEntries ?? []), car];

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
    setSelectedCar(selectedCar?.prefix === car.prefix ? null : car);
    dateInputRef?.current?.focus();
  };

  return (
    tabData && (
      <Box>
        <TabForm onSubmit={submitData} tabData={tabData} />
        <Divider sx={{ my: 2 }} />
        <CardsGrid tabData={tabData} onRemove={removeCar} onEdit={editCar} />
      </Box>
    )
  );
};
