import {
  LibraryAdd,
  AreaChart,
  LocalGasStation,
  FreeCancellation,
  Today,
  DateRange,
  CalendarMonth,
  PriceCheck,
  List,
  CurrencyExchange,
  Inventory,
  WaterDrop,
} from "@mui/icons-material";
import type { ListItemMenuItem, SearchProps, TimeSearchProps } from "./types";

export const defineSearchPropsDefault = ({
  isExternal,
  time,
}: {
  isExternal?: boolean | null;
  time?: TimeSearchProps | null;
}): SearchProps => {
  const searchProps: SearchProps = {
    external: false,
    internal: false,
    active: true,
    time: time ?? {
      past: false,
      future: false,
      now: false,
    },
  };

  if (isExternal === null || isExternal === undefined) return searchProps;

  if (isExternal === false) searchProps.internal = true;
  else searchProps.external = true;

  return searchProps;
};

export const defineIsExternal = ({
  internal,
  external,
}: SearchProps): boolean | undefined => {
  let isExternal: boolean | undefined;

  if ((internal && external) || (!internal && !external))
    isExternal = undefined;
  else if (internal && !external) isExternal = false;
  else if (!internal && external) isExternal = true;

  return isExternal;
};

export const parseBool = (str?: string | null): boolean | null => {
  if (str === "false") return false;
  if (str === "true") return true;
  return null;
};

export const getFuelingBatchProps = (): ListItemMenuItem => ({
  label: "Abastecimento",
  icon: <LocalGasStation />,
  items: [
    {
      itemLabel: "Lotes",
      itemIcon: <Inventory />,
      href: "/fuelingBatch",
    },
    {
      itemLabel: "Novo Lote",
      itemIcon: <LibraryAdd />,
      href: "/fuelingBatch/form",
    },
    {
      itemLabel: "Estatísticas",
      itemIcon: <AreaChart />,
      href: "/fuelingBatch/average",
    },
  ],
});

export const getPurchaseOrderProps = (): ListItemMenuItem => ({
  label: "Pedidos",
  icon: <PriceCheck />,
  items: [
    {
      itemLabel: "Ver pedidos",
      itemIcon: <List />,
      href: "/purchaseOrder",
    },
    {
      itemLabel: "Atualizar pedidos",
      itemIcon: <CurrencyExchange />,
      href: "/purchaseOrder/update",
    },
    {
      itemLabel: "Combustíveis",
      itemIcon: <WaterDrop />,
      href: "/fuel",
    },
  ],
});

export const getVacationProps = (): ListItemMenuItem => ({
  label: "Folgas",
  icon: <FreeCancellation />,
  items: [
    {
      itemLabel: "Abonadas",
      itemIcon: <Today />,
      href: "/vacation/dayOff",
    },
    {
      itemLabel: "Férias",
      itemIcon: <DateRange />,
      href: "/vacation",
    },
    {
      itemLabel: "Lic. Prêmio",
      itemIcon: <CalendarMonth />,
      href: "/vacation/license",
    },
  ],
});
