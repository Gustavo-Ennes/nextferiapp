"use client";

import { useState } from "react";
import { Box, Divider, Grid, Tab as MuiTab, Tabs } from "@mui/material";
import { LocalGasStation, Description } from "@mui/icons-material";
import { CardsGrid } from "./CardGrid";
import { TabForm } from "./TabForm";
import { useFuelingBatchForm } from "@/context/FuelingBatchFormContext";
import { clone } from "ramda";
import type { FuelingBatchTabProps } from "../../types";
import type {
  DepartmentDTO,
  FuelingBatchDTODepartment,
  FuelingBatchDTOInvoice,
  FuelingBatchDTOVehicle,
} from "@/dto";
import { TabPanel } from "./TabPanel";
import { FuelingBatchFormInvoices } from "./TabFormInvoices";
import { getInvoicesTotalFuels } from "../../utils";
import { useDialog } from "@/context/DialogContext";
import { getFuelInventory } from "@/lib/repository/fuelingBatch/utils";

export const Tab = ({
  fuelingBatchDepartment,
  onDataChangeAction,
  fuels,
  purchaseOrders,
  fuelingBatchInvoices,
}: FuelingBatchTabProps) => {
  const { openConfirmationDialog } = useDialog();
  const [innerTabValue, setInnerTabValue] = useState(
    `${(fuelingBatchDepartment?.department as DepartmentDTO)?._id}-invoices`,
  );
  const { selectedCar, setSelectedCar, vehicleEquipInputRef, dateInputRef } =
    useFuelingBatchForm();

  const submitData = async (vehicle: FuelingBatchDTOVehicle) => {
    const isEditing = !!selectedCar;
    const updatedFuelingBatchDepartment: FuelingBatchDTODepartment = clone(
      fuelingBatchDepartment,
    );
    const vehiclesExceptVehicleToEdit =
      fuelingBatchDepartment?.vehicles?.filter(
        (otherVehicle) => otherVehicle.prefix !== selectedCar?.prefix,
      ) ?? [];

    // I delete one vehicle's fuelings
    if (isEditing && vehicle?.fuelings?.length === 0) {
      updatedFuelingBatchDepartment.vehicles = vehiclesExceptVehicleToEdit;
      // vehicle has fuelings
    } else if (isEditing) {
      updatedFuelingBatchDepartment.vehicles = [
        ...vehiclesExceptVehicleToEdit,
        vehicle,
      ];
      // creating a vehicle
    } else {
      updatedFuelingBatchDepartment.vehicles = [
        ...(fuelingBatchDepartment?.vehicles ?? []),
        vehicle,
      ];
    }

    onDataChangeAction(updatedFuelingBatchDepartment).then(() =>
      vehicleEquipInputRef?.current?.focus(),
    );
  };

  const removeCar = (prefixToDelete: number) => {
    onDataChangeAction({
      ...fuelingBatchDepartment,
      vehicles:
        fuelingBatchDepartment?.vehicles?.filter(
          ({ prefix }) => prefix !== prefixToDelete,
        ) ?? [],
    }).then(() => vehicleEquipInputRef?.current?.focus());
  };

  const editCar = (vehicle: FuelingBatchDTOVehicle) => {
    setSelectedCar(selectedCar?.prefix === vehicle.prefix ? null : vehicle);
    dateInputRef?.current?.focus();
  };

  const onAddInvoice = (invoice: FuelingBatchDTOInvoice) => {
    onDataChangeAction({
      ...fuelingBatchDepartment,
      invoices: [...(fuelingBatchDepartment?.invoices ?? []), invoice],
    });
  };

  const onRemoveInvoice = (invoiceNumber: number) => {
    const newInvoices = fuelingBatchDepartment.invoices.filter(
      (i) => i.number !== invoiceNumber,
    );

    const fuelInventory = getFuelInventory({
      departmentTotalFuels: fuelingBatchDepartment.totals.totalFuels,
      invoiceTotalFuels: getInvoicesTotalFuels(newInvoices, fuels),
    });
    const fuelMessages = Object.entries(fuelInventory.messages ?? {}).map(
      (e) => e[1],
    );

    if (fuelMessages.length > 0) {
      const description = `Fique atento: ${fuelMessages.join(", ")}. `;

      openConfirmationDialog({
        onConfirmAction: () =>
          onDataChangeAction({
            ...fuelingBatchDepartment,
            invoices: newInvoices,
          }),
        title: `Tem certeza sobre excluir a nota ${invoiceNumber}?`,
        confirmLabel: "Tenho certeza",
        cancelLabel: "Voltar",
        description,
        role: "alertDialog",
      });
    } else {
      onDataChangeAction({
        ...fuelingBatchDepartment,
        invoices: newInvoices,
      });
    }
  };

  const innerTabs = [
    { label: "Formulário", name: "form" },
    { label: "Notas fiscais", name: "invoices" },
  ];

  return (
    fuelingBatchDepartment && (
      <Grid container alignItems="flex-start" spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Tabs
            value={innerTabValue || false}
            onChange={(_, innerTabValue: string) => {
              return setInnerTabValue(innerTabValue);
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            {innerTabs.map((innerTab) => {
              const shouldDisableForm =
                innerTab.name === innerTabs[0].name &&
                fuelingBatchDepartment.invoices.length === 0;
              return (
                <MuiTab
                  key={`${(fuelingBatchDepartment?.department as DepartmentDTO)._id}-${innerTab.name}-tab`}
                  value={`${(fuelingBatchDepartment?.department as DepartmentDTO)._id}-${innerTab.name}`}
                  label={innerTab.label}
                  sx={{ fontSize: 12, zIndex: 1 }}
                  disabled={shouldDisableForm}
                  icon={
                    innerTab.name === innerTabs[0].name ? (
                      <LocalGasStation />
                    ) : (
                      <Description />
                    )
                  }
                  iconPosition="end"
                />
              );
            })}
          </Tabs>
        </Grid>
        <Grid size={{ xs: 12 }} pt={0}>
          {innerTabs.map((innerTab) => (
            <TabPanel
              key={`${(fuelingBatchDepartment?.department as DepartmentDTO)._id}-${innerTab.name}-content`}
              value={innerTabValue}
              index={`${(fuelingBatchDepartment?.department as DepartmentDTO)._id}-${innerTab.name}`}
            >
              {innerTab.name === innerTabs[0].name ? (
                <Box>
                  <TabForm
                    onSubmitAction={submitData}
                    fuelingBatchDepartment={fuelingBatchDepartment}
                    fuels={fuels}
                  />
                  <Divider sx={{ my: 2 }} />
                  <CardsGrid
                    fuelingBatchDepartment={fuelingBatchDepartment}
                    onRemoveAction={removeCar}
                    onEditAction={editCar}
                  />
                </Box>
              ) : (
                <Box>
                  <FuelingBatchFormInvoices
                    fuelingBatchDepartment={fuelingBatchDepartment}
                    fuelingBatchInvoices={fuelingBatchInvoices}
                    purchaseOrders={purchaseOrders}
                    onAddInvoiceAction={(invoice) => onAddInvoice(invoice)}
                    onRemoveInvoiceAction={(number) => onRemoveInvoice(number)}
                    fuels={fuels}
                  />
                </Box>
              )}
            </TabPanel>
          ))}
        </Grid>
      </Grid>
    )
  );
};
