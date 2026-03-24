import type { VacationFormData } from "@/app/(secure)/vacation/types";
import { endOfDaySP, endOfHalfDay, startOfDaySP } from "@/app/utils";
import { addDays, endOfYear, isSameMonth, startOfYear, toDate } from "date-fns";
import VacationModel from "@/models/Vacation";
import { pluck, sum } from "ramda";
import type { VacationDTO, WorkerDTO } from "@/dto";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { PurchaseOrderFormData } from "@/app/(secure)/purchaseOrder/types";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";

export const updateVacationDates = (
  payload: VacationFormData | Partial<VacationFormData>,
  vacation?: VacationDTO,
): VacationFormData | Partial<VacationFormData> => {
  if (!payload.startDate && !payload.duration) return payload;

  const startDate = payload.startDate
    ? startOfDaySP(new Date(payload.startDate))
    : toDate(vacation!.startDate);
  const duration = (payload.duration ?? vacation?.duration) as number;

  if (!startDate) {
    const isUpdate = !!vacation;
    throw new Error(
      `${isUpdate ? "Update" : "Create"} needs a startDate in payload${
        isUpdate ? " or in vacation to update" : ""
      }.`,
    );
  }

  let endDate: Date;

  if (duration === 1) {
    endDate = endOfDaySP(toDate(startDate));
  } else if (duration > 1) {
    endDate = endOfDaySP(addDays(startDate, duration - 1));
  } else {
    endDate = endOfHalfDay(toDate(startDate));
  }

  return {
    ...payload,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

export const validateVacationDuration = (
  payload: VacationFormData | Partial<VacationFormData>,
  vacation?: VacationDTO,
) => {
  if (!payload.duration && !payload.period && !payload.type) return payload;

  if (
    ![0.5, 1].includes(payload.duration as number) &&
    ((payload.type && payload.type === "dayOff") ||
      (!payload.type && vacation?.type === "dayOff"))
  )
    throw new Error("Duration: daysOff must have duration of [0.5, 1]");

  if (
    ((payload.duration && payload.duration >= 1) ||
      (!payload.duration && (vacation as VacationDTO).duration >= 1)) &&
    payload.period === "half"
  )
    throw new Error("Period: 'half' means duration < 1");

  if (
    ((payload.duration && payload.duration < 1) ||
      (!payload.duration && (vacation as VacationDTO).duration < 1)) &&
    payload.period === "full"
  )
    throw new Error("Period: 'full' means duration >= 1");

  if (
    ((payload.type && payload.type === "normal") ||
      (!payload.type && vacation?.type === "normal")) &&
    ![15, 30].includes(payload.duration as number)
  )
    throw new Error(
      "Duration: normal vacations must have duration of [15, 30]",
    );

  if (
    ((payload.type && payload.type === "license") ||
      (!payload.type && vacation?.type === "license")) &&
    ![15, 30, 45, 60, 75, 90].includes(payload.duration as number)
  )
    throw new Error(
      "Duration: licenses must have duration of [15, 30, 45, 60, 75, 90]",
    );
  return payload;
};

export const validateOverlappingVacations = async (
  payload: VacationFormData | Partial<VacationFormData>,
  vacation?: VacationDTO,
) => {
  if ((payload.startDate || payload.duration) && !payload.cancelled) {
    const overlappingVacations = await VacationModel.find({
      worker: payload.worker ?? (vacation?.worker as WorkerDTO)._id,
      cancelled: { $ne: true },
      startDate: { $lte: payload.endDate },
      endDate: { $gte: payload.startDate },
      ...(vacation && { _id: { $ne: vacation._id } }),
    });

    if (overlappingVacations.length > 0) {
      const overlappingIds = overlappingVacations.map((v) => v._id).join(", ");
      throw new Error(`Conflicting vacations: [${overlappingIds}].`);
    }
  }

  return payload;
};

export const validateDayOffsQuantity = async (
  payload: VacationFormData | Partial<VacationFormData>,
  vacation?: VacationDTO,
) => {
  if (
    (payload.type && payload.type !== "dayOff") ||
    (!payload && vacation?.type !== "dayOff") ||
    payload.cancelled
  )
    return payload;

  const startDate = (payload.startDate ??
    vacation?.startDate) as unknown as Date;
  const firstDay = startOfYear(startDate);
  const lastDay = endOfYear(startDate);

  const sameYearDayOffs = await VacationModel.find({
    startDate: {
      $gte: firstDay,
      $lte: lastDay,
    },
    type: "dayOff",
    $or: [{ cancelled: false }, { cancelled: undefined }],
    worker: payload.worker ?? (vacation?.worker as WorkerDTO)._id,
    ...(vacation && { _id: { $ne: vacation._id } }),
  });

  const sameMonthDayOffs = sameYearDayOffs.filter(({ startDate }) =>
    isSameMonth(
      startDate,
      (payload.startDate ?? vacation?.startDate) as unknown as Date,
    ),
  );

  if (getTotalDuration(sameYearDayOffs) >= 6)
    throw new Error("Worker exceeds his annual dayOff limits (6).");
  if (getTotalDuration(sameMonthDayOffs) >= 1)
    throw new Error("Worker exceeds his monthly dayOff limits (1).");

  return payload;
};

export const getTotalDuration = (vacations: VacationDTO[]): number =>
  sum(pluck("duration", vacations));

export const calculatePurchaseOrderPrices = ({
  order,
  fuels,
}: {
  order: PurchaseOrderFormData | Partial<PurchaseOrderFormData>;
  fuels: FuelDTO[];
}): PurchaseOrderFormData | Partial<PurchaseOrderFormData> => {
  if (order.items && order.items.length > 0) {
    let total = 0;
    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      const itemFuel = fuels.find((fuel) => fuel._id === item.fuel);

      if (!itemFuel) throw new Error(`Fuel doesn't exists: ${item.fuel}.`);

      const itemFuelPriceVersion = (
        itemFuel.priceVersions as FuelPriceVersionDTO[]
      )?.find((priceVersion) => priceVersion?._id === item.fuelPriceVersion);

      if (!itemFuelPriceVersion)
        throw new Error(
          `Fuel price version doesn't exists: ${item.fuelPriceVersion}`,
        );

      item.price = itemFuelPriceVersion.price * item.quantity;
      total += item.price;
    }
    order.total = total;
  }

  return order;
};
