"use client";

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
  useState,
} from "react";

const MaterialRequisitionFormContext = createContext<{
  selectedTabData: TabData | null;
  setSelectedTabData: (value: TabData | null) => void;
  selectedCar: CarEntry | null;
  setSelectedCar: (value: CarEntry | null) => void;
  vehicle: string;
  setVehicle: (value: string) => void;
  prefix: number;
  setPrefix: (value: number) => void;
  fuel: FuelType;
  setFuel: (value: FuelType) => void;
  date: Date;
  setDate: (value: Date) => void;
  quantity: number;
  setQuantity: (value: number) => void;
  kmHr: number | null;
  setKmHr: (value: number | null) => void;
  fuelings: FuelingData[];
  setFuelings: (value: FuelingData[]) => void;
  hasUnsavedChanges: boolean;
} | null>(null);

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
    selectedCar?.fuelings[0]?.date ?? new Date(),
  );
  const [quantity, _setQuantity] = useState(0);
  const [kmHr, _setKmHr] = useState<number | null>(null);
  const [fuelings, _setFuelings] = useState<FuelingData[]>(
    selectedCar?.fuelings ?? [],
  );
  const [hasUnsavedChanges, _setHasUnsavedChanges] = useState(false);

  const setSelectedCar = useCallback((car: CarEntry | null) => {
    _setSelectedCar(car);
    _setVehicle(car?.vehicle ?? "");
    _setPrefix(car?.prefix ?? 0);
    _setFuel(car?.fuel ?? "gas");
    _setDate(new Date());
    _setQuantity(0);
    _setKmHr(null);
    _setFuelings(car?.fuelings ?? []);
  }, []);
  const setVehicle = useCallback((vehicle: string) => _setVehicle(vehicle), []);
  const setPrefix = useCallback((prefix: number) => _setPrefix(prefix), []);
  const setFuel = useCallback((fuel: FuelType) => _setFuel(fuel), []);
  const setDate = useCallback((date: Date) => _setDate(date), []);
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
      }}
    >
      {children}
    </MaterialRequisitionFormContext.Provider>
  );
};
