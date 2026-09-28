"use client";

import { sortCarFuelings } from "@/lib/repository/fuelingBatch/utils";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { FuelingBatchFormContextValues, VehicleForm } from "./types";
import type {
  FuelDTO,
  FuelingBatchDTODepartment,
  FuelingBatchDTOVehicle,
  FuelPriceVersionDTO,
} from "@/dto";
import { isNil, reject } from "ramda";

const FuelingBatchFormContext =
  createContext<FuelingBatchFormContextValues | null>(null);
// modificar para fuelingBatch, retornar para form
export const useFuelingBatchForm = () => {
  const ctx = useContext(FuelingBatchFormContext);
  if (!ctx)
    throw new Error(
      "FuelingBatchFormContext must be used inside FuelingBatchFormProvider",
    );
  return ctx;
};

export const FuelingBatchFormProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedDepartment, _setSelectedDepartment] =
    useState<FuelingBatchDTODepartment | null>(null);
  const [selectedCar, _setSelectedCar] =
    useState<FuelingBatchDTOVehicle | null>(null);
  const [vehicleForm, _setVehicleForm] = useState<VehicleForm>({
    description: selectedCar?.vehicle ?? "",
    prefix: selectedCar?.prefix ?? 0,
    fuel: (selectedCar?.fuel as FuelDTO) ?? "",
    fuelings: selectedCar?.fuelings ?? [],
  });
  const [date, _setDate] = useState(
    selectedCar?.fuelings?.[0]?.date ?? new Date().toISOString(),
  );
  const [quantity, _setQuantity] = useState(0);
  const [kmHr, _setKmHr] = useState<number | null>(null);
  const [hasUnsavedChanges, _setHasUnsavedChanges] = useState(false);
  const [totalLiters, _setTotalLiters] = useState(0);
  const [totalValue, _setTotalValue] = useState(0);
  const [totalKmHrs, _setTotalKmHrs] = useState(0);
  const [lastKm, _setLastKm] = useState<number | null>(null);

  const vehicleEquipInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const setSelectedCar = useCallback((car: FuelingBatchDTOVehicle | null) => {
    _setSelectedCar(car);
    _setVehicleForm({
      description: car?.vehicle ?? "",
      prefix: car?.prefix ?? 0,
      fuel: (car?.fuel as FuelDTO) ?? null,
      fuelings: sortCarFuelings([...(car?.fuelings ?? [])]),
    });

    _setDate(new Date().toISOString());
    _setQuantity(0);
    _setKmHr(null);
  }, []);
  const setVehicleForm = useCallback((vehicleForm: VehicleForm) => {
    _setVehicleForm(vehicleForm);
  }, []);
  const setDate = useCallback((isoString: string) => _setDate(isoString), []);
  const setQuantity = useCallback(
    (quantity: number) => _setQuantity(quantity),
    [],
  );
  const setKmHr = useCallback((KmHr: number | null) => _setKmHr(KmHr), []);
  const setSelectedDepartment = useCallback(
    (department: FuelingBatchDTODepartment | null) =>
      _setSelectedDepartment(department),
    [],
  );

  useEffect(() => {
    const newTotalLiters = vehicleForm.fuelings.reduce(
      (acc, fueling) => acc + fueling.quantity,
      0,
    );
    const pricePerLiter =
      (
        (vehicleForm.fuel as FuelDTO)
          ?.currentPriceVersion as FuelPriceVersionDTO
      )?.price ?? 0;
    const newTotalValue = vehicleForm.fuelings.reduce(
      (acc, fueling) => acc + fueling.quantity * pricePerLiter,
      0,
    );
    const kmHrs = reject(
      isNil,
      vehicleForm.fuelings.map((f) => f.kmHr),
    );
    const minKmHr = kmHrs.length > 0 ? Math.min(...kmHrs) : null;
    const maxKmHr = kmHrs.length > 0 ? Math.max(...kmHrs) : null;
    const totalKmHrs =
      minKmHr !== null && maxKmHr !== null ? maxKmHr - minKmHr : 0;

    _setTotalLiters(newTotalLiters);
    _setTotalValue(newTotalValue);
    _setTotalKmHrs(totalKmHrs);
    _setLastKm(maxKmHr);
  }, [vehicleForm.fuelings]);

  useEffect(() => {
    const vehicleHasChanged = selectedCar
      ? vehicleForm.description !== selectedCar.vehicle
      : vehicleForm.description !== "";
    const prefixHasChanged = selectedCar
      ? vehicleForm.prefix !== selectedCar.prefix
      : vehicleForm.prefix !== 0;
    const fuelHasChanged = selectedCar
      ? vehicleForm.fuel !== selectedCar.fuel
      : vehicleForm.fuel !== undefined;

    _setHasUnsavedChanges(
      vehicleHasChanged || prefixHasChanged || fuelHasChanged,
    );
  }, [vehicleForm]);

  return (
    <FuelingBatchFormContext.Provider
      value={{
        selectedDepartment,
        setSelectedDepartment,
        selectedCar,
        setSelectedCar,
        vehicleForm,
        setVehicleForm,
        date,
        setDate,
        quantity,
        setQuantity,
        kmHr,
        setKmHr,
        hasUnsavedChanges,
        vehicleEquipInputRef,
        dateInputRef,
        totalLiters,
        totalValue,
        totalKmHrs,
        lastKm,
      }}
    >
      {children}
    </FuelingBatchFormContext.Provider>
  );
};
