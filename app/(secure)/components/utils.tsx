import {
  LibraryAdd,
  AreaChart,
  LocalGasStation,
  FreeCancellation,
  Today,
  DateRange,
  CalendarMonth,
} from "@mui/icons-material";
import type { ListItemMenuItem, SearchProps } from "./types";

export const defineSearchPropsDefault = (
  isExternal?: boolean | null
): SearchProps => {
  const searchProps: SearchProps = {
    external: false,
    internal: false,
    active: true,
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

export const getWeeklyFuellingSummaryProps = (): ListItemMenuItem => ({
  label: "Abastecimento",
  icon: <LocalGasStation />,
  items: [
    {
      itemLabel: "Req. materiais",
      itemIcon: <LibraryAdd />,
      href: "/materialRequisition/form",
    },
    {
      itemLabel: "Média",
      itemIcon: <AreaChart />,
      href: "/materialRequisition/average",
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
