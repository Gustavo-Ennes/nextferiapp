"use client";

import { sortCarFuelings } from "@/app/(secure)/materialRequisition/utils";
import type {
  CarEntry,
  FuelingData,
  FuelType,
  TabData,
} from "@/lib/repository/weeklyFuellingSummary/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { MaterialRequisitionFormContextValues } from "./types";

const MaterialRequisitionFormContext =
  createContext<MaterialRequisitionFormContextValues | null>(null);

export const useMaterialRequisitionForm = () => {
  const ctx = useContext(MaterialRequisitionFormContext);
  if (!ctx)
    throw new Error(
      "MaterialRequisitionFormContext must be used inside MateirialRequisitionFormProvider",
    );
  return ctx;
};

export const MaterialRequisitionFormProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedTabData, _setSelectedTabData] = useState<TabData | null>(null);
  const [selectedCar, _setSelectedCar] = useState<CarEntry | null>(null);
  const [vehicle, _setVehicle] = useState(selectedCar?.vehicle ?? "");
  const [prefix, _setPrefix] = useState(selectedCar?.prefix ?? 0);
  const [fuel, _setFuel] = useState<FuelType>(selectedCar?.fuel ?? "gas");
  const [date, _setDate] = useState(
    selectedCar?.fuelings[0]?.date ?? new Date().toISOString(),
  );
  const [quantity, _setQuantity] = useState(0);
  const [kmHr, _setKmHr] = useState<number | null>(null);
  const [fuelings, _setFuelings] = useState<FuelingData[]>(
    selectedCar?.fuelings ?? [],
  );
  const [hasUnsavedChanges, _setHasUnsavedChanges] = useState(false);

  const vehicleEquipInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const setSelectedCar = useCallback((car: CarEntry | null) => {
    _setSelectedCar(car);
    _setVehicle(car?.vehicle ?? "");
    _setPrefix(car?.prefix ?? 0);
    _setFuel(car?.fuel ?? "gas");
    _setDate(new Date().toISOString());
    _setQuantity(0);
    _setKmHr(null);
    _setFuelings(sortCarFuelings([...(car?.fuelings ?? [])]));
  }, []);
  const setVehicle = useCallback((vehicle: string) => _setVehicle(vehicle), []);
  const setPrefix = useCallback((prefix: number) => _setPrefix(prefix), []);
  const setFuel = useCallback((fuel: FuelType) => _setFuel(fuel), []);
  const setDate = useCallback((isoString: string) => _setDate(isoString), []);
  const setQuantity = useCallback(
    (quantity: number) => _setQuantity(quantity),
    [],
  );
  const setKmHr = useCallback((KmHr: number | null) => _setKmHr(KmHr), []);
  const setFuelings = useCallback(
    (fuelings: FuelingData[]) => _setFuelings(fuelings),
    [],
  );
  const setSelectedTabData = useCallback(
    (tabData: TabData | null) => _setSelectedTabData(tabData),
    [],
  );

  useEffect(() => {
    const vehicleHasChanged = selectedCar
      ? vehicle !== selectedCar.vehicle
      : vehicle !== "";
    const prefixHasChanged = selectedCar
      ? prefix !== selectedCar.prefix
      : prefix !== 0;
    const fuelHasChanged = selectedCar
      ? fuel !== selectedCar.fuel
      : fuel !== "gas";

    _setHasUnsavedChanges(
      vehicleHasChanged || prefixHasChanged || fuelHasChanged,
    );
  }, [prefix, vehicle, fuel]);

  return (
    <MaterialRequisitionFormContext.Provider
      value={{
        selectedTabData,
        setSelectedTabData,
        selectedCar,
        setSelectedCar,
        vehicle,
        setVehicle,
        prefix,
        setPrefix,
        fuel,
        setFuel,
        date,
        setDate,
        quantity,
        setQuantity,
        kmHr,
        setKmHr,
        fuelings,
        setFuelings,
        hasUnsavedChanges,
        vehicleEquipInputRef,
        dateInputRef,
      }}
    >
      {children}
    </MaterialRequisitionFormContext.Provider>
  );
};
