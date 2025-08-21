"use client";

import { Box, Divider } from "@mui/material";
import { CardsGrid } from "./CardGrid";
import { CarEntry, TabData } from "../types";
import { TabForm } from "./TabForm";
import { useState } from "react";

export const Tab = ({
  data: tabData,
  onDataChange,
}: {
  data: TabData;
  onDataChange: (updatedTabData: TabData) => void;
}) => {
  const [selectedCar, setSelectedCar] = useState<CarEntry>();

  const submitData = (car: CarEntry) => {
    const isEditing = !!selectedCar;
    const updatedTabData: TabData = tabData;
    const carsExceptCarToEdit =
      tabData?.carEntries?.filter(
        (otherCar) => otherCar.prefix !== car.prefix
      ) ?? [];

    // I delete one car's fuelings
    if (isEditing && !car.fuelings.length) {
      updatedTabData.carEntries = carsExceptCarToEdit;
      // car has fuelings
    } else if (isEditing) {
      updatedTabData.carEntries = [...carsExceptCarToEdit, car];
      // creating a car
    } else updatedTabData.carEntries = [...(tabData?.carEntries ?? []), car];

    setSelectedCar(undefined);
    onDataChange(updatedTabData);
  };

  const removeCar = (prefixToDelete: number) =>
    onDataChange({
      ...tabData,
      carEntries:
        tabData?.carEntries?.filter(
          ({ prefix }) => prefix !== prefixToDelete
        ) ?? [],
    });

  const editCar = (car: CarEntry) => {
    setSelectedCar(selectedCar?.prefix === car.prefix ? undefined : car);
  };

  return (
    tabData && (
      <Box>
        <TabForm onSubmit={submitData} selectedCarEntry={selectedCar} />
        <Divider sx={{ my: 2 }} />
        <CardsGrid
          tabData={tabData}
          onRemove={removeCar}
          onEdit={editCar}
          selectedCar={selectedCar}
        />
      </Box>
    )
  );
};
