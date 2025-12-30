import type { VacationFormData } from "@/app/(secure)/vacation/types";
import { endOfDaySP, endOfHalfDay, startOfDaySP } from "@/app/utils";
import { addDays, endOfYear, isSameMonth, startOfYear } from "date-fns";
import VacationModel from "@/models/Vacation";
import type { Vacation } from "@/app/types";
import { pluck, sum } from "ramda";

export const updateVacationDates = (
  payload: VacationFormData | Partial<VacationFormData>,
  vacation?: Vacation
): VacationFormData | Partial<VacationFormData> => {
  if (!payload.startDate && !payload.duration) return payload;

  const startDate = payload.startDate
    ? startOfDaySP(new Date(payload.startDate))
    : vacation?.startDate;
  const duration = (payload.duration ?? vacation?.duration) as number;

  if (!startDate) {
    const isUpdate = !!vacation;
    throw new Error(
      `${isUpdate ? "Update" : "Create"} needs a startDate in payload${
        isUpdate ? " or in vacation to update" : ""
      }.`
    );
  }

  let endDate: Date;

  if (duration === 1) {
    endDate = endOfDaySP(startDate);
  } else if (duration > 1) {
    endDate = endOfDaySP(addDays(startDate, duration - 1));
  } else {
    endDate = endOfHalfDay(startDate);
  }

  return {
    ...payload,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

export const validateVacationDuration = (
  payload: VacationFormData | Partial<VacationFormData>,
  vacation?: Vacation
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
      (!payload.duration && (vacation as Vacation).duration >= 1)) &&
    payload.period === "half"
  )
    throw new Error("Period: 'half' means duration < 1");

  if (
    ((payload.duration && payload.duration < 1) ||
      (!payload.duration && (vacation as Vacation).duration < 1)) &&
    payload.period === "full"
  )
    throw new Error("Period: 'full' means duration >= 1");

  if (
    ((payload.type && payload.type === "normal") ||
      (!payload.type && vacation?.type === "normal")) &&
    ![15, 30].includes(payload.duration as number)
  )
    throw new Error(
      "Duration: normal vacations must have duration of [15, 30]"
    );

  if (
    ((payload.type && payload.type === "license") ||
      (!payload.type && vacation?.type === "license")) &&
    ![15, 30, 45, 60, 75, 90].includes(payload.duration as number)
  )
    throw new Error(
      "Duration: licenses must have duration of [15, 30, 45, 60, 75, 90]"
    );
  return payload;
};

export const validateOverlappingVacations = async (
  payload: VacationFormData | Partial<VacationFormData>,
  vacation?: Vacation
) => {
  if ((payload.startDate || payload.duration) && !payload.cancelled) {
    const overlappingVacations = await VacationModel.find({
      worker: payload.worker ?? vacation?.worker._id,
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
  vacation?: Vacation
) => {
  if (
    (payload.type && payload.type !== "dayOff") ||
    (!payload && vacation?.type !== "dayOff") ||
    payload.cancelled
  )
    return payload;

  const startDate = (payload.startDate ?? vacation?.startDate) as Date;
  const firstDay = startOfYear(startDate);
  const lastDay = endOfYear(startDate);

  const sameYearDayOffs = await VacationModel.find({
    startDate: {
      $gte: firstDay,
      $lte: lastDay,
    },
    type: "dayOff",
    $or: [{ cancelled: false }, { cancelled: undefined }],
    worker: payload.worker ?? vacation?.worker,
    ...(vacation && { _id: { $ne: vacation._id } }),
  });

  const sameMonthDayOffs = sameYearDayOffs.filter(({ startDate }) =>
    isSameMonth(startDate, (payload.startDate ?? vacation?.startDate) as Date)
  );

  if (getTotalDuration(sameYearDayOffs) >= 6)
    throw new Error("Worker exceeds his annual dayOff limits (6).");
  if (getTotalDuration(sameMonthDayOffs) >= 1)
    throw new Error("Worker exceeds his monthly dayOff limits (1).");

  return payload;
};

export const getTotalDuration = (vacations: Vacation[]): number =>
  sum(pluck("duration", vacations));
