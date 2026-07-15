"use client";

import { Box, Divider } from "@mui/material";
import { CardsGrid } from "./CardGrid";
import { TabForm } from "./TabForm";
import { useMaterialRequisitionForm } from "@/context/MaterialRequisitionFormContext";
import type {
  WeeklyFuellingSummaryDepartment,
  WeeklyFuellingSummaryVehicle,
} from "@/dto/WeeklyFuellingSummaryDTO";
import { clone } from "ramda";
import type { MaterialRequisitionTabProps } from "../../types";

export const Tab = ({
  summaryDepartment,
  onDataChangeAction,
  fuels,
}: MaterialRequisitionTabProps) => {
  const { selectedCar, setSelectedCar, vehicleEquipInputRef, dateInputRef } =
    useMaterialRequisitionForm();

  const submitData = async (vehicle: WeeklyFuellingSummaryVehicle) => {
    const isEditing = !!selectedCar;
    const updatedSummaryDepartment: WeeklyFuellingSummaryDepartment =
      clone(summaryDepartment);
    const vehiclesExceptVehicleToEdit =
      summaryDepartment?.vehicles?.filter(
        (otherVehicle) => otherVehicle.prefix !== selectedCar?.prefix,
      ) ?? [];

    // I delete one vehicle's fuelings
    if (isEditing && vehicle?.fuelings?.length === 0) {
      updatedSummaryDepartment.vehicles = vehiclesExceptVehicleToEdit;
      // vehicle has fuelings
    } else if (isEditing) {
      updatedSummaryDepartment.vehicles = [
        ...vehiclesExceptVehicleToEdit,
        vehicle,
      ];
      // creating a vehicle
    } else {
      updatedSummaryDepartment.vehicles = [
        ...(summaryDepartment?.vehicles ?? []),
        vehicle,
      ];
    }

    onDataChangeAction(updatedSummaryDepartment).then(() =>
      vehicleEquipInputRef?.current?.focus(),
    );
  };

  const removeCar = (prefixToDelete: number) => {
    onDataChangeAction({
      ...summaryDepartment,
      vehicles:
        summaryDepartment?.vehicles?.filter(
          ({ prefix }) => prefix !== prefixToDelete,
        ) ?? [],
    }).then(() => vehicleEquipInputRef?.current?.focus());
  };

  const editCar = (vehicle: WeeklyFuellingSummaryVehicle) => {
    setSelectedCar(selectedCar?.prefix === vehicle.prefix ? null : vehicle);
    dateInputRef?.current?.focus();
  };

  return (
    summaryDepartment && (
      <Box>
        <TabForm
          onSubmitAction={submitData}
          summaryDepartment={summaryDepartment}
          fuels={fuels}
        />
        <Divider sx={{ my: 2 }} />
        <CardsGrid
          summaryDepartment={summaryDepartment}
          onRemoveAction={removeCar}
          onEditAction={editCar}
          fuels={fuels}
        />
      </Box>
    )
  );
};
