import type { DepartmentDTO } from "@/dto";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";
import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";
import type { FuelType } from "@/lib/repository/weeklyFuellingSummary/types";
import type { SidebarStatus } from "./types";
import { capitalizeName } from "@/app/utils";

export const translateFuelType = (fuelType: FuelType): string => {
  switch (fuelType) {
    case "arla":
      return "Arla";
    case "gas":
      return "Gasolina";
    case "s10":
      return "Diesel S10";
    case "s500":
      return "Diesel S500";
  }
};

export const purchaseOrderBaseline = {
  reference: "",
  department: "",
  items: [],
};

export const prepareDefaults = (purchaseOrder: PurchaseOrderDTO) => ({
  ...purchaseOrder,
  department: (purchaseOrder.department as DepartmentDTO)._id,
  items: purchaseOrder.items.map((item) => ({
    ...item,
    fuel: (item.fuel as FuelDTO)._id,
    fuelPriceVersion: (item.fuelPriceVersion as FuelPriceVersionDTO)._id,
  })),
});

export const sortByReference = (
  orders: PurchaseOrderDTO[],
): PurchaseOrderDTO[] => {
  return [...orders].sort((a, b) => {
    const parse = (ref: string) => {
      const [num, year] = ref.split("/");
      return Number(year) * 10000 + Number(num);
    };
    return parse(a.reference) - parse(b.reference);
  });
};

export const statusMeta: Record<
  SidebarStatus,
  {
    label: string;
    color: "default" | "primary" | "success" | "error" | "warning";
  }
> = {
  pending: { label: "Pendente", color: "default" },
  queued: { label: "Na fila", color: "primary" },
  kept: { label: "Mantido", color: "warning" },
  success: { label: "Atualizado", color: "success" },
  error: { label: "Erro", color: "error" },
};

export const statusAlert: Record<
  Exclude<SidebarStatus, "pending">,
  { severity: "info" | "warning" | "success" | "error"; message: string }
> = {
  queued: {
    severity: "info",
    message:
      "Este pedido está na fila de atualização. Você pode editar e adicionar novamente.",
  },
  kept: {
    severity: "warning",
    message:
      "Este pedido está marcado como mantido. Clique em Adicionar para incluí-lo na fila.",
  },
  success: {
    severity: "success",
    message: "Este pedido já foi atualizado com sucesso.",
  },
  error: {
    severity: "error",
    message:
      "Este pedido retornou erro. Você pode tentar adicioná-lo novamente.",
  },
};

export const abbreviateFuel = (fuelName: string): string => {
  const words = fuelName.split(" ");
  let abbreviation = "";
  for (let i = 0; i < words.length; i++) {
    if (i === 0)
      abbreviation += `${words[i].substring(0, 3)}.${words[i + 1] ? " " : ""}`;
    else if (i === 1)
      abbreviation += `${words[i].substring(0, 3)}.${words[i + 1] ? " " : ""}`;
    else
      abbreviation += `${words[i].substring(0, 1)}.${words[i + 1] ? " " : ""}`;
  }
  return capitalizeName(abbreviation);
};
