"use client";

import { sortCarFuelings } from "@/app/(secure)/materialRequisition/utils";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  MaterialRequisitionFormContextValues,
  VehicleForm,
} from "./types";
import type {
  FuelDTO,
  WeeklyFuellingSummaryDepartment,
  WeeklyFuellingSummaryVehicle,
  FuelPriceVersionDTO,
} from "@/dto";
import { isNil, reject } from "ramda";

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
  const [selectedDepartment, _setSelectedDepartment] =
    useState<WeeklyFuellingSummaryDepartment | null>(null);
  const [selectedCar, _setSelectedCar] =
    useState<WeeklyFuellingSummaryVehicle | null>(null);
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
  const [totalKmHr, _setTotalKmHr] = useState(0);
  const [lastKm, _setLastKm] = useState<number | null>(null);

  const vehicleEquipInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const setSelectedCar = useCallback(
    (car: WeeklyFuellingSummaryVehicle | null) => {
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
    },
    [],
  );
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
    (department: WeeklyFuellingSummaryDepartment | null) =>
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
    const totalKmHr =
      minKmHr !== null && maxKmHr !== null ? maxKmHr - minKmHr : 0;

    _setTotalLiters(newTotalLiters);
    _setTotalValue(newTotalValue);
    _setTotalKmHr(totalKmHr);
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
    <MaterialRequisitionFormContext.Provider
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
        totalKmHr,
        lastKm,
      }}
    >
      {children}
    </MaterialRequisitionFormContext.Provider>
  );
};
