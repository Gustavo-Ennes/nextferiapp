import type { DepartmentDTO } from "@/dto";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";
import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";
import type { SidebarStatus } from "./types";
import { capitalizeName } from "@/app/utils";
import type { RowFlag, ListPageRowFlags } from "../components/types";
import { PriorityHigh } from "@mui/icons-material";

export const translateFuelType = (fuelName: string): string => {
  const names = fuelName.split(" ");
  let returnName = "";

  if (names.length === 1) return `${capitalizeName(fuelName.substring(0, 6))}.`;

  names.forEach((name, index) => {
    if (index === 0) returnName += `${name.substring(0, 6).toUpperCase()}.`;
    else if (index === 1)
      returnName += ` ${name.substring(0, 3).toUpperCase()}.`;
    else returnName += ` ${name.substring(0, 1).toUpperCase()}.`;
  });
  return returnName;
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

export const getPurchaseOrderRowFlags = ({
  orders,
  fuels,
}: {
  orders: PurchaseOrderDTO[];
  fuels: FuelDTO[];
}): ListPageRowFlags => {
  const map = new Map<string, RowFlag[]>();

  orders.forEach((order) => {
    let message = "";
    let orderStatus: "success" | "error" | "warning" = "success";

    order.items.forEach((item) => {
      const itemFuel = fuels.find(
        (f) => f._id === (item.fuel as FuelDTO)._id,
      ) as FuelDTO;
      const itemFuelVersion = item.fuelPriceVersion as FuelPriceVersionDTO;

      if (
        (itemFuel.currentPriceVersion as FuelPriceVersionDTO).version !==
        itemFuelVersion.version
      ) {
        orderStatus = "error";
        message = `Versão desatualizada para ${itemFuel.name}: atual é v${(itemFuel.currentPriceVersion as FuelPriceVersionDTO).version} e o pedido usa v${itemFuelVersion.version}.`;
      }

      if (item.quantity < 10) {
        orderStatus = orderStatus === "error" ? orderStatus : "warning";

        if (message) {
          message += ", ";
        } else {
          message = message.replace(".", "");
        }

        message += `${message ? "b" : "B"}aixa quantidade para  ${itemFuel.name}: ${item.quantity} litros.`;
      }
    });

    if (message.length > 0)
      map.set(order._id, [
        {
          message,
          icon: <PriorityHigh color={orderStatus} />,
        },
      ]);
  });

  return map;
};
