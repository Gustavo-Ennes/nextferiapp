import { capitalizeFirstLetter } from "@/app/utils";
import {
  ArrowDownward,
  ArrowUpward,
  AttachMoney,
  Business,
  DirectionsCar,
  Done,
  LocalGasStation,
  RequestQuote,
  Straighten,
  WaterDrop,
} from "@mui/icons-material";
import { sum } from "ramda";
import {
  toMonetary,
  countAllCars,
  countAllFuelings,
  countAllLiters,
  countAllKms,
  countAllInvoices,
  countAllInvoicesValues,
} from "../../utils";
import type { StatItem } from "../types";
import type {
  FuelingBatchDTO,
  FuelingBatchDTODepartment,
  FuelingBatchDTOInvoice,
} from "@/dto";
import type { TotalFuels } from "@/models/types";

export const getPrimaryStats = ({
  fuelingBatch,
  selectedDepartment,
  selectedFuelingBatch,
  invoices,
  selectedInvoices,
}: {
  fuelingBatch: FuelingBatchDTO | null;
  selectedDepartment: FuelingBatchDTODepartment | null;
  selectedFuelingBatch: FuelingBatchDTO | null;
  invoices: FuelingBatchDTOInvoice[];
  selectedInvoices: FuelingBatchDTOInvoice[];
}): StatItem[] => [
  {
    name: "total",
    icon: <AttachMoney fontSize="inherit" color="primary" />,
    label: "TOTAL: GERAL",
    total: toMonetary(fuelingBatch?.totals.totalValue ?? 0),
    type: "primary",
  },
  {
    name: "selectedTotal",
    icon: <AttachMoney fontSize="inherit" color="primary" />,
    label: `TOTAL: ${selectedDepartment?.name.toUpperCase() ?? "--"}`,
    total: selectedFuelingBatch
      ? toMonetary(selectedFuelingBatch.totals!.totalValue)
      : String(0),
    type: "primary",
  },
  {
    name: "invoiceTotal",
    icon: <RequestQuote fontSize="inherit" color="primary" />,
    label: `TOTAL NF's`,
    total: toMonetary(sum(invoices.map((i) => i.total))),
    type: "primary",
  },
  {
    name: "selectedInvoiceTotal",
    icon: <RequestQuote fontSize="inherit" color="primary" />,
    label: `TOTAL NF's: ${selectedDepartment?.name.toUpperCase() ?? "--"}`,
    total: selectedDepartment
      ? toMonetary(sum(selectedInvoices?.map((i) => i.total) ?? []))
      : String(0),
    type: "primary",
  },
];

// Adicionar uma nova métrica = adicionar um item aqui.
export const getSecondaryStats = ({
  fuelingBatch,
  selectedFuelingBatch,
}: {
  fuelingBatch: FuelingBatchDTO | null;
  selectedFuelingBatch: FuelingBatchDTO | null;
}): StatItem[] => [
  {
    name: "departments",
    icon: <Business fontSize="inherit" color="primary" />,
    label: "Departamentos",
    total: (fuelingBatch?.departments.length ?? 0).toString(),
    type: "secondary",
  },
  {
    name: "vehicles",
    icon: <DirectionsCar fontSize="inherit" color="primary" />,
    label: "Carros",
    total: fuelingBatch ? countAllCars(fuelingBatch).toString() : "0",
    selected: selectedFuelingBatch
      ? countAllCars(selectedFuelingBatch).toString()
      : undefined,
    type: "secondary",
  },
  {
    name: "fuelings",
    icon: <LocalGasStation fontSize="inherit" color="primary" />,
    label: "Abastecimentos",
    total: fuelingBatch ? countAllFuelings(fuelingBatch).toString() : "0",
    selected: selectedFuelingBatch
      ? countAllFuelings(selectedFuelingBatch).toString()
      : undefined,
    type: "secondary",
  },
  {
    name: "liters",
    icon: <WaterDrop fontSize="inherit" color="primary" />,
    label: "Litragem",
    total: fuelingBatch ? countAllLiters(fuelingBatch).toString() : "0",
    selected: selectedFuelingBatch
      ? countAllLiters(selectedFuelingBatch).toFixed(3)
      : undefined,
    type: "secondary",
  },
  {
    name: "kms",
    icon: <Straighten fontSize="inherit" color="primary" />,
    label: "Km's rodados",
    total: fuelingBatch ? countAllKms(fuelingBatch).toString() : "0",
    selected: selectedFuelingBatch
      ? countAllKms(selectedFuelingBatch).toFixed(1)
      : undefined,
    type: "secondary",
  },
  {
    name: "invoices",
    icon: <Straighten fontSize="inherit" color="primary" />,
    label: "Notas fiscais",
    total: fuelingBatch ? countAllInvoices(fuelingBatch).toString() : "0",
    selected: selectedFuelingBatch
      ? countAllInvoices(selectedFuelingBatch).toString()
      : undefined,
    type: "secondary",
  },
  {
    name: "invoicesValue",
    icon: <Straighten fontSize="inherit" color="primary" />,
    label: "Notas F. R$",
    total: fuelingBatch ? countAllInvoicesValues(fuelingBatch).toString() : "0",
    selected: selectedFuelingBatch
      ? countAllInvoicesValues(selectedFuelingBatch)
      : undefined,
    type: "secondary",
  },
];

const getFuelInventoryIcon = (value: number) =>
  value > -0.5 && value < 0.5 ? (
    <Done fontSize="inherit" color="success" />
  ) : value < -0.5 ? (
    <ArrowDownward fontSize="inherit" color="error" />
  ) : (
    <ArrowUpward fontSize="inherit" color="success" />
  );

// invoices.values - fuelings.values
export const getFuelInventoryStats = (fuelInventory: TotalFuels): StatItem[] =>
  Object.entries(fuelInventory).map(([fuelName, { liters, value }]) => ({
    name: `fuelStats-${fuelName}`,
    icon: getFuelInventoryIcon(value),
    label: capitalizeFirstLetter(fuelName),
    total: toMonetary(value),
    selected: `${liters}L`,
    type: "secondary",
    textColor: liters >= 0 ? "green" : "red",
  }));
